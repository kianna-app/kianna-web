import { Routes } from '@angular/router';
import { publicGuard } from '@core/auth/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
    title: 'Entrar — Kianna',
  },
  {
    path: 'cadastro',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./cadastro/cadastro.component').then(m => m.CadastroComponent),
    title: 'Criar conta — Kianna',
  },
  {
    path: 'nova-senha',
    loadComponent: () =>
      import('./nova-senha/nova-senha.component').then(m => m.NovaSenhaComponent),
    title: 'Definir nova senha — Kianna',
  },
];
