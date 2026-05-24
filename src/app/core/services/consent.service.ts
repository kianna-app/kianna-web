import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const CONSENT_KEY = 'kianna_consent_v1';

interface ConsentState {
  decided: boolean;
  analytics: boolean;
  date: string;
}

const EMPTY_STATE: ConsentState = { decided: false, analytics: false, date: '' };

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private platformId = inject(PLATFORM_ID);
  private state = signal<ConsentState>(this.load());

  /** Usuário já fez uma escolha (aceitar ou recusar). Enquanto false, o banner fica visível. */
  readonly hasDecided = computed(() => this.state().decided);

  /**
   * Analytics só deve ser inicializado quando este signal for true.
   * NUNCA disparar rastreamento antes de verificar este signal — exigência LGPD (opt-in).
   */
  readonly analyticsAllowed = computed(() => this.state().analytics);

  accept(): void {
    this.save({ decided: true, analytics: true, date: new Date().toISOString() });
  }

  reject(): void {
    this.save({ decided: true, analytics: false, date: new Date().toISOString() });
  }

  /** Remove a decisão salva e exibe o banner novamente (link "Preferências de cookies" no footer). */
  revoke(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(CONSENT_KEY);
    }
    this.state.set(EMPTY_STATE);
  }

  private load(): ConsentState {
    if (!isPlatformBrowser(this.platformId)) return EMPTY_STATE;
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return EMPTY_STATE;
    try {
      return JSON.parse(raw) as ConsentState;
    } catch {
      return EMPTY_STATE;
    }
  }

  private save(state: ConsentState): void {
    this.state.set(state);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    }
  }
}
