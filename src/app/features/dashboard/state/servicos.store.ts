import { Injectable, computed, inject, signal } from '@angular/core';
import { ServicosRepository } from '@core/repositories/servicos.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { Servico, ServicoInput } from '@core/types/database.types';
import { userPlano } from '@core/signals/app.signals';
import { PLAN_LIMITS, exceededLimit } from '@core/constants/plan.limits';

@Injectable({ providedIn: 'root' })
export class ServicosStore {
  private repo    = inject(ServicosRepository);
  private session = inject(SessionService);

  readonly servicos    = signal<Servico[]>([]);
  readonly carregando  = signal(false);
  readonly erro        = signal<string | null>(null);

  readonly ativos        = computed(() => this.servicos().filter(s => s.ativo));
  readonly inativos      = computed(() => this.servicos().filter(s => !s.ativo));
  readonly total         = computed(() => this.servicos().length);
  readonly limite        = computed(() => PLAN_LIMITS[userPlano()].servicos);
  readonly atingiuLimite = computed(() => exceededLimit(this.total(), this.limite()));

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listar();
      this.servicos.set(lista);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('abort') || msg.includes('failed to fetch')) {
        this.erro.set('Tempo esgotado ao carregar serviços. Tente recarregar a página.');
      } else {
        this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar serviços.');
      }
    } finally {
      this.carregando.set(false);
    }
  }

  async criar(input: ServicoInput): Promise<void> {
    try {
      const novo = await this.repo.criar(input);
      this.servicos.update(arr => [...arr, novo]);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<void> {
    try {
      const atualizado = await this.repo.atualizar(id, input);
      this.servicos.update(arr => arr.map(s => s.id === id ? atualizado : s));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    try {
      await this.repo.toggleAtivo(id, ativo);
      this.servicos.update(arr => arr.map(s => s.id === id ? { ...s, ativo } : s));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.repo.excluir(id);
      this.servicos.update(arr => arr.filter(s => s.id !== id));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }
}
