import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

@Component({
  selector: 'app-cfg-endereco',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, LoadingButtonComponent,
  ],
  templateUrl: './endereco.component.html',
  styleUrl: './endereco.component.scss',
})
export class EnderecoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly buscandoCep = signal(false);
  readonly user = currentUser;
  readonly estados = ESTADOS;

  form = this.fb.group({
    cep:         ['', Validators.pattern(/^\d{5}-?\d{3}$/)],
    rua:         [''],
    numero:      [''],
    complemento: [''],
    bairro:      [''],
    cidade:      [''],
    estado:      [''],
  });

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;
    this.form.patchValue({
      cep:         u.endereco_cep ?? '',
      rua:         u.endereco_rua ?? '',
      numero:      u.endereco_numero ?? '',
      complemento: u.endereco_complemento ?? '',
      bairro:      u.endereco_bairro ?? '',
      cidade:      u.endereco_cidade ?? '',
      estado:      u.endereco_estado ?? '',
    });
  }

  async buscarCep(): Promise<void> {
    const cep = (this.form.value.cep ?? '').replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.buscandoCep.set(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        this.snack.open('CEP não encontrado', 'OK', { duration: 2000 });
        return;
      }
      this.form.patchValue({
        rua:    data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      });
    } catch {
      this.snack.open('Erro ao buscar CEP', 'OK', { duration: 2000 });
    } finally {
      this.buscandoCep.set(false);
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Não autenticado');

      const v = this.form.value;
      const { data, error } = await supabase
        .from('profissionais')
        .update({
          endereco_cep:         v.cep || null,
          endereco_rua:         v.rua || null,
          endereco_numero:      v.numero || null,
          endereco_complemento: v.complemento || null,
          endereco_bairro:      v.bairro || null,
          endereco_cidade:      v.cidade || null,
          endereco_estado:      v.estado || null,
        })
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;
      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Endereço salvo', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
