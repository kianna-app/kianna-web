import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard, publicGuard } from '@core/auth/auth.guard';
import { adminGuard } from '@core/auth/admin.guard';
import { authInitialized, isAuthenticated, isOnboardingDone } from '@core/signals/app.signals';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const routes: Routes = [
  // ── Home pública (raiz) ──────────────────────────────────────
  {
    path: '',
    pathMatch: 'full',
    canMatch: [() => {
      const router = inject(Router);
      return toObservable(authInitialized).pipe(
        filter(v => v === true),
        take(1),
        map(() => {
          if (isAuthenticated()) {
            router.navigate(isOnboardingDone() ? ['/dashboard'] : ['/onboarding']);
            return false;
          }
          return true;
        }),
      );
    }],
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Kianna — Sua secretária digital de agendamentos',
  },

  // ── Autenticação ─────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },

  // ── Onboarding ───────────────────────────────────────────────
  {
    path: 'onboarding',
    canActivate: [authGuard],
    data: { requiresOnboarding: false },
    loadComponent: () =>
      import('./features/onboarding/onboarding.component')
        .then(m => m.OnboardingComponent),
    title: 'Configurar perfil — Kianna',
  },

  // ── Dashboard ────────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes),
  },

  // ── Painel Admin ─────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },

  // ── Página pública de agendamento (/:slug) — deve ficar antes do ** ──
  {
    path: ':slug',
    loadComponent: () =>
      import('./features/booking/pages/booking-page/booking-page.component')
        .then(m => m.BookingPageComponent),
  },

  // ── 404 ──────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
