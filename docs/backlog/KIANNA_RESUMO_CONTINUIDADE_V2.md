# Kianna — Resumo de Continuidade v2
> Atualizado em: Maio/2026 | Usar no início de nova conversa

---

## O Produto

**Kianna** é um micro SaaS de agendamento online via WhatsApp para autônomos brasileiros de beleza/saúde.

**Fluxo:** profissional cadastra → recebe link `kianna.com.br/seu-nome` → cliente acessa e agenda → sistema notifica profissional via WhatsApp → profissional confirma/recusa → cliente recebe atualização via WhatsApp.

**Domínio:** kianna.com.br | **Emoji:** ✨ | **Repos:** kianna-web (frontend) + kianna-api (backend)

---

## Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Frontend | Angular 17+ Standalone + SSR | ✅ Vercel |
| UI | Angular Material — tema verde #1D9E75 | ✅ |
| Estado | Angular Signals | ✅ |
| Backend | NestJS | ✅ Railway |
| Banco | Supabase (PostgreSQL + Auth + Realtime + Storage) | ✅ |
| WhatsApp | Z-API | ✅ Código pronto, falta criar conta e configurar |
| Pagamentos | Stripe + Pix | ❌ Não iniciado |
| Hospedagem Frontend | Vercel | ✅ |
| Hospedagem Backend | Railway | ✅ |

**URLs em produção:**
- Frontend: https://www.kianna.com.br
- Backend: https://kianna-api-production.up.railway.app
- Swagger: https://kianna-api-production.up.railway.app/api/docs
- Domínio API (futuro): https://agendazap.tech (registrado na Hostinger, não configurado ainda)

**Supabase:**
- URL: https://ocjsscsfggzwkgitzqlk.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU

---

## Arquitetura atual

```
Cliente (browser)
  │
  ├── Angular (Vercel) ──── ApiService ──── NestJS (Railway) ──── Supabase (PostgreSQL)
  │                                              │
  │                                              ├── Z-API (WhatsApp)
  │                                              └── @nestjs/schedule (cron lembretes)
  │
  └── Supabase Auth (direto) ── login, cadastro, refresh token
  └── Supabase Realtime (direto) ── subscription agendamentos
```

**Regra:** Frontend NÃO faz queries diretas ao Supabase (exceto Auth e Realtime).
Todo CRUD passa pelo backend via ApiService.

---

## Terminologia

- **Profissional** = nosso cliente (assina Kianna)
- **Cliente** = cliente do profissional (agenda no link público, sem conta)

---

## Planos

| Plano | Preço | Limites |
|---|---|---|
| Grátis | R$ 0 | 20 agendamentos/mês, 1 serviço, marca Kianna |
| Pro | R$ 39,90 | Ilimitado, lembretes WhatsApp, sem marca, relatórios |
| Studio | R$ 79,90 | Tudo do Pro + até 3 profissionais |

---

## O que está CONCLUÍDO ✅

### Módulo 1 — Auth e Onboarding
- Login/cadastro com email/senha via Supabase
- Reset de senha
- Guards de rota
- Interceptor JWT
- Onboarding 3 passos

### Módulo 2 — Dashboard completo
- Sidenav limpo (fundo branco, seções com labels, footer com avatar)
- Header com card de pendentes (Realtime)
- BottomNav mobile: Início, Agenda, Serviços, Menu (abre sidenav)
- Visão geral: card link público + mini-agenda (sem KPI barra, sem resumo-band)
- Agenda: WeekStrip + lista de cards (sem FullCalendar), dia de hoje selecionado
- Navegação de semana (setas < >)
- Calendário mensal (overlay)
- Filtro por status na resumo-band (apenas na agenda, removido da visão geral)
- CRUD completo de agendamentos (página /dashboard/agenda/:id, sem modal)
- FAB para novo agendamento
- Serviços: CRUD + limite plano grátis + banner upgrade
- Horários: CRUD disponibilidades + tela de bloqueios (sem card resumo)
- Configurações: 4 abas (perfil, agenda, redes sociais, WhatsApp)
- Antecedência mínima configurável (0h, 2h, 4h, 8h, 12h, 24h)
- Antecedência máxima configurável (sem limite, 7, 15, 30, 60 dias)
- Skeleton loading padronizado em todas as páginas
- Padronização de botões (.btn-primary, .btn-danger, .btn-ghost)
- Validação centralizada (KiannaValidators + FieldErrorComponent)

### Módulo 3 — Página pública de agendamento (/:slug)
- Layout tela única (sem steps)
- Seleção de serviço → strip de datas com navegação → strip de horários com scroll horizontal
- Formulário de dados (expande ao selecionar horário)
- Seção resumo + botão "Confirmar solicitação" fixo no rodapé
- Reagendamento via ?reagendar=ID (banner, serviço pré-selecionado)
- SSR + meta tags dinâmicas + Open Graph

### Módulo 4 — WhatsApp Z-API (código pronto)
- ZapiService: enviar texto, enviar botões (com fallback), QR Code, status, desconectar
- 6 tipos de notificação implementados:
  1. Nova solicitação → profissional
  2. Confirmação → cliente
  3. Recusa (com motivo opcional) → cliente
  4. Reagendamento (com link) → cliente
  5. Lembrete configurável (1h/2h/4h/12h/24h antes) → cliente
  6. Cancelamento pelo cliente → profissional
- Cron de lembretes (@nestjs/schedule, roda a cada 15min)
- Processamento de respostas (1=confirmar presença, 2=cancelar)
- Cancelamento automático pelo cliente (configurável por profissional)
- Webhook POST /api/webhooks/zapi
- Frontend: seção WhatsApp nas configurações (status, QR Code, Instance ID/Token, lembrete, toggle cancelamento)
- Banner "Conecte seu WhatsApp" na visão geral

### Backend NestJS
- Swagger em /api/docs
- Auth guard (valida JWT Supabase)
- Roles guard (admin/profissional)
- Módulos completos: agendamentos, profissionais, serviços, disponibilidades, bloqueios, zapi, notificações, lembretes, respostas, webhooks
- Interceptor de erro + logging
- CORS configurado

### Migração frontend → backend
- Todos os repositories migrados para usar ApiService
- Frontend não faz queries Supabase diretas (exceto Auth e Realtime)
- Supabase Realtime mantido para agendamentos (pendentes count)

### Outros
- Homepage pública (12 seções)
- Rebranding AgendaZap → Kianna
- Slug alterável 1x/mês com redirect 90 dias
- Modalidades de serviço (presencial, domiciliar, online)
- Endereço via ViaCEP
- Redes sociais
- Capacidade por horário (campo em disponibilidades)
- Bloqueios de agenda (dia inteiro ou período específico)
- Timezone configurável por profissional

---

## Status dos agendamentos (7 status)

| Status | Descrição | Bloqueia horário? |
|---|---|---|
| pendente | Criado pelo cliente | Não |
| confirmado | Aprovado pelo profissional | Sim |
| recusado | Rejeitado pelo profissional (motivo opcional) | Não |
| cancelado | Cancelado pelo profissional ou cliente | Não |
| reagendado | Agendamento original quando reagendado | Não |
| finalizado | Alterado automaticamente após término | Não |
| nao_compareceu | Alterado manualmente pelo profissional | Não |

Transições permitidas:
- pendente → confirmado | recusado
- confirmado → cancelado | reagendado | nao_compareceu | finalizado (auto)
- finalizado → nao_compareceu (correção)
- recusado, cancelado, reagendado, nao_compareceu → terminal

---

## Schema banco (tabelas principais)

```
profissionais
  id, user_id, nome, slug, foto_url, whatsapp, especialidade, bio,
  plano, role ('admin'|'profissional'), onboarding_concluido, ativo,
  politica_cancelamento, endereco_*, instagram_url, facebook_url,
  twitter_url, youtube_url, links_personalizados (jsonb),
  slug_alterado_em, timezone, antecedencia_minima_horas,
  antecedencia_maxima_dias, wpp_instance_id, wpp_token,
  wpp_status ('desconectado'|'conectando'|'conectado'|'erro'),
  lembrete_horas, cancelamento_auto_cliente,
  stripe_subscription_id

servicos
  id, profissional_id, nome, duracao_min, preco,
  modalidade ('presencial'|'domiciliar'|'online'), ativo

disponibilidades
  id, profissional_id, dia_semana (0-6),
  hora_inicio, hora_fim, intervalo_min, capacidade

bloqueios
  id, profissional_id, data, hora_inicio, hora_fim, motivo

agendamentos
  id, profissional_id, servico_id, cliente_nome, cliente_wpp,
  data_hora, status (7 status), motivo_recusa,
  agendamento_origem_id, lembrete_enviado, confirmacao_presenca,
  observacoes

slug_redirects
  id, slug_antigo, profissional_id, expira_em
```

---

## O que FALTA fazer

### 🔴 Ação imediata (desbloqueia WhatsApp)
- **Criar conta Z-API** (z-api.io)
- Criar instância de teste
- Configurar webhook: https://kianna-api-production.up.railway.app/api/webhooks/zapi
- Adicionar ZAPI_CLIENT_TOKEN e ZAPI_WEBHOOK_SECRET no .env do Railway
- Testar fluxo completo com número real
- Configurar domínio agendazap.tech → Railway (Hostinger DNS)

### 🟡 Pré-lançamento (obrigatório antes do primeiro cliente)

**LGPD:**
- Páginas /termos e /privacidade (incluir cláusula transferência internacional)
- Banner de cookies (antes de ligar Analytics)
- E-mails contato@ e privacidade@ via Cloudflare Email Routing

**Infraestrutura:**
- Backup Supabase (manual semanal ou upgrade para Pro $25/mês)
- DISASTER_RECOVERY.md criado
- SSL em todos os domínios

**Legal/Admin:**
- Registrar marca Kianna no INPI — Classe 42 — URGENTE (R$142)
- Abrir MEI (CNAE 6209-1/00)
- Conta bancária PJ

**Teste final:**
- Testar fluxo completo ponta a ponta com 2-3 profissionais reais
- Testar mobile em dispositivos reais (iPhone + Android)
- Testar edge cases (sem internet, token expirado, Z-API fora do ar)

### 🟢 Módulos futuros (pós-lançamento)

**Módulo 5 — Clientes e Relatórios:**
- Lista de clientes derivada dos agendamentos
- Relatório mensal (totais, faturamento estimado, faltas)
- Botão "Excluir minha conta" (LGPD)
- Exportação de dados

**Módulo 6 — Cobrança Stripe + Pix:**
- Assinatura recorrente mensal/anual
- Pix via Stripe nativo
- Webhook Stripe atualiza campo plano
- Downgrade automático para grátis se vencer
- Nova aba "Plano" nas configurações

**Painel Admin:**
- Rota /admin com login admin
- Visão de todos profissionais, assinantes, métricas
- Gerenciamento de planos
- Construir quando Módulo 6 estiver pronto

**Logging & Monitoring:**
- Sentry no frontend e backend (fazer nos dois juntos)
- Analytics de eventos

**Outras melhorias:**
- Multi-profissional (plano Studio)
- Push notifications
- Agenda compartilhada
- Testes automatizados

---

## Decisões arquiteturais fixas (não rever)

| Decisão | Escolha |
|---|---|
| Status inicial agendamento | pendente (profissional aprova) |
| Janela padrão agendamento | 30 dias à frente (configurável) |
| Campos do cliente | apenas nome + WhatsApp |
| Modalidades de serviço | 1 por serviço |
| Slug | alterável 1x/mês, redirect 90 dias |
| Multi-profissional | só plano Studio, pós-MVP |
| Política cancelamento | campo informativo apenas |
| Endereço | só texto, sem mapa |
| FullCalendar | substituído pelo WeekStrip + lista |
| Frontend → Backend | todo CRUD via ApiService (não Supabase direto) |
| Auth | Supabase Auth no frontend (backend valida JWT) |
| Realtime | Supabase Realtime direto no frontend |
| Backend DB access | service_role key (ignora RLS) |
| Cancelamento pelo cliente | configurável (toggle no perfil) |

---

## Estrutura de pastas

### Frontend (kianna-web)
```
src/app/
├── core/
│   ├── auth/               auth.service, guard, interceptor, session.service
│   ├── signals/            app.signals.ts (currentUser, isLoading)
│   ├── supabase/           supabase.client.ts (apenas Auth + Realtime)
│   ├── services/           api.service.ts, breakpoint.service.ts
│   ├── repositories/       agendamentos, servicos, disponibilidades,
│   │                       bloqueios, booking (todos usam ApiService)
│   ├── interceptors/       api-error.interceptor.ts
│   ├── validators/         form.validators.ts, error-messages.ts
│   ├── types/              database.types.ts
│   └── constants/          app.constants.ts, plan.limits.ts
├── features/
│   ├── home/               homepage pública
│   ├── auth/               login, cadastro
│   ├── onboarding/         3 passos
│   ├── booking/            página pública /:slug (tela única)
│   └── dashboard/
│       ├── shell/          sidenav, bottom-nav, header (badge pendentes)
│       ├── state/          servicos.store, horarios.store, agendamentos.store
│       └── pages/
│           ├── visao-geral/     (card link + mini-agenda + banner WhatsApp)
│           ├── agenda/          (WeekStrip + cards + FAB)
│           │   └── components/  week-strip, resumo-band, appt-card
│           ├── agendamento-detalhe/  (página de edição, sem modal)
│           ├── servicos/
│           ├── horarios/        (disponibilidades + bloqueios)
│           ├── configuracoes/   (perfil, agenda, redes, WhatsApp)
│           └── em-breve/
└── shared/
    └── components/         loading-button, skeleton, field-error, not-found
```

### Backend (kianna-api)
```
src/
├── common/
│   ├── guards/             supabase-auth.guard, roles.guard
│   ├── decorators/         current-user, roles
│   ├── filters/            http-exception.filter
│   ├── interceptors/       logging.interceptor
│   ├── pipes/              validation.pipe
│   └── constants/          lembrete.constants
├── config/
│   └── supabase.config.ts
├── modules/
│   ├── auth/               module + guards + decorators
│   ├── agendamentos/       controller, service, dto/
│   ├── profissionais/      controller, service, dto/
│   ├── servicos/           controller, service, dto/
│   ├── disponibilidades/   controller, service, dto/
│   ├── bloqueios/          controller, service, dto/
│   ├── booking/            controller (endpoint consolidado GET /api/booking/:slug)
│   ├── zapi/               service (envio WhatsApp), controller (QR, status)
│   ├── notificacoes/       service (6 tipos de mensagem)
│   ├── lembretes/          service (cron a cada 15min)
│   ├── respostas/          service (processar 1/2 do cliente)
│   └── webhooks/           controller (POST /api/webhooks/zapi)
└── main.ts                 Swagger + CORS + ValidationPipe
```

---

## Endpoints da API (~22 rotas)

### Públicos (sem auth)
- POST /api/agendamentos — criar agendamento
- GET /api/profissionais/:slug — dados públicos
- GET /api/booking/:slug — dados consolidados para página pública
- POST /api/webhooks/zapi — webhook Z-API

### Autenticados (JWT Supabase)
- GET/POST/PATCH/DELETE /api/agendamentos[/:id]
- PATCH /api/agendamentos/:id/status
- GET /api/agendamentos/pendentes/count
- POST /api/agendamentos/reagendar
- PATCH /api/agendamentos/finalizar-vencidos
- GET /api/profissionais/me
- PATCH /api/profissionais/me
- GET/POST/PATCH/DELETE /api/servicos[/:id]
- GET/POST/PATCH/DELETE /api/disponibilidades[/:id]
- GET/POST/DELETE /api/bloqueios[/:id]
- POST /api/whatsapp/qr-code
- POST /api/whatsapp/desconectar
- GET /api/whatsapp/status

---

## Como continuar em nova conversa

Cole este documento no início e diga:

> "Contexto: projeto Kianna conforme documento anexo.
>  Quero [configurar Z-API / implementar Módulo 5 / criar páginas LGPD / etc].
>  Antes de gerar código, pergunte o que precisar."

---

## Próximos passos imediatos

1. **Criar conta Z-API** → configurar instância → testar WhatsApp end-to-end
2. **Páginas /termos e /privacidade** → LGPD obrigatório
3. **Registrar marca INPI** → URGENTE (pode levar meses)
4. **Teste com profissionais reais** → 2-3 beta testers
5. **Lançamento MVP** 🚀
