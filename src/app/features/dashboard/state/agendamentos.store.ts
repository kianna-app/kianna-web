import { Injectable, computed, inject, signal } from '@angular/core';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { AgendamentoComServico, StatusAgend, Agendamento } from '@core/types/database.types';
import { currentUser } from '@core/signals/app.signals';

@Injectable({ providedIn: 'root' })
export class AgendamentosStore {
  private repo    = inject(AgendamentosRepository);
  private session = inject(SessionService);

  readonly agendamentos = signal<AgendamentoComServico[]>([]);
  readonly carregando   = signal(false);
  readonly erro         = signal<string | null>(null);

  readonly confirmados = computed(() =>
    this.agendamentos().filter(a => a.status === 'confirmado')
  );

  readonly pendentes = computed(() =>
    this.agendamentos().filter(a => a.status === 'pendente')
  );

  async carregarPeriodo(inicio: Date, fim: Date): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
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

  async atualizarStatus(id: string, status: StatusAgend): Promise<void> {
    try {
      await this.repo.atualizarStatus(id, status);
      this.agendamentos.update(arr =>
        arr.map(a => a.id === id ? { ...a, status } : a)
      );
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
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
