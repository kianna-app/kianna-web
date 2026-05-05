import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { authInitialized, isAuthenticated, isOnboardingDone } from '@core/signals/app.signals';

// Aguarda authInitialized=true antes de decidir — evita redirect prematuro
// enquanto o Supabase ainda está carregando a sessão do localStorage.
function waitForAuth() {
  return toObservable(authInitialized).pipe(
    filter(v => v === true),
    take(1),
  );
}

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  return waitForAuth().pipe(
    map(() => {
      if (!isAuthenticated()) {
        router.navigate(['/auth/login']);
        return false;
      }

      const requiresOnboarding = route.data?.['requiresOnboarding'] !== false;
      if (requiresOnboarding && !isOnboardingDone()) {
        router.navigate(['/onboarding']);
        return false;
      }

      return true;
    }),
  );
};

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);

  return waitForAuth().pipe(
    map(() => {
      if (isAuthenticated()) {
        router.navigate(isOnboardingDone() ? ['/dashboard'] : ['/onboarding']);
        return false;
      }
      return true;
    }),
  );
};
