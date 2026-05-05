import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./pages/agenda/agenda.component').then(m => m.AgendaComponent),
        title: 'Agenda — AgendaZap',
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('./pages/servicos/servicos.component').then(m => m.ServicosComponent),
        title: 'Serviços — AgendaZap',
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./pages/horarios/horarios.component').then(m => m.HorariosComponent),
        title: 'Horários — AgendaZap',
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Clientes' },
      },
      {
        path: 'relatorio',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Relatório' },
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Configurações' },
      },
    ],
  },
];
