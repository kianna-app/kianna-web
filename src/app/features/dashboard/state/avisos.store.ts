import { Injectable, computed, inject, signal } from '@angular/core';
import { AvisoParaProfissional, AvisosRepository } from '@core/repositories/avisos.repository';

@Injectable({ providedIn: 'root' })
export class AvisosStore {
  private repo = inject(AvisosRepository);

  private readonly _avisos     = signal<AvisoParaProfissional[]>([]);
  private readonly _carregando = signal(false);
  private readonly _erro       = signal<string | null>(null);

  readonly avisos       = this._avisos.asReadonly();
  readonly carregando   = this._carregando.asReadonly();
  readonly erro         = this._erro.asReadonly();
  readonly naoLidasCount = computed(
    () => this._avisos().filter(a => !a.lida_em).length,
  );

  async recarregar(): Promise<void> {
    this._carregando.set(true);
    this._erro.set(null);
    try {
      const lista = await this.repo.meusAvisos();
      this._avisos.set(lista);
    } catch (err) {
      console.error('[AvisosStore] erro ao buscar avisos:', err);
      this._erro.set('Não foi possível carregar as notificações.');
    } finally {
      this._carregando.set(false);
    }
  }

  async marcarLido(avisoId: string): Promise<void> {
    const atual = this._avisos();
    const alvo  = atual.find(a => a.id === avisoId);
    if (!alvo || alvo.lida_em) return;

    // Otimista
    const agora = new Date().toISOString();
    this._avisos.set(atual.map(a => a.id === avisoId ? { ...a, lida_em: agora } : a));

    try {
      await this.repo.marcarLido(avisoId);
    } catch (err) {
      console.error('[AvisosStore] erro ao marcar leitura:', err);
      // Reverte
      this._avisos.set(atual);
    }
  }

  async marcarTodasLidas(): Promise<void> {
    const naoLidas = this._avisos().filter(a => !a.lida_em);
    if (naoLidas.length === 0) return;
    await Promise.all(naoLidas.map(a => this.marcarLido(a.id)));
  }

  reset(): void {
    this._avisos.set([]);
    this._erro.set(null);
  }
}
