import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { FieldErrorComponent } from '@shared/components/field-error/field-error.component';
import { KiannaValidators } from '@core/validators/form.validators';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';
import { gerarSlug } from '@core/utils/slug.util';
import { ANTECEDENCIA_MINIMA_OPTIONS, ANTECEDENCIA_MAXIMA_OPTIONS } from '@core/constants/app.constants';
import { differenceInDays, addDays } from 'date-fns';

@Component({
  selector: 'app-cfg-empresa',
  standalone: true,
  imports: [
    CommonModule, DatePipe, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule,
    MatButtonModule, MatProgressBarModule, LoadingButtonComponent, FieldErrorComponent,
  ],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss',
})
export class EmpresaComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando      = signal(false);
  readonly logoUploading = signal(false);
  readonly dragOver      = signal(false);
  readonly user          = currentUser;

  readonly fotoPreview = computed(() => this.user()?.foto_url ?? null);
  readonly antecedenciaMinimaOptions = ANTECEDENCIA_MINIMA_OPTIONS;
  readonly antecedenciaMaximaOptions = ANTECEDENCIA_MAXIMA_OPTIONS;

  form = this.fb.group({
    nome:                      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    bio:                       ['', Validators.maxLength(200)],
    slug:                      ['', KiannaValidators.slug()],
    politica_cancelamento:     [''],
    antecedencia_minima_horas: [0],
    antecedencia_maxima_dias:  [null as number | null],
  });

  readonly nomeLen = computed(() => (this.form.get('nome')?.value ?? '').length);
  readonly bioLen  = computed(() => (this.form.get('bio')?.value ?? '').length);

  readonly slugUltimaAlteracao = computed(() => {
    const data = this.user()?.slug_alterado_em;
    return data ? new Date(data) : null;
  });

  readonly podeAlterarSlug = computed(() => {
    const ultima = this.slugUltimaAlteracao();
    if (!ultima) return true;
    return differenceInDays(new Date(), ultima) >= 30;
  });

  readonly proximaAlteracaoEm = computed(() => {
    const ultima = this.slugUltimaAlteracao();
    if (!ultima) return null;
    return addDays(ultima, 30);
  });

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;
    this.form.patchValue({
      nome:                      u.nome,
      bio:                       u.bio ?? '',
      slug:                      u.slug,
      politica_cancelamento:     u.politica_cancelamento ?? '',
      antecedencia_minima_horas: u.antecedencia_minima_horas ?? 24,
      antecedencia_maxima_dias:  u.antecedencia_maxima_dias ?? null,
    });

    if (!this.podeAlterarSlug()) {
      this.form.get('slug')?.disable();
    }

    this.form.get('nome')?.valueChanges.subscribe(() => {});
    this.form.get('bio')?.valueChanges.subscribe(() => {});
  }

  formatarSlugLive(): void {
    const valor = this.form.get('slug')?.value ?? '';
    const limpo = gerarSlug(valor);
    if (limpo !== valor) {
      this.form.get('slug')?.setValue(limpo, { emitEvent: false });
    }
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.uploadLogo(file);
  }

  onLogoFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadLogo(file);
  }

  async removerLogo(): Promise<void> {
    const u = this.user();
    if (!u) return;
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update({ foto_url: null })
        .eq('id', u.id)
        .select()
        .single();
      if (error) throw error;
      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Logo removida', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao remover', 'OK', { duration: 3000 });
    }
  }

  private async uploadLogo(file: File): Promise<void> {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.snack.open('Formato não suportado. Use JPG, PNG ou WebP.', 'OK', { duration: 3000 });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.snack.open('Arquivo muito grande. Máximo 2 MB.', 'OK', { duration: 3000 });
      return;
    }

    const u = this.user();
    if (!u) return;

    this.logoUploading.set(true);
    try {
      const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `avatars/${u.id}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path);
      const fotoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { data, error } = await supabase
        .from('profissionais')
        .update({ foto_url: fotoUrl })
        .eq('id', u.id)
        .select()
        .single();
      if (error) throw error;

      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Logo atualizada', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao fazer upload', 'OK', { duration: 3000 });
    } finally {
      this.logoUploading.set(false);
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Usuário não autenticado');

      const v = this.form.getRawValue();
      const slugMudou = v.slug !== u.slug;

      if (slugMudou) {
        const { data: existente } = await supabase
          .from('profissionais')
          .select('id')
          .eq('slug', v.slug)
          .neq('id', u.id)
          .maybeSingle();

        if (existente) {
          this.snack.open('Este link já está em uso', 'OK', { duration: 3000 });
          return;
        }

        await supabase.from('slug_redirects').insert({
          slug_antigo:     u.slug,
          profissional_id: u.id,
          expira_em:       addDays(new Date(), 90).toISOString(),
        });
      }

      const updates: Record<string, unknown> = {
        nome:                      v.nome,
        bio:                       v.bio || null,
        politica_cancelamento:     v.politica_cancelamento || null,
        antecedencia_minima_horas: v.antecedencia_minima_horas ?? 24,
        antecedencia_maxima_dias:  v.antecedencia_maxima_dias ?? null,
      };
      if (slugMudou) {
        updates['slug']            = v.slug;
        updates['slug_alterado_em'] = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;

      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Configurações salvas', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
