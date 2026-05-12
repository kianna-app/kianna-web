import { Component, inject, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
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
  private auth = inject(AuthService);
  private bp   = inject(BreakpointService);

  readonly user     = currentUser;
  readonly isMobile = this.bp.isMobile;

  @Output() abrirMenu = new EventEmitter<void>();

  readonly iniciais = computed(() => {
    const nome = this.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
  });

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
