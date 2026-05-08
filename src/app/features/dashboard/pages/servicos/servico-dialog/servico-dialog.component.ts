import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Servico, ServicoInput, ModalidadeAtendimento, MODALIDADE_LABELS } from '@core/types/database.types';
import { DURACOES_SERVICO } from '@core/constants/app.constants';

export interface ServicoDialogData {
  servico?: Servico;
}

@Component({
  selector: 'app-servico-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './servico-dialog.component.html',
  styleUrl: './servico-dialog.component.scss',
})
export class ServicoDialogComponent {
  private fb  = inject(FormBuilder);
  private ref = inject(MatDialogRef<ServicoDialogComponent>);
  data = inject<ServicoDialogData>(MAT_DIALOG_DATA);

  readonly duracoes = DURACOES_SERVICO;
  readonly isEdicao = !!this.data.servico;

  readonly modalidades: { valor: ModalidadeAtendimento; label: string; icone: string; descricao: string }[] = [
    { valor: 'presencial', ...MODALIDADE_LABELS.presencial },
    { valor: 'domiciliar', ...MODALIDADE_LABELS.domiciliar },
    { valor: 'online',     ...MODALIDADE_LABELS.online },
  ];

  form = this.fb.group({
    nome:        [this.data.servico?.nome ?? '', [Validators.required, Validators.minLength(2)]],
    duracao_min: [this.data.servico?.duracao_min ?? 60, [Validators.required, Validators.min(15)]],
    modalidade:  [this.data.servico?.modalidade ?? 'presencial' as ModalidadeAtendimento, Validators.required],
    preco:       [this.data.servico?.preco ?? 0, [Validators.required, Validators.min(0)]],
    ativo:       [this.data.servico?.ativo ?? true],
  });

  fechar(): void { this.ref.close(); }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const input: ServicoInput = {
      nome: v.nome!.trim(),
      duracao_min: v.duracao_min!,
      preco: Number(v.preco) || 0,
      modalidade: v.modalidade!,
      ativo: v.ativo!,
    };
    this.ref.close(input);
  }
}
