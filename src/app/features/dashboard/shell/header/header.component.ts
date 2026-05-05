import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private snack = inject(MatSnackBar);

  readonly user    = currentUser;
  readonly copiado = signal(false);

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  async copiarLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.linkPublico);
      this.copiado.set(true);
      this.snack.open('Link copiado!', 'OK', { duration: 2000 });
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.snack.open('Não foi possível copiar', 'OK', { duration: 2000 });
    }
  }
}
