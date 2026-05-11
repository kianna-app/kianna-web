import { Component, inject, signal, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';
import { BreakpointService } from '@core/services/breakpoint.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatMenuModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private snack = inject(MatSnackBar);
  private auth  = inject(AuthService);
  private bp    = inject(BreakpointService);

  readonly user     = currentUser;
  readonly isMobile = this.bp.isMobile;
  readonly copiado  = signal(false);

  @Output() abrirMenu = new EventEmitter<void>();

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  readonly iniciais = computed(() => {
    const nome = this.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
  });

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

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
