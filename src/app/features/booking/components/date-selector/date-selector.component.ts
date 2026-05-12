import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

@Component({
  selector: 'app-date-selector',
  standalone: true,
  template: `
    <div class="step">
      <div class="step-header">
        <button class="btn-voltar" (click)="voltou.emit()">← Voltar</button>
        <h2 class="step-titulo">Escolha a data</h2>
      </div>

      <div class="paginacao">
        <button class="btn-pag" (click)="paginaAnterior()" [disabled]="paginaAtual() === 0">&#8249;</button>
        <span class="pag-label">{{ labelPeriodo }}</span>
        <button class="btn-pag" (click)="proximaPagina()" [disabled]="paginaAtual() >= totalPaginas - 1">&#8250;</button>
      </div>

      <div class="chips-grid">
        @for (dia of diasVisiveis(); track dia.toISOString()) {
          <button
            class="chip chip-data"
            [class.disabled]="!isDiaDisponivel(dia)"
            [class.hoje]="isHoje(dia)"
            (click)="isDiaDisponivel(dia) && selecionou.emit(dia)"
          >
            <span class="chip-diaSemana">{{ DIAS_CURTOS[dia.getDay()] }}</span>
            <span class="chip-data-num">{{ dia.getDate() }}</span>
            <span class="chip-mes">{{ MESES[dia.getMonth()] }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
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

    .paginacao {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .btn-pag {
      width: 32px;
      height: 32px;
      border: 1.5px solid var(--booking-border, #e9ecef);
      border-radius: 50%;
      background: #fff;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--booking-text, #212529);

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .pag-label {
      font-size: 13px;
      color: var(--booking-muted, #6c757d);
    }

    .chips-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 4px;
      border: 1.5px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius, 8px);
      cursor: pointer;
      background: #fff;
      transition: all 0.15s;

      &:hover:not(.disabled) {
        border-color: var(--booking-primary, #1D9E75);
        background: var(--booking-primary-light, #e8f5f0);
      }

      &.disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      &.hoje {
        border-color: var(--booking-primary, #1D9E75);
      }
    }

    .chip-diaSemana {
      font-size: 10px;
      color: var(--booking-muted, #6c757d);
      text-transform: uppercase;
    }

    .chip-data-num {
      font-size: 16px;
      font-weight: 700;
      color: var(--booking-text, #212529);
      line-height: 1.2;
    }

    .chip-mes {
      font-size: 10px;
      color: var(--booking-muted, #6c757d);
    }
  `],
})
export class DateSelectorComponent implements OnInit {
  @Input() diasComSlots: Date[] = [];
  @Output() selecionou = new EventEmitter<Date>();
  @Output() voltou     = new EventEmitter<void>();

  readonly DIAS_CURTOS = DIAS_CURTOS;
  readonly MESES = MESES;

  readonly paginaAtual   = signal(0);
  readonly diasVisiveis  = signal<Date[]>([]);
  readonly totalPaginas  = Math.ceil(30 / 7);

  private todosDias: Date[] = [];

  ngOnInit(): void {
    this.todosDias = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    this.atualizarPagina();
  }

  get labelPeriodo(): string {
    const dias = this.diasVisiveis();
    if (!dias.length) return '';
    const primeiro = dias[0];
    const ultimo   = dias[dias.length - 1];
    return `${primeiro.getDate()} – ${ultimo.getDate()} ${MESES[ultimo.getMonth()]}`;
  }

  paginaAnterior(): void {
    if (this.paginaAtual() > 0) {
      this.paginaAtual.update(p => p - 1);
      this.atualizarPagina();
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas - 1) {
      this.paginaAtual.update(p => p + 1);
      this.atualizarPagina();
    }
  }

  isDiaDisponivel(dia: Date): boolean {
    return this.diasComSlots.some(d => d.toDateString() === dia.toDateString());
  }

  isHoje(dia: Date): boolean {
    return dia.toDateString() === new Date().toDateString();
  }

  private atualizarPagina(): void {
    const inicio = this.paginaAtual() * 7;
    this.diasVisiveis.set(this.todosDias.slice(inicio, inicio + 7));
  }
}
