# Kianna — Resumo Completo do Projeto
> Documento de continuidade para nova conversa com Claude
> Data: Maio/2026

---

## O Produto

**Kianna** é um micro SaaS de agendamento online via WhatsApp para autônomos brasileiros de beleza/saúde (cabeleireiros, manicures, esteticistas, barbeiros, tatuadores, massoterapeutas).

**Como funciona:** profissional cadastra serviços e horários → recebe link exclusivo `kianna.com.br/seu-nome` → cliente acessa e agenda sozinho → sistema confirma e lembra via WhatsApp automaticamente.

**Domínio:** kianna.com.br
**Repositório:** github.com/agendazap-tech/kianna-web (renomear pra kianna-app/kianna-web)
**Emoji da marca:** ✨

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 17+ Standalone + SSR (`@angular/ssr`) |
| UI | Angular Material — tema verde `#1D9E75` |
| Estado | Angular Signals |
| Backend | NestJS (Railway) — **não iniciado ainda** |
| Banco | Supabase (PostgreSQL + Auth + Storage) |
| Agenda visual | FullCalendar Angular |
| WhatsApp | Z-API (número próprio por profissional) — **não iniciado** |
| Pagamentos | Stripe com Pix — **não iniciado** |
| Hospedagem | Vercel ou Railway (não configurado ainda) |

---

## Credenciais Supabase

- **URL:** `https://ocjsscsfggzwkgitzqlk.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU`

---

## Planos e preços definidos

| Plano | Preço/mês | Limites |
|---|---|---|
| Grátis | R$ 0 | 20 agendamentos/mês, 1 serviço, marca "Powered by Kianna" |
| Pro ⭐ | R$ 39,90 | Ilimitado, lembretes WhatsApp, sem marca, relatórios |
| Studio | R$ 79,90 | Tudo do Pro + até 3 profissionais na mesma conta |

---

## Terminologia importante

- **Profissional** = nosso cliente (assina Kianna, autônomo de beleza)
- **Cliente** = cliente do profissional (agenda no link público, não tem conta)

---

## Estrutura de pastas relevante

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts         ← login, signOut, initialize
│   │   ├── auth.guard.ts           ← protege rotas
│   │   ├── auth.interceptor.ts     ← adiciona Bearer token
│   │   └── session.service.ts      ← invalida sessão, redirect login
│   ├── signals/
│   │   └── app.signals.ts          ← currentUser, isLoading, etc
│   ├── supabase/
│   │   └── supabase.client.ts      ← singleton do cliente Supabase
│   ├── repositories/
│   │   ├── base.repository.ts      ← profissionalIdOrThrow, isAuthError
│   │   ├── servicos.repository.ts
│   │   ├── disponibilidades.repository.ts
│   │   ├── agendamentos.repository.ts
│   │   └── estatisticas.repository.ts
│   ├── types/
│   │   └── database.types.ts       ← todas as interfaces TypeScript
│   ├── constants/
│   │   ├── app.constants.ts        ← APP, BREAKPOINTS, STATUS_CORES, etc
│   │   └── plan.limits.ts          ← PLAN_LIMITS, exceededLimit
│   ├── services/
│   │   └── breakpoint.service.ts   ← isMobile signal
│   └── utils/
│       ├── slug.util.ts            ← gerarSlug, slugComSufixo
│       └── whatsapp.util.ts        ← limparWhatsApp, whatsAppValido, validator
│
├── features/
│   ├── home/                       ← homepage pública
│   ├── auth/                       ← login, cadastro
│   ├── onboarding/                 ← 3 passos pós-cadastro
│   └── dashboard/
│       ├── dashboard.component.ts  ← shell (sidenav + drawer mobile + header)
│       ├── shell/
│       │   ├── sidenav/            ← menu desktop verde escuro
│       │   ├── bottom-nav/         ← 4 itens: Início, Agenda, Serviços, Horários
│       │   └── header/             ← hamburguer + ícones + avatar dropdown
│       ├── state/
│       │   ├── servicos.store.ts
│       │   ├── horarios.store.ts
│       │   └── agendamentos.store.ts
│       └── pages/
│           ├── visao-geral/        ← KPIs + link público em destaque
│           ├── agenda/             ← FullCalendar
│           ├── servicos/           ← CRUD + cards expansíveis + busca
│           ├── horarios/           ← grade semanal
│           ├── configuracoes/      ← 4 abas: Empresa, Endereço, Redes, Perfil
│           └── em-breve/           ← placeholder pra Clientes, Relatório
│
└── shared/
    └── components/
        ├── loading-button/         ← <app-loading-button> reutilizável
        └── not-found/
```

---

## O que foi implementado (concluído)

### Módulo 1 — Setup, Auth, Onboarding ✅
- Projeto Angular 17+ com SSR
- Tema verde Kianna no Angular Material
- Signals globais (`currentUser`, `isLoading`, etc)
- Auth Service + Guard + Interceptor
- Telas de Login e Cadastro estilizadas
- Onboarding em 3 passos (perfil → serviços → horários)
- SQL completo no Supabase (tabelas + RLS + Storage)
- Componente `<app-loading-button>` reutilizável

### Módulo 2 — Dashboard ✅
- Layout do dashboard (sidenav desktop + drawer mobile + bottom-nav)
- Header com hamburguer mobile + avatar dropdown
- Agenda visual com FullCalendar (pt-BR, timeGrid/listWeek)
- CRUD de Serviços com cards expansíveis e busca
- Configuração de Horários (grade semanal)
- Visão Geral com KPIs e link público em destaque

### Módulo 2 Aprimoramentos ✅
- Migration SQL: modalidades, endereço, redes sociais, slug_redirects
- Modalidade de atendimento (presencial/domiciliar/online) nos serviços
- Política de cancelamento (campo informativo)
- Slug alterável 1x/mês com redirect 90 dias
- Página de Configurações completa (4 abas: Empresa, Endereço, Redes, Perfil)
- ViaCEP automático no endereço

### Fixes UI/UX Mobile ✅
- Drawer lateral mobile (mat-sidenav mode="over")
- Bottom-nav reduzida (4 itens, sem Perfil e Config)
- Fix spinner eterno do FullCalendar
- Mensagens de erro claras nas URLs de redes sociais
- Configurações em cards com respiro visual
- Página de Serviços redesenhada (busca + cards expansíveis)

### Fixes Críticos Auth ✅
- SessionService centralizado (invalida sessão, redirect pra login)
- Detecção de token expirado (isAuthError em todos os stores)
- Logout robusto com timeout 3s (funciona mesmo com token morto)
- Limpeza manual do localStorage no logout
- Redirecionamento com snackbar "Sua sessão expirou"
- Nome no avatar dropdown → navega pra aba Perfil das Configurações

### Rebranding ✅
- AgendaZap → Kianna em todo o codebase
- Emoji 📅 → ✨
- Variáveis SCSS `$agendazap-*` → `$kianna-*`
- Environment com URL e anon key corretas

### Homepage pública ✅
- 12 seções: hero, trust bar, custo invisível, features, como funciona, nichos, depoimentos, planos, FAQ, CTA final, header, footer

---

## Schema do banco (tabelas principais)

```sql
profissionais      ← usuário da plataforma (professional)
  id, user_id, nome, slug, foto_url, whatsapp, especialidade, bio
  plano, onboarding_concluido, ativo
  politica_cancelamento
  endereco_cep/rua/numero/complemento/bairro/cidade/estado
  instagram_url, facebook_url, twitter_url, youtube_url
  links_personalizados (jsonb)
  slug_alterado_em
  wpp_instance_id, stripe_subscription_id
  created_at, updated_at

servicos           ← serviços oferecidos pelo profissional
  id, profissional_id, nome, duracao_min, preco
  modalidade (presencial|domiciliar|online)
  ativo, created_at, updated_at

disponibilidades   ← horários de atendimento por dia da semana
  id, profissional_id, dia_semana (0-6), hora_inicio, hora_fim, intervalo_min

agendamentos       ← agendamentos feitos pelos clientes finais
  id, profissional_id, servico_id
  cliente_nome, cliente_wpp, data_hora
  status (pendente|confirmado|cancelado|concluido)
  lembrete_enviado, observacoes
  created_at, updated_at

slug_redirects     ← redirects de slugs antigos (90 dias)
  id, slug_antigo, profissional_id, expira_em, created_at
```

---

## Módulos pendentes

### Módulo 3 — Página pública de agendamento (PRÓXIMO)

**O que é:** rota pública `/:slug` com SSR, acessada pelo cliente final sem criar conta.

**Fluxo:**
1. Cliente acessa `kianna.com.br/nome-do-profissional`
2. Vê perfil, serviços e horários disponíveis
3. Seleciona serviço (1 modalidade por serviço)
4. Vê horários livres (baseado em disponibilidades - agendamentos existentes)
5. Informa nome e WhatsApp
6. Confirma agendamento
7. Recebe tela de confirmação com resumo

**Campos coletados do cliente:** nome + WhatsApp (apenas)

**Pós-agendamento:** botões "Ver agendamento" e "Adicionar ao Google Agenda"

**Regras de negócio:**
- Sem criação de conta pro cliente
- Horário disponível = dentro da disponibilidade do profissional - agendamentos existentes
- Slug redirect: se slug não encontrado, checar tabela `slug_redirects`
- Status inicial do agendamento: `confirmado` (cliente não precisa esperar aprovação)
- Plano grátis: bloquear se já atingiu 20 agendamentos no mês

**Decisões técnicas:**
- SSR obrigatório (SEO — profissional compartilha o link)
- Meta tags dinâmicas por profissional (nome, foto, descrição)
- Sem Angular Material complexo (página leve pra celular de cliente)

**Dependências:**
- Tabelas existentes suficientes (não precisa migration)
- Verificar `slug_redirects` antes de 404
- Usar `disponibilidades` + `agendamentos` pra calcular slots livres

---

### Módulo 4 — Integração WhatsApp Z-API

**O que é:** bot WhatsApp conectado ao número próprio do profissional via Z-API.

**Fluxo completo:**
- Quando agendamento é criado → confirmação imediata pra cliente E profissional
- 24h antes → lembrete pro cliente com menu: `1 confirmar / 2 reagendar / 3 cancelar`
- Se cliente responder 2 (reagendar) → sistema manda link da página pública de volta
- Se cliente responder 3 (cancelar) → agendamento cancela e profissional é avisado

**Decisões técnicas:**
- Z-API: instância por profissional (número do próprio profissional)
- O profissional configura o WhatsApp em `/dashboard/configuracoes` (campo `wpp_instance_id`)
- Webhook da Z-API recebe respostas dos clientes
- Lembrete implementado como cron job no NestJS (verifica agendamentos de D+1)

**Subdivisão recomendada (em ordem):**
- 4a: Setup conta Z-API + endpoint de webhook básico no NestJS
- 4b: Confirmação imediata no agendamento (trigger no Módulo 3)
- 4c: Cron de lembrete 24h com menu interativo
- 4d: Processamento de resposta (1/2/3)

**⚠️ Maior complexidade técnica do projeto.** APIs instáveis, webhooks, retry logic, números bloqueados.

---

### Módulo 5 — Clientes, Relatório e Configurações avançadas

**O que é:**
- Lista de clientes com histórico de agendamentos
- Relatório mensal simples (totais, faturamento, faltas)
- Botão "Excluir minha conta" (LGPD obrigatório)
- Exportação de dados (portabilidade LGPD)

**Regras:**
- Clientes são derivados dos agendamentos (não têm cadastro próprio)
- Relatório: agrupado por mês, filtrável
- Exclusão de conta: cascade delete já configurado no Supabase

---

### Módulo 6 — Cobrança Stripe + Pix

**O que é:** sistema de assinatura recorrente.

**Fluxo:**
- Profissional escolhe plano (Pro ou Studio)
- Paga via Pix (integração Stripe + Pix nativa)
- Webhook Stripe atualiza campo `plano` no banco
- Downgrade automático pra Grátis se assinatura vencer
- Tela de gerenciamento em `/dashboard/configuracoes/plano` (nova aba)

**Decisões:**
- Stripe (não Mercado Pago) — melhor DX, suporta Pix
- Assinatura recorrente mensal/anual
- Sem Enterprise no MVP

---

## Backlog de itens pós-MVP

### LGPD (obrigatório antes do primeiro cliente real)
- Página de Termos de Uso (`/termos`)
- Política de Privacidade (`/privacidade`) — incluir cláusula de transferência internacional (Supabase, Z-API, Stripe são fora do Brasil)
- Banner de cookies (antes de ligar qualquer Analytics)
- E-mail `contato@kianna.com.br` + `privacidade@kianna.com.br` via Cloudflare Email Routing

### Infraestrutura (antes de clientes reais)
- Deploy produção: Angular no Vercel, NestJS no Railway
- Subdomínios: `painel.kianna.com.br` (dashboard), `api.kianna.com.br` (NestJS)
- SSL em todos os subdomínios (Cloudflare)
- Backups automáticos Supabase (plano Pro ~$25/mês)
- Monitoramento: UptimeRobot (uptime) + Sentry (erros)

### Legal/Admin (antes do primeiro pagamento)
- Registrar marca Kianna no INPI — Classe 42 — **URGENTE** (código GRU 389, R$142)
- Abrir MEI (CNAE 6209-1/00)
- Conta bancária PJ (Inter/C6/Stone)
- Depositar domínios comprados no registro.br

### Produto (nice-to-have pós-MVP)
- Bloqueio de horários (folgas, feriados)
- Avaliações pós-atendimento (link via WhatsApp)
- Pagamento antecipado/sinal (reduz no-show)
- PWA (instalar no celular como app nativo)
- Lista de espera
- Galeria de trabalhos na página pública
- Multi-localidade (estúdios com 2+ unidades)
- Blog SEO em `/blog`

---

## Decisões arquiteturais já tomadas (não rever)

| Decisão | Escolha | Motivo |
|---|---|---|
| Modalidades de serviço | 1 por serviço, mesmo preço | Simplifica cálculo no Módulo 3 |
| Slug | Alterável 1x/mês, redirect 90 dias | Equilíbrio flexibilidade/SEO |
| Multi-profissional | Só no plano Studio, pós-MVP | Não complexar MVP |
| Política de cancelamento | Campo informativo apenas | Cobrança exige Stripe (Módulo 6) |
| Endereço | Só texto (sem mapa) | Google Maps caro, OpenStreetMap depois |
| Módulo Admin | Depois da validação inicial | Aumenta escopo desnecessariamente agora |
| Página de Assinatura | Junto com Stripe (Módulo 6) | Página estática sem Stripe não faz sentido |
| localStorage | Padrão Supabase | Migrar pra cookies httpOnly quando tiver NestJS |
| Página do cliente | Só nome + WhatsApp | Menos fricção = mais conversão |

---

## Perguntas abertas (responder antes do Módulo 3)

1. **Aprovação automática:** quando cliente agenda, status começa como `confirmado` (sem aprovação do profissional) ou `pendente` (profissional precisa confirmar)?
   > Recomendação: `confirmado` automático. Profissional tem opção de cancelar se precisar.

2. **Horários lotados:** o que mostrar pro cliente quando não há horários disponíveis no próximo período?
   > Recomendação: mensagem "Sem horários nos próximos 7 dias. Entre em contato pelo WhatsApp."

3. **Fuso horário:** como tratar profissional em SP vs cliente em AM?
   > Recomendação: usar fuso horário do profissional (configurável nas configurações) + `date-fns-tz` já instalado.

4. **Intervalo entre atendimentos:** 1 serviço de 60min bloqueado entre 09:00-10:00 — próximo slot disponível é 10:00 ou há buffer?
   > Recomendação: sem buffer por padrão, mas configurável pelo profissional.

---

## Como continuar em nova conversa

Cole este documento no início da conversa e diga:

> "Contexto: projeto Kianna conforme documento anexo. Quero avançar no Módulo 3 (página pública de agendamento). Antes de gerar task card, pergunte o que precisar."

O Claude terá todo o contexto necessário para:
- Saber o que já foi feito
- Conhecer as decisões tomadas
- Entender a arquitetura existente
- Fazer perguntas cirúrgicas antes de codificar

---

## Estado atual do repositório (branches)

```
main
├── feat/modulo-1                   ← merged
├── feat/modulo-2                   ← merged
├── feat/modulo-2-aprimoramentos    ← merged
├── feat/mobile-ux-melhorias        ← merged
├── fix/grupo-a-ui                  ← merged
└── fix/auth-criticos               ← aplicando agora
```

> **Próxima branch:** `feat/modulo-3-pagina-publica`
