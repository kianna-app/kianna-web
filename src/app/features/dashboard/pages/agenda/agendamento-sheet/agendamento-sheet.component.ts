import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgendamentoComServico, StatusAgend, MODALIDADE_LABELS } from '@core/types/database.types';

export interface SheetData {
  agendamento: AgendamentoComServico;
}
export type SheetResult = { acao: 'confirmar' | 'cancelar' | 'reabrir' } | undefined;

@Component({
  selector: 'app-agendamento-sheet',
  standalone: true,
  imports: [CommonModule, DatePipe, MatBottomSheetModule, MatButtonModule, MatIconModule],
  templateUrl: './agendamento-sheet.component.html',
  styleUrl: './agendamento-sheet.component.scss',
})
export class AgendamentoSheetComponent {
  data = inject<SheetData>(MAT_BOTTOM_SHEET_DATA);
  private ref = inject(MatBottomSheetRef<AgendamentoSheetComponent, SheetResult>);

  readonly MODALIDADE_LABELS = MODALIDADE_LABELS;

  get a(): AgendamentoComServico { return this.data.agendamento; }
  get podeConfirmar(): boolean { return this.a.status === 'pendente'; }
  get podeCancelar(): boolean { return this.a.status !== 'cancelado' && this.a.status !== 'concluido'; }
  get podeReabrir(): boolean { return this.a.status === 'cancelado'; }

  acao(a: 'confirmar' | 'cancelar' | 'reabrir'): void { this.ref.dismiss({ acao: a }); }
  fechar(): void { this.ref.dismiss(); }

  abrirWhatsApp(): void {
    const num = this.a.cliente_wpp.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${this.a.cliente_nome}!`);
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank');
  }

  rotulo(s: StatusAgend): string {
    return ({ pendente: 'Pendente', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s]);
  }
}
