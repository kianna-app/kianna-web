import { Injectable, computed, inject, signal } from '@angular/core';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosStore {
  private repo = inject(AgendamentosRepository);

  readonly agendamentos = signal<AgendamentoComServico[]>([]);
  readonly carregando   = signal(false);
  readonly erro         = signal<string | null>(null);

  readonly confirmados = computed(() =>
    this.agendamentos().filter(a => a.status === 'confirmado')
  );

  async carregarPeriodo(inicio: Date, fim: Date): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listarPorPeriodo(inicio, fim);
      this.agendamentos.set(lista);
    } catch (e: unknown) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar agenda');
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarStatus(id: string, status: StatusAgend): Promise<void> {
    await this.repo.atualizarStatus(id, status);
    this.agendamentos.update(arr =>
      arr.map(a => a.id === id ? { ...a, status } : a)
    );
  }
}
