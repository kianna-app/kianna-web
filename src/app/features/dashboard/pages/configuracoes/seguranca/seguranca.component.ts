import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';

@Component({
  selector: 'app-cfg-seguranca',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    LoadingButtonComponent,
  ],
  template: `
    <div class="cfg-tab-content">
      <div class="cfg-card">
        <div class="cfg-card-head">
          <div class="cfg-card-icon icon-slate">
            <mat-icon>lock</mat-icon>
          </div>
          <div>
            <h3 class="cfg-card-titulo">Alterar senha</h3>
            <p class="cfg-card-desc">Defina uma nova senha de acesso à sua conta</p>
          </div>
        </div>

        <div class="cfg-card-body">
          <form [formGroup]="form" (ngSubmit)="trocarSenha()" class="senha-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nova senha</mat-label>
              <mat-icon matPrefix class="field-icon">lock_outline</mat-icon>
              <input matInput formControlName="senha" type="password"
                     autocomplete="new-password"
                     placeholder="Mínimo 8 caracteres"
                     [attr.aria-describedby]="form.get('senha')?.invalid && form.get('senha')?.touched ? 'err-senha' : null">
              @if (form.get('senha')?.hasError('minlength') && form.get('senha')?.touched) {
                <mat-error id="err-senha">Mínimo de 8 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar nova senha</mat-label>
              <mat-icon matPrefix class="field-icon">lock_outline</mat-icon>
              <input matInput formControlName="confirmar" type="password"
                     autocomplete="new-password"
                     placeholder="Repita a nova senha"
                     [attr.aria-describedby]="form.hasError('naoCoincidem') && form.get('confirmar')?.touched ? 'err-confirmar' : null">
            </mat-form-field>
            @if (form.hasError('naoCoincidem') && form.get('confirmar')?.touched) {
              <p class="campo-erro" id="err-confirmar" role="alert">As senhas não coincidem</p>
            }

            <div class="senha-actions">
              <app-loading-button
                type="submit"
                variant="flat"
                color="primary"
                [loading]="salvando()"
                [disabled]="form.invalid"
                icon="lock_reset"
                iconPosition="start">
                Atualizar senha
              </app-loading-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cfg-tab-content { display: flex; flex-direction: column; gap: 16px; }

    .cfg-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }
    .cfg-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }

    .cfg-card-head {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 20px 20px 0;
    }

    .cfg-card-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .cfg-card-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .icon-slate { background: #F1F5F9; }
    .icon-slate mat-icon { color: #475569; }

    .cfg-card-titulo {
      font-size: 15px; font-weight: 700;
      color: #0F172A; margin: 0 0 2px;
    }
    .cfg-card-desc {
      font-size: 13px; color: #64748B;
      margin: 0; line-height: 1.4;
    }
    .cfg-card-body { padding: 16px 20px 20px; }

    .senha-form {
      display: flex; flex-direction: column;
      gap: 4px; max-width: 480px;
    }
    .full-width { width: 100%; }
    .field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #94A3B8;
      margin-right: 4px;
    }
    .campo-erro {
      color: #B91C1C;
      font-size: 12px;
      margin: -8px 0 4px 16px;
      line-height: 1.4;
    }
    .senha-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `],
})
export class SegurancaComponent {
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);

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
      this.form.reset();
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.snack.open('Senha atualizada com sucesso!', 'OK', { duration: 3000 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      this.snack.open(this.traduzirErroAuth(msg), 'OK', { duration: 4000 });
    } finally {
      this.salvando.set(false);
    }
  }

  private traduzirErroAuth(msg: string): string {
    if (msg.toLowerCase().includes('new password should be different')) {
      return 'A nova senha deve ser diferente da senha atual.';
    }
    if (msg.toLowerCase().includes('password should be at least')) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }
    if (msg.toLowerCase().includes('weak password')) {
      return 'Senha muito fraca. Use letras, números e símbolos.';
    }
    if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('not authenticated')) {
      return 'Sessão expirada. Faça login novamente.';
    }
    if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    }
    return 'Erro ao atualizar senha. Tente novamente.';
  }
}
