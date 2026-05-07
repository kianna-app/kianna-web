export interface Plano {
  id: 'gratis' | 'pro' | 'studio';
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
      'Até 20 agendamentos por mês',
      '1 serviço cadastrado',
      'Página pública personalizada',
      'Confirmação automática no WhatsApp',
      '"Powered by Kianna" na página',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    descricao: 'Pra profissional que não quer perder cliente.',
    precoMensal: 39.90,
    precoAnual: 31.90,
    destaque: true,
    selo: 'Mais escolhido',
    ctaTexto: 'Começar agora',
    features: [
      'Agendamentos ilimitados',
      'Serviços ilimitados',
      'Lembretes automáticos no WhatsApp',
      'Personalização total da página',
      'Sem marca Kianna',
      'Relatórios mensais',
      'Suporte prioritário',
    ],
  },
  {
    id: 'studio',
    nome: 'Studio',
    descricao: 'Pra estúdios e equipes pequenas.',
    precoMensal: 79.90,
    precoAnual: 63.90,
    destaque: false,
    ctaTexto: 'Começar agora',
    features: [
      'Tudo do Pro',
      'Até 3 profissionais na mesma conta',
      'Agenda compartilhada',
      'Relatórios por profissional',
      'Suporte prioritário',
    ],
  },
];
