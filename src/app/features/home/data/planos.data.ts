// Catálogo da landing pública.
// Preços e ordem alinhados com o catálogo oficial em
// kianna-web/src/app/core/data/planos.catalog.ts (4 planos canônicos).
// IDs idênticos aos do enum DB para evitar divergência.

export interface Plano {
  id: 'gratis' | 'essencial' | 'pro' | 'studio';
  nome: string;
  descricao: string;
  precoMensal: number;
  precoAnual: number;
  destaque: boolean;
  ctaTexto: string;
  features: string[];
  selo?: string;
}

export const PLANOS: Plano[] = [
  {
    id: 'gratis',
    nome: 'Grátis',
    descricao: 'Perfeito pra testar e começar.',
    precoMensal: 0,
    precoAnual: 0,
    destaque: false,
    ctaTexto: 'Criar conta grátis',
    features: [
      'Até 30 agendamentos por mês',
      'Até 3 serviços cadastrados',
      'Página pública de agendamento',
      'Sem WhatsApp integrado',
    ],
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    descricao: 'Para quem já passou do Grátis.',
    precoMensal: 49,
    precoAnual: 49,
    destaque: false,
    ctaTexto: 'Assinar Essencial',
    features: [
      'Tudo do Grátis',
      'Até 15 serviços cadastrados',
      'Até 150 agendamentos por mês',
      'Sem WhatsApp integrado',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    descricao: 'Pra profissional que não quer perder cliente.',
    precoMensal: 179,
    precoAnual: 179,
    destaque: true,
    selo: 'Mais escolhido',
    ctaTexto: 'Começar Pro',
    features: [
      'Agendamentos ilimitados',
      'Serviços ilimitados',
      'WhatsApp integrado (lembretes + confirmação)',
    ],
  },
  {
    id: 'studio',
    nome: 'Studio',
    descricao: 'Pra estúdios e equipes pequenas.',
    precoMensal: 299,
    precoAnual: 299,
    destaque: false,
    ctaTexto: 'Começar Studio',
    features: [
      'Tudo do Pro',
      'Até 5 profissionais na mesma conta',
      'Relatórios avançados',
    ],
  },
];
