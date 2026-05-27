# Backlog do Projeto Kianna

> Importe este arquivo no Notion: New page → Import → Markdown

**Total de itens:** 32

---

## 🔴 Obrigatório LGPD

### Página de Termos de Uso

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 4-8h
- **Gatilho:** Antes do 1º cadastro real
- **Módulo:** -
- **Rota:** /termos

**Descrição:** Contrato entre Kianna e usuário definindo regras, responsabilidades, cancelamento, propriedade intelectual e foro. Conteúdo mínimo: CNPJ/CPF, escopo do serviço, obrigações, política de cancelamento, foro de eleição.

**Como fazer:** Adaptar template ABCD ou iubenda. Validar com advogado se possível.

---

### Política de Privacidade (LGPD)

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 4-8h
- **Gatilho:** Antes do 1º cadastro real
- **Módulo:** -
- **Rota:** /privacidade

**Descrição:** Documento explicando dados coletados, finalidade, compartilhamento (Supabase, Z-API, Stripe), retenção, direitos do titular, transferência internacional de dados.

**Como fazer:** Template iubenda + customização específica. Não esquecer cláusula de transferência internacional.

---

### Banner de cookies (LGPD)

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 3-6h
- **Gatilho:** Antes de ligar Analytics ou rastreamento
- **Módulo:** -
- **Rota:** Todas as páginas

**Descrição:** Banner com botões iguais 'Aceitar' e 'Recusar', categorização de cookies, link pra política, persistência da escolha. NÃO ativar Analytics antes.

**Como fazer:** Lib ngx-cookieconsent (gratuita) ou implementação custom com signal + localStorage.

---

### E-mail de contato no footer

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 30min-1h
- **Gatilho:** Antes do 1º cadastro real
- **Módulo:** -
- **Rota:** Footer global

**Descrição:** E-mails contato@kianna.com.br (geral) e privacidade@kianna.com.br (LGPD). Visível no footer de todas as páginas.

**Como fazer:** Cloudflare Email Routing — grátis, redireciona pro Gmail pessoal.

---

## 🟡 Melhoria importante

### Aceite de Termos no Cadastro

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 30min
- **Gatilho:** Após criar página de Termos
- **Módulo:** Módulo 1
- **Rota:** /auth/cadastro

**Descrição:** Verificar checkbox obrigatório 'Li e aceito Termos e Privacidade' aponta pra página real (não placeholder).

**Como fazer:** Atualizar links no cadastro.component.html.

---

### Botão 'Excluir minha conta'

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 2-3h
- **Gatilho:** LGPD direito ao esquecimento (Art. 18)
- **Módulo:** Módulo 5
- **Rota:** /dashboard/configuracoes

**Descrição:** Botão em /dashboard/configuracoes com modal de confirmação. Cascade delete já está configurado no Supabase.

**Como fazer:** Implementar junto com configurações no Módulo 5.

---

### Exportação de dados (portabilidade)

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 4-6h
- **Gatilho:** LGPD direito de portabilidade (Art. 18)
- **Módulo:** Módulo 5
- **Rota:** /dashboard/configuracoes

**Descrição:** Botão 'Baixar meus dados' que gera ZIP com JSON de profissional, serviços, agendamentos, foto.

**Como fazer:** Endpoint NestJS que monta ZIP + envia por e-mail.

---

### Logs de auditoria de acessos

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 4h
- **Gatilho:** Antes de escalar produção
- **Módulo:** -
- **Rota:** Backend

**Descrição:** Tabela logs_auditoria no Supabase. Registrar login/logout, falhas, alterações sensíveis.

**Como fazer:** Migration + service que registra eventos.


---

### Módulo 4 — Integração WhatsApp Z-API

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 2 semanas
- **Gatilho:** Após Módulo 3
- **Módulo:** Módulo 4
- **Rota:** Backend + integrações

**Descrição:** ATENÇÃO: maior complexidade do projeto. Confirmação imediata, lembrete 24h com menu interativo, reagendamento via WhatsApp.

**Como fazer:** Dividir em sub-módulos 4a, 4b, 4c. Testar cada um isoladamente antes de produção.


### Módulo 6 — Cobrança Stripe + Pix

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** Semana inteira
- **Gatilho:** Após Módulo 5
- **Módulo:** Módulo 6
- **Rota:** /dashboard/configuracoes/plano

**Descrição:** Integração Stripe com Pix. Upgrade Grátis → Pro → Studio. Gestão de assinatura. Webhooks de pagamento.

**Como fazer:** Task card a ser gerado. Cuidado especial com webhooks e estados de assinatura.

---


### Backups automáticos do Supabase

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 2-3h
- **Gatilho:** Antes de qualquer cliente real
- **Módulo:** -
- **Rota:** Infra

**Descrição:** CRÍTICO: Sem backup, perda de dados = morte do produto. Plano grátis Supabase tem backup limitado (7 dias, não baixável).

**Como fazer:** Plano Pro Supabase (US$25/mês) OU cron job semanal exportando pra storage externo.

---

### Monitoramento e alertas

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 2h
- **Gatilho:** Antes de marketing pago
- **Módulo:** -
- **Rota:** Infra

**Descrição:** UptimeRobot (uptime), Sentry (erros), Better Stack (logs). Tudo em planos gratuitos.

**Como fazer:** Integração via SDK em cada serviço.

---

### SSL/HTTPS em todos subdomínios

- **Status:** Backlog
- **Prioridade:** Alta
- **Estimativa:** 1h
- **Gatilho:** Antes de qualquer marketing
- **Módulo:** -
- **Rota:** Infra

**Descrição:** Cloudflare oferece SSL grátis. Configurar antes de qualquer marketing.

**Como fazer:** Cloudflare → SSL/TLS → Full Strict.

---

## 🟣 Marketing

### Google Analytics ou Plausible

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 1-2h
- **Gatilho:** Após banner de cookies funcionando
- **Módulo:** -
- **Rota:** Tracking

**Descrição:** Medir conversão da homepage. GA grátis (questões LGPD) ou Plausible €9/mês (mais privacy-friendly).

**Como fazer:** Adicionar script após consentimento via banner de cookies.

---

### Google Search Console

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 30min
- **Gatilho:** Após homepage no ar
- **Módulo:** -
- **Rota:** SEO

**Descrição:** Indexar homepage no Google e monitorar SEO.

**Como fazer:** Verificar domínio via DNS TXT record.

---

### Microsoft Clarity (mapas de calor)

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 30min
- **Gatilho:** Após homepage no ar
- **Módulo:** -
- **Rota:** Tracking

**Descrição:** Ver onde usuários clicam e abandonam. Gratuito.

**Como fazer:** Adicionar script após consentimento via banner de cookies.

---

### Pixel Facebook + Google Ads conversion

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 1-2h
- **Gatilho:** Quando começar anúncios pagos
- **Módulo:** -
- **Rota:** Tracking

**Descrição:** Pra rodar campanhas pagas depois.

**Como fazer:** Pixels + eventos de conversão (cadastro, upgrade).

---

### Blog em /blog

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 1 dia setup + 4h/artigo
- **Gatilho:** Após MVP completo
- **Módulo:** -
- **Rota:** /blog

**Descrição:** Conteúdo SEO. Artigos: 'Como reduzir faltas no salão', 'Modelos de mensagem WhatsApp', etc.

**Como fazer:** WordPress Hostinger (futuro) OU Hashnode/Dev.to com domínio custom.

---

## ⚪ Nice-to-have

### App mobile (PWA)

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 1-2 dias
- **Gatilho:** Após MVP estável
- **Módulo:** -
- **Rota:** /dashboard

**Descrição:** Transformar painel em PWA. Push notifications de novos agendamentos.

**Como fazer:** manifest.json + service worker + ícones.

---



### Multi-localidade (estúdios com 2+ unidades)

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 2-3 dias
- **Gatilho:** Quando primeiros clientes Studio pedirem
- **Módulo:** -
- **Rota:** Página pública

**Descrição:** Múltiplos endereços. Cliente escolhe local.

**Como fazer:** Tabela enderecos + UI de seleção.

---

### Galeria de trabalhos

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 1-2 dias
- **Gatilho:** Após MVP
- **Módulo:** -
- **Rota:** Página pública

**Descrição:** Profissional sobe fotos antes/depois pra atrair clientes.

**Como fazer:** Upload via Supabase Storage + galeria na página pública.

---

### Avaliações pós-atendimento

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 1-2 dias
- **Gatilho:** Após Módulo 4 (WhatsApp)
- **Módulo:** -
- **Rota:** /avaliar/:id

**Descrição:** Após agendamento concluído, cliente recebe link no WhatsApp pra avaliar 1-5 estrelas.

**Como fazer:** Trigger pós-agendamento + página de avaliação pública + dashboard.










### Depositar marca Kianna no INPI

- **Status:** Backlog
- **Prioridade:** URGENTE
- **Estimativa:** 1h
- **Gatilho:** Esta semana
- **Módulo:** -
- **Rota:** -

**Descrição:** Classe 42 (SaaS). R$ 142 com desconto MEI/ME. Sem isso, qualquer um pode depositar antes e te bloquear.

**Como fazer:** INPI online (busca.inpi.gov.br/pePI/) + GRU código 389.

---

### Abertura de MEI

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 1-2h
- **Gatilho:** Antes do 1º pagamento recebido
- **Módulo:** -
- **Rota:** -

**Descrição:** Pra emitir nota fiscal. Limite R$81mil/ano = suficiente pros primeiros 12-24 meses.

**Como fazer:** Portal do Empreendedor → Formalize-se. CNAE: 6209-1/00 (TI).

---

### Conta bancária PJ

- **Status:** Backlog
- **Prioridade:** Média
- **Estimativa:** 1-2h
- **Gatilho:** Após abrir MEI
- **Módulo:** -
- **Rota:** -

**Descrição:** Receber pagamentos via Stripe e separar finanças.

**Como fazer:** Inter, C6, Stone, BTG (todos gratuitos).

---

