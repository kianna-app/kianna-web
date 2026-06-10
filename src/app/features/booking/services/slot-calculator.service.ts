import { Injectable } from '@angular/core';
import { Disponibilidade, Servico, Bloqueio } from '@core/types/database.types';
import { addMinutes, startOfDay } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface SlotInfo {
  hora: string;
  dataHoraISO: string;
  disponivel: boolean;
  motivoIndisponivel?: string;
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
    antecedenciaMaximaDias?: number | null,
  ): SlotInfo[] {
    const tz = timezone || 'America/Sao_Paulo';
    const antecedencia = antecedenciaMinHoras ?? 24;
    const janelaMaxima = antecedenciaMaximaDias ?? 30;

    const diaSemana = data.getDay();
    const disp = disponibilidades.find(d => d.dia_semana === diaSemana);
    if (!disp) return [];

    const diaISO = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(data);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + janelaMaxima);
    const dataLimiteISO = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(dataLimite);

    // Filtrar se data está além do limite de antecedência máxima
    if (diaISO > dataLimiteISO) {
      return [];
    }

    const bloqueiosDoDia = bloqueios.filter(b => b.data === diaISO);
    if (bloqueiosDoDia.some(b => b.hora_inicio === null)) return [];
    const bloqueiosParciais = bloqueiosDoDia.filter(b => b.hora_inicio !== null);

    const capacidade = disp.capacidade ?? 1;
    const slots: SlotInfo[] = [];
    const intervalo = disp.intervalo_min || 30;
    const duracao = servico?.duracao_min || 30;

    let cursor = this.slotDate(diaISO, disp.hora_inicio, tz);
    const fim = this.slotDate(diaISO, disp.hora_fim, tz);
    const limiteAntecedencia = Date.now() + antecedencia * 60 * 60 * 1000;

    while (addMinutes(cursor, duracao).getTime() <= fim.getTime()) {
      const slotHora = formatInTimeZone(cursor, tz, 'HH:mm');
      const slotISO = cursor.toISOString();

      const dentroDaAntecedencia = cursor.getTime() <= limiteAntecedencia;
      const emBloqueio = bloqueiosParciais.some(
        b => slotHora >= b.hora_inicio! && slotHora < b.hora_fim!,
      );
      const confirmadosNoSlot = agendamentosConfirmados.filter(
        a => new Date(a.data_hora).toISOString() === slotISO,
      ).length;

      const lotado = confirmadosNoSlot >= capacidade;
      const disponivel = !dentroDaAntecedencia && !emBloqueio && !lotado;
      const motivoIndisponivel = dentroDaAntecedencia
        ? `Agendamento com menos de ${antecedencia} horas de antecedência não é permitido.`
        : emBloqueio
          ? 'Horário bloqueado pelo profissional.'
          : lotado
            ? 'Horário já reservado.'
            : undefined;

      slots.push({
        hora: slotHora,
        dataHoraISO: slotISO,
        disponivel,
        motivoIndisponivel,
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
    antecedenciaMaximaDias?: number | null,
    diasAFrente?: number,
  ): Date[] {
    const hoje = startOfDay(new Date());
    const janelaMaxima = antecedenciaMaximaDias ?? 30;
    const diasAVerificar = Math.min(diasAFrente ?? 30, janelaMaxima);
    const diasValidos: Date[] = [];

    for (let i = 0; i < diasAVerificar; i++) {
      const dia = new Date(hoje);
      dia.setDate(hoje.getDate() + i);
      const slots = this.calcularSlotsParaDia(
        dia, servico, disponibilidades, agendamentosConfirmados,
        bloqueios, timezone, antecedenciaMinHoras, antecedenciaMaximaDias,
      );
      if (slots.some(s => s.disponivel)) {
        diasValidos.push(dia);
      }
    }

    return diasValidos;
  }

  private slotDate(diaISO: string, hora: string, timezone: string): Date {
    // hora pode vir como "HH:MM" ou "HH:MM:SS" do Postgres → normaliza para "HH:MM"
    const horaCurta = (hora || '00:00').slice(0, 5);
    return fromZonedTime(`${diaISO}T${horaCurta}:00`, timezone);
  }
}
