import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Bloqueio } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class BloqueiosRepository {

  async getBloqueiosPorPeriodo(
    profissionalId: string,
    dataInicio: string,
    dataFim: string,
  ): Promise<Bloqueio[]> {
    const { data } = await supabase
      .from('bloqueios')
      .select('*')
      .eq('profissional_id', profissionalId)
      .gte('data', dataInicio)
      .lte('data', dataFim);
    return (data ?? []) as Bloqueio[];
  }

  async listar(): Promise<Bloqueio[]> {
    const profissional_id = profissionalIdOrThrow();
    const hoje = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('bloqueios')
      .select('*')
      .eq('profissional_id', profissional_id)
      .gte('data', hoje)
      .order('data', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Bloqueio[];
  }

  async criar(payload: {
    data: string;
    hora_inicio?: string;
    hora_fim?: string;
    motivo?: string;
  }): Promise<Bloqueio> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('bloqueios')
      .insert({ ...payload, profissional_id })
      .select()
      .single();
    if (error) throw error;
    return data as Bloqueio;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('bloqueios')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
