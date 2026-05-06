import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tipo?: 'warn' | 'primary';
  ocultarCancelar?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6">{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap: 8px; padding: 16px">
      @if (!data.ocultarCancelar) {
        <button mat-button (click)="ref.close(false)">{{ data.cancelLabel ?? 'Cancelar' }}</button>
      }
      <button mat-raised-button [color]="data.tipo ?? 'warn'" (click)="ref.close(true)">
        {{ data.confirmLabel ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<ConfirmDialogComponent>);
}
