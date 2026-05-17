import { Component, OnDestroy, OnInit, inject, computed } from '@angular/core';
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
import { AgendamentosStore } from '@features/dashboard/state/agendamentos.store';

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
export class HeaderComponent implements OnInit, OnDestroy {
  private auth    = inject(AuthService);
  private bp      = inject(BreakpointService);
  private agStore = inject(AgendamentosStore);

  readonly user          = currentUser;
  readonly isMobile      = this.bp.isMobile;
  readonly pendentesCount = this.agStore.pendentesCount;

  readonly iniciais = computed(() => {
    const nome = this.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
  });

  readonly planoBadge = computed(() => {
    const plano = this.user()?.plano;
    if (plano === 'pro')    return 'Pro';
    if (plano === 'studio') return 'Studio';
    return 'Gratuito';
  });

  ngOnInit(): void {
    const profId = this.user()?.id;
    if (!profId) return;
    this.agStore.subscribeRealtime(profId);
  }

  ngOnDestroy(): void {
    this.agStore.destruirRealtime();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
