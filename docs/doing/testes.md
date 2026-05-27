# Roteiro de Teste de Interface — Sprint 24/05

Pré-requisitos
Aplicação rodando em localhost:4200
Conta de profissional criada (plano Free)
Conta admin disponível

1. Perfil (/dashboard/perfil)

## Ação Resultado esperado

1.1 Navegar para /dashboard/perfil Página carrega com nome, e-mail e WhatsApp do usuário - OK

1.2 Clicar no avatar para trocar foto Seletor de arquivo abre; ao escolher imagem ela aparece no avatar - OK
1.3 Editar campo Nome e salvar Toast de sucesso; nome atualizado no footer da sidenav  - OK
1.4 Editar campo WhatsApp com número inválido Validação bloqueia salvar - FALHA
    - Não encontrei nenhum campo para alterar o número do WhatsApp.

1.5 Editar WhatsApp com número válido e salvar Toast de sucesso - FALHA
    - Não encontrei nenhum campo para alterar o número do WhatsApp.
  
1.6 Clicar em Excluir conta Dialog de confirmação abre pedindo digitação de "EXCLUIR" - OK
1.7 Digitar palavra errada no dialog Botão de confirmar permanece desabilitado - OK
1.8 Digitar "EXCLUIR" corretamente Botão fica ativo; ao confirmar faz logout e redireciona para login - OK

1. Sino de Notificações (Header)
x           
## Ação Resultado esperado

2.1 Carregar qualquer página do dashboard Ícone de sino aparece no header - OK
2.2 Existir avisos não lidos (via admin) Badge vermelho com contagem aparece sobre o sino - OK
    - Porém o badge vermelho está distorcido, muito grande.

2.3 Clicar no sino Painel dropdown abre listando avisos em ordem cronológica - OK
2.4 Clicar em um aviso não lido Item muda visualmente para "lido"; badge decrementa - OK
2.5 Todos os avisos lidos Badge some do ícone - OK
2.6 Clicar fora do painel Painel fecha - OK

1. Upgrade (/dashboard/upgrade)

## Ação Resultado esperado

3.1 Navegar para /dashboard/upgrade Página carrega com dois cards: Free e Pro -
    - Carrega Essencial, Pro (marcado) e Studio
  
3.2 Card do plano atual (Free) Tem badge "Seu plano atual" e botão desabilitado/ausente
    - Não encontrei nenhum card de plano  Free.
    - O plano Atual está marcado em Essencial
    - No header aparece o plano Gratuito, nãp consegui trocar de plano para testes.

3.3 Clicar em Falar com a Kianna (Pro) Link/ação de contato é acionado (WhatsApp ou modal)
    - Não encontrei este campo.


3.4 Usuário com plano Pro Card Pro exibe badge "Seu plano atual"
    - Não consegui mudar para plano PRO.

# Ação Resultado esperado

1. Relatório (/dashboard/relatorio)

# Ação Resultado esperado

4.1 Navegar para /dashboard/relatorio Mês atual carregado; spinner exibido durante chamada - falha
    - Não mostra Spinner, apenas Carregando relatório...

4.2 Existir agendamentos no mês Cards de status mostram contagens corretas (Pendentes, Confirmados, Concluídos, Cancelados)  - OK
4.3 Mês sem agendamentos Donut chart oculto; mensagem "Sem agendamentos neste mês" visível  - OK
4.4 Clicar seta esquerda (mês anterior) Mês retrocede, dados recarregam  - OK
4.5 Tentar avançar no mês atual Seta direita desabilitada  - OK
4.6 Navegar a mês anterior e clicar seta direita Mês avança, dados recarregam  - OK
4.7 Mês com múltiplos serviços Donut chart renderiza, legenda lista serviços com % correto (soma = 100%)   - OK
4.8 Simular erro de rede Mensagem de erro aparece com botão "Tentar novamente"  - OK


1. Segurança — Troca de Senha (/dashboard/configuracoes)

# Ação Resultado esperado

5.1 Navegar para /dashboard/configuracoes Aba "Segurança" visível - OK
5.2 Clicar na aba Segurança Formulário de troca de senha aparece - OK
5.3 Preencher nova senha curta (< 8 chars) Validação exibe erro - OK
5.4 Preencher senhas que não coincidem Erro "senhas não coincidem" - falha
    - Erro não aparece erro.
    - o botão só habilita se as senhas coincidem, porém não aparece mensagem.
5.5 Preencher senhas válidas e salvar Toast de sucesso; campos limpos
    - Mensagem após mudança: 'New password should be different from the old password.' atualizar para português.
    - Os campos não ficaram limpos.

6. Admin — Notificações (/admin/notificacoes)

# Ação Resultado esperado

6.1 Acessar /admin/notificacoes Lista de avisos carrega   - OK
6.2 Clicar em Nova notificação Dialog de criação abre com campos título, corpo, destinatário  - OK
6.3 Salvar com campos vazios Validação bloqueia  - OK
6.4 Salvar aviso válido Aviso aparece na lista; sino do profissional alvo mostra badge  - OK
6.5 Clicar em aviso existente para editar Dialog preenche com dados atuais  - OK
6.6 Excluir aviso Confirmação; aviso some da lista  - OK
6.7 Clicar em Ver leituras de um aviso Dialog exibe quem leu e quando  - OK


7. Regressão geral

# Ação Resultado esperado

7.1 Login e logout Fluxo normal sem erros no console  - OK
7.2 Navegar em todas as rotas da sidenav Nenhuma rota 404 ou erro de carregamento  - OK
7.3 Redimensionar para mobile (375px) Sidenav some; layout de cada página se adapta sem overflow   - OK
7.4 Recarregar página em qualquer rota Estado persiste (token/sessão válida)   - OK




Observações a serem discutidas:



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

### Logs de auditoria de acessos

- **Status:** Backlog
- **Prioridade:** Baixa
- **Estimativa:** 4h
- **Gatilho:** Antes de escalar produção
- **Módulo:** -
- **Rota:** Backend

**Descrição:** Tabela logs_auditoria no Supabase. Registrar login/logout, falhas, alterações sensíveis.

**Como fazer:** Migration + service que registra eventos.


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


** VALIDAÇÃO DO EMAIL DO cadastro
** VALIDAÇÃO DO celular