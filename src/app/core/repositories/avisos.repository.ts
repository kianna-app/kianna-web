import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

export type AvisoDestino = 'todos' | 'selecionados';
export type AvisoEstado  = 'agendada' | 'publicada';

export interface AvisoParaProfissional {
  id: string;
  titulo: string;
  corpo: string;
  publicar_em: string;
  lida_em: string | null;
}

export interface AvisoComStats {
  id: string;
  titulo: string;
  corpo: string;
  publicar_em: string;
  destino: AvisoDestino;
  estado: AvisoEstado;
  destinatarios: string[];
  total_destinatarios: number;
  total_leituras: number;
  criado_em: string;
  atualizado_em: string;
  excluida_em: string | null;
}

export interface LeituraDetalhada {
  profissional_id: string;
  nome: string;
  lida_em: string | null;
}

export interface CriarAvisoPayload {
  titulo: string;
  corpo: string;
  publicar_em?: string;
  destino: AvisoDestino;
  destinatarios?: string[];
}

export type AtualizarAvisoPayload = Partial<CriarAvisoPayload>;

@Injectable({ providedIn: 'root' })
export class AvisosRepository {
  private api = inject(ApiService);

  // ── Profissional ──
  meusAvisos(): Promise<AvisoParaProfissional[]> {
    return this.api.get<AvisoParaProfissional[]>('/api/avisos');
  }

  marcarLido(avisoId: string): Promise<void> {
    return this.api.post<void>(`/api/avisos/${avisoId}/ler`, {});
  }

  // ── Admin ──
  historico(): Promise<AvisoComStats[]> {
    return this.api.get<AvisoComStats[]>('/api/admin/avisos');
  }

  criar(payload: CriarAvisoPayload): Promise<AvisoComStats> {
    return this.api.post<AvisoComStats>('/api/admin/avisos', payload);
  }

  atualizar(id: string, payload: AtualizarAvisoPayload): Promise<AvisoComStats> {
    return this.api.patch<AvisoComStats>(`/api/admin/avisos/${id}`, payload);
  }

  excluir(id: string): Promise<void> {
    return this.api.delete<void>(`/api/admin/avisos/${id}`);
  }

  leituras(id: string): Promise<LeituraDetalhada[]> {
    return this.api.get<LeituraDetalhada[]>(`/api/admin/avisos/${id}/leituras`);
  }
}
