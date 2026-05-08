import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/visao-geral/visao-geral.component').then(m => m.VisaoGeralComponent),
        title: 'Visão Geral — Kianna',
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
        title: 'Meu Perfil — Kianna',
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./pages/agenda/agenda.component').then(m => m.AgendaComponent),
        title: 'Agenda — Kianna',
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('./pages/servicos/servicos.component').then(m => m.ServicosComponent),
        title: 'Serviços — Kianna',
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./pages/horarios/horarios.component').then(m => m.HorariosComponent),
        title: 'Horários — Kianna',
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
          import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
        title: 'Configurações — Kianna',
      },
    ],
  },
];
