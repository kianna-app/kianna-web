import { Plano } from '@core/types/database.types';
import { PLAN_LIMITS, isUnlimited } from '@core/constants/plan.limits';

export interface PlanoChip {
  icone: string;
  legenda: string;
  valor: string;
}

export interface PlanoFeature {
  label: string;
  destaque?: boolean;
}

export interface PlanoCatalogo {
  id: Plano;
  nome: string;
  preco: number;
  precoLabel: string;
  resumo: string;
  destaque?: string;
  chips: PlanoChip[];
  features: PlanoFeature[];
}

function n(v: number): string {
  return isUnlimited(v) ? 'Ilimitado' : String(v);
}

export const PLANOS_CATALOGO: PlanoCatalogo[] = [
  {
    id: 'gratis',
    nome: 'Essencial',
    preco: 49,
    precoLabel: 'R$ 49/mês',
    resumo: 'Para começar: agenda e link público de agendamentos.',
    chips: [
      { icone: 'badge',       legenda: 'Profissionais',         valor: n(PLAN_LIMITS.gratis.multiProfissional) },
      { icone: 'content_cut', legenda: 'Serviços',              valor: n(PLAN_LIMITS.gratis.servicos) },
      { icone: 'event',       legenda: 'Agendamentos / mês',    valor: n(PLAN_LIMITS.gratis.agendamentosMes) },
    ],
    features: [
      { label: 'Agenda completa com calendário mensal' },
      { label: 'Página pública de agendamento (link compartilhável)' },
      { label: `Até ${PLAN_LIMITS.gratis.servicos} serviços cadastrados` },
      { label: `Até ${PLAN_LIMITS.gratis.agendamentosMes} agendamentos por mês` },
      { label: 'Sem integração com WhatsApp' },
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 179,
    precoLabel: 'R$ 179/mês',
    resumo: 'Tudo do Essencial + WhatsApp completo, o coração do produto.',
    destaque: 'WhatsApp completo: lembretes, confirmação automática e respostas',
    chips: [
      { icone: 'badge',       legenda: 'Profissionais',      valor: n(PLAN_LIMITS.pro.multiProfissional) },
      { icone: 'content_cut', legenda: 'Serviços',           valor: n(PLAN_LIMITS.pro.servicos) },
      { icone: 'event',       legenda: 'Agendamentos / mês', valor: n(PLAN_LIMITS.pro.agendamentosMes) },
    ],
    features: [
      { label: 'Tudo do plano Essencial' },
      { label: 'WhatsApp integrado (Z-API)', destaque: true },
      { label: 'Lembretes automáticos para clientes', destaque: true },
      { label: 'Confirmação de presença automática', destaque: true },
      { label: 'Serviços ilimitados' },
      { label: 'Agendamentos ilimitados por mês' },
      { label: 'Página pública personalizada' },
      { label: 'Relatórios básicos de agendamentos' },
    ],
  },
  {
    id: 'studio',
    nome: 'Studio',
    preco: 299,
    precoLabel: 'R$ 299/mês',
    resumo: 'Tudo do Pro + múltiplos profissionais e relatórios avançados.',
    destaque: 'Múltiplos profissionais e relatórios completos',
    chips: [
      { icone: 'badge',       legenda: 'Profissionais',      valor: n(PLAN_LIMITS.studio.multiProfissional) },
      { icone: 'content_cut', legenda: 'Serviços',           valor: n(PLAN_LIMITS.studio.servicos) },
      { icone: 'event',       legenda: 'Agendamentos / mês', valor: n(PLAN_LIMITS.studio.agendamentosMes) },
    ],
    features: [
      { label: 'Tudo do plano Pro' },
      { label: `Até ${PLAN_LIMITS.studio.multiProfissional} profissionais na mesma conta`, destaque: true },
      { label: 'Relatórios avançados (financeiro, retenção)', destaque: true },
      { label: '[[ Suporte prioritário ]]' },
    ],
  },
];

export const PLANO_CHIPS_LEGENDA: PlanoChip[] = [
  { icone: 'badge',       legenda: 'Profissionais',         valor: '' },
  { icone: 'content_cut', legenda: 'Serviços cadastrados',  valor: '' },
  { icone: 'event',       legenda: 'Agendamentos por mês',  valor: '' },
];
