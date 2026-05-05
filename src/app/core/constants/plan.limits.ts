import { Plano } from '@core/types/database.types';

export interface PlanoLimits {
  servicos: number;
  agendamentosMes: number;
  lembretes: boolean;
  linkPersonalizado: boolean;
  relatorio: boolean;
  multiProfissional: number;
}

export const PLAN_LIMITS: Record<Plano, PlanoLimits> = {
  gratis: {
    servicos: 3,
    agendamentosMes: 20,
    lembretes: false,
    linkPersonalizado: false,
    relatorio: false,
    multiProfissional: 1,
  },
  pro: {
    servicos: -1,
    agendamentosMes: -1,
    lembretes: true,
    linkPersonalizado: true,
    relatorio: true,
    multiProfissional: 1,
  },
  studio: {
    servicos: -1,
    agendamentosMes: -1,
    lembretes: true,
    linkPersonalizado: true,
    relatorio: true,
    multiProfissional: 3,
  },
};

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function exceededLimit(atual: number, limite: number): boolean {
  if (isUnlimited(limite)) return false;
  return atual >= limite;
}
