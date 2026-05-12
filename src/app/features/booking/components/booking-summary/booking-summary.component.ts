import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Profissional, Servico, MODALIDADE_LABELS } from '@core/types/database.types';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <div class="step">
      <div class="step-header">
        <button class="btn-voltar" (click)="voltou.emit()">← Voltar</button>
        <h2 class="step-titulo">Confirmar agendamento</h2>
      </div>

      <div class="resumo-card">
        <div class="resumo-linha">
          <span class="resumo-label">Serviço</span>
          <span class="resumo-valor">{{ servico?.nome }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Modalidade</span>
          <span class="resumo-valor">
            {{ servico ? MODALIDADE_LABELS[servico.modalidade].label : '' }}
          </span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Duração</span>
          <span class="resumo-valor">{{ servico?.duracao_min }} min</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Valor</span>
          <span class="resumo-valor destaque">{{ servico?.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>
        <div class="resumo-divider"></div>
        <div class="resumo-linha">
          <span class="resumo-label">Data e hora</span>
          <span class="resumo-valor">{{ dataHora | date:"dd/MM/yyyy 'às' HH:mm" }}</span>
        </div>
        <div class="resumo-divider"></div>
        <div class="resumo-linha">
          <span class="resumo-label">Seu nome</span>
          <span class="resumo-valor">{{ cliente?.nome }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">WhatsApp</span>
          <span class="resumo-valor">{{ wppFormatado }}</span>
        </div>
      </div>

      @if (erro) {
        <p class="erro-msg">{{ erro }}</p>
      }

      <button class="btn-confirmar" (click)="confirmou.emit()" [disabled]="loading">
        @if (loading) {
          Confirmando...
        } @else {
          Confirmar agendamento
        }
      </button>
    </div>
  `,
  styles: [`
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .step-titulo {
      font-size: 16px;
      font-weight: 600;
      color: var(--booking-text, #212529);
      margin: 0;
    }

    .btn-voltar {
      background: none;
      border: none;
      color: var(--booking-primary, #1D9E75);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }

    .resumo-card {
      background: var(--booking-surface, #f8f9fa);
      border: 1px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius-lg, 12px);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .resumo-label {
      font-size: 13px;
      color: var(--booking-muted, #6c757d);
    }

    .resumo-valor {
      font-size: 14px;
      font-weight: 500;
      color: var(--booking-text, #212529);
      text-align: right;

      &.destaque {
        color: var(--booking-primary, #1D9E75);
        font-weight: 700;
        font-size: 16px;
      }
    }

    .resumo-divider {
      height: 1px;
      background: var(--booking-border, #e9ecef);
    }

    .erro-msg {
      color: #E11D48;
      font-size: 13px;
      margin: 0 0 16px;
      text-align: center;
    }

    .btn-confirmar {
      width: 100%;
      padding: 14px;
      background: var(--booking-primary, #1D9E75);
      color: #fff;
      border: none;
      border-radius: var(--booking-radius, 8px);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
  `],
})
export class BookingSummaryComponent {
  @Input() profissional: Profissional | null = null;
  @Input() servico: Servico | null = null;
  @Input() dataHora: string | null = null;
  @Input() cliente: { nome: string; wpp: string } | null = null;
  @Input() loading = false;
  @Input() erro: string | null = null;
  @Output() confirmou = new EventEmitter<void>();
  @Output() voltou    = new EventEmitter<void>();

  readonly MODALIDADE_LABELS = MODALIDADE_LABELS;

  get wppFormatado(): string {
    const w = this.cliente?.wpp ?? '';
    if (w.length === 11) return `(${w.slice(0,2)}) ${w.slice(2,7)}-${w.slice(7)}`;
    if (w.length === 10) return `(${w.slice(0,2)}) ${w.slice(2,6)}-${w.slice(6)}`;
    return w;
  }
}
