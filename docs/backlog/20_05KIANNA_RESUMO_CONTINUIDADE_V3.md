# KIANNA — Resumo de Continuidade (V3)

**Data desta sessão:** 21/05/2026
**Sessão anterior:** V2 (resumo original)

---

## O que avançou nesta sessão

Esta sessão foi sobre **WhatsApp/Z-API end-to-end** + **decisão de arquitetura de negócio** + **painel admin**. Resumo do que mudou:

1. **Conexão Z-API funcionando** — instância criada, webhook configurado, WhatsApp conectado, teste end-to-end completo.
2. **Decisão arquitetural tomada** — Modelo C (Kianna como Partner Z-API). Documentado em `KIANNA_ESTRATEGIA_WHATSAPP_V1.md`.
3. **Bug de notificação corrigido** — agendamento público agora notifica profissional E cliente.
4. **Painel admin interno criado** — para gerenciar credenciais Z-API dos profissionais sem logar na conta deles.

---

## Estado atual do WhatsApp/Z-API

### Configuração que está rodando
- **Instância Z-API criada** (ID começa com `3F365BBD...`). Status: **TRIAL** — decisão de assinar ainda PENDENTE (atenção: trial expira e a instância some se não assinar).
- **Token da instância** foi rotacionado (o original vazou em screenshot, então foi gerado novo).
- **Webhook configurado** no painel Z-API, campo "Ao receber":
  `https://kianna-api-production.up.railway.app/api/webhooks/zapi?token=<WEBHOOK_TOKEN>`
  - Z-API NÃO suporta header customizado → token vai via **query string**.
  - "Notificar enviadas por mim também" → DESLIGADO.
- **Variáveis no Railway:** `ZAPI_CLIENT_TOKEN` e `ZAPI_WEBHOOK_TOKEN` configuradas.

### Mudança feita no WebhooksController
Passou a aceitar token via `@Query('token')` (além do header) e agora **falha fechada** se `ZAPI_WEBHOOK_TOKEN` não estiver setado (antes falhava aberto — risco de segurança corrigido).

### Como as credenciais funcionam (importante para migração futura)
- `ZAPI_CLIENT_TOKEN` e token da instância: vivem na nuvem (Z-API/Railway), independem da máquina local. Trocar de PC = zero impacto.
- `ZAPI_WEBHOOK_TOKEN`: gerado localmente com `openssl`, mas agora mora no Railway + na URL do webhook na Z-API. Independe da máquina.
- **Se migrar de plataforma (sair do Railway):** recriar as variáveis na nova plataforma e atualizar a URL do webhook na Z-API (se o domínio mudar).
- **TODO:** guardar essas variáveis num gerenciador de senhas (Bitwarden/1Password), fora do Git, para não depender só do Railway.

---

## Fluxo de notificação (corrigido nesta sessão)

### Como deve funcionar (decisão de produto)
Agendamento público → horário nasce como **solicitação/pendente** (profissional aprova manual) → **profissional E cliente** recebem WhatsApp na hora → profissional confirma no dashboard → cliente recebe confirmação.

### Bug encontrado e corrigido
- O endpoint público chamava `notificarNovaSolicitacao` (profissional), mas **NÃO existia notificação ao cliente**.
- Criado método `notificarSolicitacaoRecebidaCliente` no `NotificacoesService`.
- Endpoint público agora dispara as duas notificações.
- Diagnóstico confirmou: sem try/catch engolindo erro (usa `void .then().catch()` que loga); `profissional_id` vem do DTO correto.

### Estado dos fluxos de notificação
| Fluxo | Status |
|---|---|
| Nova solicitação → profissional | ✅ Funciona |
| Solicitação recebida → cliente | ✅ Corrigido nesta sessão |
| Confirmação → cliente | ✅ Funciona |
| Recusa → cliente | ✅ Existe no código |
| Cancelamento (profissional) → cliente | ✅ Funciona |
| Cancelamento (cliente) → profissional | ✅ Existe (via webhook) |
| Reagendamento → cliente | ✅ Existe no código |
| Lembrete (cron) | ⏳ Código existe, cron é PR futuro |

---

## Painel Admin (criado nesta sessão)

MVP mínimo para o dono da plataforma gerenciar credenciais Z-API sem logar na conta dos profissionais.

- Coluna `is_admin` (boolean) na tabela `profissionais`. Admin marcado manualmente no Supabase.
- `AdminGuard` reaproveitando a autenticação existente.
- Endpoints `/api/admin/profissionais` (listar) e `/api/admin/profissionais/:id/whatsapp` (atualizar credenciais).
- Tela `/admin` no Angular: tabela de profissionais + badge de status + edição com token mascarado.
- **Fora do escopo (futuro):** geração de QR Code pelo painel, criação automática de instância via Partner API.

**TODO de verificação:** confirmar que o `is_admin` aparece no perfil/me do frontend para o route guard funcionar.

---

## DECISÕES ARQUITETURAIS DE NEGÓCIO (novas, importantes)

### Modelo escolhido: C — Kianna como Partner Z-API
Cada profissional conecta o **próprio WhatsApp** (chip dele); a instância Z-API é provisionada e paga pelo Kianna. Profissional nunca cria conta na Z-API.

- **Rejeitado Modelo A** (profissional traz própria conta Z-API): onboarding inviável.
- **Rejeitado Modelo B** (número único global): risco de ban catastrófico — um número disparando em massa = spam detectado → todos param de uma vez.

### Estratégia faseada de provisionamento
| Fase | Volume | Como provisiona |
|---|---|---|
| Validação | 0-10 | Manual (admin cria instância no painel Z-API + cola no painel admin do Kianna) |
| Crescimento | 10-30 | Manual + pleiteia desconto por volume |
| Escala | 30+ | Partner API (provisionamento automático via código) |

**Importante:** com <10 clientes NÃO há leverage para negociar Partner. A call comercial com a Z-API deve ser agendada quando tiver 8-10 clientes pagantes ativos.

### Estrutura de planos (a validar com betas)
| Plano | Preço | Inclui |
|---|---|---|
| Essencial | R$ 49/mês | Agenda + página pública, SEM WhatsApp |
| Pro | R$ 179/mês | Tudo + WhatsApp completo |
| Studio (futuro) | R$ 299/mês | Pro + múltiplos profissionais + relatórios |

- WhatsApp é o **coração do produto** (confirmado).
- R$ 29,90 original é **inviável** (custo Z-API ~R$ 99/instância no varejo).
- Testar variações R$ 149 / R$ 179 / R$ 199 com betas pagantes.
- Teste grátis: Essencial 14 dias sem cartão; Pro 7 dias com cartão obrigatório.
- Marca própria é estratégica: profissional NUNCA deve ver "Z-API" na UI.

---

## BACKLOG (em ordem de prioridade)

### Alta prioridade
1. **Decidir sobre assinar a Z-API** (trial expirando).
2. **Tratar `wpp_status` desconectado** — hoje, se o WhatsApp do profissional cai, todas as notificações são descartadas SILENCIOSAMENTE. Ninguém percebe. Implementar:
   - Detectar via `DisconnectedCallback` e avisar o profissional (e-mail/push).
   - Badge de status bem visível no dashboard do profissional.
   - (Opcional) fila de reenvio quando reconectar.
3. **Onboardar 2-3 betas PAGANTES** no plano Pro para validar preço.

### Média prioridade
4. **Refatoração `WhatsappProvider`** — abstrair o `ZapiService` atrás de uma interface, para poder trocar de provedor sem reescrever tudo. (~35 min)
5. **Auditoria white-label** — remover toda menção a "Z-API" da UI do profissional.
6. **Páginas /termos e /privacidade (LGPD)** — pendente desde a V2.

### Baixa prioridade / futuro
7. **Tabela `whatsapp_instancias`** separada de `profissionais` — fazer junto com a integração Partner API.
8. **Partner API** — provisionamento automático de instâncias (só com volume).
9. Pontos do code review original: idempotência de webhook por messageId, tipagem do DTO com class-validator, specs/testes, tratamento de status `'erro'`.
10. **Stripe** — cobrança recorrente (pendente desde a V2).

---

## Documentos gerados nesta sessão
- `KIANNA_ESTRATEGIA_WHATSAPP_V1.md` — estratégia completa de modelo de negócio e planos.
- `ROTEIRO_CLAUDE_CODE_notificacao_agendamento.md` — roteiro do fix de notificação (já aplicado).
- `ROTEIRO_CLAUDE_CODE_painel_admin.md` — roteiro do painel admin (já aplicado).
- Este resumo (V3).

---

## Para retomar na próxima sessão
Estado: WhatsApp conectado e testado, notificações funcionando, painel admin pronto. Decisão pendente sobre assinar Z-API. Próximos candidatos naturais: (a) tratar desconexão do `wpp_status`, (b) onboardar betas pagantes, (c) refatoração `WhatsappProvider` + white-label, ou (d) LGPD/termos.
