# ROTEIRO CLAUDE CODE — 04: Página de Relatório (Profissional)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Objetivo:** Página de **Relatório** para o profissional ter uma visão simples dos agendamentos do mês e da popularidade dos serviços.

---

## Acesso e navegação

- Item **"Relatório"** (ou "Relatórios") no sidebar do dashboard do profissional.
- Rota sob a auth de profissional. Dados sempre escopados ao profissional logado (nunca vazar dados de outro).

## Conteúdo

### 1. Agendamentos do mês (visão simplificada)
- Resumo dos agendamentos do **mês corrente** (com seletor de mês, se simples de adicionar).
- **Status de cada um de forma simplificada** — agrupar por status (ex.: pendente / confirmado / recusado / cancelado / concluído — usar os status reais do modelo) com contagem por status.
- Apresentação clean: cards de contadores por status no topo + (opcional) lista enxuta dos agendamentos do mês. Não precisa ser tabela complexa; priorizar leitura rápida.

### 2. Popularidade dos serviços (gráfico de pizza)
- **Gráfico de pizza** mostrando a distribuição de agendamentos por serviço no período.
- Lib de gráfico **leve** (ex.: Chart.js via `ng2-charts`, ou similar já usado no projeto). Não adicionar dependência pesada se já houver uma no repo — inspecionar antes.
- Legenda com nome do serviço + percentual/contagem. Acessível (não depender só de cor: incluir rótulos).
- Estado vazio: se não há agendamentos no período, mensagem amigável em vez de gráfico quebrado.

## Backend

- Endpoint(s) de agregação para o profissional logado:
  - contagem de agendamentos por status no período;
  - contagem por serviço no período (para a pizza).
- **Agregar no banco** (query com group by), não trazer todos os registros para somar no front (escalabilidade).
- Escopar sempre por `profissional_id` do usuário autenticado.

## Critérios de aceite

- [ ] Item no sidebar + rota protegida, dados escopados ao profissional.
- [ ] Resumo de agendamentos do mês com contagem por status (simplificado).
- [ ] Gráfico de pizza de popularidade dos serviços, com legenda e rótulos acessíveis.
- [ ] Agregação feita no backend (group by), não no front.
- [ ] Estado vazio tratado; responsivo/mobile-first.
- [ ] Build sem erros.
