import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PLAN_LIMITS } from '@core/constants/plan.limits';
import { planoLabel, proximoPlanoId } from '@core/data/planos.catalog';
import { userPlano } from '@core/signals/app.signals';
import { Plano } from '@core/types/database.types';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import { UpgradeNavigationService } from './upgrade-navigation.service';

const PLAN_LIMIT_REACHED_CODE = 'PLAN_LIMIT_REACHED';

type LimitResource = 'services';

interface PlanLimitErrorBody {
  code?: string;
  resource?: string;
  limit?: number;
  message?: string;
}

export interface PlanLimitDialogInput {
  resource: LimitResource;
  limit?: number;
  planoAtual?: Plano;
}

@Injectable({ providedIn: 'root' })
export class PlanLimitDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly upgradeNav = inject(UpgradeNavigationService);

  async abrir(input: PlanLimitDialogInput): Promise<void> {
    const planoAtual = input.planoAtual ?? userPlano();
    const proximoPlano = proximoPlanoId(planoAtual);
    const nomePlano = planoLabel(planoAtual);
    const nomeProximo = proximoPlano ? planoLabel(proximoPlano) : '';
    const limite = input.limit ?? this.limiteLocal(input.resource, planoAtual);
    const recurso = this.recursoLabel(input.resource, limite);

    const data: ConfirmDialogData = {
      titulo: `Limite de ${recurso.plural} atingido`,
      mensagem: proximoPlano
        ? `Seu plano ${nomePlano} permite cadastrar até ${recurso.limite}. Faça upgrade para o plano ${nomeProximo} para adicionar mais ${recurso.plural}.`
        : `Seu plano ${nomePlano} já está no maior limite disponível para ${recurso.plural}.`,
      confirmLabel: proximoPlano ? `Ver plano ${nomeProximo}` : 'Entendido',
      confirmIcon: proximoPlano ? 'upgrade' : 'check_circle',
      tipo: 'primary',
      ocultarCancelar: !proximoPlano,
    };

    const confirmado = await firstValueFrom(
      this.dialog
        .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
          ConfirmDialogComponent,
          { data },
        )
        .afterClosed(),
    );

    if (confirmado && proximoPlano) {
      this.upgradeNav.irParaUpgrade();
    }
  }

  async abrirPorErro(error: unknown): Promise<boolean> {
    const body = this.extrairErro(error);
    if (body?.code !== PLAN_LIMIT_REACHED_CODE || body.resource !== 'services') {
      return false;
    }

    await this.abrir({
      resource: 'services',
      limit: body.limit,
    });
    return true;
  }

  private extrairErro(error: unknown): PlanLimitErrorBody | null {
    if (error instanceof HttpErrorResponse) {
      return error.error as PlanLimitErrorBody;
    }

    const err = error as { error?: PlanLimitErrorBody; code?: string; resource?: string; limit?: number };
    return err?.error ?? err ?? null;
  }

  private limiteLocal(resource: LimitResource, plano: Plano): number | undefined {
    if (resource === 'services') {
      const limite = PLAN_LIMITS[plano].servicos;
      return limite === -1 ? undefined : limite;
    }
    return undefined;
  }

  private recursoLabel(
    resource: LimitResource,
    limit: number | undefined,
  ): { plural: string; limite: string } {
    if (resource === 'services') {
      const plural = 'serviços';
      const unidade = limit === 1 ? 'serviço' : plural;
      return {
        plural,
        limite: limit === undefined ? 'o limite do plano' : `${limit} ${unidade}`,
      };
    }

    return { plural: 'recursos', limite: 'o limite do plano' };
  }
}
