import { Injectable } from '@angular/core';
import { Disponibilidade, Servico } from '@core/types/database.types';
import { format, addMinutes, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

export interface SlotInfo {
  hora: string;
  dataHoraISO: string;
  disponivel: boolean;
}

@Injectable({ providedIn: 'root' })
export class SlotCalculatorService {

  calcularSlotsParaDia(
    data: Date,
    servico: Servico,
    disponibilidades: Disponibilidade[],
    agendados: Array<{ data_hora: string; duracao_min: number }>,
  ): SlotInfo[] {
    const diaSemana = data.getDay();
    const disp = disponibilidades.find(d => d.dia_semana === diaSemana);
    if (!disp) return [];

    const slots: SlotInfo[] = [];
    const intervalo = disp.intervalo_min;
    let cursor = this.parseHora(data, disp.hora_inicio);
    const fim = this.parseHora(data, disp.hora_fim);
    const agora = new Date();

    while (
      isBefore(addMinutes(cursor, servico.duracao_min), fim) ||
      +addMinutes(cursor, servico.duracao_min) === +fim
    ) {
      const slotFim = addMinutes(cursor, servico.duracao_min);
      const jaPassou = isBefore(cursor, agora);

      const temConflito = agendados.some(ag => {
        const agInicio = parseISO(ag.data_hora);
        const agFim = addMinutes(agInicio, ag.duracao_min);
        return isBefore(cursor, agFim) && isAfter(slotFim, agInicio);
      });

      slots.push({
        hora: format(cursor, 'HH:mm'),
        dataHoraISO: cursor.toISOString(),
        disponivel: !temConflito && !jaPassou,
      });

      cursor = addMinutes(cursor, intervalo);
    }

    return slots;
  }

  diasComSlots(
    disponibilidades: Disponibilidade[],
    agendados: Array<{ data_hora: string; duracao_min: number }>,
    servico: Servico,
    diasAFrente = 30,
  ): Date[] {
    const hoje = startOfDay(new Date());
    const diasValidos: Date[] = [];

    for (let i = 0; i < diasAFrente; i++) {
      const dia = new Date(hoje);
      dia.setDate(hoje.getDate() + i);
      const slots = this.calcularSlotsParaDia(dia, servico, disponibilidades, agendados);
      if (slots.some(s => s.disponivel)) {
        diasValidos.push(dia);
      }
    }

    return diasValidos;
  }

  private parseHora(base: Date, horaStr: string): Date {
    const [h, m] = horaStr.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }
}
