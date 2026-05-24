import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Plano } from '@core/types/database.types';

export interface PlanoBackend {
  id: Plano;
  nome: string;
  preco: number;
  precoLabel: string;
  resumo: string;
}

export interface CatalogoResponse {
  planos: PlanoBackend[];
  atual: Plano;
}

export interface UpgradeStubResponse {
  status: 'em_breve';
  mensagem: string;
  planoId: Plano;
}

@Injectable({ providedIn: 'root' })
export class PlanosRepository {
  private api = inject(ApiService);

  async catalogo(): Promise<CatalogoResponse> {
    return this.api.get<CatalogoResponse>('/api/planos');
  }

  async iniciarUpgrade(planoId: Plano): Promise<UpgradeStubResponse> {
    return this.api.post<UpgradeStubResponse>('/api/planos/upgrade', { planoId });
  }
}
