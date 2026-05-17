import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosRepository {
  private api = inject(ApiService);

  async listarPorPeriodo(inicio: Date, fim: Date): Promise<AgendamentoComServico[]> {
    const inicioISO = encodeURIComponent(inicio.toISOString());
    const fimISO    = encodeURIComponent(fim.toISOString());
    return this.api.get<AgendamentoComServico[]>(
      `/api/agendamentos?inicio=${inicioISO}&fim=${fimISO}`,
    );
  }

  async atualizarStatus(
    id: string,
    status: StatusAgend,
    motivo_recusa?: string,
  ): Promise<void> {
    const payload: Record<string, unknown> = { status };
    if (status === 'recusado' && motivo_recusa !== undefined) {
      payload['motivo_recusa'] = motivo_recusa;
    }
    await this.api.patch(`/api/agendamentos/${id}/status`, payload);
  }

  async criar(payload: {
    profissional_id: string; servico_id: string; cliente_nome: string;
    cliente_wpp: string; data_hora: string; status: string; observacoes?: string;
  }): Promise<{ id: string }> {
    const { status: _status, ...body } = payload;
    return this.api.post<{ id: string }>('/api/agendamentos', body);
  }

  async atualizar(id: string, payload: Partial<{
    servico_id: string; cliente_nome: string; cliente_wpp: string;
    data_hora: string; status: string; observacoes: string;
  }>): Promise<void> {
    const { status: _status, ...body } = payload;
    await this.api.patch(`/api/agendamentos/${id}`, body);
  }

  async excluir(id: string): Promise<void> {
    await this.api.delete(`/api/agendamentos/${id}`);
  }

  async contarPendentes(_profissionalId: string): Promise<number> {
    const r = await this.api.get<{ count: number }>('/api/agendamentos/pendentes/count');
    return r.count ?? 0;
  }

  async finalizarVencidos(_profissionalId: string): Promise<void> {
    await this.api.patch('/api/agendamentos/finalizar-vencidos', {});
  }

  async reagendar(
    agendamentoOrigemId: string,
    payload: {
      profissional_id: string;
      servico_id: string;
      cliente_nome: string;
      cliente_wpp: string;
      data_hora: string;
    },
  ): Promise<{ id: string }> {
    return this.api.postPublic<{ id: string }>('/api/agendamentos/reagendar', {
      agendamento_origem_id: agendamentoOrigemId,
      ...payload,
    });
  }

  async getById(id: string): Promise<{ id: string; servico_id: string | null } | null> {
    try {
      const ag = await this.api.get<{ id: string; servico_id: string | null }>(
        `/api/agendamentos/${id}`,
      );
      return ag ?? null;
    } catch {
      return null;
    }
  }
}
