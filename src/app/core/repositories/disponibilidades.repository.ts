import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class DisponibilidadesRepository {
  private api = inject(ApiService);

  async listar(): Promise<Disponibilidade[]> {
    return this.api.get<Disponibilidade[]>('/api/disponibilidades');
  }

  async criar(input: DisponibilidadeInput): Promise<Disponibilidade> {
    return this.api.post<Disponibilidade>('/api/disponibilidades', input);
  }

  async atualizar(
    id: string,
    input: Partial<DisponibilidadeInput>,
  ): Promise<Disponibilidade> {
    return this.api.patch<Disponibilidade>(`/api/disponibilidades/${id}`, input);
  }

  async excluir(id: string): Promise<void> {
    await this.api.delete<void>(`/api/disponibilidades/${id}`);
  }

  async substituirTodas(inputs: DisponibilidadeInput[]): Promise<void> {
    const atuais = await this.listar();
    await Promise.all(atuais.map(d => this.excluir(d.id)));
    if (inputs.length === 0) return;
    await Promise.all(inputs.map(i => this.criar(i)));
  }
}
