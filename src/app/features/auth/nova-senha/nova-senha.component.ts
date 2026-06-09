import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/auth/auth.service';
import { APP } from '@core/constants/app.constants';
import { isOnboardingDone } from '@core/signals/app.signals';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';

function senhasIguaisValidator(control: AbstractControl) {
  const senha = control.get('senha');
  const confirmar = control.get('confirmarSenha');
  if (senha?.value !== confirmar?.value) {
    confirmar?.setErrors({ senhasDiferentes: true });
  } else if (confirmar?.hasError('senhasDiferentes')) {
    confirmar.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-nova-senha',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    LoadingButtonComponent,
  ],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">{{ APP.EMOJI }}</span>
          <span class="logo-text">{{ APP.NOME }}</span>
        </div>

        <h1 class="auth-title">Definir nova senha</h1>
        <p class="auth-subtitle">Crie uma senha segura para acessar sua conta.</p>

        @if (errorMsg()) {
          <div class="auth-error">
            <mat-icon>error_outline</mat-icon>
            {{ errorMsg() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="salvar()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nova senha</mat-label>
            <input
              matInput
              formControlName="senha"
              [type]="showSenha() ? 'text' : 'password'"
              autocomplete="new-password" />
            <mat-icon matPrefix>lock_outline</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showSenha.set(!showSenha())">
              <mat-icon>{{ showSenha() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('senha')?.hasError('required') && form.get('senha')?.touched) {
              <mat-error>Senha é obrigatória</mat-error>
            } @else if (form.get('senha')?.hasError('minlength')) {
              <mat-error>A senha deve ter pelo menos 8 caracteres</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar senha</mat-label>
            <input
              matInput
              formControlName="confirmarSenha"
              type="password"
              autocomplete="new-password" />
            <mat-icon matPrefix>lock_reset</mat-icon>
            @if (form.get('confirmarSenha')?.hasError('required') && form.get('confirmarSenha')?.touched) {
              <mat-error>Confirmação de senha é obrigatória</mat-error>
            } @else if (form.get('confirmarSenha')?.hasError('senhasDiferentes')) {
              <mat-error>As senhas não coincidem</mat-error>
            }
          </mat-form-field>

          <app-loading-button
            variant="raised"
            color="primary"
            type="submit"
            [loading]="salvando()"
            loadingText="Salvando..."
            class="full-width">
            Salvar senha
          </app-loading-button>
        </form>

        <p class="auth-footer">
          Já definiu a senha?
          <a routerLink="/auth/login">Entrar</a>
        </p>
      </div>
    </div>
  `,
})
export class NovaSenhaComponent {
  readonly APP = APP;
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly salvando = signal(false);
  readonly errorMsg = signal('');
  readonly showSenha = signal(false);

  readonly form = this.fb.group({
    senha: ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required],
  }, { validators: senhasIguaisValidator });

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.updatePassword(this.form.value.senha!);
      await this.router.navigate([isOnboardingDone() ? '/dashboard' : '/onboarding']);
    } catch {
      this.errorMsg.set('Link expirado ou inválido. Peça uma nova redefinição de senha.');
    } finally {
      this.salvando.set(false);
    }
  }
}
