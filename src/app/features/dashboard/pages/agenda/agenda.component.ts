import {
  Component, inject, signal, computed, effect, OnInit
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBar } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import { AgendamentosStore } from '../../state/agendamentos.store'
import { ServicosStore } from '../../state/servicos.store'
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository'
import { AgendamentoFormDialogComponent, AgendamentoFormDialogData } from './components/agendamento-form-dialog/agendamento-form-dialog.component'
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types'
import { currentUser } from '@core/signals/app.signals'
import { APP } from '@core/constants/app.constants'

const STATUS_STYLE: Record<StatusAgend, { bg: string; border: string; text: string; label: string }> = {
  confirmado:     { bg: '#DCFCE7', border: '#1D9E75', text: '#166534', label: 'Confirmado'      },
  pendente:       { bg: '#FEF3C7', border: '#D97706', text: '#92400E', label: 'Pendente'        },
  cancelado:      { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', label: 'Cancelado'       },
  recusado:       { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', label: 'Recusado'        },
  reagendado:     { bg: '#F3E8FF', border: '#9B59B6', text: '#6B21A8', label: 'Reagendado'      },
  finalizado:     { bg: '#D1FAE5', border: '#059669', text: '#065F46', label: 'Finalizado'      },
  nao_compareceu: { bg: '#F1F5F9', border: '#64748B', text: '#334155', label: 'Não compareceu' },
}

interface GrupoDia {
  data:         Date
  diaNome:      string
  dataCompleta: string
  agendamentos: AgendamentoComServico[]
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatProgressSpinnerModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  readonly agStore  = inject(AgendamentosStore)
  readonly svStore  = inject(ServicosStore)
  private agRepo    = inject(AgendamentosRepository)
  private dialog    = inject(MatDialog)
  private snack     = inject(MatSnackBar)
  private fb        = inject(FormBuilder)

  readonly STATUS_STYLE = STATUS_STYLE
  readonly statusKeys   = Object.keys(STATUS_STYLE) as StatusAgend[]

  semanaOffset       = signal(0)
  filtroStatus       = signal<StatusAgend | ''>('')
  agAberto           = signal<AgendamentoComServico | null>(null)
  salvando           = signal(false)
  editarExpandido    = signal(false)
  mostrarCampoMotivo = signal(false)
  motivoRecusa       = signal('')

  form = this.fb.group({
    servico_id:   ['', Validators.required],
    data_hora:    ['', Validators.required],
    cliente_nome: ['', Validators.required],
    cliente_wpp:  ['', Validators.required],
    observacoes:  [''],
  })

  semana = computed(() => this.gerarSemana(this.semanaOffset()))

  gruposDias = computed<GrupoDia[]>(() => {
    const status  = this.filtroStatus()
    const lista   = status
      ? this.agStore.agendamentos().filter(a => a.status === status)
      : this.agStore.agendamentos()

    const map = new Map<string, AgendamentoComServico[]>()
    for (const ag of lista) {
      const key = new Date(ag.data_hora).toDateString()
      const arr = map.get(key) ?? []
      arr.push(ag)
      map.set(key, arr)
    }
    return [...map.entries()]
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([key, ags]) => {
        const data = new Date(key)
        return {
          data,
          diaNome:      data.toLocaleDateString('pt-BR', { weekday: 'long' }),
          dataCompleta: data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
          agendamentos: [...ags].sort((a, b) => a.data_hora.localeCompare(b.data_hora)),
        }
      })
  })

  get periodoLabel(): string {
    const dias   = this.semana()
    const inicio = dias[0].data
    const fim    = dias[6].data
    const i = inicio.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    const f = fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    return `${i} – ${f} ${fim.getFullYear()}`
  }

  constructor() {
    effect(() => {
      const ag = this.agAberto()
      if (!ag) return
      const dh  = new Date(ag.data_hora)
      const pad = (n: number) => String(n).padStart(2, '0')
      const dhl = `${dh.getFullYear()}-${pad(dh.getMonth() + 1)}-${pad(dh.getDate())}T${pad(dh.getHours())}:${pad(dh.getMinutes())}`
      this.form.patchValue({
        servico_id:   ag.servico_id ?? '',
        data_hora:    dhl,
        cliente_nome: ag.cliente_nome,
        cliente_wpp:  ag.cliente_wpp,
        observacoes:  ag.observacoes ?? '',
      })
      this.editarExpandido.set(false)
      this.mostrarCampoMotivo.set(false)
      this.motivoRecusa.set('')
    })
  }

  async ngOnInit(): Promise<void> {
    await this.carregarSemana()
    if (!this.svStore.servicos().length) this.svStore.carregar()
  }

  irHoje(): void {
    this.semanaOffset.set(0)
    this.carregarSemana()
  }

  semanaAnterior(): void {
    this.semanaOffset.update(v => v - 1)
    this.carregarSemana()
  }

  proximaSemana(): void {
    this.semanaOffset.update(v => v + 1)
    this.carregarSemana()
  }

  trocarFiltro(status: StatusAgend): void {
    this.filtroStatus.set(this.filtroStatus() === status ? '' : status)
  }

  abrirDrawer(ag: AgendamentoComServico): void {
    this.agAberto.set(ag)
  }

  fecharDrawer(): void {
    this.agAberto.set(null)
  }

  async abrirNovo(): Promise<void> {
    const ref = this.dialog.open<AgendamentoFormDialogComponent, AgendamentoFormDialogData>(
      AgendamentoFormDialogComponent,
      { data: { modo: 'criar' } }
    )
    const result = await firstValueFrom(ref.afterClosed())
    if (result) await this.carregarSemana()
  }

  async atualizarStatus(status: StatusAgend): Promise<void> {
    const ag = this.agAberto()
    if (!ag || this.salvando()) return
    this.salvando.set(true)
    try {
      await this.agStore.atualizarStatus(ag.id, status)
      this.agAberto.set({ ...ag, status })
      this.snack.open('Status atualizado.', '', { duration: 3000 })
    } catch {
      this.snack.open('Erro ao atualizar status.', '', { duration: 3000 })
    } finally {
      this.salvando.set(false)
    }
  }

  async executarRecusa(): Promise<void> {
    const ag = this.agAberto()
    if (!ag || this.salvando()) return
    this.salvando.set(true)
    try {
      const motivo = this.motivoRecusa() || undefined
      await this.agStore.atualizarStatus(ag.id, 'recusado', motivo)
      this.agAberto.set({ ...ag, status: 'recusado' })
      this.mostrarCampoMotivo.set(false)
      this.snack.open('Agendamento recusado.', '', { duration: 3000 })
    } catch {
      this.snack.open('Erro ao recusar.', '', { duration: 3000 })
    } finally {
      this.salvando.set(false)
    }
  }

  async salvarEdicao(): Promise<void> {
    if (this.form.invalid) return
    const ag = this.agAberto()
    if (!ag) return
    this.salvando.set(true)
    try {
      const v = this.form.value
      const dataHoraISO = v.data_hora ? new Date(v.data_hora).toISOString() : undefined
      const payload = {
        ...(v.servico_id   ? { servico_id:   v.servico_id }   : {}),
        ...(dataHoraISO    ? { data_hora:    dataHoraISO }    : {}),
        ...(v.cliente_nome ? { cliente_nome: v.cliente_nome } : {}),
        ...(v.cliente_wpp  ? { cliente_wpp:  v.cliente_wpp }  : {}),
        observacoes: v.observacoes ?? '',
      }
      await this.agRepo.atualizar(ag.id, payload)
      await this.carregarSemana()
      this.fecharDrawer()
      this.snack.open('Agendamento atualizado.', '', { duration: 3000 })
    } catch {
      this.snack.open('Erro ao salvar. Tente novamente.', '', { duration: 4000 })
    } finally {
      this.salvando.set(false)
    }
  }

  reagendar(): void {
    const ag = this.agAberto()
    if (!ag) return
    const slug = currentUser()?.slug ?? ''
    const link = `${APP.URL_BASE}/${slug}?reagendar=${ag.id}`
    navigator.clipboard.writeText(link)
      .then(() => this.snack.open('Link de reagendamento copiado!', 'OK', { duration: 4000 }))
      .catch(() => this.snack.open('Não foi possível copiar o link.', 'OK', { duration: 4000 }))
  }

  abrirWhatsApp(): void {
    const ag = this.agAberto()
    if (!ag) return
    const num = ag.cliente_wpp.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${ag.cliente_nome}!`)
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  ehHoje(data: Date): boolean {
    return data.toDateString() === new Date().toDateString()
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  formatarHora(iso: string, duracaoMin: number | null): string {
    const inicio = new Date(iso)
    const fim    = duracaoMin ? new Date(inicio.getTime() + duracaoMin * 60000) : null
    const fmt    = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return fim ? `${fmt(inicio)} – ${fmt(fim)}` : fmt(inicio)
  }

  formatarPreco(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  private async carregarSemana(): Promise<void> {
    const dias   = this.semana()
    const inicio = new Date(dias[0].data); inicio.setHours(0, 0, 0, 0)
    const fim    = new Date(dias[6].data); fim.setHours(23, 59, 59, 999)
    await this.agStore.carregarPeriodo(inicio, fim)
  }

  private gerarSemana(offset = 0): { data: Date }[] {
    const hoje = new Date()
    const base = new Date(hoje)
    base.setDate(hoje.getDate() - hoje.getDay() + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return { data: d }
    })
  }
}
