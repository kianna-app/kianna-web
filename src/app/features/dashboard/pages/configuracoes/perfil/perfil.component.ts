import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-cfg-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    LoadingButtonComponent,
  ],
  template: `
    <div class="cfg-tab-content">

      <!-- ── Card: Informações da conta ─────────────────────── -->
      <div class="cfg-card">
        <div class="cfg-card-head">
          <div class="cfg-card-icon icon-blue">
            <mat-icon>person</mat-icon>
          </div>
          <div>
            <h3 class="cfg-card-titulo">Informações da conta</h3>
            <p class="cfg-card-desc">Seus dados de acesso e identificação</p>
          </div>
        </div>

        <div class="cfg-card-body">
          @if (user(); as u) {
            <div class="perfil-info-list">

              <div class="perfil-info-item">
                <div class="perfil-info-avatar">
                  @if (u.foto_url) {
                    <img [src]="u.foto_url" [alt]="u.nome" class="avatar-img">
                  } @else {
                    <div class="avatar-fallback">
                      {{ u.nome.charAt(0).toUpperCase() }}
                    </div>
                  }
                </div>
                <div class="perfil-info-text">
                  <span class="perfil-info-name">{{ u.nome }}</span>
                  <span class="perfil-info-badge" [attr.data-plano]="u.plano">
                    @switch (u.plano) {
                      @case ('gratis')  { Plano Gratuito }
                      @case ('pro')     { Plano Pro }
                      @case ('studio')  { Plano Studio }
                    }
                  </span>
                </div>
              </div>

              <div class="perfil-info-row">
                <mat-icon>email</mat-icon>
                <div>
                  <span class="perfil-row-label">E-mail</span>
                  <span class="perfil-row-value">{{ u.email }}</span>
                </div>
              </div>

              <div class="perfil-info-row">
                <mat-icon>phone</mat-icon>
                <div>
                  <span class="perfil-row-label">WhatsApp</span>
                  <span class="perfil-row-value">{{ u.whatsapp || '—' }}</span>
                </div>
              </div>

              <div class="perfil-info-row">
                <mat-icon>link</mat-icon>
                <div>
                  <span class="perfil-row-label">Link público</span>
                  <span class="perfil-row-value link-value">kianna.com.br/{{ u.slug }}</span>
                </div>
              </div>
            </div>

            <p class="perfil-hint">Para alterar e-mail ou WhatsApp, entre em contato pelo suporte.</p>
          }
        </div>
      </div>

      <!-- ── Card: Segurança ─────────────────────────────────── -->
      <div class="cfg-card">
        <div class="cfg-card-head">
          <div class="cfg-card-icon icon-slate">
            <mat-icon>lock</mat-icon>
          </div>
          <div>
            <h3 class="cfg-card-titulo">Segurança</h3>
            <p class="cfg-card-desc">Atualize sua senha de acesso</p>
          </div>
        </div>

        <div class="cfg-card-body">
          <form [formGroup]="form" (ngSubmit)="trocarSenha()" class="senha-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nova senha</mat-label>
              <mat-icon matPrefix class="field-icon">lock_outline</mat-icon>
              <input matInput formControlName="senha" type="password"
                     autocomplete="new-password"
                     placeholder="Mínimo 8 caracteres">
              @if (form.get('senha')?.hasError('minlength') && form.get('senha')?.touched) {
                <mat-error>Mínimo de 8 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar nova senha</mat-label>
              <mat-icon matPrefix class="field-icon">lock_outline</mat-icon>
              <input matInput formControlName="confirmar" type="password"
                     autocomplete="new-password"
                     placeholder="Repita a nova senha">
              @if (form.hasError('naoCoincidem') && form.get('confirmar')?.touched) {
                <mat-error>As senhas não coincidem</mat-error>
              }
            </mat-form-field>

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
    .cfg-tab-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Card base */
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
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cfg-card-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .icon-blue  { background: #EFF6FF; }
    .icon-blue mat-icon  { color: #3B82F6; }
    .icon-slate { background: #F1F5F9; }
    .icon-slate mat-icon { color: #475569; }

    .cfg-card-titulo {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 2px;
    }

    .cfg-card-desc {
      font-size: 13px;
      color: #64748B;
      margin: 0;
      line-height: 1.4;
    }

    .cfg-card-body {
      padding: 16px 20px 20px;
    }

    /* Perfil info */
    .perfil-info-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .perfil-info-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0 16px;
      border-bottom: 1px solid #F1F5F9;
      margin-bottom: 4px;
    }

    .perfil-info-avatar { flex-shrink: 0; }

    .avatar-img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #E2E8F0;
    }

    .avatar-fallback {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1D9E75, #107B57);
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .perfil-info-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .perfil-info-name {
      font-size: 16px;
      font-weight: 700;
      color: #0F172A;
    }

    .perfil-info-badge {
      display: inline-flex;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 99px;
      background: #F1F5F9;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .perfil-info-badge[data-plano="pro"]    { background: #EFF6FF; color: #1D4ED8; }
    .perfil-info-badge[data-plano="studio"] { background: #F5F3FF; color: #6D28D9; }

    .perfil-info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #F8FAFC;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #94A3B8;
        flex-shrink: 0;
      }

      div {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
    }

    .perfil-row-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94A3B8;
    }

    .perfil-row-value {
      font-size: 14px;
      color: #334155;
      font-weight: 500;
    }

    .link-value {
      color: #1D9E75;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }

    .perfil-hint {
      font-size: 12px;
      color: #94A3B8;
      margin: 12px 0 0;
      padding: 10px 12px;
      background: #F8FAFC;
      border-radius: 8px;
      border-left: 3px solid #E2E8F0;
    }

    /* Senha form */
    .senha-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 480px;
    }

    .full-width { width: 100%; }

    .field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #94A3B8;
      margin-right: 4px;
    }

    .senha-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `],
})
export class PerfilComponent {
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user     = currentUser;

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
      this.snack.open('Senha atualizada com sucesso', 'OK', { duration: 2000 });
      this.form.reset();
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao atualizar senha', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
