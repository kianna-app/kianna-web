# ROTEIRO CLAUDE CODE — 07: Tratar wpp_status Desconectado

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md` (design para o badge no painel + não-funcionais).
**Depende de:** a abstração `WhatsappProvider` (roteiro 06) — usar a interface, não amarrar na Z-API.

**Problema:** hoje, quando o WhatsApp do profissional cai, o sistema pode até registrar `wpp_status = desconectado`, mas (a) ninguém é avisado e (b) as notificações que deveriam sair nesse período são descartadas em silêncio. Resultado: o profissional perde agendamento e nem fica sabendo. Este é o maior risco do estado atual antes de betas pagantes.

**Escopo desta task (travado): Camadas 1 + 2.** Fila de reenvio ao reconectar (camada 3) fica FORA — é fase posterior.

---

## Passo 0 — Mapear antes de mexer (obrigatório)

Inspecionar o código real e documentar (não assumir):

1. Como `wpp_status` é atualizado hoje. Existe captura de evento de desconexão da Z-API (ex.: `DisconnectedCallback`, ou status via webhook)? Onde?
2. Onde as notificações são disparadas e **o que acontece hoje quando o envio falha**. O V3 indica uso de `void promise.then().catch()` que loga — então parte do "não falhar em silêncio" pode já existir. Confirmar antes de reescrever.
3. Se já existe **envio de e-mail** no projeto (algum serviço de e-mail transacional configurado). Isso decide se a Camada 1 é só código ou se depende de config externa (ver "Dependência" abaixo).
4. Os possíveis valores de `wpp_status` (`desconectado / conectando / conectado` conforme resumo).

---

## Camada 1 — Detectar a queda e avisar o profissional

### Detectar
- Capturar a transição para `desconectado` no ponto onde o status já é tratado (callback/webhook de status da Z-API). **Passar pela interface `WhatsappProvider`** sempre que possível — a detecção de status é comportamento de provider, não específico da Z-API. Se a interface ainda não expõe status, estender a interface (e o adapter Z-API), não burlar.
- Registrar `desconectado_em` (timestamp) junto ao status, para saber desde quando caiu e evitar avisos repetidos.

### Avisar — por E-MAIL + BADGE (NÃO por WhatsApp)
> O canal de aviso **não pode ser o WhatsApp**, porque o WhatsApp é justamente o que caiu. Usar e-mail + badge no painel.

- **E-mail ao profissional:** ao detectar a queda, enviar um e-mail avisando que o WhatsApp desconectou e que ele precisa reconectar (com link para a tela de conexão). 
  - **Anti-spam:** enviar no máximo 1 e-mail por evento de queda (não reenviar a cada notificação que falhar). Usar o `desconectado_em` / um flag `aviso_enviado` para deduplicar. Quando reconectar, resetar o flag.
- **Badge no painel (dashboard do profissional):** indicador bem visível de "WhatsApp desconectado" enquanto o status estiver caído, com ação para reconectar. Sumir quando reconectar.
  - Visual conforme base comum (iOS/clean), usando a cor de alerta dos tokens do projeto. Acessível (não só cor — incluir texto/ícone).

### Dependência possível (pode ser tarefa SUA, não da Claude Code)
- Se **não houver** e-mail transacional configurado no projeto, enviar e-mail de verdade exige um provedor (ex.: serviço SMTP/transacional) + variáveis de ambiente. Isso é config externa, fora do ambiente da Claude Code.
- **Instrução:** se o e-mail não estiver disponível, a Claude Code deve (a) implementar a chamada de envio atrás de uma pequena abstração (`NotificadorEmail`) com um adapter stub/log, (b) deixar TODO claro de que o provedor precisa ser configurado, e (c) **garantir que o badge funcione mesmo sem e-mail** — assim o aviso visual já protege o profissional enquanto o e-mail não está plugado.

---

## Camada 2 — Não falhar em silêncio

- Quando uma notificação **não puder ser enviada** porque o WhatsApp está desconectado (ou o envio falhar), isso NÃO pode ser engolido. Deve:
  - **Logar** com nível adequado (warn/error), incluindo profissional, tipo de notificação e motivo (observabilidade — base comum).
  - **Registrar estado** da notificação como não entregue/falha (se houver tabela/coluna de notificações; se não houver, criar um registro mínimo ou ao menos log estruturado). Isso é o que permite, no futuro, a fila de reenvio (camada 3) sem retrabalho.
  - Antes de tentar enviar, se já se sabe que o status é `desconectado`, registrar como "não enviada — WhatsApp desconectado" em vez de tentar e falhar.
- **Não** alterar o conteúdo das notificações nem o fluxo de quando elas são disparadas — só o tratamento da falha.

---

## Fora de escopo (não fazer agora)

- **Camada 3 — fila de reenvio** ao reconectar. Deixar o terreno pronto (estado de falha registrado), mas não implementar o reenvio automático nesta task.
- Push/SMS como canais de aviso.
- Mudar a lógica de negócio das notificações.

---

## Critérios de aceite

- [ ] Mapeamento do estado atual documentado (como status é atualizado, como falhas são tratadas hoje, se há e-mail).
- [ ] Queda de WhatsApp detectada e `desconectado_em` registrado, via `WhatsappProvider` quando possível.
- [ ] E-mail de aviso ao profissional na queda, no máximo 1 por evento (deduplicado), com link para reconectar — ou stub + TODO claro se não houver provedor.
- [ ] Badge visível de "WhatsApp desconectado" no dashboard, some ao reconectar; acessível; funciona mesmo sem e-mail configurado.
- [ ] Notificações que não saem por desconexão são logadas e têm estado registrado — nada engolido em silêncio.
- [ ] Fila de reenvio NÃO implementada, mas estado de falha registrado para viabilizá-la depois.
- [ ] Sem mudança no conteúdo/fluxo das notificações; build verde.
