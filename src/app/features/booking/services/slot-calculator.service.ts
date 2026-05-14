import { Injectable } from '@angular/core';
import { Disponibilidade, Servico, Bloqueio } from '@core/types/database.types';
import { addMinutes, startOfDay } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

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
    agendamentosConfirmados: Array<{ data_hora: string }>,
    bloqueios: Bloqueio[],
    timezone: string,
    antecedenciaMinHoras: number,
  ): SlotInfo[] {
    const diaSemana = data.getDay();
    const disp = disponibilidades.find(d => d.dia_semana === diaSemana);
    if (!disp) return [];

    const diaISO = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(data);

    const bloqueiosDoDia = bloqueios.filter(b => b.data === diaISO);
    if (bloqueiosDoDia.some(b => b.hora_inicio === null)) return [];
    const bloqueiosParciais = bloqueiosDoDia.filter(b => b.hora_inicio !== null);

    const capacidade = disp.capacidade ?? 1;
    const slots: SlotInfo[] = [];
    const intervalo = disp.intervalo_min;

    let cursor = this.slotDate(diaISO, disp.hora_inicio, timezone);
    const fim = this.slotDate(diaISO, disp.hora_fim, timezone);
    const limiteAntecedencia = Date.now() + antecedenciaMinHoras * 60 * 60 * 1000;

    while (addMinutes(cursor, servico.duracao_min).getTime() <= fim.getTime()) {
      const slotHora = formatInTimeZone(cursor, timezone, 'HH:mm');
      const slotISO = cursor.toISOString();

      const dentroDaAntecedencia = cursor.getTime() <= limiteAntecedencia;
      const emBloqueio = bloqueiosParciais.some(
        b => slotHora >= b.hora_inicio! && slotHora < b.hora_fim!,
      );
      const confirmadosNoSlot = agendamentosConfirmados.filter(
        a => new Date(a.data_hora).toISOString() === slotISO,
      ).length;

      slots.push({
        hora: slotHora,
        dataHoraISO: slotISO,
        disponivel: !dentroDaAntecedencia && !emBloqueio && confirmadosNoSlot < capacidade,
      });

      cursor = addMinutes(cursor, intervalo);
    }

    return slots;
  }

  diasComSlots(
    disponibilidades: Disponibilidade[],
    agendamentosConfirmados: Array<{ data_hora: string }>,
    servico: Servico,
    bloqueios: Bloqueio[],
    timezone: string,
    antecedenciaMinHoras: number,
    diasAFrente = 30,
  ): Date[] {
    const hoje = startOfDay(new Date());
    const diasValidos: Date[] = [];

    for (let i = 0; i < diasAFrente; i++) {
      const dia = new Date(hoje);
      dia.setDate(hoje.getDate() + i);
      const slots = this.calcularSlotsParaDia(
        dia, servico, disponibilidades, agendamentosConfirmados,
        bloqueios, timezone, antecedenciaMinHoras,
      );
      if (slots.some(s => s.disponivel)) {
        diasValidos.push(dia);
      }
    }

    return diasValidos;
  }

  private slotDate(diaISO: string, hora: string, timezone: string): Date {
    return fromZonedTime(`${diaISO}T${hora}:00`, timezone);
  }
}
