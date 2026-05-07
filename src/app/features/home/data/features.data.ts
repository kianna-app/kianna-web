export interface Feature {
  icone: string;
  titulo: string;
  descricao: string;
}

export const FEATURES: Feature[] = [
  {
    icone: 'schedule',
    titulo: 'Agendamento 24h por dia',
    descricao: 'Chega de perder tempo respondendo "tem horário?" no WhatsApp. Seu cliente acessa seu link, vê seus horários livres e agenda sozinho — a qualquer hora, até de madrugada.',
  },
  {
    icone: 'notifications_active',
    titulo: 'Lembretes automáticos no WhatsApp',
    descricao: 'Esqueceu do horário? Nunca mais. A Kianna envia lembretes automáticos pelo WhatsApp 24h antes do compromisso, reduzindo faltas em até 80%.',
  },
  {
    icone: 'palette',
    titulo: 'Sua página, sua cara',
    descricao: 'Página de agendamento personalizada com seu nome, suas cores, sua foto e seus serviços. Profissionalismo imediato pra impressionar seu cliente.',
  },
];
