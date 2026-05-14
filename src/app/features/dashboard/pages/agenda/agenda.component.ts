import { Component, inject, signal, computed, OnInit } from '@angular/core'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { Router } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialog } from '@angular/material/dialog'
import { AgendamentosStore } from '../../state/agendamentos.store'
import { MODALIDADE_LABELS } from '@core/types/database.types'
import { WeekStripComponent } from './components/week-strip/week-strip.component'
import { ApptCardComponent, AgendamentoView } from './components/appt-card/appt-card.component'
import { MonthCalendarComponent } from './components/month-calendar/month-calendar.component'
import { AgendamentoFormDialogComponent, AgendamentoFormDialogData } from './components/agendamento-form-dialog/agendamento-form-dialog.component'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, TitleCasePipe, MatProgressSpinnerModule,
    WeekStripComponent, ApptCardComponent, MonthCalendarComponent,
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  protected agendamentosStore = inject(AgendamentosStore)
  private dialog = inject(MatDialog)
  private router = inject(Router)

  diaSelecionado    = signal<Date>(new Date())
  semanaOffset      = signal(0)
  mostrarCalendario = signal(false)

  semana = computed(() => this.gerarSemana(this.semanaOffset()))

  agendamentosDoDia = computed<AgendamentoView[]>(() => {
    const diaSel = this.diaSelecionado().toDateString()
    return this.agendamentosStore.agendamentos()
      .filter(a => new Date(a.data_hora).toDateString() === diaSel)
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
      .map(a => {
        const svc   = a.servico
        const inicio = new Date(a.data_hora)
        const fim    = svc ? new Date(inicio.getTime() + svc.duracao_min * 60000) : inicio
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
          // extras para edição
          servico_id:  a.servico_id ?? undefined,
          cliente_wpp: (a as any).cliente_wpp,
          observacoes: (a as any).observacoes,
        } as AgendamentoView & { servico_id?: string; cliente_wpp?: string; observacoes?: string }
      })
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
    await this.carregarPeriodoVisivel()
  }

  semanaAnterior() {
    this.semanaOffset.update(v => v - 1)
    this.carregarPeriodoVisivel()
  }

  proximaSemana() {
    this.semanaOffset.update(v => v + 1)
    this.carregarPeriodoVisivel()
  }

  selecionarDiaDoCalendario(data: Date) {
    this.diaSelecionado.set(data)
    const hoje = new Date()
    const inicioSemanaAtual = new Date(hoje)
    inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay())
    inicioSemanaAtual.setHours(0, 0, 0, 0)

    const inicioSemanaData = new Date(data)
    inicioSemanaData.setDate(data.getDate() - data.getDay())
    inicioSemanaData.setHours(0, 0, 0, 0)

    const diff = Math.round(
      (inicioSemanaData.getTime() - inicioSemanaAtual.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
    this.semanaOffset.set(diff)
    this.mostrarCalendario.set(false)
    this.carregarPeriodoVisivel()
  }

  async abrirNovo() {
    const ref = this.dialog.open<AgendamentoFormDialogComponent, AgendamentoFormDialogData>(
      AgendamentoFormDialogComponent,
      { data: { modo: 'criar', diaSelecionado: this.diaSelecionado() } }
    )
    const result = await firstValueFrom(ref.afterClosed())
    if (result) await this.carregarPeriodoVisivel()
  }

  abrirEdicao(ag: AgendamentoView) {
    this.router.navigate(['/dashboard/agenda', ag.id])
  }

  get mesLabel(): string {
    const dias = this.semana()
    const meio = dias[3].data
    return meio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  get diaSelecionadoLabel(): string {
    return this.diaSelecionado().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  private async carregarPeriodoVisivel() {
    const dias   = this.semana()
    const inicio = new Date(dias[0].data); inicio.setHours(0, 0, 0, 0)
    const fim    = new Date(dias[6].data); fim.setHours(23, 59, 59, 999)
    await this.agendamentosStore.carregarPeriodo(inicio, fim)
  }

  private gerarSemana(offset = 0) {
    const hoje       = new Date()
    const diasLetras = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    const base       = new Date(hoje)
    base.setDate(hoje.getDate() - hoje.getDay() + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      const k        = d.toDateString()
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
}
