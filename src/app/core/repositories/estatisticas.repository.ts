import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { AgendamentoComServico } from '@core/types/database.types';

export interface EstatisticasDashboard {
  proximosAgendamentos: AgendamentoComServico[];
  totalDoMes: number;
  doDia: number;
  cancelamentosDoMes: number;
  taxaOcupacao: number;
  totalPendentes: number;
}

@Injectable({ providedIn: 'root' })
export class EstatisticasRepository {

  async carregarDashboard(): Promise<EstatisticasDashboard> {
    const profissional_id = profissionalIdOrThrow();
    const agora = new Date();
    const inicioHoje = startOfDay(agora);
    const fimHoje = endOfDay(agora);
    const inicioMes = startOfMonth(agora);
    const fimMes = endOfMonth(agora);
    const fimSemana = addDays(agora, 7);

    const { data: proximos, error: e1 } = await supabase
      .from('agendamentos')
      .select(`*, servico:servicos ( id, nome, duracao_min, preco, modalidade )`)
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'pendente'])
      .gte('data_hora', agora.toISOString())
      .lte('data_hora', fimSemana.toISOString())
      .order('data_hora', { ascending: true })
      .limit(5);
    if (e1) throw e1;

    const { count: totalMes, error: e2 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'finalizado'])
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    if (e2) throw e2;

    const { count: doDia, error: e3 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'finalizado'])
      .gte('data_hora', inicioHoje.toISOString())
      .lte('data_hora', fimHoje.toISOString());
    if (e3) throw e3;

    const { count: cancelados, error: e4 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .eq('status', 'cancelado')
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    if (e4) throw e4;

    const { count: pendentes, error: e5 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .eq('status', 'pendente')
      .gte('data_hora', agora.toISOString());
    if (e5) throw e5;

    return {
      proximosAgendamentos: (proximos ?? []) as unknown as AgendamentoComServico[],
      totalDoMes: totalMes ?? 0,
      doDia: doDia ?? 0,
      cancelamentosDoMes: cancelados ?? 0,
      taxaOcupacao: 0,
      totalPendentes: pendentes ?? 0,
    };
  }
}
