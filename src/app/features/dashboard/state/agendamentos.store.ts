import { Injectable, computed, inject, signal } from '@angular/core';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';
import { currentUser } from '@core/signals/app.signals';
import { supabase } from '@core/supabase/supabase.client';
import type { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AgendamentosStore {
  private repo    = inject(AgendamentosRepository);
  private session = inject(SessionService);

  readonly agendamentos   = signal<AgendamentoComServico[]>([]);
  readonly carregando     = signal(false);
  readonly erro           = signal<string | null>(null);
  readonly pendentesCount = signal(0);

  private realtimeChannel?: RealtimeChannel;
  private ultimoPeriodo?: { inicio: Date; fim: Date };

  subscribeRealtime(profissionalId: string): void {
    if (this.realtimeChannel) return;
    void this.carregarContagem(profissionalId);
    this.realtimeChannel = supabase
      .channel('agendamentos-store')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'agendamentos',
        filter: `profissional_id=eq.${profissionalId}`,
      }, () => {
        void this.carregarContagem(profissionalId);
        void this.recarregarPeriodoAtual();
      })
      .subscribe();
  }

  private async recarregarPeriodoAtual(): Promise<void> {
    const p = this.ultimoPeriodo;
    if (!p) return;
    try {
      const lista = await this.repo.listarPorPeriodo(p.inicio, p.fim);
      this.agendamentos.set(lista);
    } catch {
      // silencioso: o próximo carregar manual revalida
    }
  }

  destruirRealtime(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = undefined;
    }
  }

  private async carregarContagem(profissionalId: string): Promise<void> {
    const n = await this.repo.contarPendentes(profissionalId);
    this.pendentesCount.set(n);
  }

  readonly confirmados = computed(() =>
    this.agendamentos().filter(a => a.status === 'confirmado')
  );

  readonly pendentes = computed(() =>
    this.agendamentos().filter(a => a.status === 'pendente')
  );

  async carregarPeriodo(inicio: Date, fim: Date): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    this.ultimoPeriodo = { inicio, fim };
    try {
      const lista = await this.repo.listarPorPeriodo(inicio, fim);
      this.agendamentos.set(lista);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('abort') || msg.includes('failed to fetch')) {
        this.erro.set('Tempo esgotado ao carregar agenda. Tente recarregar a página.');
      } else {
        this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar agenda.');
      }
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarStatus(id: string, status: StatusAgend, motivo_recusa?: string): Promise<void> {
    try {
      await this.repo.atualizarStatus(id, status, motivo_recusa);
      this.agendamentos.update(arr =>
        arr.map(a => a.id === id ? { ...a, status, ...(motivo_recusa ? { motivo_recusa } : {}) } : a)
      );
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  atualizarStatusLocal(id: string, status: StatusAgend): void {
    this.agendamentos.update(arr =>
      arr.map(a => a.id === id ? { ...a, status } : a)
    );
  }

  async criar(payload: {
    servico_id: string; cliente_nome: string; cliente_wpp: string;
    data_hora: string; status: string; observacoes?: string;
  }): Promise<void> {
    try {
      const user = currentUser();
      if (!user?.id) throw new Error('Não autenticado');
      await this.repo.criar({ ...payload, profissional_id: user.id });
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  async atualizar(id: string, payload: Partial<{
    servico_id: string; cliente_nome: string; cliente_wpp: string;
    data_hora: string; status: string; observacoes: string;
  }>): Promise<void> {
    try {
      await this.repo.atualizar(id, payload);
      this.agendamentos.update(arr =>
        arr.map(a => a.id === id ? { ...a, ...payload } as AgendamentoComServico : a)
      );
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.repo.excluir(id);
      this.agendamentos.update(arr => arr.filter(a => a.id !== id));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }
}
