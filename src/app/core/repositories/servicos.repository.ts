import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Servico, ServicoInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class ServicosRepository {
  private api = inject(ApiService);

  async listar(): Promise<Servico[]> {
    return this.api.get<Servico[]>('/api/servicos');
  }

  async getById(id: string): Promise<Servico> {
    return this.api.get<Servico>(`/api/servicos/${id}`);
  }

  async criar(input: ServicoInput): Promise<Servico> {
    return this.api.post<Servico>('/api/servicos', input);
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<Servico> {
    return this.api.patch<Servico>(`/api/servicos/${id}`, input);
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    await this.api.patch<Servico>(`/api/servicos/${id}`, { ativo });
  }

  async excluir(id: string): Promise<void> {
    await this.api.delete<void>(`/api/servicos/${id}`);
  }
}
