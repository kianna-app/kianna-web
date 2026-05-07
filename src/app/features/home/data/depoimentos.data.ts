export interface Depoimento {
  estrelas: number;
  texto: string;
  nome: string;
  cargo: string;
  cidade: string;
  fotoUrl: string;
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    estrelas: 5,
    texto: 'Eu perdia pelo menos 1 hora do meu dia respondendo cliente pra marcar horário. Agora mando o link e elas que se organizam. Mudou minha vida!',
    nome: 'Mariana Silva',
    cargo: 'Cabeleireira',
    cidade: 'São Paulo, SP',
    fotoUrl: '',
  },
  {
    estrelas: 5,
    texto: 'A automação dos lembretes fez minhas faltas caírem 70%. O sistema se paga logo no primeiro mês.',
    nome: 'Patrícia Rocha',
    cargo: 'Esteticista',
    cidade: 'Curitiba, PR',
    fotoUrl: '',
  },
  {
    estrelas: 5,
    texto: 'Antes eu anotava tudo na agenda de papel e vivia perdendo horário. Hoje minhas clientes elogiam o sistema.',
    nome: 'Camila Andrade',
    cargo: 'Manicure',
    cidade: 'Maringá, PR',
    fotoUrl: '',
  },
];
