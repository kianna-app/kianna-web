# ROTEIRO CLAUDE CODE — Base Comum (Design + Requisitos Não-Funcionais)

Este arquivo é referenciado pelos 4 roteiros desta leva (Perfil, Upgrade, Notificações, Relatório). Ele evita repetição: cada roteiro herda tudo daqui e só descreve o que é específico.

> **Contexto para você (Claude Code):** você conhece o sistema (Angular standalone moderno, backend NestJS, Supabase, `AdminGuard` e endpoints `/api/admin/*` já existentes da sessão do painel admin). Inspecione o modelo de dados real e reaproveite o que já existe. Não reescreva o que funciona.

---

## Diretrizes de interface (valem para as 4 frentes)

- Moderna, clean, minimalista, **mobile-first** e responsiva de verdade.
- Usar as **cores do projeto** (design tokens já existentes). Onde a referência pedir accent, usar o accent da marca, não inventar paleta.
- Premium: espaço em branco generoso, hierarquia tipográfica clara (fonte do sistema / a do projeto), cantos arredondados suaves, separadores hairline, sombras baixas. Nada de "admin template".
- Acessibilidade: contraste adequado, labels em inputs, foco visível, alvos de toque ≥44px, navegação por teclado, `aria-*` onde fizer sentido.
- Performance/fluidez: lazy-load das rotas, evitar libs pesadas, transições curtas e discretas.
- Estados sempre tratados: loading (skeleton/spinner discreto), vazio (mensagem amigável), erro (mensagem clara + ação), sucesso (feedback breve, ex.: toast).

## Requisitos não-funcionais (valem para as 4 frentes)

- **Baixo acoplamento / reutilização:** componentes e serviços isolados; lógica de dados em services, não nos componentes. Reaproveitar componentes de UI entre as frentes (ex.: card, modal de confirmação, toast).
- **Manutenção / escalabilidade:** seguir a arquitetura de pastas já adotada (feature-based). DTOs tipados no backend (class-validator).
- **Estabilidade / disponibilidade:** falhar de forma controlada — nunca engolir erro em silêncio; toda chamada de rede com tratamento de erro visível ao usuário ou logado.
- **Observabilidade/logs:** logar operações sensíveis no backend (criação/edição/exclusão, envio de notificação, mudança de plano) com nível adequado. Não logar dados sensíveis (tokens, dados pessoais em texto puro).
- **Segurança:** rotas admin sob `AdminGuard`; rotas de profissional sob a auth existente; validação de input no backend (não confiar no front).

## Convenções

- Toda operação destrutiva (excluir, desativar) usa **modal de confirmação** reutilizável.
- Placeholders de conteúdo não definido no padrão `[[ ]]`.
- Build precisa passar sem erros ao final de cada roteiro.

## Aviso

Onde houver implicação de LGPD ou cobrança, o conteúdo é base funcional, não parecer jurídico/fiscal. Revisão profissional recomendada antes de produção.
