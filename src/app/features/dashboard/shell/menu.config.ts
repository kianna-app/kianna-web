export interface MenuItem {
  rota: string;
  label: string;
  icone: string;
  implementadoEm?: string;
  exactMatch?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  { rota: '/dashboard',              label: 'Visão Geral', icone: 'dashboard',     exactMatch: true },
  { rota: '/dashboard/agenda',       label: 'Agenda',      icone: 'event' },
  { rota: '/dashboard/calendario',   label: 'Calendário',  icone: 'calendar_month' },
  { rota: '/dashboard/servicos',     label: 'Serviços',    icone: 'content_cut' },
  { rota: '/dashboard/horarios',     label: 'Horários',    icone: 'schedule' },
  { rota: '/dashboard/perfil',       label: 'Perfil',      icone: 'person' },
  { rota: '/dashboard/configuracoes',label: 'Config.',     icone: 'settings' },
  { rota: '/dashboard/clientes',     label: 'Clientes',    icone: 'people',       implementadoEm: 'modulo-5' },
  { rota: '/dashboard/relatorio',    label: 'Relatório',   icone: 'insert_chart', implementadoEm: 'modulo-5' },
];
