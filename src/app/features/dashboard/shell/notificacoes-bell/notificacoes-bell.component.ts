import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvisosStore } from '@features/dashboard/state/avisos.store';

@Component({
  selector: 'app-notificacoes-bell',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatMenuModule, MatTooltipModule,
  ],
  templateUrl: './notificacoes-bell.component.html',
  styleUrl: './notificacoes-bell.component.scss',
})
export class NotificacoesBellComponent implements OnInit {
  private store = inject(AvisosStore);

  readonly avisos      = this.store.avisos;
  readonly carregando  = this.store.carregando;
  readonly erro        = this.store.erro;
  readonly naoLidas    = this.store.naoLidasCount;

  readonly expandido = signal<string | null>(null);

  readonly badgeText = computed(() => {
    const n = this.naoLidas();
    if (n === 0) return '';
    return n > 9 ? '9+' : String(n);
  });

  async ngOnInit(): Promise<void> {
    await this.store.recarregar();
  }

  async onMenuOpened(): Promise<void> {
    await this.store.recarregar();
  }

  async toggleExpand(id: string): Promise<void> {
    const novo = this.expandido() === id ? null : id;
    this.expandido.set(novo);
    if (novo) await this.store.marcarLido(novo);
  }

  async marcarTodas(ev: Event): Promise<void> {
    ev.stopPropagation();
    await this.store.marcarTodasLidas();
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  formatarData(iso: string): string {
    const d = new Date(iso);
    const agora = new Date();
    const diffMs = agora.getTime() - d.getTime();
    const dias = Math.floor(diffMs / 86400000);

    if (dias === 0) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    if (dias === 1) return 'Ontem';
    if (dias < 7)   return `${dias}d atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
