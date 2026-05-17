import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let msg = 'Erro ao conectar com o servidor.';

      if (err.status === 0) {
        msg = 'Sem conexão com o servidor. Verifique sua internet.';
      } else if (err.status === 401) {
        msg = 'Sessão expirada. Faça login novamente.';
      } else if (err.status === 403) {
        msg = err.error?.message || 'Sem permissão para esta ação.';
      } else if (err.status === 404) {
        msg = 'Recurso não encontrado.';
      } else if (err.status >= 500) {
        msg = 'Erro interno do servidor. Tente novamente.';
      } else if (err.error?.message) {
        msg = err.error.message;
      }

      console.error('[API]', err.status, err.url, err.error);
      snack.open(msg, '', { duration: 4000, panelClass: 'snack-error' });

      return throwError(() => err);
    }),
  );
};
