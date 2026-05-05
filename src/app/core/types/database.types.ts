export type Plano       = 'gratis' | 'pro' | 'studio';
export type StatusAgend = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type DiaSemana   = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
}

export interface Servico {
  id: string;
  profissional_id: string;
  nome: string;
  duracao_min: number;
  preco: number;
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
  servico: Pick<Servico, 'id' | 'nome' | 'duracao_min' | 'preco'> | null;
}

export type ServicoInput = Pick<Servico, 'nome' | 'duracao_min' | 'preco' | 'ativo'>;

export interface DisponibilidadeInput {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}
