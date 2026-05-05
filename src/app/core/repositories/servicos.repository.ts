import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Servico, ServicoInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class ServicosRepository {

  async listar(): Promise<Servico[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('profissional_id', profissional_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Servico[];
  }

  async criar(input: ServicoInput): Promise<Servico> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('servicos')
      .insert({ ...input, profissional_id })
      .select()
      .single();
    if (error) throw error;
    return data as Servico;
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Servico;
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .update({ ativo })
      .eq('id', id);
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) throw error;
  }
}
