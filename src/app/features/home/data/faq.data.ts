export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export const FAQ: FaqItem[] = [
  {
    pergunta: 'Minhas clientes vão saber usar?',
    resposta: 'Com certeza. A página de agendamento é tão simples quanto pedir comida no iFood — escolhe o serviço, escolhe o horário e pronto. Funciona no celular sem instalar nada.',
  },
  {
    pergunta: 'Funciona pro meu tipo de negócio?',
    resposta: 'A Kianna funciona pra qualquer profissional que atende com hora marcada: cabeleireiros, manicures, esteticistas, barbeiros, tatuadores, massoterapeutas e similares. Se você marca horário com cliente, funciona pra você.',
  },
  {
    pergunta: 'Como funciona o teste grátis?',
    resposta: 'Você cria sua conta sem cartão de crédito e pode usar o plano Grátis pra sempre — com até 20 agendamentos por mês. Quando quiser ilimitado, troca pro Pro com 1 clique.',
  },
  {
    pergunta: 'Preciso ter site ou conhecimento técnico?',
    resposta: 'Não. A Kianna cria sua página de agendamento automaticamente quando você cadastra. É só compartilhar o link.',
  },
  {
    pergunta: 'Posso cancelar quando quiser?',
    resposta: 'Pode sim. Sem multa, sem fidelidade. Você cancela direto pelo dashboard — leva 1 minuto.',
  },
  {
    pergunta: 'Como meus clientes vão receber as confirmações?',
    resposta: 'Direto no WhatsApp deles. Quando cliente agenda, ela recebe a confirmação imediatamente. 24h antes do compromisso, recebe um lembrete pra confirmar, reagendar ou cancelar.',
  },
  {
    pergunta: 'Quanto custa pra começar?',
    resposta: 'Zero. O plano Grátis funciona pra sempre, sem precisar de cartão. Quando você crescer, pode passar pro Pro (R$ 39,90/mês) ou Studio (R$ 79,90/mês).',
  },
];
