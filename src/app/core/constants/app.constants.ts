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

export const ANTECEDENCIA_MINIMA_OPTIONS: { label: string; value: number }[] = [
  { label: 'Sem antecedência (agendamento imediato)', value: 0 },
  { label: '2 horas antes',                           value: 2 },
  { label: '4 horas antes',                           value: 4 },
  { label: '8 horas antes',                           value: 8 },
  { label: '12 horas antes',                          value: 12 },
  { label: '24 horas antes',                          value: 24 },
];

export const ANTECEDENCIA_MAXIMA_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Sem limite',  value: null },
  { label: '7 dias',      value: 7 },
  { label: '15 dias',     value: 15 },
  { label: '30 dias',     value: 30 },
  { label: '60 dias',     value: 60 },
];
