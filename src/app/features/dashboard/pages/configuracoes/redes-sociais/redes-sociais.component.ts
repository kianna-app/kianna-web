import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';

const URL_PATTERN = /^https?:\/\//;

interface RedeSocial {
  controlName: string;
  label:       string;
  placeholder: string;
  letra:       string;
  bgColor:     string;
  textColor:   string;
}

const REDES: RedeSocial[] = [
  {
    controlName: 'instagram_url',
    label:       'Instagram',
    placeholder: 'https://instagram.com/seuusuario',
    letra:       'Ig',
    bgColor:     'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)',
    textColor:   '#fff',
  },
  {
    controlName: 'facebook_url',
    label:       'Facebook',
    placeholder: 'https://facebook.com/seunegocio',
    letra:       'Fb',
    bgColor:     '#1877F2',
    textColor:   '#fff',
  },
  {
    controlName: 'twitter_url',
    label:       'X (Twitter)',
    placeholder: 'https://x.com/seuusuario',
    letra:       'X',
    bgColor:     '#000',
    textColor:   '#fff',
  },
  {
    controlName: 'youtube_url',
    label:       'YouTube',
    placeholder: 'https://youtube.com/@seucanal',
    letra:       'Yt',
    bgColor:     '#FF0000',
    textColor:   '#fff',
  },
];

@Component({
  selector: 'app-cfg-redes-sociais',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, LoadingButtonComponent,
  ],
  templateUrl: './redes-sociais.component.html',
  styleUrl: './redes-sociais.component.scss',
})
export class RedesSociaisComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando  = signal(false);
  readonly user      = currentUser;
  readonly MAX_LINKS = 3;
  readonly redes     = REDES;

  form = this.fb.group({
    instagram_url:        ['', Validators.pattern(URL_PATTERN)],
    facebook_url:         ['', Validators.pattern(URL_PATTERN)],
    twitter_url:          ['', Validators.pattern(URL_PATTERN)],
    youtube_url:          ['', Validators.pattern(URL_PATTERN)],
    links_personalizados: this.fb.array([]),
  });

  get linksArray(): FormArray {
    return this.form.get('links_personalizados') as FormArray;
  }

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;

    this.form.patchValue({
      instagram_url: u.instagram_url ?? '',
      facebook_url:  u.facebook_url  ?? '',
      twitter_url:   u.twitter_url   ?? '',
      youtube_url:   u.youtube_url   ?? '',
    });

    const links = (u.links_personalizados ?? []) as { label: string; url: string }[];
    links.forEach(l => this.adicionarLink(l.label, l.url));
  }

  adicionarLink(label = '', url = ''): void {
    if (this.linksArray.length >= this.MAX_LINKS) {
      this.snack.open(`Máximo ${this.MAX_LINKS} links personalizados`, 'OK', { duration: 2000 });
      return;
    }
    this.linksArray.push(this.fb.group({
      label: [label, [Validators.required, Validators.maxLength(30)]],
      url:   [url,   [Validators.required, Validators.pattern(URL_PATTERN)]],
    }));
  }

  removerLink(index: number): void {
    this.linksArray.removeAt(index);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Não autenticado');

      const v = this.form.value;
      const { data, error } = await supabase
        .from('profissionais')
        .update({
          instagram_url:        v.instagram_url || null,
          facebook_url:         v.facebook_url  || null,
          twitter_url:          v.twitter_url   || null,
          youtube_url:          v.youtube_url   || null,
          links_personalizados: v.links_personalizados ?? [],
        })
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;
      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Redes sociais salvas', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
