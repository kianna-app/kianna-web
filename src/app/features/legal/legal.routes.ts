import { Routes } from '@angular/router';

export const legalRoutes: Routes = [
  {
    path: 'termos',
    loadComponent: () =>
      import('./pages/termos/termos.component').then(m => m.TermosComponent),
    title: 'Termos de Uso — Kianna',
  },
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./pages/privacidade/privacidade.component').then(m => m.PrivacidadeComponent),
    title: 'Política de Privacidade — Kianna',
  },
];
