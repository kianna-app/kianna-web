# Roteiro de Testes — Sprint 27/05

## Limites por Plano (roteiro 11) + Polimentos de UI (ontem)

**Pré-requisitos**

- Aplicação rodando em localhost:4200 (frontend) e localhost:3000 (backend) - OK
- Quatro contas de profissional disponíveis — uma para cada plano: `gratis`, `essencial`, `pro`, `studio`  - OK
- Para trocar o plano de uma conta:
  - alterar `profissionais.plano` direto no banco (Supabase Studio) e fazer **logout + login** — o token JWT não atualiza automaticamente  - OK
- Conta admin disponível para usar o painel /admin e o dialog de alterar plano  - OK
- Ter ao menos 3 serviços cadastrados na conta Grátis (para testar o bloqueio no 4º)  - OK
- Ter ao menos 15 serviços na conta Essencial (para testar o bloqueio no 16º)  - OK

Plano Studio:

- Não encontrei um modo de alterar o tipo da minha conta.
- Caminho validado para testes: usar conta admin em `/admin`, abrir o menu do profissional e clicar em "Alterar plano". O dialog lista o plano `Studio`; após salvar, fazer logout/login na conta do profissional para atualizar o JWT.

Plano Pro: - OK

- Foi possível salvar dois serviços com o mesmo nome e valor.
  
## 1. Limites de Serviços por Plano

### 1.1 Plano Grátis — bloqueio no 4º serviço

| Ação | Resultado esperado |
|---|---|
| Logar com conta `gratis` que já tem 3 serviços cadastrados | Badge "3 / 3" ou indicador de limite deve estar visível |  - OK

    - Erro: Ao Clicar em Ver planos, nada acontece.
    - Mensagem do banner: Limite de serviços atingido. Faça upgrade para adicionar mais serviços
| Clicar em "Novo serviço" | Dialog de limite abre — **não** o formulário de criação |  - OK
    - Erro: Se já possui 3 serviços não é possível clicar em "Novo serviço".
| Verificar texto do dialog | Deve mencionar o nome do plano ("Grátis"), o limite (3) e o plano seguinte ("Essencial") |
| Verificar botão do dialog | Deve exibir "Ver plano Essencial" (não "Entendido") |
| Clicar em "Ver plano Essencial" | Navega para `/dashboard/upgrade` |
     - Erro: Ao Clicar em Ver planos, nada acontece.

### 1.3 Plano Essencial — bloqueio no 16º serviço

| Ação | Resultado esperado |
|---|---|
| Logar com conta `essencial` que já tem 15 serviços | Clicar em "Novo serviço" abre dialog de limite | - OK

- Ao atingir 15 o botão fica bloqueado para novos serviços. 
| Verificar texto do dialog | Menciona "Essencial", limite 15, próximo plano "Pro" | 
  - Erro: Não tem dialog, apenas a mensagem do banner: Limite de serviços atingido. Faça upgrade para adicionar mais serviços
| Clicar no CTA | Navega para `/dashboard/upgrade` |
  - Erro: Nada acontece.



### 1.4 Plano Pro — serviços ilimitados
NÃO REALIZADO
| Ação | Resultado esperado |
|---|---|
| Logar com conta `pro` com 20+ serviços | Botão "Novo serviço" abre o formulário normalmente, sem dialog de limite |
| Criar mais um serviço | Serviço criado com sucesso |



### 1.5 Plano Studio — serviços ilimitados

| Ação | Resultado esperado |
|---|---|
| Logar com conta `studio` | Criar serviços sem restrição | - OK



## 2. Limites de Agendamentos por Mês (booking público)

### 2.1 Plano Grátis — lotado após 30 agendamentos no mês
NÃO REALIZADO
| Ação | Resultado esperado |
|---|---|
| Profissional `gratis` com 30 agendamentos no mês corrente | Acessar `/<slug>` (página pública de booking) |
| Verificar estado da página pública | Campo de agendamento deve aparecer desabilitado ou mensagem de indisponibilidade ("lotado") |
| Profissional com 29 agendamentos | Página pública ainda permite agendar |

**Resultado:**

---

### 2.2 Plano Essencial — lotado após 150 agendamentos
NÃO REALIZADO

| Ação | Resultado esperado |
|---|---|
| Simular profissional `essencial` com 150 agendamentos no mês | `GET /api/booking/<slug>` retorna `lotado: true` |
| Com 149 agendamentos | `lotado: false` |

## 3. WhatsApp — Bloqueio para Grátis e Essencial

### 3.1 UI — banner de upgrade visível

| Ação | Resultado esperado |
|---|---|
| Logar com `gratis` e acessar `/dashboard/configuracoes` → aba WhatsApp | Banner laranja aparece no topo: "WhatsApp não incluído no seu plano" | - ok
| Verificar cards abaixo do banner | Cards de "Conexão" e "Automações" aparecem esmaecidos e não clicáveis |  - ok
| Verificar botão no banner | Botão "Ver planos" visível | - ok
| Clicar em "Ver planos" | Navega para `/dashboard/upgrade` |  - ok
| Repetir com conta `essencial` | Mesmo comportamento — banner + cards desabilitados | - ok

### 3.3 Plano Pro — WhatsApp acessível

| Ação | Resultado esperado |
|---|---|
| Logar com `pro` e acessar `/dashboard/configuracoes` → WhatsApp | Sem banner de upgrade; formulário de Instance ID e Token habilitado | - OK

## 4. Relatórios — Bloqueio para Grátis, Essencial e Pro

### 4.1 UI — banner de upgrade para planos sem acesso

| Ação | Resultado esperado |
|---|---|
| Logar com `gratis` e acessar `/dashboard/relatorio` | Banner laranja: "Relatórios disponíveis apenas no plano Studio" | - OK
| Verificar que o conteúdo do relatório está oculto | Seletor de mês, cards de status e gráfico não aparecem | - OK
| Botão "Ver planos" no banner | Clica e navega para `/dashboard/upgrade` | - OK
| Repetir com `essencial` | Mesmo comportamento | - OK
| Repetir com `pro` | Mesmo comportamento — relatórios **não** estão no plano Pro | - OK



### 4.3 Plano Studio — relatórios acessíveis

| Ação | Resultado esperado |
|---|---|
| Logar com `studio` e acessar `/dashboard/relatorio` | Sem banner; relatório carrega normalmente com seletor de mês e gráficos |  - OK

## 5. Catálogo de Planos — Valores Corretos

### 5.1 Página /dashboard/upgrade

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/upgrade` com qualquer conta | Cards de planos exibidos |  - OK

| Card Grátis | Chips mostram: 1 profissional, 3 serviços, **30** agendamentos/mês |  - OK
| Card Essencial | Chips mostram: 1 profissional, **15** serviços, **150** agendamentos/mês |  - OK
| Card Pro | Chips mostram: 1 profissional, Ilimitado serviços, Ilimitado agendamentos |  - OK
| Card Studio | Chips mostram: **5** profissionais, Ilimitado, Ilimitado |  
| Features do Essencial | Lista real (15 serviços, 150 agendamentos) — não mais "A definir" | - OK
| Features do Pro | Não deve listar "Relatórios básicos" (relatório é exclusivo Studio) | - OK
| Features do Studio | Lista "5 profissionais" e "Relatórios avançados" | - OK


### 5.2 Landing page (/) — seção de planos

| Ação | Resultado esperado |
|---|---|
| Acessar `/` e rolar até a seção de planos | Verificar textos corretos |  - OK 
| Card Grátis | "Até 30 agendamentos por mês", "Até 3 serviços" |  - OK 
| Card Essencial | "Até 15 serviços cadastrados", "Até 150 agendamentos por mês" |  - OK 
| Card Pro | Chips mostram: 1 profissional, Ilimitado serviços, Ilimitado agendamentos |  - OK - Marcado como padrão.
| Card Studio | "Até 5 profissionais na mesma conta" | - OK



## 6. Perfil — Plano Atual e Upgrade (ontem)

### 6.1 Badge do plano no header

| Ação | Resultado esperado |
|---|---|
| Logar com qualquer conta | Abrir menu do usuário (avatar no header) | - ok
| Verificar badge | Deve exibir "Plano Grátis" / "Plano Essencial" / "Plano Pro" / "Plano Studio" conforme o plano da conta | - OK

**Resultado:**

---

### 6.2 Plano exibido na página de Perfil

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/perfil` | Card do plano atual visível na página | - OK
| Conta `gratis` | Exibe "Grátis" com informações do plano e botão de upgrade | - OK
| Conta `studio` | Exibe "Studio" sem botão de upgrade (já é o plano máximo) | - OK
| Clicar no botão de upgrade | Navega para `/dashboard/upgrade` | - OK



## 7. Segurança — Troca de Senha (ontem)

### 7.1 Validação de senhas que não coincidem

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/configuracoes` → aba Segurança | |
| Preencher nova senha e confirmar com valor diferente | Mensagem "As senhas não coincidem" aparece abaixo do campo | - OK
| Corrigir a confirmação para bater | Erro some | - OK

**Resultado:**

---

### 7.2 Erros em português

| Ação | Resultado esperado |
|---|---|
| Tentar trocar para a mesma senha atual | Toast em português: "A nova senha deve ser diferente da senha atual." | - OK
| Campos após salvar com sucesso | Nova senha e confirmação são limpos | - OK


## 8. Empresa — Validação de WhatsApp (ontem)

| Ação | Resultado esperado |
|---|---|
| Acessar `/dashboard/configuracoes` → aba Empresa | |
| Digitar número de WhatsApp inválido (ex: "123") no campo | Validação exibe erro e bloqueia o salvar | - OK
| Digitar número válido (ex: "11999998888") e salvar | Toast de sucesso | - OK



## 9. Admin — Alterar Plano (ontem)

| Ação | Resultado esperado |
|---|---|
| Logar como admin e acessar `/admin` | Lista de profissionais carrega; coluna "Plano" visível | - OK
| Abrir menu de ações de um profissional | Opção "Alterar plano" disponível | - OK
| Clicar em "Alterar plano" | Dialog abre com plano atual selecionado | - OK
| Selecionar outro plano e confirmar | Plano do profissional atualizado; lista reflete o novo plano | - OK
| Logar como o profissional alterado (após logout/login) | Plano correto exibido no header e no perfil |  - OK



## 10. Regressão Geral

| Ação | Resultado esperado |
|---|---|
| Navegar entre todas as rotas da sidenav com conta `gratis` | Nenhum erro de carregamento; WhatsApp e Relatório exibem banner de upgrade | - OK
| Navegar com conta `studio` | Todas as rotas acessíveis sem banners de bloqueio | - ok
| Criar serviço abaixo do limite em conta `gratis` | Criado normalmente, sem dialog de limite | - OK
| Recarregar a página em `/dashboard/relatorio` com conta `studio` | Relatório carrega normalmente após reload | - ok
| Console do navegador | Sem erros `TypeError` ou `ExpressionChangedAfterItHasBeenChecked` | - ok


## Observações a serem discutidas

_Espaço livre para anotações durante os testes:_

- Não foi possível criar um usuário usando o /admin.
  - Erro: O schema atual exige user_id. Implemente o fluxo de convite do profissional antes (ver TODO em admin.service).
- Não é possível mudar a senha de uma conta usando o /admin
- Adicionar um botão de logout no /admin
- Em Admin criar um modo que o administrador "resete" a senha do usuário e ele seja obrigado a troca a senha no próximo login



Novo agendamento
- Quando o profissional irá criar um novo agendamento manual.
  - Validação do número do whats para um numero válido.
  - Campo de data não está abrindo calendario para selecionar a data, está um campo no qual o usuário precisa digitar o valor.
  - Campo de hora não está abrindo relógio para selecionar a hora, está um campo no qual o usuário precisa digitar o valor.
  - 
