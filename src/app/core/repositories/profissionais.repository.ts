import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Profissional } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class ProfissionaisRepository {
  private api = inject(ApiService);

  async me(): Promise<Profissional> {
    return this.api.get<Profissional>('/api/profissionais/me');
  }

  async atualizarPerfil(dados: Partial<Profissional>): Promise<Profissional> {
    return this.api.patch<Profissional>('/api/profissionais/me', dados);
  }

  async getPorSlug(slug: string): Promise<Profissional | null> {
    try {
      return await this.api.getPublic<Profissional>(`/api/profissionais/${slug}`);
    } catch {
      return null;
    }
  }
}
