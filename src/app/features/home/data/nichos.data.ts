export interface Nicho {
  id: string;
  icone: string;
  emoji: string;
  titulo: string;
  descricao: string;
}

export const NICHOS: Nicho[] = [
  {
    id: 'cabeleireiro',
    icone: 'content_cut',
    emoji: '💇‍♀️',
    titulo: 'Cabeleireiros',
    descricao: 'Salões pequenos ou autônomos que perdem horas no WhatsApp negociando horário.',
  },
  {
    id: 'manicure',
    icone: 'spa',
    emoji: '💅',
    titulo: 'Manicures',
    descricao: 'Profissionais que oferecem múltiplos serviços e querem organizar a agenda.',
  },
  {
    id: 'esteticista',
    icone: 'face',
    emoji: '✨',
    titulo: 'Esteticistas',
    descricao: 'Limpeza de pele, design de sobrancelha, e procedimentos com tempo certo.',
  },
  {
    id: 'barbeiro',
    icone: 'cut',
    emoji: '💈',
    titulo: 'Barbeiros',
    descricao: 'Cortes, barbas e combos com cliente sempre na hora certa.',
  },
  {
    id: 'tatuador',
    icone: 'edit',
    emoji: '🎨',
    titulo: 'Tatuadores',
    descricao: 'Sessões longas que precisam de bloqueio de horário sem confusão.',
  },
  {
    id: 'massagista',
    icone: 'self_improvement',
    emoji: '💆',
    titulo: 'Massoterapeutas',
    descricao: 'Sessões de relaxamento agendadas com lembretes que reduzem faltas.',
  },
];
