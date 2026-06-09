import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/auth/auth.service';
import { AvisoComStats, AvisosRepository } from '@core/repositories/avisos.repository';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import {
  NotificacaoFormDialogComponent,
  NotificacaoFormDialogData,
} from './notificacao-form-dialog.component';
import {
  LeiturasDialogComponent,
  LeiturasDialogData,
} from './leituras-dialog.component';

@Component({
  selector: 'app-admin-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './notificacoes.component.html',
  styleUrl: './notificacoes.component.scss',
})
export class AdminNotificacoesComponent implements OnInit {
  private repo   = inject(AvisosRepository);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  private auth   = inject(AuthService);

  readonly carregando = signal(true);
  readonly avisos     = signal<AvisoComStats[]>([]);
  readonly erro       = signal<string | null>(null);

  readonly publicadas = computed(() => this.avisos().filter(a => a.estado === 'publicada'));
  readonly agendadas  = computed(() => this.avisos().filter(a => a.estado === 'agendada'));

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.avisos.set(await this.repo.historico());
    } catch (err) {
      console.error('[AdminNotificacoes] erro:', err);
      this.erro.set('Não foi possível carregar as notificações.');
    } finally {
      this.carregando.set(false);
    }
  }

  async novaNotificacao(): Promise<void> {
    const ref = this.dialog.open<
      NotificacaoFormDialogComponent,
      NotificacaoFormDialogData,
      AvisoComStats | null
    >(NotificacaoFormDialogComponent, {
      data: {},
      width: '560px',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const resultado = await firstValueFrom(ref.afterClosed());
    if (resultado) await this.carregar();
  }

  async editar(a: AvisoComStats): Promise<void> {
    const ref = this.dialog.open<
      NotificacaoFormDialogComponent,
      NotificacaoFormDialogData,
      AvisoComStats | null
    >(NotificacaoFormDialogComponent, {
      data: { aviso: a },
      width: '560px',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const resultado = await firstValueFrom(ref.afterClosed());
    if (resultado) await this.carregar();
  }

  verLeituras(a: AvisoComStats): void {
    this.dialog.open<LeiturasDialogComponent, LeiturasDialogData>(
      LeiturasDialogComponent,
      {
        data: { avisoId: a.id, titulo: a.titulo },
        width: '520px',
        maxWidth: '95vw',
        autoFocus: false,
      },
    );
  }

  async excluir(a: AvisoComStats): Promise<void> {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          titulo: 'Excluir notificação?',
          mensagem: `"${a.titulo}" será removida e deixará de aparecer para os profissionais. Esta ação não pode ser desfeita.`,
          confirmLabel: 'Excluir',
          tipo: 'warn',
        },
        autoFocus: false,
      },
    );
    const confirmou = await firstValueFrom(ref.afterClosed());
    if (!confirmou) return;

    try {
      await this.repo.excluir(a.id);
      this.snack.open('Notificação excluída', 'OK', { duration: 2500 });
      await this.carregar();
    } catch (err) {
      console.error('[AdminNotificacoes] erro ao excluir:', err);
      this.snack.open('Não foi possível excluir. Tente novamente.', 'OK', { duration: 4000 });
    }
  }

  formatar(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  porcentagemLida(a: AvisoComStats): number {
    if (a.total_destinatarios === 0) return 0;
    return Math.round((a.total_leituras / a.total_destinatarios) * 100);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
