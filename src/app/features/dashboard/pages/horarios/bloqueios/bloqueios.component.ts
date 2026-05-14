import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BloqueiosStore } from '../../../state/bloqueios.store';
import { AddBloqueioDialogComponent } from './add-bloqueio-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bloqueios',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="bloqueios-wrap">
      <div class="bloqueios-header">
        <div>
          <h3 class="titulo">Bloqueios de agenda</h3>
          <p class="subtitulo">Bloqueie dias ou períodos específicos em que você não atenderá</p>
        </div>
        <button mat-flat-button color="primary" class="btn-adicionar" (click)="abrirDialog()">
          <mat-icon>add</mat-icon>
          Adicionar bloqueio
        </button>
      </div>

      @if (store.carregando()) {
        <div class="loading-center"><mat-spinner diameter="32" /></div>
      } @else if (store.bloqueios().length === 0) {
        <div class="vazio">
          <mat-icon>event_available</mat-icon>
          <p>Nenhum bloqueio configurado</p>
        </div>
      } @else {
        <div class="lista">
          @for (b of store.bloqueios(); track b.id) {
            <div class="bloqueio-item">
              <div class="bloqueio-info">
                <span class="bloqueio-data">{{ b.data | date:'dd/MM/yyyy (EEE)':'':'pt-BR' }}</span>
                <span class="bloqueio-periodo">
                  @if (b.hora_inicio) {
                    {{ b.hora_inicio }} – {{ b.hora_fim }}
                  } @else {
                    Dia inteiro
                  }
                </span>
                @if (b.motivo) {
                  <span class="bloqueio-motivo">{{ b.motivo }}</span>
                }
              </div>
              <button class="btn-excluir" (click)="excluir(b.id)" [disabled]="excluindo() === b.id" aria-label="Excluir">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bloqueios-wrap { padding: 16px 0; }

    .bloqueios-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
    }
    .titulo    { font: 600 15px 'Inter'; color: var(--text-1); margin: 0; }
    .subtitulo { font: 400 13px 'Inter'; color: var(--text-3); margin: 4px 0 0; }
    .btn-adicionar { gap: 4px; }

    .loading-center { display: flex; justify-content: center; padding: 24px; }

    .vazio {
      text-align: center; padding: 32px 16px; color: var(--text-3);
      mat-icon { font-size: 36px; color: var(--border-soft); display: block; margin-bottom: 8px; }
      p { font: 400 14px 'Inter'; margin: 0; }
    }

    .lista { display: flex; flex-direction: column; gap: 8px; }

    .bloqueio-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px;
      background: var(--bg-card); border: 1px solid var(--border-soft);
      border-radius: var(--r-md); gap: 12px;
    }
    .bloqueio-info { display: flex; flex-direction: column; gap: 2px; }
    .bloqueio-data   { font: 600 13px 'Inter'; color: var(--text-1); }
    .bloqueio-periodo{ font: 500 12px 'Inter'; color: var(--c-primary); }
    .bloqueio-motivo { font: 400 12px 'Inter'; color: var(--text-3); font-style: italic; }

    .btn-excluir {
      background: none; border: none; cursor: pointer;
      color: var(--text-4); padding: 6px; display: flex; align-items: center; border-radius: 6px;
      &:hover { color: var(--c-rose); background: var(--c-rose-bg); }
      &:disabled { opacity: 0.4; cursor: default; }
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
    }
  `],
})
export class BloqueiosComponent implements OnInit {
  readonly store    = inject(BloqueiosStore);
  private snack     = inject(MatSnackBar);
  private dialog    = inject(MatDialog);
  readonly excluindo = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.store.carregar();
  }

  async abrirDialog(): Promise<void> {
    const ref = this.dialog.open(AddBloqueioDialogComponent, { width: '400px' });
    await firstValueFrom(ref.afterClosed());
  }

  async excluir(id: string): Promise<void> {
    this.excluindo.set(id);
    try {
      await this.store.excluir(id);
      this.snack.open('Bloqueio removido.', '', { duration: 2000 });
    } catch {
      this.snack.open('Erro ao remover bloqueio.', 'OK', { duration: 3000 });
    } finally {
      this.excluindo.set(null);
    }
  }
}
