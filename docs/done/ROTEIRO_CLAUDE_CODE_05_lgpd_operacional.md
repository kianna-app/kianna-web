# ROTEIRO CLAUDE CODE — 05: LGPD Operacional (Cookies, Footer, Aceite no Cadastro)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md` (design iOS/clean + não-funcionais).
**Pré-requisitos:** o roteiro de LGPD (`/termos` e `/privacidade`) precisa existir — vários itens aqui linkam para essas rotas.

Três entregas independentes neste roteiro. Podem ser feitas em qualquer ordem, respeitando os pré-requisitos.

Analisar antes, talvez alguns pontos já estejam implementados.

---

## 1. Banner de consentimento de cookies (LGPD)

- **Prioridade:** Alta. **Gatilho:** antes de ligar qualquer Analytics/rastreamento.
- **Escopo:** todas as páginas (componente global no layout raiz).

### Requisitos travados
- Banner com **dois botões de peso visual igual**: **"Aceitar"** e **"Recusar"**. Recusar NÃO pode ser escondido, secundário ou mais difícil que aceitar (exigência LGPD/boa prática — botões equivalentes).
- **Categorização de cookies:** ao menos necessários (sempre on, não desligável) e analíticos/opcionais (controláveis). Um terceiro nível (marketing) só se for usar.
- **Link para a Política de Privacidade** (`/privacidade`) e/ou política de cookies.
- **Persistência da escolha:** salvar a decisão (e a data) e não mostrar o banner de novo até expirar/ser revogado. Permitir **revisar/alterar** a escolha depois (ex.: link discreto no footer "Preferências de cookies").
- **CRÍTICO — não disparar nada antes do consentimento:** Analytics, pixels e qualquer rastreamento só carregam APÓS o "Aceitar" nas categorias correspondentes. Por padrão, tudo opcional começa DESLIGADO (opt-in, não opt-out). Deixar isso explícito no código.

### Implementação (decisão com você, Claude Code)
- Avaliar `ngx-cookieconsent`: ela é mais antiga e pode atritar com Angular standalone/signals. **Se houver fricção**, usar implementação **custom com signal + localStorage** (alternativa já aprovada).
- Persistência: `localStorage` (a escolha não é dado sensível). Um service dedicado (`ConsentService`) expõe o estado por signal; quem precisa de analytics observa esse signal antes de inicializar.
- Visual: discreto, clean, iOS-like, **mobile-first**; não cobrir conteúdo essencial; acessível (foco, teclado, contraste, `role`/`aria`).

---

## 2. E-mails de contato no footer

- **Prioridade:** Alta. **Gatilho:** antes do 1º cadastro real.

### O que a Claude Code FAZ
- Exibir no **footer global** (todas as páginas) os e-mails:
  - `contato@kianna.com.br` (geral)
  - `privacidade@kianna.com.br` (LGPD/encarregado)
- Como `mailto:` clicáveis, acessíveis. Se o footer já existe (do roteiro LGPD), apenas adicionar; senão, criar footer mínimo com esses e-mails + links `/termos` e `/privacidade` + ano.

### O que a Claude Code NÃO faz (é você, fora do ambiente)
- Criar as caixas de e-mail e o roteamento é **configuração de DNS/Cloudflare**, não código. A sugestão (Cloudflare Email Routing, grátis, redireciona pro Gmail) é uma TAREFA MANUAL SUA. Deixar um comentário no footer indicando que os endereços precisam existir de verdade antes do 1º cadastro.

---

## 3. Aceite de Termos no cadastro

- **Prioridade:** Média. **Gatilho:** depois que `/termos` e `/privacidade` existirem.
- **Rota:** `/auth/cadastro` (confirmar caminho real no repo).

### Requisitos travados
- **Checkbox obrigatório** no cadastro: "Li e aceito os Termos de Uso e a Política de Privacidade".
- Os textos "Termos de Uso" e "Política de Privacidade" são **links reais** para `/termos` e `/privacidade` (não placeholder, não `#`). Abrir em nova aba para não perder o formulário.
- O botão de concluir cadastro fica **desabilitado** enquanto o checkbox não estiver marcado.
- **Registrar o aceite:** ao cadastrar, persistir que o usuário aceitou (idealmente com data/hora e versão dos termos) — isso é o que dá valor probatório ao aceite. Se o backend ainda não guarda isso, adicionar o campo; se for muito, deixar TODO claro.
- Verificar se já existe checkbox no `cadastro.component` apontando para placeholder e corrigir os links.

---

## 4. Validações no cadastro (e-mail e celular)

Mesma tela do aceite de termos (`/auth/cadastro`) — fazer na mesma passada.

- **E-mail:** validar formato no front e no back. Idealmente, confirmação por link (double opt-in) para evitar e-mails inválidos na base — se o provedor de auth (Supabase) já oferece verificação de e-mail, **ativar/usar a existente** em vez de criar do zero; se não, deixar TODO claro. Mensagem de erro clara e em português.
- **Celular (WhatsApp):** validar formato brasileiro (DDI/DDD + número). Como o número é o que o WhatsApp vai usar para notificar, um número inválido aqui quebra o coração do produto silenciosamente. Bloquear cadastro com número malformado, mensagem clara.
- Reusar a MESMA validação de número usada no perfil (roteiro 09) — não duplicar regra de validação em dois lugares (código reutilizável).
- Acessibilidade: erros associados aos campos (`aria-describedby`).

## Critérios de aceite (checklist)

Banner de cookies
- [ ] Aparece em todas as páginas na 1ª visita; some após escolha; revisável depois.
- [ ] "Aceitar" e "Recusar" com peso visual igual.
- [ ] Categorias (necessários + opcionais), necessários não desligáveis.
- [ ] Link para `/privacidade`.
- [ ] Nada de analytics/rastreamento dispara antes do consentimento (opt-in).
- [ ] Escolha persistida; acessível; mobile-first.

Footer
- [ ] `contato@` e `privacidade@` como mailto no footer global.
- [ ] Comentário marcando que as caixas precisam ser criadas (DNS — tarefa manual).

Aceite no cadastro
- [ ] Checkbox obrigatório bloqueia o submit até marcar.
- [ ] Links reais para `/termos` e `/privacidade` (nova aba).
- [ ] Aceite registrado (data/versão) ou TODO claro se faltar suporte no backend.

Validações de cadastro
- [ ] E-mail validado (formato) front e back; verificação por link usada se já houver, senão TODO.
- [ ] Celular validado (formato brasileiro), bloqueia cadastro se inválido.
- [ ] Regra de validação de número compartilhada com o perfil (sem duplicar).
- [ ] Mensagens em português, erros associados aos campos.

Geral
- [ ] Build sem erros.

---

## Aviso

Itens com implicação de LGPD: base funcional, não parecer jurídico. O registro de aceite e o comportamento de consentimento de cookies devem ser revisados por advogado(a) antes de produção.
