import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height: 100vh; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 12px; padding: 32px;">
      <h1 style="font-size: 64px; margin: 0; color: #1D9E75;">404</h1>
      <p style="color: #64748B;">Página não encontrada</p>
      <a routerLink="/" style="color: #1D9E75; font-weight: 600;">Voltar ao início</a>
    </div>
  `,
})
export class NotFoundComponent {}
