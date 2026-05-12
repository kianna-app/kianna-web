import { Injectable, computed, inject, signal } from '@angular/core';
import { DisponibilidadesRepository } from '@core/repositories/disponibilidades.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class HorariosStore {
  private repo    = inject(DisponibilidadesRepository);
  private session = inject(SessionService);

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
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      const msg = (e instanceof Error ? e.message : '').toLowerCase();
      if (msg.includes('abort') || msg.includes('failed to fetch')) {
        this.erro.set('Tempo esgotado ao carregar horários. Tente recarregar a página.');
      } else {
        this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar horários.');
      }
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
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.erro.set(e instanceof Error ? e.message : 'Erro ao salvar horários');
      throw e;
    } finally {
      this.salvando.set(false);
    }
  }
}
