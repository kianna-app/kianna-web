import { Component, OnDestroy, OnInit, inject, computed, signal, EventEmitter, Output } from '@angular/core';
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
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { supabase } from '@core/supabase/supabase.client';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  private auth             = inject(AuthService);
  private bp               = inject(BreakpointService);
  private agendamentosRepo = inject(AgendamentosRepository);

  readonly user          = currentUser;
  readonly isMobile      = this.bp.isMobile;
  readonly pendentesCount = signal(0);

  private realtimeChannel?: RealtimeChannel;

  @Output() abrirMenu = new EventEmitter<void>();

  readonly iniciais = computed(() => {
    const nome = this.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
  });

  async ngOnInit(): Promise<void> {
    const profId = this.user()?.id;
    if (!profId) return;

    this.pendentesCount.set(await this.agendamentosRepo.contarPendentes(profId));
    this.subscribeToAgendamentos(profId);
  }

  ngOnDestroy(): void {
    this.realtimeChannel?.unsubscribe();
  }

  private subscribeToAgendamentos(profissionalId: string): void {
    this.realtimeChannel = supabase
      .channel('agendamentos-pendentes-header')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `profissional_id=eq.${profissionalId}`,
        },
        () => {
          this.agendamentosRepo.contarPendentes(profissionalId)
            .then(n => this.pendentesCount.set(n))
            .catch(() => null);
        },
      )
      .subscribe();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
