import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
    title: 'Entrar — AgendaZap',
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./cadastro/cadastro.component').then(m => m.CadastroComponent),
    title: 'Criar conta — AgendaZap',
  },
];
