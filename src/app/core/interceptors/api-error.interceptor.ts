import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Erros tratados globalmente (snackbar):
 *  - Sem conexão / timeout / status 0
 *  - 401 (sessão) e 500+ (servidor)
 *
 * Erros 4xx (400, 404, 409, 422) são repassados ao componente,
 * que mostra a mensagem contextual da API.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const snack = inject(MatSnackBar);

  return next(req).pipe(
    timeout({ each: 30_000 }),
    catchError((err: unknown) => {
      if (err instanceof TimeoutError) {
        snack.open('A requisição demorou demais para responder. Tente novamente.', '',
          { duration: 4000, panelClass: 'snack-error' });
        return throwError(() => err);
      }

      if (err instanceof HttpErrorResponse) {
        let mostrarSnack = false;
        let msg = '';

        if (err.status === 0) {
          msg = 'Sem conexão com o servidor. Verifique sua internet.';
          mostrarSnack = true;
        } else if (err.status === 401) {
          msg = 'Sessão expirada. Faça login novamente.';
          mostrarSnack = true;
        } else if (err.status >= 500) {
          msg = (err.error?.message as string) || 'Erro interno do servidor. Tente novamente.';
          mostrarSnack = true;
        }

        if (mostrarSnack) {
          snack.open(msg, '', { duration: 4000, panelClass: 'snack-error' });
        }

        console.error('[API]', err.status, err.url, err.error);
      }

      return throwError(() => err);
    }),
  );
};
