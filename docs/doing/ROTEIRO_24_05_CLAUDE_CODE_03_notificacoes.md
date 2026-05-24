# ROTEIRO CLAUDE CODE — 03: Notificações (Admin → Profissionais)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Objetivo:** Sistema de notificações internas onde o **Admin** publica avisos que aparecem no **dashboard dos profissionais**. **Sem cron:** o "agendamento" é um campo de data de publicação usado como **filtro no momento da leitura** (quando o profissional abre o dashboard).

---

## Decisão de arquitetura (importante — sem cron)

- A notificação tem um campo **`publicar_em`** (timestamp).
- A busca acontece **quando o profissional acessa o dashboard**: o backend retorna as notificações destinadas a ele cujo `publicar_em <= agora` (e não excluídas).
- "Agendar" = definir `publicar_em` no futuro. Nada dispara sozinho; ela simplesmente passa a aparecer quando a data chega e o profissional abre o painel. **Não criar cron/job.**

## Modelo de dados (inspecionar schema e adaptar nomes)

- Tabela **`notificacoes`**: `id`, `titulo`, `corpo`, `publicar_em`, `criado_em`, `criado_por` (admin), `atualizado_em`, `excluida_em` (soft-delete).
- **Destinatários:** suportar "todos" ou seleção específica. Duas abordagens — escolha a que melhor combina com o schema:
  - campo `destino = 'todos'` + tabela de exceções, ou
  - tabela **`notificacoes_destinatarios`** (`notificacao_id`, `profissional_id`) — preferir esta para granularidade e para registrar leitura por profissional.
- **Leitura:** tabela/coluna de status por profissional — ex.: `notificacoes_leituras` (`notificacao_id`, `profissional_id`, `lida_em`). Permite o admin ver quem leu.

## Lado do Profissional

- No **dashboard**, exibir as notificações aplicáveis (publicadas, destinadas a ele, não excluídas). Indicador de não-lidas (badge/contador).
- Profissional pode **marcar como lida** (registra `lida_em`). UI clara: não-lida destacada, lida atenuada.
- Componente discreto e premium (sino com contador / painel deslizante / lista) — seguir design da base comum.

## Lado do Admin (nova página, sob `AdminGuard`)

Página de gestão de notificações:

- **Criar** notificação: título + corpo + seleção de destinatários (todos OU escolher profissionais específicos) + `publicar_em` (agora ou data futura).
- **Editar** notificação existente.
- **Excluir** notificação (soft-delete; some para os profissionais).
- **Status de leitura:** por notificação, ver quem leu e quem não leu (lista ou contadores "X de Y leram").
- **Histórico:** lista de todas as notificações enviadas/agendadas, com estado (agendada/publicada), data e métricas de leitura.
- Notificação com `publicar_em` no futuro aparece como **"agendada"** no histórico (e ainda não chegou aos profissionais).

## Backend

- Endpoints admin (sob `AdminGuard`): criar, editar, excluir (soft), listar histórico, ver status de leitura.
- Endpoint profissional: listar minhas notificações publicadas + marcar como lida.
- Validação de DTOs (título/corpo obrigatórios, `publicar_em` válido).
- Logar criação/edição/exclusão e envios (observabilidade).

## Critérios de aceite

- [ ] Admin cria notificação (título + corpo), escolhe destinatários (todos ou seleção) e `publicar_em`.
- [ ] Profissional vê notificações publicadas no dashboard e marca como lida.
- [ ] Badge/contador de não-lidas.
- [ ] Admin vê status de leitura (quem leu / não leu).
- [ ] Admin edita e exclui (soft-delete) notificações.
- [ ] "Agendada" = `publicar_em` futuro, aparece ao profissional só quando a data chega e ele abre o dashboard. **Sem cron.**
- [ ] Histórico de notificações com estado e métricas.
- [ ] Tudo sob a auth correta (admin x profissional); estados tratados.
- [ ] Build sem erros.
