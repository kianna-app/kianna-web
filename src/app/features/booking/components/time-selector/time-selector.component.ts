import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SlotInfo } from '../../services/slot-calculator.service';

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

@Component({
  selector: 'app-time-selector',
  standalone: true,
  template: `
    <div class="step">
      <div class="step-header">
        <button class="btn-voltar" (click)="voltou.emit()">← Voltar</button>
        <h2 class="step-titulo">Escolha o horário</h2>
      </div>

      @if (data) {
        <p class="data-label">{{ dataLabel }}</p>
      }

      @if (slotsDisponiveis.length === 0) {
        <p class="sem-slots">Nenhum horário disponível neste dia.</p>
      } @else {
        <div class="chips-wrap">
          @for (slot of slots; track slot.dataHoraISO) {
            <button
              class="chip chip-hora"
              [class.disabled]="!slot.disponivel"
              (click)="slot.disponivel && selecionou.emit(slot.dataHoraISO)"
            >
              {{ slot.hora }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
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

    .data-label {
      font-size: 13px;
      color: var(--booking-muted, #6c757d);
      margin: 0 0 16px;
      text-transform: capitalize;
    }

    .sem-slots {
      color: var(--booking-muted, #6c757d);
      font-size: 14px;
    }

    .chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      padding: 10px 16px;
      border: 1.5px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius, 8px);
      background: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--booking-text, #212529);

      &:hover:not(.disabled) {
        border-color: var(--booking-primary, #1D9E75);
        background: var(--booking-primary-light, #e8f5f0);
        color: var(--booking-primary, #1D9E75);
      }

      &.disabled {
        opacity: 0.35;
        cursor: not-allowed;
        text-decoration: line-through;
      }
    }
  `],
})
export class TimeSelectorComponent {
  @Input() slots: SlotInfo[] = [];
  @Input() data: Date | null = null;
  @Output() selecionou = new EventEmitter<string>();
  @Output() voltou     = new EventEmitter<void>();

  get slotsDisponiveis(): SlotInfo[] {
    return this.slots.filter(s => s.disponivel);
  }

  get dataLabel(): string {
    if (!this.data) return '';
    const dia = DIAS[this.data.getDay()];
    const d   = this.data.getDate();
    const mes = MESES[this.data.getMonth()];
    return `${dia}, ${d} de ${mes}`;
  }
}
