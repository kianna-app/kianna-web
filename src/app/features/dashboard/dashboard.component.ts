import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 40px; max-width: 720px; margin: 0 auto;">
      <h1 style="color: #1D9E75;">Olá, {{ currentUser()?.nome }} 👋</h1>
      <p style="color: #64748B; margin-top: 8px;">
        Seu dashboard será implementado no Módulo 2.
      </p>
      <p style="margin-top: 16px;">
        Seu link público: <strong>agendazap.tec/{{ currentUser()?.slug }}</strong>
      </p>
      <button mat-stroked-button color="warn" (click)="logout()" style="margin-top: 24px;">
        <mat-icon>logout</mat-icon> Sair
      </button>
    </div>
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  currentUser = currentUser;
  logout() { this.auth.signOut(); }
}
