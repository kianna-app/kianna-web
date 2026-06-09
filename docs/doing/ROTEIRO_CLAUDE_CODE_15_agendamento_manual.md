# ROTEIRO CLAUDE CODE — 15: Novo Agendamento Manual — Datepicker, Timepicker e Validação

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Contexto:** três problemas na tela de criação de agendamento manual pelo profissional, identificados nos testes de 27/05.

---

## A. Datepicker — campo de texto em vez de calendário

**Problema:** o campo de data abre como input de texto livre — o usuário precisa digitar a data manualmente. Esperado: calendário visual para seleção.

- Implementar um **datepicker** nativo ou via componente já usado no projeto (inspecionar se há algum datepicker/component de data em uso em outras telas — reusar antes de adicionar dependência nova).
- Se não houver nenhum no projeto: usar o `<input type="date">` nativo com estilização consistente com o design system (iOS/clean, mobile-first). É acessível, funciona em todos os browsers modernos e não requer lib — preferir essa abordagem antes de adicionar uma lib de calendário pesada.
- Restrições de data: não permitir datas passadas; respeitar os dias de atendimento configurados pelo profissional (disponibilidades). Se a lógica de disponibilidade já existe no booking público, reusar.
- Mobile-first: em mobile, `<input type="date">` abre o seletor nativo do OS (calendário do iOS/Android) — comportamento correto e premium sem custo.

## B. Timepicker — campo de texto em vez de relógio

**Problema:** o campo de hora é input de texto livre. Esperado: seletor de hora visual.

- Mesma abordagem do datepicker: inspecionar se há timepicker no projeto; se não, usar `<input type="time">` nativo.
- `<input type="time">` abre o seletor nativo em mobile (relógio do iOS/Android) — correto.
- Restrições de horário: respeitar os slots disponíveis do profissional para a data selecionada. Se a lógica de slots já existe no booking público, reusar — não duplicar.
- Formato: `HH:mm` (24h), consistente com o resto do sistema.

## C. Validação do número de WhatsApp do cliente

**Problema:** ao criar agendamento manual, o campo de WhatsApp do cliente não valida o formato.

- Reusar a **mesma regra de validação** já implementada nos roteiros 09 e 05 (validação de número brasileiro — DDI/DDD + número). Não duplicar a regra.
- Número inválido bloqueia o salvar com mensagem clara.
- Campo opcional ou obrigatório: inspecionar o modelo — se o agendamento manual pode existir sem WhatsApp do cliente (ex.: presencial sem notificação), manter opcional mas validar o formato se preenchido.

---

## Critérios de aceite

- [ ] Campo de data abre calendário/seletor visual (nativo ou componente existente); não aceita digitação livre.
- [ ] Datas passadas bloqueadas; dias sem atendimento bloqueados.
- [ ] Campo de hora abre seletor visual; slots indisponíveis bloqueados.
- [ ] Validação de WhatsApp do cliente reusa a regra existente; número inválido bloqueia com mensagem.
- [ ] Comportamento mobile-first: seletores nativos do OS em dispositivos móveis.
- [ ] Nenhuma lib nova adicionada se `<input type="date/time">` nativo resolver.
- [ ] Build verde; regressão no booking público não introduzida.
