import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

type StatusAg = 'confirmado' | 'pendente' | 'cancelado' | 'concluido'
interface StatusStyle { label: string; bar: string; bg: string; text: string; chipBg: string }

const STATUS_MAP: Record<StatusAg, StatusStyle> = {
  confirmado: { label: 'Confirmado', bar: 'var(--c-primary)',  bg: 'var(--c-primary-bg)',  text: 'var(--c-primary-text)',  chipBg: 'var(--c-primary-chip)'  },
  pendente:   { label: 'Pendente',   bar: 'var(--c-amber)',    bg: 'var(--c-amber-bg)',    text: 'var(--c-amber-text)',    chipBg: 'var(--c-amber-chip)'    },
  cancelado:  { label: 'Cancelado',  bar: 'var(--c-rose)',     bg: 'var(--c-rose-bg)',     text: 'var(--c-rose-text)',     chipBg: 'var(--c-rose-chip)'     },
  concluido:  { label: 'Concluído',  bar: 'var(--c-green)',    bg: 'var(--c-green-bg)',    text: 'var(--c-green-text)',    chipBg: 'var(--c-green-chip)'    },
}

export interface AgendamentoView {
  id: string; inicio: string; fim: string; status: StatusAg
  clienteNome: string; servicoNome: string; duracao: string; modalidade: string
  data_hora: string
}

@Component({
  selector: 'app-appt-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [style.background]="s.bg">
      <div class="bar" [style.background]="s.bar"></div>
      <div class="body">
        <div class="top">
          <div class="time" [style.color]="s.text">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 [attr.stroke]="s.text" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2"/>
            </svg>
            {{ agendamento.inicio }} – {{ agendamento.fim }}
          </div>
          <span class="chip" [style.background]="s.chipBg" [style.color]="s.text">
            {{ s.label }}
          </span>
        </div>
        <div class="titulo" [class.cancelado]="agendamento.status === 'cancelado'">
          {{ agendamento.clienteNome }}
        </div>
        <div class="desc">{{ agendamento.servicoNome }}</div>
        <div class="meta">{{ agendamento.duracao }}{{ agendamento.modalidade ? ' · ' + agendamento.modalidade : '' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      position: relative; border-radius: var(--r-lg); overflow: hidden;
      box-shadow: var(--shadow-1); border: 1px solid rgba(15,23,42,0.03);
    }
    .bar { position:absolute; left:0; top:10px; bottom:10px; width:4px; border-radius:3px; }
    .body { padding: 14px 14px 14px 20px; }
    .top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .time { display:flex; align-items:center; gap:6px; font:600 12px 'Inter'; letter-spacing:.1px; }
    .chip { padding:3px 8px; border-radius:999px; font:600 11px 'Inter'; }
    .titulo { font:600 15px 'Inter'; color:var(--text-1); letter-spacing:-.2px; }
    .titulo.cancelado { text-decoration:line-through; text-decoration-color:rgba(11,15,25,.35); }
    .desc { font:400 13px 'Inter'; color:var(--text-2); margin-top:3px; }
    .meta { font:500 11.5px 'Inter'; color:var(--text-3); margin-top:8px; }
  `]
})
export class ApptCardComponent {
  @Input({ required: true }) agendamento!: AgendamentoView
  get s(): StatusStyle { return STATUS_MAP[this.agendamento.status] }
}
