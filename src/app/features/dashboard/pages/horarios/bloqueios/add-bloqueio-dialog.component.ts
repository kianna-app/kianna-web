import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BloqueiosStore } from '../../../state/bloqueios.store';

@Component({
  selector: 'app-add-bloqueio-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatRadioModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <h2 class="dialog-titulo">Novo bloqueio</h2>
        <button class="btn-icon-close" mat-dialog-close aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="form-body">
        <mat-form-field appearance="outline">
          <mat-label>Data</mat-label>
          <input matInput type="date" [(ngModel)]="data" [min]="hoje">
        </mat-form-field>

        <div class="tipo-row">
          <label class="tipo-label">Tipo de bloqueio</label>
          <div class="tipo-opcoes">
            <label class="tipo-opcao" [class.selecionado]="tipo === 'dia'">
              <input type="radio" [(ngModel)]="tipo" value="dia"> Dia inteiro
            </label>
            <label class="tipo-opcao" [class.selecionado]="tipo === 'periodo'">
              <input type="radio" [(ngModel)]="tipo" value="periodo"> Período específico
            </label>
          </div>
        </div>

        @if (tipo === 'periodo') {
          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Hora início</mat-label>
              <input matInput type="time" [(ngModel)]="horaInicio">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Hora fim</mat-label>
              <input matInput type="time" [(ngModel)]="horaFim">
            </mat-form-field>
          </div>
        }

        <mat-form-field appearance="outline">
          <mat-label>Motivo (opcional)</mat-label>
          <input matInput [(ngModel)]="motivo" placeholder="Ex: Consulta médica">
        </mat-form-field>
      </div>

      <div class="dialog-actions">
        <button class="btn-ghost" mat-dialog-close>Cancelar</button>
        <button class="btn-primary" (click)="salvar()" [disabled]="!data || salvando()">
          @if (salvando()) { <mat-spinner diameter="16" /> }
          Salvar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 24px; min-width: 340px; max-width: 420px; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .dialog-titulo { font: 700 18px 'Inter'; color: #212529; margin: 0; }
    .btn-icon-close {
      width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e9ecef;
      background: #fff; display: grid; place-items: center; cursor: pointer; color: #868e96;
      &:hover { background: #f8f9fa; color: #212529; }
    }
    .form-body { display: flex; flex-direction: column; gap: 8px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    mat-form-field { width: 100%; }
    .tipo-label { font: 500 13px 'Inter'; color: #495057; display: block; margin-bottom: 6px; }
    .tipo-opcoes { display: flex; gap: 12px; }
    .tipo-opcao {
      display: flex; align-items: center; gap: 6px;
      font: 400 14px 'Inter'; cursor: pointer; padding: 6px 12px;
      border: 1.5px solid #e9ecef; border-radius: 8px;
      &.selecionado { border-color: #1D9E75; background: #E8F5F0; color: #0F5C44; }
      input[type=radio] { display: none; }
    }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `],
})
export class AddBloqueioDialogComponent {
  private store = inject(BloqueiosStore);
  private snack = inject(MatSnackBar);
  private ref   = inject(MatDialogRef<AddBloqueioDialogComponent>);

  readonly salvando = signal(false);

  data       = '';
  tipo       = 'dia';
  horaInicio = '';
  horaFim    = '';
  motivo     = '';

  get hoje(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async salvar(): Promise<void> {
    if (!this.data) return;

    if (this.tipo === 'periodo' && (!this.horaInicio || !this.horaFim)) {
      this.snack.open('Informe hora de início e fim.', 'OK', { duration: 3000 });
      return;
    }
    if (this.tipo === 'periodo' && this.horaFim <= this.horaInicio) {
      this.snack.open('Hora fim deve ser maior que hora início.', 'OK', { duration: 3000 });
      return;
    }

    this.salvando.set(true);
    try {
      await this.store.adicionar({
        data: this.data,
        ...(this.tipo === 'periodo' ? { hora_inicio: this.horaInicio, hora_fim: this.horaFim } : {}),
        motivo: this.motivo || undefined,
      });
      this.snack.open('Bloqueio adicionado!', '', { duration: 2500 });
      this.ref.close(true);
    } catch {
      this.snack.open('Erro ao salvar bloqueio.', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
