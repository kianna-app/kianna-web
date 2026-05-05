export const APP = {
  NOME: 'AgendaZap',
  DOMINIO: 'agendazap.tech',
  URL_BASE: 'https://agendazap.tech',
} as const;

export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 960,
  DESKTOP: 1280,
} as const;

export const STATUS_CORES: Record<string, string> = {
  confirmado: '#1D9E75',
  pendente:   '#D97706',
  cancelado:  '#E11D48',
  concluido:  '#64748B',
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
