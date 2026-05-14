import { Injectable, inject, signal } from '@angular/core';
import { BloqueiosRepository } from '@core/repositories/bloqueios.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { Bloqueio } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class BloqueiosStore {
  private repo    = inject(BloqueiosRepository);
  private session = inject(SessionService);

  readonly bloqueios  = signal<Bloqueio[]>([]);
  readonly carregando = signal(false);
  readonly salvando   = signal(false);
  readonly erro       = signal<string | null>(null);

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listar();
      this.bloqueios.set(lista);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.erro.set(e instanceof Error ? e.message : 'Erro ao carregar bloqueios.');
    } finally {
      this.carregando.set(false);
    }
  }

  async adicionar(payload: {
    data: string;
    hora_inicio?: string;
    hora_fim?: string;
    motivo?: string;
  }): Promise<void> {
    this.salvando.set(true);
    try {
      const novo = await this.repo.criar(payload);
      this.bloqueios.update(arr => [...arr, novo].sort((a, b) => a.data.localeCompare(b.data)));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    } finally {
      this.salvando.set(false);
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.repo.excluir(id);
      this.bloqueios.update(arr => arr.filter(b => b.id !== id));
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      throw e;
    }
  }
}
