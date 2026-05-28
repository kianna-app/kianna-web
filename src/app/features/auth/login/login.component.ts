import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/auth.service';
import { APP } from '@core/constants/app.constants';
import { isOnboardingDone } from '@core/signals/app.signals';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    LoadingButtonComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  readonly APP = APP;
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg  = signal('');
  showSenha = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.signIn(this.form.value.email!, this.form.value.senha!);
      await new Promise(r => setTimeout(r, 250));
      this.router.navigate([isOnboardingDone() ? '/dashboard' : '/onboarding']);
    } catch {
      this.errorMsg.set('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
