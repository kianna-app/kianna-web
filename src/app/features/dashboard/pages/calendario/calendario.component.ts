import {
  Component, inject, signal, computed, effect, OnInit, PLATFORM_ID, NgZone
} from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions, EventInput, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

import { AgendamentosStore } from '../../state/agendamentos.store'
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository'
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types'
import { APP } from '@core/constants/app.constants'
import { currentUser } from '@core/signals/app.signals'

type CalView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'

const STATUS_STYLE: Record<StatusAgend, { bg: string; border: string; text: string; chip: string; label: string }> = {
  confirmado:     { bg: '#DCFCE7', border: '#1D9E75', text: '#166534', chip: 'confirmado',     label: 'Confirmado'      },
  pendente:       { bg: '#FEF3C7', border: '#D97706', text: '#92400E', chip: 'pendente',       label: 'Pendente'        },
  cancelado:      { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', chip: 'cancelado',      label: 'Cancelado'       },
  recusado:       { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', chip: 'cancelado',      label: 'Recusado'        },
  reagendado:     { bg: '#F3E8FF', border: '#9B59B6', text: '#6B21A8', chip: 'reagendado',     label: 'Reagendado'      },
  finalizado:     { bg: '#D1FAE5', border: '#059669', text: '#065F46', chip: 'finalizado',     label: 'Finalizado'      },
  nao_compareceu: { bg: '#F1F5F9', border: '#64748B', text: '#334155', chip: 'nao_compareceu', label: 'Não compareceu' },
}

const VIEWS: { id: CalView; label: string }[] = [
  { id: 'dayGridMonth',  label: 'Mês'    },
  { id: 'timeGridWeek',  label: 'Semana' },
  { id: 'timeGridDay',   label: 'Dia'    },
  { id: 'listWeek',      label: 'Agenda' },
]

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, FullCalendarModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent implements OnInit {
  private agStore = inject(AgendamentosStore)
  private agRepo  = inject(AgendamentosRepository)
  private snack   = inject(MatSnackBar)
  private zone    = inject(NgZone)
  private platform = inject(PLATFORM_ID)

  readonly isBrowser = isPlatformBrowser(this.platform)
  readonly views = VIEWS

  viewAtual  = signal<CalView>('timeGridWeek')
  tituloAtual = signal('')
  carregandoPeriodo = signal(false)
  eventoAberto = signal<AgendamentoComServico | null>(null)
  salvandoStatus = signal(false)

  // filter signals
  filtroStatus = signal<StatusAgend | ''>('')

  agendamentosFiltrados = computed(() => {
    const lista = this.agStore.agendamentos()
    const status = this.filtroStatus()
    return status ? lista.filter(a => a.status === status) : lista
  })

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    locale: ptBrLocale,
    initialView: 'timeGridWeek',
    headerToolbar: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    nowIndicator: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    height: 'auto',
    allDaySlot: false,
    expandRows: true,
    stickyHeaderDates: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    events: async (info, success, fail) => {
      try {
        this.zone.run(() => this.carregandoPeriodo.set(true))
        await this.agStore.carregarPeriodo(info.start, info.end)
        const eventos = this.buildEventos(this.agStore.agendamentos())
        const statusFiltro = this.filtroStatus()
        const resultado = statusFiltro
          ? eventos.filter(e => (e.extendedProps as any)?.status === statusFiltro)
          : eventos
        success(resultado)
      } catch {
        fail(new Error('Erro ao carregar agendamentos'))
      } finally {
        this.zone.run(() => this.carregandoPeriodo.set(false))
      }
    },
    datesSet: (info) => {
      this.zone.run(() => this.tituloAtual.set(info.view.title))
    },
    eventClick: (info: EventClickArg) => {
      this.zone.run(() => {
        const ag = info.event.extendedProps['agendamento'] as AgendamentoComServico
        if (ag) this.eventoAberto.set(ag)
      })
    },
    select: (_info: DateSelectArg) => {
      // future: open form dialog with pre-filled date
    },
    eventDrop: async (info: EventDropArg) => {
      const ag = info.event.extendedProps['agendamento'] as AgendamentoComServico
      if (!ag) return
      try {
        const novaDataHora = info.event.start!.toISOString()
        await this.agRepo.atualizar(ag.id, { data_hora: novaDataHora })
        this.snack.open('Agendamento movido com sucesso.', '', { duration: 3000 })
      } catch {
        info.revert()
        this.snack.open('Erro ao mover agendamento.', '', { duration: 3000 })
      }
    },
    eventResize: async (info: EventResizeDoneArg) => {
      info.revert() // duration resize not supported yet
    },
    eventContent: (arg) => {
      const props = arg.event.extendedProps as { clienteNome?: string; servicoNome?: string; status?: StatusAgend }
      const style = STATUS_STYLE[props.status ?? 'pendente']
      const timeText = arg.timeText
      return {
        html: `
          <div class="fc-event-inner" style="border-left:3px solid ${style.border}; background:${style.bg}; color:${style.text}">
            <div class="fc-ev-time">${timeText}</div>
            <div class="fc-ev-name">${props.clienteNome ?? ''}</div>
            ${props.servicoNome ? `<div class="fc-ev-svc">${props.servicoNome}</div>` : ''}
          </div>`
      }
    },
  }

  ngOnInit(): void {
    // load initial week
    const hoje = new Date()
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - hoje.getDay()); inicio.setHours(0,0,0,0)
    const fim = new Date(inicio); fim.setDate(inicio.getDate() + 6); fim.setHours(23,59,59,999)
    this.agStore.carregarPeriodo(inicio, fim)
  }

  // Exposed to template
  readonly STATUS_STYLE = STATUS_STYLE
  statusKeys = Object.keys(STATUS_STYLE) as StatusAgend[]

  trocarView(view: CalView): void {
    this.viewAtual.set(view)
    const calApi = this.getCalApi()
    if (calApi) calApi.changeView(view)
  }

  hoje(): void {
    const calApi = this.getCalApi()
    if (calApi) calApi.today()
  }

  anterior(): void {
    const calApi = this.getCalApi()
    if (calApi) calApi.prev()
  }

  proximo(): void {
    const calApi = this.getCalApi()
    if (calApi) calApi.next()
  }

  fecharDrawer(): void {
    this.eventoAberto.set(null)
  }

  async atualizarStatus(status: StatusAgend): Promise<void> {
    const ag = this.eventoAberto()
    if (!ag || this.salvandoStatus()) return
    this.salvandoStatus.set(true)
    try {
      await this.agStore.atualizarStatus(ag.id, status)
      this.eventoAberto.set({ ...ag, status })
      this.getCalApi()?.refetchEvents()
      this.snack.open('Status atualizado.', '', { duration: 3000 })
    } catch {
      this.snack.open('Erro ao atualizar status.', '', { duration: 3000 })
    } finally {
      this.salvandoStatus.set(false)
    }
  }

  reagendar(): void {
    const ag = this.eventoAberto()
    if (!ag) return
    const slug = currentUser()?.slug ?? ''
    const link = `${APP.URL_BASE}/${slug}?reagendar=${ag.id}`
    navigator.clipboard.writeText(link)
      .then(() => this.snack.open('Link de reagendamento copiado!', 'OK', { duration: 4000 }))
      .catch(() => this.snack.open('Não foi possível copiar o link.', 'OK', { duration: 4000 }))
  }

  abrirWhatsApp(): void {
    const ag = this.eventoAberto()
    if (!ag) return
    const num = ag.cliente_wpp.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${ag.cliente_nome}!`)
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  statusLabel(s: StatusAgend): string { return STATUS_STYLE[s]?.label ?? s }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  formatarHora(iso: string, duracaoMin: number | null): string {
    const inicio = new Date(iso)
    const fim = duracaoMin ? new Date(inicio.getTime() + duracaoMin * 60000) : null
    const fmt = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return fim ? `${fmt(inicio)} – ${fmt(fim)}` : fmt(inicio)
  }

  formatarPreco(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  private buildEventos(lista: AgendamentoComServico[]): EventInput[] {
    return lista.map(a => {
      const inicio = new Date(a.data_hora)
      const duracao = a.servico?.duracao_min ?? 60
      const fim = new Date(inicio.getTime() + duracao * 60_000)
      const style = STATUS_STYLE[a.status] ?? STATUS_STYLE['pendente']
      return {
        id: a.id,
        title: a.cliente_nome,
        start: inicio,
        end: fim,
        backgroundColor: style.bg,
        borderColor: style.border,
        textColor: style.text,
        extendedProps: {
          agendamento: a,
          clienteNome: a.cliente_nome,
          servicoNome: a.servico?.nome ?? '',
          status: a.status,
        },
      } as EventInput
    })
  }

  private getCalApi() {
    const el = document.querySelector('full-calendar') as any
    return el?._component?.calendar ?? null
  }
}
