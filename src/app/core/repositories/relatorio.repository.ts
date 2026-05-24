import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

export interface ContagemPorStatus  { status: string; total: number; }
export interface ContagemPorServico { servico_id: string | null; nome: string; total: number; }
export interface RelatorioResponse {
  periodo: { inicio: string; fim: string };
  total: number;
  por_status:  ContagemPorStatus[];
  por_servico: ContagemPorServico[];
}

@Injectable({ providedIn: 'root' })
export class RelatorioRepository {
  private api = inject(ApiService);

  mensal(ano: number, mes: number): Promise<RelatorioResponse> {
    return this.api.get<RelatorioResponse>(
      `/api/relatorio?ano=${ano}&mes=${mes}`,
    );
  }
}
