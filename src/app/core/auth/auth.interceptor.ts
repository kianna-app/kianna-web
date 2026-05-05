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
      if (!token) return next(req);
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
