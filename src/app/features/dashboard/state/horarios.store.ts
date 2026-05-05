import { Injectable, computed, inject, signal } from '@angular/core';
import { DisponibilidadesRepository } from '@core/repositories/disponibilidades.repository';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class HorariosStore {
  private repo = inject(DisponibilidadesRepository);

  readonly disponibilidades = signal<Disponibilidade[]>([]);
  readonly carregando       = signal(false);
  readonly salvando         = signal(false);
  readonly erro             = signal<string | null>(null);

  readonly diasAtivos = computed(() =>
    new Set(this.disponibilidades().map(d => d.dia_semana))
  );

  readonly horasSemanais = computed(() => {
    return this.disponibilidades().reduce((acc, d) => {
      const [hi, mi] = d.hora_inicio.split(':').map(Number);
      const [hf, mf] = d.hora_fim.split(':').map(Number);
      return acc + (hf * 60 + mf - (hi * 60 + mi)) / 60;
    }, 0);
  });

  readonly slotsSemanais = computed(() => {
    return this.disponibilidades().reduce((acc, d) => {
      const [hi, mi] = d.hora_inicio.split(':').map(Number);
      const [hf, mf] = d.hora_fim.split(':').map(Number);
      const minutos = hf * 60 + mf - (hi * 60 + mi);
      return acc + Math.floor(minutos / d.intervalo_min);
    }, 0);
  });

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listar();
      this.disponibilidades.set(lista);
    } catch (e: unknown) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar horários');
    } finally {
      this.carregando.set(false);
    }
  }

  async salvar(inputs: DisponibilidadeInput[]): Promise<void> {
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.repo.substituirTodas(inputs);
      await this.carregar();
    } catch (e: unknown) {
      this.erro.set(e instanceof Error ? e.message : 'Erro ao salvar horários');
      throw e;
    } finally {
      this.salvando.set(false);
    }
  }
}
