import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ExcluirContaDialogData {
  email: string;
}

@Component({
  selector: 'app-excluir-conta-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Excluir conta</h2>

    <mat-dialog-content>
      <p class="aviso">
        Esta ação <strong>desativa sua conta</strong>. Você não conseguirá mais entrar com este e-mail.
        Seus agendamentos, clientes e demais dados são <strong>preservados</strong> conforme nossa política
        e poderão ser recuperados em caso de reativação.
      </p>

      <p class="instrucao">
        Para confirmar, digite seu e-mail abaixo:
        <span class="email-hint">{{ data.email }}</span>
      </p>

      <input
        type="email"
        class="confirm-input"
        [ngModel]="digitado()"
        (ngModelChange)="digitado.set($event)"
        placeholder="seu@email.com"
        autocomplete="off"
        spellcheck="false"
        autocapitalize="off"
        aria-label="Digite seu e-mail para confirmar a exclusão"
      />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" class="btn-ghost" (click)="ref.close(false)">
        <mat-icon>close</mat-icon> Cancelar
      </button>
      <button
        type="button"
        class="btn-danger"
        [disabled]="!confirma()"
        (click)="ref.close(true)">
        <mat-icon>delete_outline</mat-icon> Excluir conta
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .aviso {
      margin: 0 0 16px;
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
    }

    .instrucao {
      margin: 0 0 8px;
      color: #334155;
      font-size: 13px;
    }

    .email-hint {
      display: block;
      margin-top: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-weight: 600;
      color: #0F172A;
      font-size: 13px;
      background: #F1F5F9;
      padding: 6px 10px;
      border-radius: 6px;
      word-break: break-all;
    }

    .confirm-input {
      width: 100%;
      margin-top: 12px;
      padding: 10px 12px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #0F172A;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .confirm-input:focus {
      border-color: #E11D48;
      box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.15);
    }

    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class ExcluirContaDialogComponent {
  data = inject<ExcluirContaDialogData>(MAT_DIALOG_DATA);
  ref  = inject(MatDialogRef<ExcluirContaDialogComponent>);

  readonly digitado = signal('');
  readonly confirma = computed(
    () => this.digitado().trim().toLowerCase() === this.data.email.trim().toLowerCase(),
  );
}
