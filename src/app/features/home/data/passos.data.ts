export interface Passo {
  numero: number;
  titulo: string;
  descricao: string;
}

export const PASSOS: Passo[] = [
  {
    numero: 1,
    titulo: 'Configure suas regras',
    descricao: 'Define seus horários de trabalho, pausas, almoço e a duração de cada serviço. Em 2 minutos você está pronta.',
  },
  {
    numero: 2,
    titulo: 'Compartilhe seu link',
    descricao: 'Coloca no perfil do Instagram, manda no WhatsApp do cliente ou imprime no cartão de visitas. Ele agenda sozinho.',
  },
  {
    numero: 3,
    titulo: 'Receba notificações',
    descricao: '"Novo agendamento confirmado." A Kianna avisa você no WhatsApp e adiciona automaticamente na sua agenda.',
  },
];
