# ROTEIRO CLAUDE CODE — 12: Monitoramento de Erros (Sentry) + Logs de Auditoria

usar as seguintes informações:

DSN Back
https://ad3f9404e036f856874ae875cfda9a36@o4511467189174272.ingest.us.sentry.io/4511467194482688


DSN Front
https://59e0062384d5463cdfd68d347b55218e@o4511467189174272.ingest.us.sentry.io/4511467227185152



**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md` (requisitos não-funcionais — observabilidade é o foco central aqui).
**Contexto:** complementa a task 07 (`wpp_status`) — ambas tratam de observabilidade. Podem ser executadas em qualquer ordem, mas os logs de auditoria do backend usam o mesmo padrão de logging que o roteiro 07 estabelece. Se o 07 já foi executado, reusar o padrão definido lá.

> **ATENÇÃO — PRÉ-REQUISITO DO USUÁRIO (não é código):**
> O Sentry exige uma conta e um DSN antes de qualquer integração. Isso é feito pelo usuário no painel do Sentry (sentry.io), não pela Claude Code.
>
> - Criar **dois projetos** no Sentry: um `Node.js` (para o NestJS) e um `Angular` (para o frontend).
> - Cada projeto gera um DSN. Salvar ambos.
> - Adicionar as variáveis de ambiente no Railway: `SENTRY_DSN_BACKEND` e no ambiente de build do frontend: `SENTRY_DSN_FRONTEND`.
> - **Só após isso a Claude Code consegue integrar.** Se as variáveis não estiverem disponíveis, implementar com variável de ambiente lida do environment e deixar comentário claro.

---

## Parte 1 — Sentry no Backend (NestJS)

### Instalação

- `@sentry/nestjs` (ou `@sentry/node` se a versão NestJS não for compatível — inspecionar versão do projeto).

### Configuração

- Inicializar o Sentry no bootstrap da aplicação, lendo o DSN de `process.env.SENTRY_DSN_BACKEND`.
- Se `SENTRY_DSN_BACKEND` não estiver definido (ambiente local sem config), **não crashar** — apenas logar um aviso e seguir sem Sentry. Nunca obrigar o DSN em desenvolvimento.
- Capturar exceções não tratadas automaticamente (o SDK já faz isso; confirmar que está ativo).
- `environment` configurado (`production` / `development`) para filtrar ruído de desenvolvimento nos alertas.

### O que capturar além do automático

- Erros de envio de notificação WhatsApp (o `catch` da task 07, se já implementado — garantir que o erro é passado para `Sentry.captureException`).
- Erros de webhook não processados.
- Erros de validação de limite de plano (`PLAN_LIMIT_REACHED` não precisa ir pro Sentry — é fluxo normal; erros inesperados sim).
- **Não logar dados sensíveis:** antes de enviar pro Sentry, garantir que tokens, senhas, dados pessoais (nome, telefone de clientes) não estão no contexto do erro. Usar `beforeSend` para sanitizar se necessário.

### Breadcrumbs úteis (contexto para debug)

- `profissional_id` no contexto do request (via Sentry scope), para saber qual profissional estava envolvido no erro. Não incluir dados pessoais do cliente final.

---

## Parte 2 — Sentry no Frontend (Angular)

### Instalação

- `@sentry/angular`.

### Configuração

- Inicializar no `main.ts` ou `app.config.ts`, lendo o DSN de `environment.sentryDsn`.
- Integrar com o `ErrorHandler` do Angular para capturar erros de runtime automaticamente.
- Integrar com o `Router` para rastrear navegação (performance traces — útil pra identificar rotas lentas).
- Se `sentryDsn` estiver vazio (environment local), não inicializar — sem erro, sem ruído.
- `environment` correto nos arquivos `environment.ts` / `environment.prod.ts`.

### O que NÃO capturar

- Erros de validação de formulário (são fluxo esperado, não bugs).
- Erros 401/403 de auth (fluxo normal de sessão expirada).
- Filtrar via `beforeSend` para não poluir o Sentry com ruído.

---

## Parte 3 — Logs de Auditoria (Supabase)

Tabela `logs_auditoria` para registrar eventos sensíveis — fins de observabilidade operacional e LGPD (demonstrar que operações foram realizadas e por quem).

### Migration (nova tabela)

* JÁ FORAM RODADOS NO SUPABASE *

```sql
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ator_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  ator_tipo TEXT NOT NULL CHECK (ator_tipo IN ('profissional', 'admin', 'sistema')),
  acao TEXT NOT NULL,
  recurso TEXT NOT NULL,
  recurso_id TEXT,
  detalhes JSONB,
  ip TEXT,
  resultado TEXT NOT NULL CHECK (resultado IN ('sucesso', 'falha'))
);

CREATE INDEX idx_logs_auditoria_ator ON logs_auditoria(ator_id);
CREATE INDEX idx_logs_auditoria_criado_em ON logs_auditoria(criado_em DESC);
CREATE INDEX idx_logs_auditoria_acao ON logs_auditoria(acao);
```

### Eventos a registrar (mínimo)

| acao | recurso | quando |
|---|---|---|
| `login` | `sessao` | login bem-sucedido |
| `login_falha` | `sessao` | tentativa falha de login |
| `logout` | `sessao` | logout |
| `alteracao_senha` | `profissional` | troca de senha |
| `exclusao_conta` | `profissional` | soft-delete da própria conta |
| `alteracao_plano` | `profissional` | admin muda o plano |
| `credencial_zapi_atualizada` | `profissional` | admin atualiza credenciais Z-API |
| `notificacao_enviada` | `whatsapp` | mensagem enviada via WhatsApp |
| `notificacao_falha` | `whatsapp` | falha no envio (complementa task 07) |
| `wpp_desconectado` | `whatsapp` | detecção de queda (complementa task 07) |

### AuditoriaService

- `AuditoriaService` dedicado, injetável, com método único: `registrar(evento: AuditoriaEvento): Promise<void>`.
- **Nunca bloquear o fluxo principal:** chamar com `void` (fire-and-forget). Falha no log de auditoria não deve gerar erro para o usuário.
- **Não logar dados senssoais** no campo `detalhes` — IDs e metadados sim, tokens/senhas/dados pessoais não.
- Se o Sentry estiver configurado, uma falha no `AuditoriaService` deve ser capturada por ele silenciosamente.

### Injetar nos pontos de auditoria
Adicionar chamadas ao `AuditoriaService` nos services/controllers onde os eventos da tabela acima ocorrem. Reusar/complementar os pontos de log já estabelecidos no roteiro 07, não duplicar.

---

## O que o usuário ainda precisa fazer (não é código)

Além do Sentry (pré-requisito acima):

- **UptimeRobot:** cadastrar a URL da API no painel do UptimeRobot (sentry.io não monitora uptime — são ferramentas separadas). Gratuito, 10 minutos. Alertas por e-mail quando a API cair. **Não é task da Claude Code.**

---

## Critérios de aceite

Sentry Backend

- [ ] SDK instalado e inicializado; DSN lido de variável de ambiente.
- [ ] Não crasha se DSN ausente (ambiente local).
- [ ] Erros não tratados capturados automaticamente.
- [ ] Erros de WhatsApp/webhook enviados ao Sentry.
- [ ] Dados sensíveis sanitizados antes do envio (`beforeSend`).
- [ ] `profissional_id` no contexto do request (sem dados pessoais do cliente).

Sentry Frontend

- [ ] SDK instalado; integrado com `ErrorHandler` e `Router`.
- [ ] Não inicializa se DSN vazio.
- [ ] Erros de formulário e 401/403 filtrados.

Logs de auditoria

- [ ] Migration criada; tabela `logs_auditoria` com índices.
- [ ] `AuditoriaService` implementado (fire-and-forget, sem bloquear fluxo).
- [ ] Todos os eventos da tabela registrados nos pontos corretos.
- [ ] Nenhum dado sensível nos `detalhes`.
- [ ] Falha no serviço de auditoria não propaga erro para o usuário.

Geral

- [ ] Build verde; nenhuma regressão.
- [ ] Comentário claro sobre o pré-requisito de conta Sentry + DSN.
