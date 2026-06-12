# KIANNA — Resumo de Continuidade (V4)

**Data desta sessão:** 09/06/2026
**Sessão anterior:** V3 (21/05/2026)

---

## O que avançou nesta sessão

Esta foi a sessão mais longa e densa até agora. Cobriu cinco frentes em paralelo: produto (features novas), qualidade (testes funcionais + fixes), arquitetura (abstração WhatsApp + monitoramento), negócio (decisão BSP/Z-API) e operações (LGPD, planos, admin).

---

## Roteiros gerados (15 no total)

| # | Roteiro | Status |
|---|---|---|
| 00 | Base comum (design iOS + não-funcionais) | ✅ referência |
| 01 | Perfil do profissional + link no sidebar | ✅ executado |
| 02 | Página de Upgrade de plano | ✅ executado |
| 03 | Notificações admin → profissional | ✅ executado |
| 04 | Relatório (agendamentos + pizza de serviços) | ✅ executado |
| 05 | LGPD operacional (cookies, footer, aceite, validações de cadastro) | ✅ executado |
| 06 | Refatoração WhatsappProvider (abstração) | ✅ executado |
| 07 | Tratar wpp_status desconectado | ⏳ pendente |
| 08 | Unificação de planos + botão admin | ✅ executado |
| 09 | Fixes perfil + segurança (senha, WhatsApp) | ✅ executado |
| 10 | Polimento UI (badge sino, loading relatório) | ✅ executado |
| 11 | Limites por plano (sistema completo) | ✅ executado |
| 12 | Sentry + logs de auditoria | ✅ executado |
| 13 | Fixes limites/UX (botão Ver planos, dialog contextual, duplicata serviço) | ⏳ pendente |
| 14 | Admin: criar profissional, reset senha, logout | ⏳ pendente |
| 15 | Agendamento manual (datepicker, timepicker, validação WhatsApp) | ⏳ pendente |

---

## Decisões tomadas (não reabrir sem motivo)

### Planos e limites (definitivos)

| id | Rótulo | Preço | Profissionais | Serviços | Agend./mês | WhatsApp | Relatórios |
|---|---|---|---|---|---|---|---|
| `gratis` | Grátis | R$ 0 | 1 | 3 | 30 | ❌ | ❌ |
| `essencial` | Essencial | R$ 49 | 1 | 15 | 150 | ❌ | ❌ |
| `pro` | Pro | R$ 179 | 1 | ilimitado | ilimitado | ✅ | ❌ |
| `studio` | Studio | R$ 299 | 5 | ilimitado | ilimitado | ✅ | ✅ |

- `ilimitado` = `null` no banco, não número arbitrário.
- Relatórios exclusivos do Studio.
- WhatsApp a partir do Pro.
- Teste grátis: Essencial 14 dias sem cartão; Pro 7 dias com cartão (decisão V3, ainda não implementada).

### WhatsApp / provedor

- **Hoje:** Z-API, Modelo C (Kianna provisiona instância, profissional conecta o chip).
- **Migração pra BSP:** gatilho em ~15-20 profissionais pagantes (revisado de "30+" do V3).
- **Candidatos BSP:** 360dialog Partner Platform (€500/mês + taxa/canal, zero markup por mensagem, multicliente nativo) ou Infobip (markup 15-25%, foco enterprise). 360dialog é o melhor encaixe pro Modelo C.
- **O que viabiliza a migração sem reescrever:** a abstração `WhatsappProvider` (roteiro 06 ✅). O adapter Z-API implementa a interface; trocar pra BSP = novo adapter, sem tocar notificações/webhook.
- **Push notifications:** não fazer. Pro cliente final, WhatsApp é estruturalmente melhor. Pro profissional, Web Push é "talvez no futuro" quando tiver dezenas de usuários recorrentes — hoje e-mail + badge (roteiro 07) é suficiente.

### Notificações internas (admin → profissional)

- Sem cron. Campo `publicar_em` filtrado na leitura (quando o profissional abre o dashboard). "Agendada" = `publicar_em` futuro que aparece quando a data chega.

### Excluir conta (profissional)

- Soft-delete com confirmação dupla. Dados preservados (agendamentos, clientes, instância). Não apaga nada.

### Analytics

- GA e Plausible fora do escopo por ora. Gatilho: quando iniciar anúncios pagos.
- Sentry ✅ integrado. UptimeRobot = tarefa manual sua (10min, cadastrar URL no painel).

---

## Estado atual (pós-sessão)

### Métricas

| Dimensão | Estado |
|---|---|
| Código implementado | ~90% |
| Validado em uso real | ~65% |
| Pronto pra cobrar | ~70% |
| Betas pagantes | 0 |

### O que está sólido (validado nos testes)

- Agendamento (núcleo): criação, confirmação, recusa, cancelamento, reagendamento.
- Notificações WhatsApp: profissional + cliente, todos os fluxos.
- Webhook + respostas de clientes.
- Booking público (página do profissional).
- Bloqueios de WhatsApp por plano (Grátis/Essencial sem acesso).
- Bloqueios de Relatório por plano (só Studio).
- Catálogo de planos: UI, landing page e dashboard alinhados.
- Perfil: nome, foto, e-mail, plano atual, upsell, logout, excluir conta.
- Segurança: troca de senha com validação e mensagens em português.
- Admin: listar profissionais, alterar plano, credenciais Z-API.
- Notificações internas: criar, editar, excluir, ler, status de leitura.
- Relatório: agendamentos do mês + gráfico de pizza.
- Sentry: integrado no backend e frontend.
- Logs de auditoria: tabela criada, `AuditoriaService` implementado.

### O que está pendente (roteiros 07, 13, 14, 15)

**Roteiro 07 — wpp_status desconectado (MAIOR RISCO)**
Quando o WhatsApp do profissional cai, notificações são descartadas em silêncio. Ninguém é avisado. Precisa existir antes dos betas pagantes.
- Camada 1: detectar queda, e-mail ao profissional (máx. 1 por evento), badge no dashboard.
- Camada 2: notificações que falham são logadas com estado — não engolidas.
- Fila de reenvio (camada 3): fora do escopo por ora.

**Roteiro 13 — Fixes de limites/UX**
- Botão "Ver planos" não navega em nenhum ponto (bug único repetido).
- Dialog de limite sem contexto específico (plano atual + limite + próximo plano).
- Serviços com mesmo nome duplicados no mesmo profissional não são bloqueados.

**Roteiro 14 — Admin incompleto**
- Criar profissional bloqueado por falta de `user_id` — precisa do fluxo de convite via `supabase.auth.admin.inviteUserByEmail()`.
- Reset de senha pelo admin não existe.
- Logout no painel admin não existe.

**Roteiro 15 — Agendamento manual**
- Campo de data é texto livre (sem calendário).
- Campo de hora é texto livre (sem relógio).
- Validação de WhatsApp do cliente faltando.

---

## Onde travamos (pontos de atenção)

### 1. Sentry — demora pra confirmar funcionamento
O Sentry foi integrado mas não gerou erro visível por 3 horas durante o teste. Causa: o SDK não estava plugado ainda quando o teste foi feito (chicken-and-egg). Após integração, o aviso `SENTRY_DSN_BACKEND não definido` confirmou que o código de proteção funcionou. Para confirmar que está capturando: usar `Sentry.captureMessage('teste')` no boot ou um endpoint temporário de erro forçado — não remover variáveis de ambiente como teste.

### 2. Divergência de planos (resolvida, mas custou tempo)
O código legado usava `gratuito/basico/profissional`; o V3 definia `Essencial/Pro/Studio`; o header mostrava "Gratuito". Três fontes desalinhadas. O roteiro 08 unificou, mas os limites ficaram `[[A DEFINIR]]` — o que causou os bugs do teste seguinte (limite zero aplicado). Lição: nunca fazer migration de planos sem definir os limites na mesma task.

### 3. Criação de profissional pelo admin (bloqueada por arquitetura do Supabase)
O Supabase Auth exige que o `user_id` exista antes de criar o registro em `profissionais`. Criar um usuário pelo painel admin requer a Admin API do Supabase (service role key com permissão de `inviteUserByEmail`). Isso não foi mapeado no roteiro original do admin. O roteiro 14 cobre o fix.

### 4. Testes de agendamento/mês não realizados (2.1, 2.2)
Os testes de limite de agendamentos por mês (30 para Grátis, 150 para Essencial) não foram executados — simular 30+ agendamentos no mês é trabalhoso manualmente. Recomendação: criar um endpoint de teste/seed temporário que popula agendamentos para uma conta, executa o teste e limpa. Ou testar via chamada direta à API com dados mock.

---

## Tarefas manuais suas (fora do código)

| Tarefa | Urgência | Onde |
|---|---|---|
| Confirmar que houve redeploy após adicionar `SENTRY_DSN_BACKEND` no Railway | Agora | Railway |
| Testar Sentry com `captureMessage` após redeploy | Agora | Código temporário |
| UptimeRobot: cadastrar URL da API | Antes dos betas | uptimerobot.com |
| Cloudflare Email Routing: criar `contato@kianna.com.br` e `privacidade@kianna.com.br` | Antes do 1º cadastro real | Cloudflare |
| Revisão jurídica das páginas LGPD | Antes de cobrar | Advogado(a) OAB |
| Call comercial com 360dialog | ~15-20 profissionais pagantes | — |

---

## Backlog priorizado (próximos passos)

### Bloco 1 — Fechar os pendentes (antes dos betas)

1. **Roteiro 13** — fixes de limites/UX. Botão "Ver planos" quebrado afeta toda a experiência de upgrade.
2. **Roteiro 07** — wpp_status desconectado. Maior risco operacional antes de cobrar.
3. **Roteiro 14** — admin: criar profissional + reset senha + logout.
4. **Roteiro 15** — agendamento manual: datepicker + timepicker + validação.

### Bloco 2 — Habilitar receita

5. **Stripe** — cobrança recorrente. Sem isso, nenhum plano cobra de verdade. Ponto de extensão já existe no roteiro 02 (`PlanoService.iniciarUpgrade` stub + TODO).
6. **Testes de limite de agendamentos/mês** — validar os bloqueios de 30 (Grátis) e 150 (Essencial) que não foram testados.
7. **Onboarding de 2-3 betas pagantes** — valida preço, funcionamento real e o WhatsApp com usuários reais.

### Bloco 3 — Escalar com segurança

8. **Call 360dialog** — quando atingir 8-10 pagantes, negociar Partner Platform.
9. **Tabela `whatsapp_instancias`** separada de `profissionais` — junto com Partner API.
10. **Logs de auditoria: testes de limite de agendamentos** — endpoint de seed temporário.
11. **Analytics (GA ou Plausible)** — após banner de cookies funcionando e antes de anúncios pagos.
12. **Blog /blog** — após 1º beta validado. Hashnode com domínio custom é o caminho mais rápido.
13. **Web Push pro profissional** — só quando tiver dezenas de usuários recorrentes.

---

## Documentos gerados nesta sessão

- `ROTEIRO_CLAUDE_CODE_00_base_comum.md`
- `ROTEIRO_CLAUDE_CODE_01_perfil.md` até `ROTEIRO_CLAUDE_CODE_15_agendamento_manual.md`
- `KIANNA_VISAO_GERAL_STATUS.html` — painel visual de status com barras de progresso
- Este resumo (V4)

---

## Para retomar na próxima sessão

Estado: 11 de 15 roteiros executados. Quatro pendentes (07, 13, 14, 15). Sentry integrado mas aguardando confirmação de captura de erros. Planos unificados e com limites definidos. Testes de 27/05 com boa cobertura, exceto limite de agendamentos/mês. Zero betas pagantes — o próximo passo de negócio mais importante é fechar o bloco 1, plugar o Stripe e onboardar os primeiros pagantes.
