import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Servico, MODALIDADE_LABELS } from '@core/types/database.types';

@Component({
  selector: 'app-service-selector',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="step">
      <h2 class="step-titulo">Escolha o serviço</h2>

      @if (servicos.length === 0) {
        <p class="sem-servicos">Nenhum serviço disponível no momento.</p>
      }

      <div class="servicos-lista">
        @for (s of servicos; track s.id) {
          <button class="servico-card" (click)="selecionou.emit(s)">
            <div class="servico-info">
              <span class="servico-nome">{{ s.nome }}</span>
              <span class="servico-modalidade">
                {{ MODALIDADE_LABELS[s.modalidade].icone }} {{ MODALIDADE_LABELS[s.modalidade].label }}
              </span>
            </div>
            <div class="servico-meta">
              <span class="servico-duracao">{{ s.duracao_min }} min</span>
              <span class="servico-preco">{{ s.preco | currency:'BRL':'symbol':'1.0-0' }}</span>
            </div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .step-titulo {
      font-size: 16px;
      font-weight: 600;
      color: var(--booking-text, #212529);
      margin: 0 0 16px;
    }

    .sem-servicos {
      color: var(--booking-muted, #6c757d);
      font-size: 14px;
    }

    .servicos-lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .servico-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1.5px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius-lg, 12px);
      background: #fff;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: all 0.15s;

      &:hover {
        border-color: var(--booking-primary, #1D9E75);
        background: var(--booking-primary-light, #e8f5f0);
      }
    }

    .servico-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .servico-nome {
      font-size: 15px;
      font-weight: 600;
      color: var(--booking-text, #212529);
    }

    .servico-modalidade {
      font-size: 12px;
      color: var(--booking-muted, #6c757d);
    }

    .servico-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .servico-duracao {
      font-size: 12px;
      color: var(--booking-muted, #6c757d);
    }

    .servico-preco {
      font-size: 15px;
      font-weight: 700;
      color: var(--booking-primary, #1D9E75);
    }
  `],
})
export class ServiceSelectorComponent {
  @Input() servicos: Servico[] = [];
  @Output() selecionou = new EventEmitter<Servico>();

  readonly MODALIDADE_LABELS = MODALIDADE_LABELS;
}
