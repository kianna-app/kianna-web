import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AgendamentoComServico } from '@core/types/database.types'

interface DiaCalendario {
  data: Date
  numero: number
  temAgendamento: boolean
  hoje: boolean
  selecionado: boolean
  mesAtual: boolean
}

@Component({
  selector: 'app-month-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cal">
      <div class="cal-header">
        <button class="cal-nav" (click)="mesAnterior()" aria-label="Mês anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span class="cal-titulo">{{ tituloMes() }}</span>
        <button class="cal-nav" (click)="proximoMes()" aria-label="Próximo mês">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button class="cal-fechar" (click)="fechar.emit()" aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="cal-dias-semana">
        @for (d of diasSemana; track d) {
          <div class="ds-label">{{ d }}</div>
        }
      </div>

      <div class="cal-grid">
        @for (dia of diasCalendario(); track dia.data.toISOString()) {
          <div class="cal-dia"
               [class.hoje]="dia.hoje"
               [class.selecionado]="dia.selecionado"
               [class.outro-mes]="!dia.mesAtual"
               (click)="dia.mesAtual && diaClicado.emit(dia.data)">
            <span class="dia-num">{{ dia.numero }}</span>
            @if (dia.temAgendamento && dia.mesAtual) {
              <span class="dia-dot"></span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cal {
      width: 320px;
      font-family: 'Inter', sans-serif;
      background: #fff;
    }

    .cal-header {
      display: flex;
      align-items: center;
      padding: 16px 16px 8px;
      gap: 4px;
    }

    .cal-titulo {
      flex: 1;
      text-align: center;
      font: 600 15px 'Inter';
      color: #212529;
      text-transform: capitalize;
    }

    .cal-nav, .cal-fechar {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 1px solid #e9ecef;
      background: #fff;
      display: grid; place-items: center;
      cursor: pointer;
      color: #495057;
      transition: all .15s;
      &:hover { background: #E8F5F0; color: #1D9E75; border-color: #1D9E75; }
    }

    .cal-dias-semana {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 4px 12px;
    }

    .ds-label {
      text-align: center;
      font: 600 11px 'Inter';
      color: #adb5bd;
      text-transform: uppercase;
      padding: 4px 0;
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0 12px 16px;
      gap: 2px;
    }

    .cal-dia {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .12s;
      position: relative;
      gap: 2px;

      &:hover:not(.selecionado):not(.outro-mes) { background: #f1f3f5; }

      &.hoje { border: 2px solid #1D9E75; }

      &.selecionado {
        background: #1D9E75;
        .dia-num { color: #fff; }
        .dia-dot { background: rgba(255,255,255,.6); }
      }

      &.outro-mes {
        cursor: default;
        .dia-num { color: #ced4da; }
      }
    }

    .dia-num {
      font: 500 13px 'Inter';
      color: #212529;
      line-height: 1;
    }

    .dia-dot {
      width: 4px; height: 4px;
      border-radius: 50%;
      background: #1D9E75;
    }
  `]
})
export class MonthCalendarComponent implements OnInit {
  @Input() agendamentos: AgendamentoComServico[] = []
  @Input() diaSelecionado: Date = new Date()
  @Output() diaClicado = new EventEmitter<Date>()
  @Output() fechar = new EventEmitter<void>()

  readonly diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  readonly mesAtual  = signal(new Date().getMonth())
  readonly anoAtual  = signal(new Date().getFullYear())

  ngOnInit() {
    this.mesAtual.set(this.diaSelecionado.getMonth())
    this.anoAtual.set(this.diaSelecionado.getFullYear())
  }

  tituloMes = computed(() => {
    const d = new Date(this.anoAtual(), this.mesAtual(), 1)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  })

  diasCalendario = computed((): DiaCalendario[] => {
    const hoje = new Date()
    const mes  = this.mesAtual()
    const ano  = this.anoAtual()

    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia   = new Date(ano, mes + 1, 0)

    const daysWithAg = new Set(
      this.agendamentos
        .filter(a => a.status !== 'cancelado')
        .map(a => new Date(a.data_hora).toDateString())
    )

    const dias: DiaCalendario[] = []

    // Preencher dias do mês anterior para completar a primeira semana
    const inicioDaSemana = primeiroDia.getDay()
    for (let i = inicioDaSemana - 1; i >= 0; i--) {
      const d = new Date(ano, mes, -i)
      dias.push({
        data: d, numero: d.getDate(), temAgendamento: false,
        hoje: false, selecionado: false, mesAtual: false,
      })
    }

    // Dias do mês atual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const data = new Date(ano, mes, d)
      dias.push({
        data,
        numero: d,
        temAgendamento: daysWithAg.has(data.toDateString()),
        hoje: data.toDateString() === hoje.toDateString(),
        selecionado: data.toDateString() === this.diaSelecionado.toDateString(),
        mesAtual: true,
      })
    }

    // Completar última semana
    const restante = 7 - (dias.length % 7)
    if (restante < 7) {
      for (let i = 1; i <= restante; i++) {
        const d = new Date(ano, mes + 1, i)
        dias.push({
          data: d, numero: d.getDate(), temAgendamento: false,
          hoje: false, selecionado: false, mesAtual: false,
        })
      }
    }

    return dias
  })

  mesAnterior() {
    if (this.mesAtual() === 0) {
      this.mesAtual.set(11)
      this.anoAtual.update(a => a - 1)
    } else {
      this.mesAtual.update(m => m - 1)
    }
  }

  proximoMes() {
    if (this.mesAtual() === 11) {
      this.mesAtual.set(0)
      this.anoAtual.update(a => a + 1)
    } else {
      this.mesAtual.update(m => m + 1)
    }
  }
}
