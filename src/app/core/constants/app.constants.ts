export const APP = {
  NOME: 'Kianna',
  DOMINIO: 'kianna.com.br',
  URL_BASE: 'https://kianna.com.br',
  EMOJI: '✨',
  TAGLINE: 'Sua secretária digital de agendamentos',
} as const;

export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 960,
  DESKTOP: 1280,
} as const;

export const STATUS_CORES: Record<string, string> = {
  confirmado:     '#1D9E75',
  pendente:       '#D97706',
  cancelado:      '#E11D48',
  recusado:       '#E11D48',
  reagendado:     '#7C3AED',
  finalizado:     '#64748B',
  nao_compareceu: '#94A3B8',
};

export const DURACOES_SERVICO = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240] as const;

export const DIAS_SEMANA = [
  { dia: 1, label: 'Segunda',  curto: 'Seg' },
  { dia: 2, label: 'Terça',    curto: 'Ter' },
  { dia: 3, label: 'Quarta',   curto: 'Qua' },
  { dia: 4, label: 'Quinta',   curto: 'Qui' },
  { dia: 5, label: 'Sexta',    curto: 'Sex' },
  { dia: 6, label: 'Sábado',   curto: 'Sáb' },
  { dia: 0, label: 'Domingo',  curto: 'Dom' },
] as const;
