import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthenticated, isOnboardingDone } from '@core/signals/app.signals';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);

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
};

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (isAuthenticated()) {
    if (isOnboardingDone()) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/onboarding']);
    }
    return false;
  }
  return true;
};
