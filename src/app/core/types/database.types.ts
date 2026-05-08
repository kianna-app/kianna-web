export type Plano       = 'gratis' | 'pro' | 'studio';
export type StatusAgend = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type DiaSemana   = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ── Modalidades ───────────────────────────────────────────────
export type ModalidadeAtendimento = 'presencial' | 'domiciliar' | 'online';

export const MODALIDADE_LABELS: Record<ModalidadeAtendimento, { label: string; icone: string; descricao: string }> = {
  presencial:  { label: 'Presencial',  icone: 'storefront',     descricao: 'Cliente vai até você' },
  domiciliar:  { label: 'Domiciliar',  icone: 'directions_car', descricao: 'Você vai até o cliente' },
  online:      { label: 'Online',      icone: 'videocam',       descricao: 'Atendimento por vídeo' },
};

export interface LinkPersonalizado {
  label: string;
  url: string;
}

export interface Profissional {
  id: string;
  user_id: string;
  nome: string;
  slug: string;
  foto_url: string | null;
  whatsapp: string;
  especialidade: string | null;
  bio: string | null;
  plano: Plano;
  wpp_instance_id: string | null;
  stripe_subscription_id: string | null;
  onboarding_concluido: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;

  // ── Módulo 2 ──
  politica_cancelamento: string | null;
  endereco_cep: string | null;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  links_personalizados: LinkPersonalizado[];
  slug_alterado_em: string | null;
}

export interface Servico {
  id: string;
  profissional_id: string;
  nome: string;
  duracao_min: number;
  preco: number;
  modalidade: ModalidadeAtendimento;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Disponibilidade {
  id: string;
  profissional_id: string;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}

export interface Agendamento {
  id: string;
  profissional_id: string;
  servico_id: string | null;
  cliente_nome: string;
  cliente_wpp: string;
  data_hora: string;
  status: StatusAgend;
  lembrete_enviado: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoComServico extends Agendamento {
  servico: Pick<Servico, 'id' | 'nome' | 'duracao_min' | 'preco' | 'modalidade'> | null;
}

export type ServicoInput = Pick<Servico, 'nome' | 'duracao_min' | 'preco' | 'modalidade' | 'ativo'>;

export interface DisponibilidadeInput {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}

export interface SlugRedirect {
  id: string;
  slug_antigo: string;
  profissional_id: string;
  expira_em: string;
  created_at: string;
}
