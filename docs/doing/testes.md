# Roteiro de Teste de Interface — Sprint 24/05

Pré-requisitos
Aplicação rodando em localhost:4200
Conta de profissional criada (plano Free)
Conta admin disponível

1. Perfil (/dashboard/perfil)

## Ação Resultado esperado

1.1 Navegar para /dashboard/perfil Página carrega com nome, e-mail e WhatsApp do usuário
1.2 Clicar no avatar para trocar foto Seletor de arquivo abre; ao escolher imagem ela aparece no avatar
1.3 Editar campo Nome e salvar Toast de sucesso; nome atualizado no footer da sidenav
1.4 Editar campo WhatsApp com número inválido Validação bloqueia salvar
1.5 Editar WhatsApp com número válido e salvar Toast de sucesso
1.6 Clicar em Excluir conta Dialog de confirmação abre pedindo digitação de "EXCLUIR"
1.7 Digitar palavra errada no dialog Botão de confirmar permanece desabilitado
1.8 Digitar "EXCLUIR" corretamente Botão fica ativo; ao confirmar faz logout e redireciona para login

2. Sino de Notificações (Header)
## Ação Resultado esperado

2.1 Carregar qualquer página do dashboard Ícone de sino aparece no header
2.2 Existir avisos não lidos (via admin) Badge vermelho com contagem aparece sobre o sino
2.3 Clicar no sino Painel dropdown abre listando avisos em ordem cronológica
2.4 Clicar em um aviso não lido Item muda visualmente para "lido"; badge decrementa
2.5 Todos os avisos lidos Badge some do ícone
2.6 Clicar fora do painel Painel fecha

3. Upgrade (/dashboard/upgrade)

## Ação Resultado esperado

3.1 Navegar para /dashboard/upgrade Página carrega com dois cards: Free e Pro
3.2 Card do plano atual (Free) Tem badge "Seu plano atual" e botão desabilitado/ausente
3.3 Clicar em Falar com a Kianna (Pro) Link/ação de contato é acionado (WhatsApp ou modal)
3.4 Usuário com plano Pro Card Pro exibe badge "Seu plano atual"

# Ação Resultado esperado

1. Relatório (/dashboard/relatorio)

# Ação Resultado esperado

4.1 Navegar para /dashboard/relatorio Mês atual carregado; spinner exibido durante chamada
4.2 Existir agendamentos no mês Cards de status mostram contagens corretas (Pendentes, Confirmados, Concluídos, Cancelados)
4.3 Mês sem agendamentos Donut chart oculto; mensagem "Sem agendamentos neste mês" visível
4.4 Clicar seta esquerda (mês anterior) Mês retrocede, dados recarregam
4.5 Tentar avançar no mês atual Seta direita desabilitada
4.6 Navegar a mês anterior e clicar seta direita Mês avança, dados recarregam
4.7 Mês com múltiplos serviços Donut chart renderiza, legenda lista serviços com % correto (soma = 100%)
4.8 Simular erro de rede Mensagem de erro aparece com botão "Tentar novamente"
5. Segurança — Troca de Senha (/dashboard/configuracoes)

# Ação Resultado esperado

5.1 Navegar para /dashboard/configuracoes Aba "Segurança" visível
5.2 Clicar na aba Segurança Formulário de troca de senha aparece
5.3 Preencher nova senha curta (< 8 chars) Validação exibe erro
5.4 Preencher senhas que não coincidem Erro "senhas não coincidem"
5.5 Preencher senhas válidas e salvar Toast de sucesso; campos limpos
6. Admin — Notificações (/admin/notificacoes)

# Ação Resultado esperado

6.1 Acessar /admin/notificacoes Lista de avisos carrega
6.2 Clicar em Nova notificação Dialog de criação abre com campos título, corpo, destinatário
6.3 Salvar com campos vazios Validação bloqueia
6.4 Salvar aviso válido Aviso aparece na lista; sino do profissional alvo mostra badge
6.5 Clicar em aviso existente para editar Dialog preenche com dados atuais
6.6 Excluir aviso Confirmação; aviso some da lista
6.7 Clicar em Ver leituras de um aviso Dialog exibe quem leu e quando
7. Regressão geral

# Ação Resultado esperado

7.1 Login e logout Fluxo normal sem erros no console
7.2 Navegar em todas as rotas da sidenav Nenhuma rota 404 ou erro de carregamento
7.3 Redimensionar para mobile (375px) Sidenav some; layout de cada página se adapta sem overflow
7.4 Recarregar página em qualquer rota Estado persiste (token/sessão válida)
Commits enviados: kianna-web beefbf9 e kianna-api 789358d. O roteiro cobre os 6 módulos implementados + regressão geral.
