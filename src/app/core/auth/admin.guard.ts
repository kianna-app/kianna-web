import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { authInitialized, isAuthenticated, isAdmin } from '@core/signals/app.signals';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  return toObservable(authInitialized).pipe(
    filter(v => v === true),
    take(1),
    map(() => {
      if (!isAuthenticated()) {
        router.navigate(['/auth/login']);
        return false;
      }
      if (!isAdmin()) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }),
  );
};
