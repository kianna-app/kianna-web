import { Injectable } from '@angular/core';
import { supabase } from '@core/supabase/supabase.client';
import { Profissional, Servico, Disponibilidade, Agendamento } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class BookingRepository {

  async getProfissionalBySlug(slug: string): Promise<Profissional | null> {
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .eq('slug', slug)
      .eq('ativo', true)
      .maybeSingle();
    return data;
  }

  async getRedirectBySlug(slug: string): Promise<string | null> {
    const now = new Date().toISOString();
    const { data: redirect } = await supabase
      .from('slug_redirects')
      .select('profissional_id')
      .eq('slug_antigo', slug)
      .gt('expira_em', now)
      .maybeSingle();
    if (!redirect) return null;
    const { data: prof } = await supabase
      .from('profissionais')
      .select('slug')
      .eq('id', redirect.profissional_id)
      .maybeSingle();
    return (prof as any)?.slug ?? null;
  }

  async getServicos(profissionalId: string): Promise<Servico[]> {
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('ativo', true)
      .order('nome');
    return data ?? [];
  }

  async getDisponibilidades(profissionalId: string): Promise<Disponibilidade[]> {
    const { data } = await supabase
      .from('disponibilidades')
      .select('*')
      .eq('profissional_id', profissionalId);
    return data ?? [];
  }

  async getAgendamentosNoIntervalo(
    profissionalId: string,
    de: string,
    ate: string,
  ): Promise<Pick<Agendamento, 'data_hora' | 'servico_id'>[]> {
    const { data } = await supabase
      .from('agendamentos_publicos')
      .select('data_hora, servico_id')
      .eq('profissional_id', profissionalId)
      .gte('data_hora', `${de}T00:00:00`)
      .lte('data_hora', `${ate}T23:59:59`);
    return data ?? [];
  }

  async contarAgendamentosNoMes(profissionalId: string): Promise<number> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const { count } = await supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('profissional_id', profissionalId)
      .in('status', ['pendente', 'confirmado', 'concluido'])
      .gte('data_hora', inicioMes)
      .lte('data_hora', fimMes);
    return count ?? 0;
  }

  async criarAgendamento(payload: {
    profissional_id: string;
    servico_id: string;
    cliente_nome: string;
    cliente_wpp: string;
    data_hora: string;
  }): Promise<{ id: string } | null> {
    const { data } = await supabase
      .from('agendamentos')
      .insert({ ...payload, status: 'pendente' })
      .select('id')
      .single();
    return data;
  }
}
