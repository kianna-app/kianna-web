import { Component, OnInit, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgendamentosStore } from '../../state/agendamentos.store';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';
import { STATUS_CORES } from '@core/constants/app.constants';
import { BreakpointService } from '@core/services/breakpoint.service';
import { AgendamentoSheetComponent, SheetData, SheetResult } from './agendamento-sheet/agendamento-sheet.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarRef?: FullCalendarComponent;

  protected store = inject(AgendamentosStore);
  private bp      = inject(BreakpointService);
  private sheet   = inject(MatBottomSheet);
  private snack   = inject(MatSnackBar);

  private periodoCarregado  = signal<string | null>(null);
  private carregandoTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly events = computed<EventInput[]>(() =>
    this.store.agendamentos().map(a => this.toEvent(a))
  );

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin],
    initialView: this.bp.isMobile() ? 'listWeek' : 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: this.bp.isMobile() ? 'listWeek,timeGridDay' : 'timeGridDay,timeGridWeek,listWeek',
    },
    locale: ptBrLocale,
    firstDay: 1,
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    allDaySlot: false,
    nowIndicator: true,
    height: 'auto',
    expandRows: true,
    editable: false,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    events: this.events(),
    eventClick: (arg) => this.aoClicarEvento(arg),
    datesSet: (info) => this.aoTrocarPeriodo(info.start, info.end),
  }));

  ngOnInit(): void {
    // datesSet dispara automaticamente no primeiro render
  }

  ngOnDestroy(): void {
    if (this.carregandoTimeout) clearTimeout(this.carregandoTimeout);
  }

  private toEvent(a: AgendamentoComServico): EventInput {
    const inicio = new Date(a.data_hora);
    const dur = a.servico?.duracao_min ?? 60;
    const fim = new Date(inicio.getTime() + dur * 60_000);
    return {
      id:              a.id,
      title:           a.cliente_nome,
      start:           inicio,
      end:             fim,
      backgroundColor: STATUS_CORES[a.status],
      borderColor:     STATUS_CORES[a.status],
      extendedProps:   { agendamento: a },
    };
  }

  private async aoTrocarPeriodo(inicio: Date, fim: Date): Promise<void> {
    const chave = `${inicio.toISOString()}_${fim.toISOString()}`;
    if (this.periodoCarregado() === chave) return;
    this.periodoCarregado.set(chave);

    if (this.carregandoTimeout) clearTimeout(this.carregandoTimeout);
    this.carregandoTimeout = setTimeout(() => {
      if (this.store.carregando()) {
        this.snack.open('Conexão lenta. Tente novamente.', 'Recarregar', { duration: 5000 })
          .onAction().subscribe(() => location.reload());
      }
    }, 10000);

    await this.store.carregarPeriodo(inicio, fim);

    if (this.carregandoTimeout) {
      clearTimeout(this.carregandoTimeout);
      this.carregandoTimeout = null;
    }
  }

  private async aoClicarEvento(arg: EventClickArg): Promise<void> {
    const agendamento = arg.event.extendedProps['agendamento'] as AgendamentoComServico;
    const ref = this.sheet.open<AgendamentoSheetComponent, SheetData, SheetResult>(
      AgendamentoSheetComponent, { data: { agendamento } }
    );
    const r = await firstValueFrom(ref.afterDismissed());
    if (!r) return;

    const novoStatus: StatusAgend =
      r.acao === 'confirmar' ? 'confirmado' :
      r.acao === 'reabrir'   ? 'pendente'   : 'cancelado';

    try {
      await this.store.atualizarStatus(agendamento.id, novoStatus);

      const fcEvent = this.calendarRef?.getApi().getEventById(agendamento.id);
      if (fcEvent) {
        fcEvent.setProp('backgroundColor', STATUS_CORES[novoStatus]);
        fcEvent.setProp('borderColor', STATUS_CORES[novoStatus]);
        fcEvent.setExtendedProp('agendamento', { ...agendamento, status: novoStatus });
      }

      const labels = {
        confirmado: 'Agendamento confirmado',
        cancelado:  'Agendamento cancelado',
        pendente:   'Agendamento reaberto',
      } as const;
      this.snack.open(labels[novoStatus], 'OK', { duration: 2500 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao atualizar', 'OK', { duration: 3000 });
    }
  }
}
