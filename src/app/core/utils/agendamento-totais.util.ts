import { AgendamentoComServico } from '@core/types/database.types';

const SERVICOS_RE = /Serviços selecionados:\s*(.*?)\.\s*Duração total:/i;
const DURACAO_RE = /Duração total:\s*(\d+)\s*min/i;
const VALOR_RE = /Valor total:\s*R\$\s*([\d.,]+)/i;

export function nomesServicosAgendamento(ag: AgendamentoComServico): string[] {
  const observacoes = ag.observacoes ?? '';
  const match = observacoes.match(SERVICOS_RE);
  if (match?.[1]) {
    return match[1]
      .split(',')
      .map(nome => nome.trim())
      .filter(Boolean);
  }
  return ag.servico?.nome ? [ag.servico.nome] : [];
}

export function duracaoAgendamento(ag: AgendamentoComServico): number | null {
  const match = (ag.observacoes ?? '').match(DURACAO_RE);
  if (match?.[1]) return Number(match[1]);
  return ag.servico?.duracao_min ?? null;
}

export function precoAgendamento(ag: AgendamentoComServico): number | null {
  const match = (ag.observacoes ?? '').match(VALOR_RE);
  if (match?.[1]) return valorPtBrParaNumero(match[1]);
  return ag.servico?.preco ?? null;
}

export function servicosTextoAgendamento(ag: AgendamentoComServico): string {
  const nomes = nomesServicosAgendamento(ag);
  return nomes.length ? nomes.join(', ') : '—';
}

function valorPtBrParaNumero(valor: string): number {
  return Number(valor.replace(/\./g, '').replace(',', '.')) || 0;
}
