# ROTEIRO CLAUDE CODE — /admin: CRUD de Perfil do Profissional

**Objetivo:** Evoluir o painel `/admin` (hoje só gerencia credenciais Z-API) para uma ferramenta de operador onde o **dono da plataforma** configura a **página/perfil do profissional** no lugar dele. Acesso restrito a admin. Estilo visual livre do padrão do app: **minimalista, responsivo, moderno, linha iOS/Apple**.

> **Contexto para você (Claude Code):** você conhece o sistema. **Inspecione o modelo de dados real** (entidade/tabela `profissionais`, DTOs, service existente) e use os nomes de campo corretos do projeto. Este roteiro define escopo, comportamento e design; a implementação concreta segue o que já existe no repo (o `/admin`, o `AdminGuard`, os endpoints `/api/admin/...` já criados na sessão anterior).

---

## Escopo desta sessão (travado)

- **Bloco de dados:** APENAS **Perfil** do profissional — nome, bio, foto, slug/URL pública. (Serviços, horários e contato ficam para sessões futuras — não implementar agora.)
- **Operações:** CRUD completo — Criar, Ler, Editar, Excluir.
- **Acesso:** somente admin (reutilizar `AdminGuard` e a autenticação existente).

---

## Comportamento de cada operação

### Ler (listar + detalhe)
- A lista de profissionais já existe no `/admin`. Reaproveitar. Cada linha leva ao detalhe/edição do perfil.
- Detalhe mostra os campos de perfil atuais + preview do slug público (ex.: link clicável para a página pública `/{slug}`).

### Editar
- Formulário de perfil: **nome**, **bio**, **foto**, **slug**.
- **Slug:** validar unicidade e formato (minúsculas, sem espaço/acento, hífen). Se o slug mudar, a URL pública muda — avisar isso na UI (a página antiga deixa de funcionar). Se já existe lógica de slug no projeto, reaproveitar.
- **Foto:** upload de imagem. Inspecione como o projeto já lida com upload/storage (Supabase Storage?) e reutilize. Mostrar preview e permitir trocar/remover.
- Salvar via endpoint admin (estender os `/api/admin/profissionais/:id`). Feedback de sucesso/erro claro.

### Criar
- "Criar profissional" pelo admin = registro **pré-cadastrado** pelo operador (sem o fluxo normal de signup do profissional).
- **Ponto a resolver (você decide com base no que existe):** como o profissional assume a conta depois? Se já houver fluxo de convite/magic-link/definição de senha, reaproveite. Se não houver, crie o registro com um estado claro (ex.: `pendente`/sem senha) e **deixe um TODO comentado** explicando que o acesso do profissional precisa ser definido depois — não invente um fluxo de auth completo nesta sessão.
- Campos mínimos na criação: nome + e-mail (identificador) + slug. Bio e foto podem ser preenchidos depois na edição.

### Excluir — **soft-delete por padrão (importante)**
Excluir profissional é a operação mais perigosa: há agendamentos, clientes, dados de terceiros (LGPD) e possivelmente instância Z-API vinculados.

- **Padrão = soft-delete:** marcar como inativo/arquivado (ex.: campo `deleted_at` ou `ativo=false` — use o que combinar com o schema). Some das listagens normais, recuperável, **não apaga dados vinculados**.
- **Confirmação dupla** antes de excluir: modal exigindo digitar o nome ou o slug do profissional para confirmar (padrão de "ação destrutiva").
- Deixar visível em algum lugar os arquivados (filtro "mostrar inativos") com opção de **restaurar**.
- **Hard-delete (apagar de vez):** NÃO implementar como ação padrão. Se for incluído, que seja escondido, com aviso explícito sobre dados vinculados e LGPD, e separado do soft-delete. Preferência: deixar fora desta sessão e marcar como TODO.

---

## Design — linha iOS / Apple (concreto, não genérico)

O objetivo é parecer a tela de **Ajustes do iOS / app nativo Apple**, não um admin Bootstrap genérico. Diretrizes concretas:

- **Layout:** muito espaço em branco. Conteúdo em coluna central com largura máxima confortável (~640–760px no desktop), respirando nas laterais. Mobile-first, responsivo de verdade.
- **Agrupamento em "inset grouped lists":** campos agrupados em cards de cantos arredondados (~12–16px de raio), fundo branco/levemente elevado sobre um fundo cinza-claro (`#F2F2F7` no claro). Cada grupo com um título pequeno em caixa alta suave acima dele — padrão dos Ajustes do iOS.
- **Tipografia:** fonte do sistema (`-apple-system, SF Pro, Inter` como fallback). Hierarquia clara: título grande e bold no topo, labels discretos, corpo legível. Sem excesso de pesos.
- **Cor:** base neutra (cinzas/branco). Um único accent (azul iOS `#007AFF` ou o accent da marca Kianna, se houver). Vermelho iOS (`#FF3B30`) reservado só para ações destrutivas (excluir).
- **Controles:** inputs com fundo sutil e cantos arredondados; toggles no estilo switch do iOS quando houver booleano; botões com bom alvo de toque (≥44px de altura). Transições suaves e discretas.
- **Sombras:** sutis e baixas, nada pesado. Profundidade pela cor de fundo e separadores finos (`hairline`), não por bordas grossas.
- **Estados:** loading (skeleton ou spinner discreto), vazio (mensagem amigável quando não há profissionais), erro (mensagem clara), sucesso (feedback breve, ex.: toast).
- **Modo escuro:** se o app já suporta, respeitar; senão, opcional.
- Pode usar o skill de frontend-design como referência de qualidade, mas o **estilo é iOS minimalista**, sobrepondo o design system padrão do app neste módulo.

> Não usar bibliotecas pesadas de UI só pra isso. Tailwind (se já no projeto) ou CSS puro bem feito é suficiente. Evite o "visual de admin template".

---

## Backend

- Estender os endpoints admin existentes (`/api/admin/profissionais`, `/api/admin/profissionais/:id`) para cobrir o CRUD de perfil. Manter o `AdminGuard`.
- Validação de entrada (slug, e-mail, tamanho de bio, tipo/tamanho de imagem).
- Soft-delete no service (não remover do banco por padrão).
- Inspecionar o `ZapiService`/credenciais já integrados ao detalhe do profissional — não quebrar o que já existe (o painel já edita credenciais Z-API; o perfil é uma seção adicional, não substituição).

---

## Critérios de aceite (checklist)

- [ ] `/admin` continua protegido por `AdminGuard`; nada exposto sem admin.
- [ ] Listar profissionais (reaproveitando o existente) com acesso ao perfil.
- [ ] Editar perfil: nome, bio, foto (upload + preview), slug (com validação de unicidade/formato e aviso de mudança de URL).
- [ ] Criar profissional pré-cadastrado (nome, e-mail, slug); fluxo de acesso do profissional reaproveitado ou marcado como TODO claro.
- [ ] Excluir = soft-delete com confirmação dupla; arquivados visíveis e restauráveis; hard-delete NÃO é a ação padrão.
- [ ] Visual iOS/Apple minimalista, responsivo, mobile-first; não parece admin genérico.
- [ ] Estados de loading/vazio/erro/sucesso tratados.
- [ ] A edição de credenciais Z-API existente continua funcionando.
- [ ] Build passa sem erros.

---

## Fora de escopo (não fazer agora)

- Serviços, horários/disponibilidade, contato e redes (sessões futuras).
- Geração de QR Code / criação automática de instância (Partner API — já estava fora).
- Fluxo completo de autenticação/convite do profissional, se não existir (marcar TODO).
- Hard-delete como ação padrão.
