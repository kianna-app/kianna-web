import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Profissional, Servico, Disponibilidade, Bloqueio } from '@core/types/database.types';

export interface DadosBooking {
  profissional: Profissional;
  servicos: Servico[];
  disponibilidades: Disponibilidade[];
  bloqueios: Bloqueio[];
  agendamentos_confirmados: Array<{ data_hora: string }>;
  lotado: boolean;
}

export interface BookingRedirect {
  redirect_slug: string;
}

export type DadosBookingResposta = DadosBooking | BookingRedirect;

export function isBookingRedirect(
  resposta: DadosBookingResposta,
): resposta is BookingRedirect {
  return (resposta as BookingRedirect).redirect_slug !== undefined;
}

@Injectable({ providedIn: 'root' })
export class BookingRepository {
  private api = inject(ApiService);

  async getDadosBooking(slug: string): Promise<DadosBookingResposta | null> {
    try {
      return await this.api.getPublic<DadosBookingResposta>(`/api/booking/${slug}`);
    } catch {
      return null;
    }
  }

  async getAgendamentoById(
    id: string,
  ): Promise<{ id: string; servico_id: string | null } | null> {
    try {
      return await this.api.getPublic<{ id: string; servico_id: string | null }>(
        `/api/agendamentos/publico/${id}`,
      );
    } catch {
      return null;
    }
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
