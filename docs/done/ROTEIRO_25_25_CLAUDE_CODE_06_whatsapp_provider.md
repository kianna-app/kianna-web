# ROTEIRO CLAUDE CODE — 06: Refatoração WhatsappProvider (abstração)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md` — apenas a parte de **requisitos não-funcionais** (baixo acoplamento, manutenção, observabilidade). Não há UI neste roteiro.

**Objetivo:** Abstrair o `ZapiService` atrás de uma interface `WhatsappProvider`, para que o resto do sistema dependa da **interface**, não da implementação concreta. Isso permite, no futuro, trocar Z-API por um BSP oficial (360dialog/Infobip) implementando um novo adapter, **sem reescrever** notificações, webhook ou admin.

---

## REGRA DE OURO (não negociável)

**Comportamento idêntico. Refatoração pura, sem mudança funcional.** O WhatsApp está em produção e funcionando (instância conectada, notificações rodando). Ao final, tudo deve funcionar **exatamente como antes** — mesmas chamadas, mesmas mensagens, mesmo webhook. Se algo mudar de comportamento, a refatoração está errada.

- **Diff mínimo.** Quanto menor a mudança, menor o risco de quebrar produção.
- **Não** alterar a lógica de notificação, o conteúdo das mensagens, nem o fluxo do webhook.
- **Não** integrar nenhum BSP. Não criar adapter de 360dialog/Infobip agora (sem credencial, sem como testar — YAGNI). A interface só precisa ser desenhada de forma que um adapter desses **caiba depois**.

---

## Passo 1 — Mapear antes de mexer (obrigatório)

Antes de criar qualquer arquivo, inspecionar o código real e listar:

1. Todos os métodos públicos que o `ZapiService` expõe hoje (enviar mensagem, configurar webhook, verificar status, etc. — usar os reais).
2. Todos os **chamadores** do `ZapiService`. Pelo contexto do projeto, ao menos: `NotificacoesService`, `WebhooksController`, e o painel admin que edita credenciais Z-API. Confirmar no código quem mais injeta/usa o serviço.
3. Quais métodos cada chamador realmente usa.

A interface será desenhada **a partir do que os chamadores usam de fato** — não inventar métodos especulativos.

## Passo 2 — Definir a interface `WhatsappProvider`

- Criar a interface (ex.: `whatsapp-provider.interface.ts`) com os métodos que os chamadores consomem, com tipos claros (DTOs de entrada/saída tipados).
- Desenhar a interface em termos **agnósticos de provedor**: nomes e contratos que façam sentido para qualquer provedor de WhatsApp, não específicos da Z-API. Ex.: `sendTextMessage(params)`, `getConnectionStatus(instanceRef)` — e não algo amarrado a detalhes internos da Z-API.
- Detalhes específicos da Z-API (formato de payload, token de instância, query string do webhook) ficam **dentro** do adapter, não vazam na interface.
- Usar um token de injeção (ex.: `WHATSAPP_PROVIDER`) para o NestJS resolver a implementação.

## Passo 3 — `ZapiService` implementa a interface

- Fazer o `ZapiService` (renomeável para `ZapiWhatsappProvider` ou similar, se o projeto preferir, mas **não obrigatório** — preservar nome reduz diff) implementar `WhatsappProvider`.
- O corpo dos métodos permanece **idêntico** ao atual. Só se garante que as assinaturas batem com a interface.
- Registrar no módulo: o token `WHATSAPP_PROVIDER` resolve para o adapter Z-API (`{ provide: WHATSAPP_PROVIDER, useClass: ZapiService }`).

## Passo 4 — Chamadores dependem da interface

- Trocar a injeção nos chamadores (`NotificacoesService`, `WebhooksController`, serviço do admin, etc.) para injetar o token `WHATSAPP_PROVIDER` tipado como `WhatsappProvider`, em vez do `ZapiService` concreto.
- Nenhuma mudança de lógica nos chamadores — só a origem da dependência.

## Passo 5 — Validar comportamento idêntico

- Build passa, sem erros de tipo.
- Se existirem specs/testes, todos continuam verdes. Se não existirem, **adicionar um teste mínimo** que verifique que o provider injetado responde à interface (não precisa testar a Z-API real).
- Conferir que os pontos de injeção foram todos migrados (nenhum `ZapiService` concreto injetado direto fora do registro do módulo).
- Checklist manual de fumaça para você rodar depois (documentar no PR): enviar uma notificação de teste e confirmar que chega; receber um webhook e confirmar que é processado.

---

## Requisitos não-funcionais aplicáveis

- **Baixo acoplamento:** este é o objetivo central — chamadores não conhecem mais a Z-API.
- **Observabilidade:** preservar os logs existentes; não remover logging no caminho.
- **Manutenção:** interface e adapter em arquivos claros; comentar no topo da interface o propósito (permitir trocar de provedor) e deixar um TODO marcando onde um futuro adapter BSP entraria (`{ provide: WHATSAPP_PROVIDER, useClass: BspWhatsappProvider }`), **sem implementá-lo**.

## Critérios de aceite

- [ ] Interface `WhatsappProvider` criada, agnóstica de provedor, a partir do uso real dos chamadores.
- [ ] `ZapiService` implementa a interface; corpo dos métodos inalterado.
- [ ] Token de injeção (`WHATSAPP_PROVIDER`) registrado no módulo resolvendo para o adapter Z-API.
- [ ] Todos os chamadores (notificações, webhook, admin) injetam a interface, não o serviço concreto.
- [ ] Detalhes específicos da Z-API não vazam na interface.
- [ ] Nenhuma mudança funcional; mensagens, webhook e notificações idênticos.
- [ ] Build verde; testes verdes (ou teste mínimo de contrato adicionado).
- [ ] TODO marcando o ponto de extensão para adapter BSP, sem implementá-lo.

## Fora de escopo

- Implementar adapter de 360dialog/Infobip ou qualquer BSP.
- Mudar lógica de notificação, conteúdo de mensagem ou fluxo de webhook.
- Tabela `whatsapp_instancias` separada (item futuro do backlog, junto com Partner API).


n8n