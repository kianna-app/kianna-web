import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export type AcaoAuth =
  | 'login'
  | 'login_falha'
  | 'logout'
  | 'alteracao_senha'
  | 'exclusao_conta';

/**
 * Fire-and-forget: encaminha eventos de autenticação ao backend
 * (`POST /api/auditoria/auth`). Nunca propaga erros para o componente,
 * para não bloquear o fluxo do usuário.
 */
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private api = inject(ApiService);

  registrarAuth(acao: AcaoAuth, motivo?: string): void {
    const body: { acao: AcaoAuth; motivo?: string } = { acao };
    if (motivo) body.motivo = motivo;

    const promise =
      acao === 'login_falha'
        ? this.api.postPublic('/api/auditoria/auth', body)
        : this.api.post('/api/auditoria/auth', body);

    promise.catch((err) => {
      console.warn('[Auditoria] falha ao registrar', acao, err);
    });
  }
}
