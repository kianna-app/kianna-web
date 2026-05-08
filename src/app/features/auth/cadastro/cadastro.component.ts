import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '@core/auth/auth.service';
import { APP } from '@core/constants/app.constants';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';

function senhasIguaisValidator(control: AbstractControl) {
  const senha    = control.get('senha');
  const confirma = control.get('confirmarSenha');
  if (senha?.value !== confirma?.value) {
    confirma?.setErrors({ senhasDiferentes: true });
  } else if (confirma?.hasError('senhasDiferentes')) {
    confirma?.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatCheckboxModule, LoadingButtonComponent,
  ],
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  readonly APP = APP;
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg  = signal('');
  showSenha = signal(false);

  form = this.fb.group({
    nome:           ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    senha:          ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required],
    termos:         [false, Validators.requiredTrue],
  }, { validators: senhasIguaisValidator });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.signUp(
        this.form.value.email!,
        this.form.value.senha!,
        this.form.value.nome!,
      );
      await this.auth.signIn(this.form.value.email!, this.form.value.senha!);
      await new Promise(r => setTimeout(r, 250));
      this.router.navigate(['/onboarding']);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : '').toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        this.errorMsg.set('Esse e-mail já está cadastrado. Tente fazer login.');
      } else {
        this.errorMsg.set('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
