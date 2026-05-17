import { Injectable, inject } from '@angular/core';
import { supabase } from '@core/supabase/supabase.client';
import { ApiService } from '@core/services/api.service';
import { Profissional, Servico, Disponibilidade, Bloqueio } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class BookingRepository {
  private api = inject(ApiService);

  async getProfissionalBySlug(slug: string): Promise<Profissional | null> {
    try {
      return await this.api.getPublic<Profissional>(`/api/profissionais/${slug}`);
    } catch {
      return null;
    }
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
    return (data ?? []) as Disponibilidade[];
  }

  async getAgendamentosConfirmados(
    profissionalId: string,
    de: string,
    ate: string,
  ): Promise<Array<{ data_hora: string }>> {
    const { data } = await supabase
      .from('agendamentos_publicos')
      .select('data_hora')
      .eq('profissional_id', profissionalId)
      .eq('status', 'confirmado')
      .gte('data_hora', `${de}T00:00:00`)
      .lte('data_hora', `${ate}T23:59:59`);
    return data ?? [];
  }

  async getBloqueios(profissionalId: string, de: string, ate: string): Promise<Bloqueio[]> {
    const { data } = await supabase
      .from('bloqueios')
      .select('*')
      .eq('profissional_id', profissionalId)
      .gte('data', de)
      .lte('data', ate);
    return (data ?? []) as Bloqueio[];
  }

  async getAgendamentoById(id: string): Promise<{ id: string; servico_id: string | null } | null> {
    const { data } = await supabase
      .from('agendamentos_publicos')
      .select('id, servico_id')
      .eq('id', id)
      .maybeSingle();
    return data as { id: string; servico_id: string | null } | null;
  }

  async contarAgendamentosNoMes(profissionalId: string): Promise<number> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const { count } = await supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('profissional_id', profissionalId)
      .in('status', ['pendente', 'confirmado', 'finalizado'])
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
    agendamento_origem_id?: string;
  }): Promise<{ id: string } | null> {
    try {
      if (payload.agendamento_origem_id) {
        const { agendamento_origem_id, ...rest } = payload;
        return await this.api.postPublic<{ id: string }>(
          '/api/agendamentos/reagendar',
          { agendamento_origem_id, ...rest },
        );
      }
      return await this.api.postPublic<{ id: string }>('/api/agendamentos', payload);
    } catch (err) {
      console.error('[BookingRepository] criarAgendamento falhou:', err);
      return null;
    }
  }
}
