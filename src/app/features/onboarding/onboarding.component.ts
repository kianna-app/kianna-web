import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';
import { gerarSlug, slugComSufixo } from '@core/utils/slug.util';
import { APP } from '@core/constants/app.constants';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { whatsAppValidator, limparWhatsApp } from '@core/utils/whatsapp.util';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatStepperModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule,
    LoadingButtonComponent,
  ],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: { showError: true },
  }],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  readonly APP = APP;
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  isLoading   = signal(false);
  errorMsg    = signal('');
  fotoPreview = signal<string | null>(null);
  fotoFile    = signal<File | null>(null);

  perfilForm = this.fb.group({
    nome:          ['', [Validators.required, Validators.minLength(3)]],
    especialidade: ['', Validators.required],
    whatsapp:      ['', [Validators.required, whatsAppValidator]],
    bio:           [''],
  });

  servicosForm = this.fb.group({
    nomeServico: ['', Validators.required],
    duracaoMin:  [60, Validators.required],
    preco:       [0, [Validators.required, Validators.min(0)]],
  });
  servicosCadastrados = signal<Array<{nome: string; duracao: number; preco: number}>>([]);

  diasSemana = [
    { dia: 1, label: 'Seg' },
    { dia: 2, label: 'Ter' },
    { dia: 3, label: 'Qua' },
    { dia: 4, label: 'Qui' },
    { dia: 5, label: 'Sex' },
    { dia: 6, label: 'Sáb' },
    { dia: 0, label: 'Dom' },
  ];
  diasAtivos = signal<Set<number>>(new Set([1, 2, 3, 4, 5]));
  horaInicio = signal('09:00');
  horaFim    = signal('18:00');
  intervalo  = signal(60);

  duracoes = [15, 30, 45, 60, 90, 120, 180, 240];

  onFotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.errorMsg.set('Foto muito grande (máx. 2 MB)');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('Arquivo precisa ser uma imagem');
      return;
    }
    this.errorMsg.set('');

    this.fotoFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.fotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  adicionarServico(): void {
    if (this.servicosForm.invalid) return;
    const v = this.servicosForm.value;
    this.servicosCadastrados.update(s => [
      ...s,
      { nome: v.nomeServico!, duracao: v.duracaoMin!, preco: v.preco! }
    ]);
    this.servicosForm.reset({ duracaoMin: 60, preco: 0 });
  }

  removerServico(index: number): void {
    this.servicosCadastrados.update(s => s.filter((_, i) => i !== index));
  }

  toggleDia(dia: number): void {
    this.diasAtivos.update(dias => {
      const novo = new Set(dias);
      if (novo.has(dia)) { novo.delete(dia); } else { novo.add(dia); }
      return novo;
    });
  }

  private async gerarSlugUnico(nomeBase: string): Promise<string> {
    const slugBase = gerarSlug(nomeBase);
    let slug = slugBase;
    let sufixo = 2;
    while (true) {
      const { data } = await supabase
        .from('profissionais')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!data) return slug;
      slug = slugComSufixo(slugBase, sufixo);
      sufixo++;
      if (sufixo > 50) throw new Error('Não foi possível gerar slug único');
    }
  }

  async concluirOnboarding(): Promise<void> {
    if (this.servicosCadastrados().length === 0) return;
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const whatsapp = this.perfilForm.value.whatsapp!;
      const { data: wppExistente } = await supabase
        .from('profissionais')
        .select('id')
        .eq('whatsapp', whatsapp)
        .maybeSingle();
      if (wppExistente) {
        this.perfilForm.get('whatsapp')?.setErrors({ jaCadastrado: true });
        this.errorMsg.set('Este número de WhatsApp já está em uso em outra conta.');
        return;
      }

      const nome = this.perfilForm.value.nome!;
      const slug = await this.gerarSlugUnico(nome);

      let foto_url: string | null = null;
      if (this.fotoFile()) {
        const ext  = this.fotoFile()!.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `avatars/${user.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('profiles')
          .upload(path, this.fotoFile()!, { upsert: true, contentType: this.fotoFile()!.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('profiles').getPublicUrl(path);
        foto_url = data.publicUrl;
      }

      const { data: profissional, error: profErr } = await supabase
        .from('profissionais')
        .insert({
          user_id:       user.id,
          nome,
          slug,
          foto_url,
          whatsapp:      limparWhatsApp(this.perfilForm.value.whatsapp!),
          especialidade: this.perfilForm.value.especialidade!,
          bio:           this.perfilForm.value.bio || null,
          plano:         'gratis',
          onboarding_concluido: true,
        })
        .select()
        .single();
      if (profErr) throw profErr;

      const servicos = this.servicosCadastrados().map(s => ({
        profissional_id: profissional!.id,
        nome:        s.nome,
        duracao_min: s.duracao,
        preco:       s.preco,
        ativo:       true,
      }));
      const { error: servErr } = await supabase.from('servicos').insert(servicos);
      if (servErr) throw servErr;

      const disponibilidades = Array.from(this.diasAtivos()).map(dia => ({
        profissional_id: profissional!.id,
        dia_semana:    dia,
        hora_inicio:   this.horaInicio(),
        hora_fim:      this.horaFim(),
        intervalo_min: this.intervalo(),
      }));
      const { error: dispErr } = await supabase.from('disponibilidades').insert(disponibilidades);
      if (dispErr) throw dispErr;

      currentUser.set({
        ...(profissional as any),
        onboarding_concluido: true,
      });

      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      console.error('Erro no onboarding:', err);
      this.errorMsg.set(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
