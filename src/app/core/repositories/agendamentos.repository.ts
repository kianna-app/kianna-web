import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Agendamento, AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosRepository {

  async listarPorPeriodo(inicio: Date, fim: Date): Promise<AgendamentoComServico[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servicos ( id, nome, duracao_min, preco, modalidade )
      `)
      .eq('profissional_id', profissional_id)
      .gte('data_hora', inicio.toISOString())
      .lt('data_hora', fim.toISOString())
      .order('data_hora', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as AgendamentoComServico[];
  }

  async atualizarStatus(id: string, status: StatusAgend): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Agendamento;
  }

  async criar(payload: {
    profissional_id: string; servico_id: string; cliente_nome: string;
    cliente_wpp: string; data_hora: string; status: string; observacoes?: string;
  }): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('agendamentos').insert(payload).select('id').single();
    if (error) throw error;
    return data as { id: string };
  }

  async atualizar(id: string, payload: Partial<{
    servico_id: string; cliente_nome: string; cliente_wpp: string;
    data_hora: string; status: string; observacoes: string;
  }>): Promise<void> {
    const profissional_id = profissionalIdOrThrow();
    const { error } = await supabase
      .from('agendamentos').update(payload)
      .eq('id', id).eq('profissional_id', profissional_id);
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const profissional_id = profissionalIdOrThrow();
    const { error } = await supabase
      .from('agendamentos').delete()
      .eq('id', id).eq('profissional_id', profissional_id);
    if (error) throw error;
  }

  async contarDoMesAtual(): Promise<number> {
    const profissional_id = profissionalIdOrThrow();
    const inicio = new Date();
    inicio.setDate(1); inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + 1);

    const { count, error } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .gte('data_hora', inicio.toISOString())
      .lt('data_hora', fim.toISOString())
      .neq('status', 'cancelado');
    if (error) throw error;
    return count ?? 0;
  }
}
