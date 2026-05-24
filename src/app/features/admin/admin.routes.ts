import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    title: 'Painel Admin — Kianna',
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      import('./pages/notificacoes/notificacoes.component').then(m => m.AdminNotificacoesComponent),
    title: 'Notificações — Admin Kianna',
  },
];
