import { Plano } from '@core/types/database.types';

export interface PlanoLimits {
  servicos: number;        // -1 = ilimitado
  agendamentosMes: number; // -1 = ilimitado
  whatsapp: boolean;
  relatorio: boolean;
  multiProfissional: number;
}

// Fonte única de verdade para limites por plano.
// Valores decididos pelo negócio — não alterar sem instrução explícita.
// -1 representa ilimitado (nunca usar 999999 ou similar).
export const PLAN_LIMITS: Record<Plano, PlanoLimits> = {
  gratis: {
    servicos: 3,
    agendamentosMes: 30,
    whatsapp: false,
    relatorio: false,
    multiProfissional: 1,
  },
  essencial: {
    servicos: 15,
    agendamentosMes: 150,
    whatsapp: false,
    relatorio: false,
    multiProfissional: 1,
  },
  pro: {
    servicos: -1,
    agendamentosMes: -1,
    whatsapp: true,
    relatorio: false,
    multiProfissional: 1,
  },
  studio: {
    servicos: -1,
    agendamentosMes: -1,
    whatsapp: true,
    relatorio: true,
    multiProfissional: 5,
  },
};

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function exceededLimit(atual: number, limite: number): boolean {
  if (isUnlimited(limite)) return false;
  return atual >= limite;
}

export function hasWhatsappAccess(plano: Plano): boolean {
  return PLAN_LIMITS[plano].whatsapp;
}

export function hasRelatorioAccess(plano: Plano): boolean {
  return PLAN_LIMITS[plano].relatorio;
}
