export interface MenuItem {
  rota: string;
  label: string;
  icone: string;
  implementadoEm?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { rota: '/dashboard/agenda',        label: 'Agenda',    icone: 'event' },
  { rota: '/dashboard/servicos',      label: 'Serviços',  icone: 'cut' },
  { rota: '/dashboard/horarios',      label: 'Horários',  icone: 'schedule' },
  { rota: '/dashboard/clientes',      label: 'Clientes',  icone: 'people',       implementadoEm: 'modulo-5' },
  { rota: '/dashboard/relatorio',     label: 'Relatório', icone: 'insert_chart', implementadoEm: 'modulo-5' },
  { rota: '/dashboard/configuracoes', label: 'Config.',   icone: 'settings',     implementadoEm: 'modulo-5' },
];
