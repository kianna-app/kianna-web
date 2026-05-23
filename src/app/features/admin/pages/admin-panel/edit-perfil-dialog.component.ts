import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { KiannaValidators } from '@core/validators/form.validators';
import { gerarSlug } from '@core/utils/slug.util';
import { supabase } from '@core/supabase/supabase.client';
import { environment } from '@environments/environment';

export interface EditPerfilDialogData {
  id: string;
  nome: string;
  slug: string;
  bio: string | null;
  foto_url: string | null;
}

interface PerfilSalvo {
  id: string;
  nome: string;
  slug: string;
  bio: string | null;
  foto_url: string | null;
}

@Component({
  selector: 'app-edit-perfil-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="ios-sheet">
      <header class="sheet-header">
        <button type="button" class="sheet-btn" (click)="cancelar()">Cancelar</button>
        <h2 class="sheet-title">Perfil</h2>
        <button
          type="button"
          class="sheet-btn sheet-btn--primary"
          [disabled]="form.invalid || salvando()"
          (click)="salvar()"
        >
          {{ salvando() ? 'Salvando…' : 'Salvar' }}
        </button>
      </header>

      <div class="sheet-body">
        <!-- Foto -->
        <section class="group group--centered">
          <div class="avatar-wrap">
            @if (fotoPreview()) {
              <img [src]="fotoPreview()!" alt="Foto do profissional" class="avatar" />
            } @else {
              <div class="avatar avatar--placeholder">{{ iniciais() }}</div>
            }
            @if (fotoUploading()) {
              <div class="avatar-overlay">…</div>
            }
          </div>

          <div class="avatar-actions">
            <label class="action-btn">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                (change)="onFileChange($event)"
              />
              {{ fotoPreview() ? 'Trocar foto' : 'Adicionar foto' }}
            </label>
            @if (fotoPreview()) {
              <button
                type="button"
                class="action-btn action-btn--destructive"
                (click)="removerFoto()"
              >
                Remover
              </button>
            }
          </div>
        </section>

        <!-- Dados básicos -->
        <h3 class="group-label">Informações</h3>
        <section class="group" [formGroup]="form">
          <label class="row">
            <span class="row-label">Nome</span>
            <input class="row-input" type="text" formControlName="nome" />
          </label>

          <label class="row row--column">
            <span class="row-label">Bio</span>
            <textarea
              class="row-input row-textarea"
              formControlName="bio"
              rows="3"
              maxlength="2000"
              placeholder="Conte um pouco sobre você"
            ></textarea>
            <span class="row-hint">{{ bioLen() }}/2000</span>
          </label>
        </section>

        <!-- Slug / URL -->
        <h3 class="group-label">URL pública</h3>
        <section class="group" [formGroup]="form">
          <label class="row">
            <span class="row-label">Slug</span>
            <input
              class="row-input row-input--mono"
              type="text"
              formControlName="slug"
              (input)="formatarSlug()"
              autocomplete="off"
              spellcheck="false"
            />
          </label>

          <div class="row row--info">
            <span class="row-label">URL</span>
            <a
              class="row-link"
              [href]="urlPublica()"
              target="_blank"
              rel="noopener"
            >
              {{ urlPublica() }}
            </a>
          </div>
        </section>

        @if (slugMudou()) {
          <p class="hint hint--warning">
            Ao salvar, a URL pública atual <strong>{{ data.slug }}</strong> deixará de funcionar.
          </p>
        }

        @if (form.get('slug')?.touched && form.get('slug')?.invalid) {
          <p class="hint hint--error">
            Use apenas letras minúsculas, números e hífens (ex.: <em>maria-silva</em>).
          </p>
        }
      </div>
    </div>
  `,
  styleUrl: './ios-sheet.scss',
})
export class EditPerfilDialogComponent {
  readonly data = inject<EditPerfilDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditPerfilDialogComponent, PerfilSalvo | null>);
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly salvando = signal(false);
  readonly fotoUploading = signal(false);
  readonly fotoUrl = signal<string | null>(this.data.foto_url);

  form = this.fb.group({
    nome: [this.data.nome, [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    bio: [this.data.bio ?? '', Validators.maxLength(2000)],
    slug: [this.data.slug, KiannaValidators.slug()],
  });

  readonly fotoPreview = computed(() => this.fotoUrl());
  readonly bioLen = computed(() => (this.form.get('bio')?.value ?? '').length);

  readonly slugMudou = computed(() => {
    const v = this.form.get('slug')?.value ?? '';
    return v !== this.data.slug;
  });

  readonly urlPublica = computed(() => {
    const slug = this.form.get('slug')?.value ?? this.data.slug;
    const origin =
      typeof window !== 'undefined' ? window.location.origin : (environment.apiUrl ?? '');
    return `${origin}/${slug}`;
  });

  iniciais(): string {
    const nome = this.form.get('nome')?.value ?? this.data.nome ?? '';
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatarSlug(): void {
    const v = this.form.get('slug')?.value ?? '';
    const limpo = gerarSlug(v);
    if (limpo !== v) this.form.get('slug')?.setValue(limpo, { emitEvent: false });
  }

  onFileChange(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (file) this.uploadFoto(file);
  }

  private async uploadFoto(file: File): Promise<void> {
    const tiposOk = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposOk.includes(file.type)) {
      this.snack.open('Use JPG, PNG ou WebP.', 'OK', { duration: 3000 });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.snack.open('Imagem maior que 2 MB.', 'OK', { duration: 3000 });
      return;
    }

    this.fotoUploading.set(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `avatars/${this.data.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path);
      this.fotoUrl.set(`${urlData.publicUrl}?t=${Date.now()}`);
      this.form.markAsDirty();
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro no upload', 'OK', { duration: 3000 });
    } finally {
      this.fotoUploading.set(false);
    }
  }

  removerFoto(): void {
    this.fotoUrl.set(null);
    this.form.markAsDirty();
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
      const payload: Record<string, unknown> = {
        nome: v.nome!.trim(),
        bio: v.bio?.trim() ? v.bio.trim() : null,
        foto_url: this.fotoUrl(),
      };
      if (v.slug !== this.data.slug) {
        payload['slug'] = v.slug;
      }

      const salvo = await this.api.put<PerfilSalvo>(
        `/api/admin/profissionais/${this.data.id}`,
        payload,
      );

      this.snack.open('Perfil salvo', 'OK', { duration: 2000 });
      this.dialogRef.close(salvo);
    } catch (e: unknown) {
      const err = e as { error?: { message?: string }; message?: string };
      const msg = err?.error?.message ?? err?.message ?? 'Erro ao salvar';
      this.snack.open(msg, 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
