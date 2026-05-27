# Roteiro de Testes — Sprint 27/05
## Limites por Plano (roteiro 11) + Polimentos de UI (ontem)

**Pré-requisitos**
- Aplicação rodando em localhost:4200 (frontend) e localhost:3000 (backend)
- Quatro contas de profissional disponíveis — uma para cada plano: `gratis`, `essencial`, `pro`, `studio`
- Para trocar o plano de uma conta: alterar `profissionais.plano` direto no banco (Supabase Studio) e fazer **logout + login** — o token JWT não atualiza automaticamente
- Conta admin disponível para usar o painel /admin e o dialog de alterar plano
- Ter ao menos 3 serviços cadastrados na conta Grátis (para testar o bloqueio no 4º)
- Ter ao menos 15 serviços na conta Essencial (para testar o bloqueio no 16º)

---

## 1. Limites de Serviços por Plano

### 1.1 Plano Grátis — bloqueio no 4º serviço

| Ação | Resultado esperado |
|---|---|
| Logar com conta `gratis` que já tem 3 serviços cadastrados | Badge "3 / 3" ou indicador de limite deve estar visível |
| Clicar em "Novo serviço" | Dialog de limite abre — **não** o formulário de criação |
| Verificar texto do dialog | Deve mencionar o nome do plano ("Grátis"), o limite (3) e o plano seguinte ("Essencial") |
| Verificar botão do dialog | Deve exibir "Ver plano Essencial" (não "Entendido") |
| Clicar em "Ver plano Essencial" | Navega para `/dashboard/upgrade` |

**Resultado:**

---

### 1.2 Plano Grátis — backend bloqueia mesmo sem frontend

| Ação | Resultado esperado |
|---|---|
| Com conta `gratis` (3 serviços), chamar `POST /api/servicos` via Swagger/curl com token válido | HTTP 403 com `{ code: "PLAN_LIMIT_REACHED", resource: "services", limit: 3 }` |

**Resultado:**

---

### 1.3 Plano Essencial — bloqueio no 16º serviço

| Ação | Resultado esperado |
|---|---|
| Logar com conta `essencial` que já tem 15 serviços | Clicar em "Novo serviço" abre dialog de limite |
| Verificar texto do dialog | Menciona "Essencial", limite 15, próximo plano "Pro" |
| Clicar no CTA | Navega para `/dashboard/upgrade` |

**Resultado:**

---

### 1.4 Plano Pro — serviços ilimitados

| Ação | Resultado esperado |
|---|---|
| Logar com conta `pro` com 20+ serviços | Botão "Novo serviço" abre o formulário normalmente, sem dialog de limite |
| Criar mais um serviço | Serviço criado com sucesso |

**Resultado:**

---

### 1.5 Plano Studio — serviços ilimitados

| Ação | Resultado esperado |
|---|---|
| Logar com conta `studio` | Criar serviços sem restrição |

**Resultado:**

---

## 2. Limites de Agendamentos por Mês (booking público)

### 2.1 Plano Grátis — lotado após 30 agendamentos no mês

| Ação | Resultado esperado |
|---|---|
| Profissional `gratis` com 30 agendamentos no mês corrente | Acessar `/<slug>` (página pública de booking) |
| Verificar estado da página pública | Campo de agendamento deve aparecer desabilitado ou mensagem de indisponibilidade ("lotado") |
| Profissional com 29 agendamentos | Página pública ainda permite agendar |

**Resultado:**

---

### 2.2 Plano Essencial — lotado após 150 agendamentos

| Ação | Resultado esperado |
|---|---|
| Simular profissional `essencial` com 150 agendamentos no mês | `GET /api/booking/<slug>` retorna `lotado: true` |
| Com 149 agendamentos | `lotado: false` |

**Resultado:**

---

### 2.3 Plano Pro/Studio — agendamentos ilimitados

| Ação | Resultado esperado |
|---|---|
| Profissional `pro` ou `studio` com qualquer quantidade de agendamentos | `GET /api/booking/<slug>` sempre retorna `lotado: false` |

**Resultado:**

---

## 3. WhatsApp — Bloqueio para Grátis e Essencial

### 3.1 UI — banner de upgrade visível

| Ação | Resultado esperado |
|---|---|
| Logar com `gratis` e acessar `/dashboard/configuracoes` → aba WhatsApp | Banner laranja aparece no topo: "WhatsApp não incluído no seu plano" |
| Verificar cards abaixo do banner | Cards de "Conexão" e "Automações" aparecem esmaecidos e não clicáveis |
| Verificar botão no banner | Botão "Ver planos" visível |
| Clicar em "Ver planos" | Navega para `/dashboard/upgrade` |
| Repetir com conta `essencial` | Mesmo comportamento — banner + cards desabilitados |

**Resultado:**

---

### 3.2 Backend — 403 nos endpoints de WhatsApp para Grátis/Essencial

| Ação | Resultado esperado |
|---|---|
| Com token de conta `gratis`, chamar `POST /api/whatsapp/qr-code` | HTTP 403 `{ code: "PLAN_LIMIT_REACHED", resource: "whatsapp" }` |
| Com token de conta `essencial`, chamar `GET /api/whatsapp/status` | HTTP 403 |
| Com token de conta `pro`, chamar `GET /api/whatsapp/status` | HTTP 200 (acesso liberado) |
| Com token de conta `studio`, chamar `POST /api/whatsapp/desconectar` | HTTP 200 |

**Resultado:**

---

### 3.3 Plano Pro — WhatsApp acessível

| Ação | Resultado esperado |
|---|---|
| Logar com `pro` e acessar `/dashboard/configuracoes` → WhatsApp | Sem banner de upgrade; formulário de Instance ID e Token habilitado |

**Resultado:**

---

## 4. Relatórios — Bloqueio para Grátis, Essencial e Pro

### 4.1 UI — banner de upgrade para planos sem acesso

| Ação | Resultado esperado |
|---|---|
| Logar com `gratis` e acessar `/dashboard/relatorio` | Banner laranja: "Relatórios disponíveis apenas no plano Studio" |
| Verificar que o conteúdo do relatório está oculto | Seletor de mês, cards de status e gráfico não aparecem |
| Botão "Ver planos" no banner | Clica e navega para `/dashboard/upgrade` |
| Repetir com `essencial` | Mesmo comportamento |
| Repetir com `pro` | Mesmo comportamento — relatórios **não** estão no plano Pro |

**Resultado:**

---

### 4.2 Backend — 403 para planos sem acesso

| Ação | Resultado esperado |
|---|---|
| Com token `gratis`, chamar `GET /api/relatorio` | HTTP 403 `{ code: "PLAN_LIMIT_REACHED", resource: "relatorio" }` |
| Com token `pro`, chamar `GET /api/relatorio` | HTTP 403 |
| Com token `studio`, chamar `GET /api/relatorio` | HTTP 200 com dados do relatório |

**Resultado:**

---

### 4.3 Plano Studio — relatórios acessíveis

| Ação | Resultado esperado |
|---|---|
| Logar com `studio` e acessar `/dashboard/relatorio` | Sem banner; relatório carrega normalmente com seletor de mês e gráficos |

**Resultado:**

---

## 5. Catálogo de Planos — Valores Corretos

### 5.1 Página /dashboard/upgrade

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/upgrade` com qualquer conta | Cards de planos exibidos |
| Card Grátis | Chips mostram: 1 profissional, 3 serviços, **30** agendamentos/mês |
| Card Essencial | Chips mostram: 1 profissional, **15** serviços, **150** agendamentos/mês |
| Card Pro | Chips mostram: 1 profissional, Ilimitado serviços, Ilimitado agendamentos |
| Card Studio | Chips mostram: **5** profissionais, Ilimitado, Ilimitado |
| Features do Essencial | Lista real (15 serviços, 150 agendamentos) — não mais "A definir" |
| Features do Pro | Não deve listar "Relatórios básicos" (relatório é exclusivo Studio) |
| Features do Studio | Lista "5 profissionais" e "Relatórios avançados" |

**Resultado:**

---

### 5.2 Landing page (/) — seção de planos

| Ação | Resultado esperado |
|---|---|
| Acessar `/` e rolar até a seção de planos | Verificar textos corretos |
| Card Grátis | "Até 30 agendamentos por mês", "Até 3 serviços" |
| Card Essencial | "Até 15 serviços cadastrados", "Até 150 agendamentos por mês" |
| Card Studio | "Até 5 profissionais na mesma conta" |

**Resultado:**

---

## 6. Perfil — Plano Atual e Upgrade (ontem)

### 6.1 Badge do plano no header

| Ação | Resultado esperado |
|---|---|
| Logar com qualquer conta | Abrir menu do usuário (avatar no header) |
| Verificar badge | Deve exibir "Plano Grátis" / "Plano Essencial" / "Plano Pro" / "Plano Studio" conforme o plano da conta |

**Resultado:**

---

### 6.2 Plano exibido na página de Perfil

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/perfil` | Card do plano atual visível na página |
| Conta `gratis` | Exibe "Grátis" com informações do plano e botão de upgrade |
| Conta `studio` | Exibe "Studio" sem botão de upgrade (já é o plano máximo) |
| Clicar no botão de upgrade | Navega para `/dashboard/upgrade` |

**Resultado:**

---

## 7. Segurança — Troca de Senha (ontem)

### 7.1 Validação de senhas que não coincidem

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/configuracoes` → aba Segurança | |
| Preencher nova senha e confirmar com valor diferente | Mensagem "As senhas não coincidem" aparece abaixo do campo |
| Corrigir a confirmação para bater | Erro some |

**Resultado:**

---

### 7.2 Erros em português

| Ação | Resultado esperado |
|---|---|
| Tentar trocar para a mesma senha atual | Toast em português: "A nova senha deve ser diferente da senha atual." |
| Campos após salvar com sucesso | Nova senha e confirmação são limpos |

**Resultado:**

---

## 8. Empresa — Validação de WhatsApp (ontem)

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/configuracoes` → aba Empresa | |
| Digitar número de WhatsApp inválido (ex: "123") no campo | Validação exibe erro e bloqueia o salvar |
| Digitar número válido (ex: "11999998888") e salvar | Toast de sucesso |

**Resultado:**

---

## 9. Admin — Alterar Plano (ontem)

| Ação | Resultado esperado |
|---|---|
| Logar como admin e acessar `/admin` | Lista de profissionais carrega; coluna "Plano" visível |
| Abrir menu de ações de um profissional | Opção "Alterar plano" disponível |
| Clicar em "Alterar plano" | Dialog abre com plano atual selecionado |
| Selecionar outro plano e confirmar | Plano do profissional atualizado; lista reflete o novo plano |
| Logar como o profissional alterado (após logout/login) | Plano correto exibido no header e no perfil |

**Resultado:**

---

## 10. Regressão Geral

| Ação | Resultado esperado |
|---|---|
| Navegar entre todas as rotas da sidenav com conta `gratis` | Nenhum erro de carregamento; WhatsApp e Relatório exibem banner de upgrade |
| Navegar com conta `studio` | Todas as rotas acessíveis sem banners de bloqueio |
| Criar serviço abaixo do limite em conta `gratis` | Criado normalmente, sem dialog de limite |
| Recarregar a página em `/dashboard/relatorio` com conta `studio` | Relatório carrega normalmente após reload |
| Console do navegador | Sem erros `TypeError` ou `ExpressionChangedAfterItHasBeenChecked` |

**Resultado:**

---

## Observações a serem discutidas

_Espaço livre para anotações durante os testes:_

-
-
-
