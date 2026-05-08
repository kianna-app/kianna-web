import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-cfg-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    LoadingButtonComponent,
  ],
  template: `
    <div class="cfg-form">
      <h2>Sua conta</h2>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>E-mail</mat-label>
        <input matInput [value]="user()?.email ?? ''" readonly>
        <mat-hint>Para mudar o e-mail, entre em contato pelo suporte.</mat-hint>
      </mat-form-field>

      <h2>Trocar senha</h2>

      <form [formGroup]="form" (ngSubmit)="trocarSenha()" class="senha-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nova senha (mín. 8 caracteres)</mat-label>
          <input matInput formControlName="senha" type="password" autocomplete="new-password">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmar nova senha</mat-label>
          <input matInput formControlName="confirmar" type="password" autocomplete="new-password">
          @if (form.hasError('naoCoincidem') && form.get('confirmar')?.touched) {
            <mat-error>As senhas não coincidem</mat-error>
          }
        </mat-form-field>

        <div class="cfg-actions">
          <app-loading-button type="submit" variant="flat" color="primary"
                              [loading]="salvando()" [disabled]="form.invalid"
                              icon="lock_reset" iconPosition="start">
            Atualizar senha
          </app-loading-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .cfg-form { display: flex; flex-direction: column; gap: 16px; max-width: 480px; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase;
         letter-spacing: .04em; color: #64748B; margin: 8px 0 0; }
    .full-width { width: 100%; }
    .senha-form { display: flex; flex-direction: column; gap: 8px; }
    .cfg-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class PerfilComponent {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user = currentUser;

  form = this.fb.group({
    senha:     ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', Validators.required],
  }, {
    validators: (group) => {
      const s = group.get('senha')?.value;
      const c = group.get('confirmar')?.value;
      return s !== c ? { naoCoincidem: true } : null;
    },
  });

  async trocarSenha(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: this.form.value.senha! });
      if (error) throw error;
      this.snack.open('Senha atualizada', 'OK', { duration: 2000 });
      this.form.reset();
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao atualizar senha', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
