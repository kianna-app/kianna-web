import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';

export interface EditCredentialsDialogData {
  id: string;
  nome: string;
  wpp_instance_id: string | null;
  wpp_token: string | null;
}

@Component({
  selector: 'app-edit-credentials-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Credenciais Z-API — {{ data.nome }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Instance ID</mat-label>
          <input matInput formControlName="wpp_instance_id" placeholder="Ex.: 3DXXXX123" />
          <mat-error>Obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Token</mat-label>
          <input
            matInput
            formControlName="wpp_token"
            [type]="tokenVisivel() ? 'text' : 'password'"
            placeholder="Token Z-API"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="tokenVisivel.set(!tokenVisivel())"
            [attr.aria-label]="tokenVisivel() ? 'Ocultar token' : 'Revelar token'"
          >
            <mat-icon>{{ tokenVisivel() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-hint *ngIf="data.wpp_token && !form.get('wpp_token')?.dirty">
            Token atual: {{ mascarar(data.wpp_token) }}
          </mat-hint>
          <mat-error>Obrigatório</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        (click)="salvar()"
        [disabled]="form.invalid || salvando()"
      >
        {{ salvando() ? 'Salvando…' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 340px;
      padding-top: 8px;
    }
    mat-form-field { width: 100%; }
  `],
})
export class EditCredentialsDialogComponent {
  readonly data = inject<EditCredentialsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditCredentialsDialogComponent>);
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly salvando = signal(false);
  readonly tokenVisivel = signal(false);

  form = this.fb.group({
    wpp_instance_id: [this.data.wpp_instance_id ?? '', [Validators.required]],
    wpp_token: [this.data.wpp_token ?? '', [Validators.required]],
  });

  mascarar(token: string): string {
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}…${token.slice(-4)}`;
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);
    try {
      const v = this.form.getRawValue();
      await this.api.put(`/api/admin/profissionais/${this.data.id}/whatsapp`, {
        wpp_instance_id: v.wpp_instance_id!.trim(),
        wpp_token: v.wpp_token!.trim(),
      });
      this.snack.open('Credenciais salvas', 'OK', { duration: 2000 });
      this.dialogRef.close(true);
    } catch (e: unknown) {
      this.snack.open(
        e instanceof Error ? e.message : 'Erro ao salvar',
        'OK',
        { duration: 3000 },
      );
    } finally {
      this.salvando.set(false);
    }
  }
}
