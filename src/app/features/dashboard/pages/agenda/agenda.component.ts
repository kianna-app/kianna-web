import { Component, inject, signal, computed, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { AgendamentosStore } from '../../state/agendamentos.store'
import { MODALIDADE_LABELS } from '@core/types/database.types'
import { WeekStripComponent } from './components/week-strip/week-strip.component'
import { ResumoBandComponent } from './components/resumo-band/resumo-band.component'
import { ApptCardComponent, AgendamentoView } from './components/appt-card/appt-card.component'

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, WeekStripComponent, ResumoBandComponent, ApptCardComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  protected agendamentosStore = inject(AgendamentosStore)

  diaSelecionado = signal<Date>(new Date())

  semana = computed(() => this.gerarSemana())

  agendamentosDoDia = computed<AgendamentoView[]>(() => {
    const diaSel = this.diaSelecionado().toDateString()
    return this.agendamentosStore.agendamentos()
      .filter(a => new Date(a.data_hora).toDateString() === diaSel)
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
      .map(a => {
        const svc = a.servico
        const inicio = new Date(a.data_hora)
        const fim = svc ? new Date(inicio.getTime() + svc.duracao_min * 60000) : inicio
        return {
          id:          a.id,
          inicio:      inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          fim:         fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status:      a.status,
          clienteNome: a.cliente_nome,
          servicoNome: svc?.nome ?? '—',
          duracao:     svc ? `${svc.duracao_min} min` : '',
          modalidade:  svc ? (MODALIDADE_LABELS[svc.modalidade]?.label ?? svc.modalidade) : '',
          data_hora:   a.data_hora,
        }
      })
  })

  resumo = computed(() => {
    const ags = this.agendamentosDoDia()
    return {
      total:       ags.length,
      confirmados: ags.filter(a => a.status === 'confirmado').length,
      pendentes:   ags.filter(a => a.status === 'pendente').length,
      concluidos:  ags.filter(a => a.status === 'concluido').length,
    }
  })

  ocupacaoPorDia = computed(() => {
    const map = new Map<string, number>()
    this.agendamentosStore.agendamentos()
      .filter(a => a.status !== 'cancelado')
      .forEach(a => {
        const k = new Date(a.data_hora).toDateString()
        map.set(k, (map.get(k) ?? 0) + 1)
      })
    return map
  })

  async ngOnInit() {
    const hoje = new Date()
    const inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - hoje.getDay())
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 7)
    await this.agendamentosStore.carregarPeriodo(inicio, fim)
  }

  private gerarSemana() {
    const hoje = new Date()
    const diasLetras = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() - hoje.getDay() + i)
      const k = d.toDateString()
      const ocupacao = Math.min(this.ocupacaoPorDia().get(k) ?? 0, 3)
      return {
        data:        d,
        letra:       diasLetras[d.getDay()],
        numero:      d.getDate(),
        hoje:        d.toDateString() === hoje.toDateString(),
        selecionado: d.toDateString() === this.diaSelecionado().toDateString(),
        ocupacao,
      }
    })
  }

  get mesLabel(): string {
    return this.diaSelecionado().toLocaleDateString('pt-BR', { month: 'long' })
  }

  get anoLabel(): string {
    return this.diaSelecionado().getFullYear().toString()
  }

  get diaSelecionadoLabel(): string {
    return this.diaSelecionado().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }
}
