# ROTEIRO CLAUDE CODE — 13: Correções de Limite por Plano (UX/Navegação)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Contexto:** os bloqueios de limite estão funcionando (o botão fica desabilitado, o banner aparece), mas dois problemas de UX repetem em todos os pontos de limite: o botão "Ver planos" não navega, e o dialog não tem contexto específico (nome do plano atual, limite, próximo plano). São um bug único repetido — uma correção resolve todos os pontos.

---

## A. Botão "Ver planos" não navega (todos os pontos)

**Problema:** em todos os lugares onde aparece ("Ver planos", "Ver plano Essencial", "Fazer upgrade"), o clique não faz nada.

- Auditar todos os lugares onde o botão existe (banner de limite de serviços, dialog de limite, banner de WhatsApp, banner de relatório, card de upsell no perfil).
- Corrigir a navegação para `/dashboard/upgrade` em todos. Reusar um único método/helper — não duplicar `router.navigate` em cada componente.
- Verificar se há `event.preventDefault()` ou `$event` mal tratado causando o engolimento do clique.

## B. Dialog de limite sem contexto (serviços — planos Grátis e Essencial)

**Problema:** ao atingir o limite de serviços, aparece apenas o banner genérico "Limite de serviços atingido. Faça upgrade para adicionar mais serviços" — sem dialog, sem nome do plano atual, sem limite específico, sem nome do plano seguinte.

**Comportamento esperado:**
- Ao clicar em "Novo serviço" com limite atingido → abrir **dialog** (não só banner) com:
  - Nome do plano atual (ex.: "Grátis") e limite (ex.: "3 serviços").
  - Nome do plano seguinte (ex.: "Essencial") como CTA ("Ver plano Essencial").
  - Botão do dialog navega para `/dashboard/upgrade` (corrige A acima).
- O backend já retorna `{ code: 'PLAN_LIMIT_REACHED', resource: 'services', limit: N }` (roteiro 11). O frontend deve usar esses dados para montar o dialog dinamicamente — não hardcodar textos por plano.
- O dialog é o mesmo componente reutilizável de confirmação do projeto, parametrizado. Não criar um componente novo por recurso.

## C. Plano Studio — não encontrado modo de alterar conta no teste

- Verificar se o botão "Alterar plano" no `/admin` já cobre o Studio corretamente (o teste 9 passou para outros planos). Se sim, documentar no roteiro de testes que o caminho é via admin. Se não, corrigir.

## D. Serviços com mesmo nome duplicados (plano Pro)

- Adicionar validação de unicidade de nome de serviço **por profissional** — dois serviços com o mesmo nome no mesmo profissional devem ser bloqueados.
- Validar no **backend** (constraint ou check no service antes de inserir/atualizar). Frontend exibe mensagem clara: "Já existe um serviço com este nome."
- Não bloquear mesmo nome entre profissionais diferentes.

## Critérios de aceite

- [OK] "Ver planos" navega para `/dashboard/upgrade` em todos os pontos (serviços, WhatsApp, relatório, perfil).
- [OK] Clique em "Novo serviço" com limite atingido abre dialog com plano atual + limite + CTA para plano seguinte.
- [OK] Dialog usa dados do backend (`PLAN_LIMIT_REACHED`) — sem textos hardcoded por plano.
- [OK] Botão do dialog navega corretamente (corrige A).
- [ ] Plano Studio coberto pelo "Alterar plano" do admin ou corrigido.
- [OK] Serviço com nome duplicado bloqueado no backend; mensagem clara no frontend.
- [ ] Build verde; nenhuma regressão nos bloqueios que já funcionavam.
