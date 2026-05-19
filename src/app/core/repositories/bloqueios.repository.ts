import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Bloqueio } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class BloqueiosRepository {
  private api = inject(ApiService);

  async listar(): Promise<Bloqueio[]> {
    return this.api.get<Bloqueio[]>('/api/bloqueios');
  }

  async criar(payload: {
    data: string;
    hora_inicio?: string;
    hora_fim?: string;
    motivo?: string;
  }): Promise<Bloqueio> {
    return this.api.post<Bloqueio>('/api/bloqueios', payload);
  }

  async excluir(id: string): Promise<void> {
    await this.api.delete<void>(`/api/bloqueios/${id}`);
  }
}
