import { Injectable, computed, inject, signal } from '@angular/core';
import { ServicosRepository } from '@core/repositories/servicos.repository';
import { Servico, ServicoInput } from '@core/types/database.types';
import { userPlano } from '@core/signals/app.signals';
import { PLAN_LIMITS, exceededLimit } from '@core/constants/plan.limits';

@Injectable({ providedIn: 'root' })
export class ServicosStore {
  private repo = inject(ServicosRepository);

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
      this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar serviços');
    } finally {
      this.carregando.set(false);
    }
  }

  async criar(input: ServicoInput): Promise<void> {
    if (this.atingiuLimite()) {
      throw new Error(`Limite do plano atingido (${this.limite()} serviços).`);
    }
    const novo = await this.repo.criar(input);
    this.servicos.update(arr => [...arr, novo]);
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<void> {
    const atualizado = await this.repo.atualizar(id, input);
    this.servicos.update(arr => arr.map(s => s.id === id ? atualizado : s));
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    await this.repo.toggleAtivo(id, ativo);
    this.servicos.update(arr => arr.map(s => s.id === id ? { ...s, ativo } : s));
  }

  async excluir(id: string): Promise<void> {
    await this.repo.excluir(id);
    this.servicos.update(arr => arr.filter(s => s.id !== id));
  }
}
