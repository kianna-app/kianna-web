import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';
import { gerarSlug } from '@core/utils/slug.util';
import { differenceInDays, addDays } from 'date-fns';

@Component({
  selector: 'app-cfg-empresa',
  standalone: true,
  imports: [
    CommonModule, DatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, LoadingButtonComponent,
  ],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss',
})
export class EmpresaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user = currentUser;

  form = this.fb.group({
    nome:                  ['', [Validators.required, Validators.minLength(2)]],
    bio:                   [''],
    slug:                  ['', [Validators.required, Validators.minLength(3)]],
    politica_cancelamento: [''],
  });

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
      nome:                  u.nome,
      bio:                   u.bio ?? '',
      slug:                  u.slug,
      politica_cancelamento: u.politica_cancelamento ?? '',
    });

    if (!this.podeAlterarSlug()) {
      this.form.get('slug')?.disable();
    }
  }

  formatarSlugLive(): void {
    const valor = this.form.get('slug')?.value ?? '';
    const limpo = gerarSlug(valor);
    if (limpo !== valor) {
      this.form.get('slug')?.setValue(limpo, { emitEvent: false });
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
          slug_antigo: u.slug,
          profissional_id: u.id,
          expira_em: addDays(new Date(), 90).toISOString(),
        });
      }

      const updates: Record<string, unknown> = {
        nome:                  v.nome,
        bio:                   v.bio || null,
        politica_cancelamento: v.politica_cancelamento || null,
      };
      if (slugMudou) {
        updates['slug'] = v.slug;
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
