import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (!token) {
        console.warn('[AuthInterceptor] sem token para:', req.url);
        return next(req);
      }
      console.log('[AuthInterceptor] adicionando Bearer | expira em:', (token as any)?.exp ?? '?', '| agora:', Math.floor(Date.now() / 1000));
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
