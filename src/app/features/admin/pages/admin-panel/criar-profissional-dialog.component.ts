import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { KiannaValidators } from '@core/validators/form.validators';
import { gerarSlug } from '@core/utils/slug.util';
import { environment } from '@environments/environment';

interface ProfissionalCriado {
  id: string;
  nome: string;
  slug: string;
}

@Component({
  selector: 'app-criar-profissional-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="ios-sheet">
      <header class="sheet-header">
        <button type="button" class="sheet-btn" (click)="cancelar()">Cancelar</button>
        <h2 class="sheet-title">Novo profissional</h2>
        <button
          type="button"
          class="sheet-btn sheet-btn--primary"
          [disabled]="form.invalid || salvando()"
          (click)="salvar()"
        >
          {{ salvando() ? 'Criando…' : 'Criar' }}
        </button>
      </header>

      <div class="sheet-body" [formGroup]="form">
        <h3 class="group-label">Identificação</h3>
        <section class="group">
          <label class="row">
            <span class="row-label">Nome</span>
            <input class="row-input" type="text" formControlName="nome" placeholder="Maria Silva" />
          </label>

          <label class="row">
            <span class="row-label">E-mail</span>
            <input
              class="row-input"
              type="email"
              formControlName="email"
              placeholder="maria@exemplo.com"
              autocomplete="off"
            />
          </label>
        </section>

        <h3 class="group-label">URL pública</h3>
        <section class="group">
          <label class="row">
            <span class="row-label">Slug</span>
            <input
              class="row-input row-input--mono"
              type="text"
              formControlName="slug"
              (input)="formatarSlug()"
              placeholder="maria-silva"
              spellcheck="false"
              autocomplete="off"
            />
          </label>
          <div class="row row--info">
            <span class="row-label">URL</span>
            <span class="row-link">{{ urlPublica() }}</span>
          </div>
        </section>

        <p class="hint">
          O profissional será criado em estado <strong>pendente</strong>.
          Bio, foto e demais dados podem ser preenchidos depois.
        </p>
        <p class="hint hint--warning">
          O fluxo de acesso (convite/senha) ainda precisa ser definido —
          enquanto isso, o operador gerencia o perfil pelo painel admin.
        </p>
      </div>
    </div>
  `,
  styleUrl: './ios-sheet.scss',
})
export class CriarProfissionalDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<CriarProfissionalDialogComponent, ProfissionalCriado | null>,
  );
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly salvando = signal(false);

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    slug: ['', KiannaValidators.slug()],
  });

  readonly urlPublica = computed(() => {
    const slug = this.form.get('slug')?.value ?? '';
    const origin =
      typeof window !== 'undefined' ? window.location.origin : (environment.apiUrl ?? '');
    return slug ? `${origin}/${slug}` : `${origin}/seu-slug`;
  });

  formatarSlug(): void {
    const v = this.form.get('slug')?.value ?? '';
    const limpo = gerarSlug(v);
    if (limpo !== v) this.form.get('slug')?.setValue(limpo, { emitEvent: false });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    try {
      const v = this.form.getRawValue();
      const criado = await this.api.post<ProfissionalCriado>('/api/admin/profissionais', {
        nome: v.nome!.trim(),
        email: v.email!.trim(),
        slug: v.slug,
      });
      this.snack.open('Profissional criado', 'OK', { duration: 2000 });
      this.dialogRef.close(criado);
    } catch (e: unknown) {
      const err = e as { error?: { message?: string }; message?: string };
      const msg = err?.error?.message ?? err?.message ?? 'Erro ao criar';
      this.snack.open(msg, 'OK', { duration: 4000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
