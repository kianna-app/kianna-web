import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    data: { requiresOnboarding: false },
    loadComponent: () =>
      import('./features/onboarding/onboarding.component')
        .then(m => m.OnboardingComponent),
    title: 'Configurar perfil — AgendaZap',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
