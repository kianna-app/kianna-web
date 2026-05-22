# Roteiro para Claude Code — Painel Admin Interno (MVP mínimo)

## Objetivo

Criar um **painel administrativo interno** no Kianna onde o dono da plataforma (admin) possa, a partir de uma tela web protegida:
1. Listar todos os profissionais cadastrados.
2. Ver o status de conexão do WhatsApp de cada um.
3. Colar/editar as credenciais Z-API (Instance ID e Token) de cada profissional.

Isso elimina a necessidade de o admin logar na conta de cada profissional para configurar o WhatsApp manualmente.

## Princípios desta implementação

- **Mínimo viável.** NÃO criar tabel**a nova (`whatsapp_instancias`). Usar os cam**pos que JÁ existem na tabela `profissionais`: `wpp_instance_id`, `wpp_token`, `wpp_status`. A migração para tabela separada será feita no futuro, junto com a integração Partner API — NÃO agora.
- **Não inflar escopo.** Está FORA deste MVP (não implementar): geração de QR Code pelo painel admin, criação automática de instância via Partner API, edição de outros dados do profissional, paginação, busca avançada, exclusão de profissionais.
- **Correção cirúrgica.** Não alterar o fluxo de WhatsApp existente do profissional (tela de configurações dele, conexão via QR Code) — isso já funciona.

## Tarefa 1 — Coluna de admin

Adicionar uma flag de admin à tabela `profissionais` (caso ainda não exista):

```sql
ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
```

O admin (dono da plataforma) será marcado manualmente no Supabase com `is_admin = true`. NÃO criar sistema de roles/permissões — apenas esta flag booleana.

## Tarefa 2 — Backend: AdminGuard

Criar um guard NestJS (`AdminGuard`) que:
- Verifica se o usuário autenticado tem `is_admin === true` no banco.
- Reutiliza o mecanismo de autenticação JÁ existente (o mesmo guard/estratégia que protege as rotas autenticadas atuais, ex.: `/api/whatsapp/*`). NÃO criar autenticação nova — apenas estender a checagem para exigir `is_admin`.
- Retorna 403 se o usuário autenticado não for admin.

## Tarefa 3 — Backend: endpoints admin

Criar um `AdminController` (sugestão de prefixo: `/api/admin`) protegido pelo `AdminGuard`, com:

### `GET /api/admin/profissionais`
Retorna a lista de todos os profissionais com os campos necessários para o painel:
```
id, nome, slug, whatsapp, wpp_instance_id (mascarado ou completo — ver nota), wpp_status, created_at
```
- O `wpp_token` NÃO deve ser retornado nesta listagem (sensível). Retornar apenas um booleano `tem_token` indicando se está preenchido.

### `PUT /api/admin/profissionais/:id/whatsapp`
Recebe `{ wpp_instance_id, wpp_token }` e atualiza esses campos do profissional indicado.
- Validar que ambos vêm como string não-vazia (use class-validator no DTO).
- Após salvar, NÃO alterar `wpp_status` automaticamente (ele será atualizado pelo fluxo de conexão/webhook existente).
- Retornar confirmação simples `{ ok: true }`.

### (Opcional, se trivial) `GET /api/admin/profissionais/:id`
Retorna um profissional específico com `wpp_token` completo, para preencher o formulário de edição. Protegido pelo mesmo guard.

## Tarefa 4 — Frontend: tela /admin

Criar uma rota `/admin` no Angular, protegida por um route guard que verifica se o usuário logado é admin (consultar o backend ou um campo no perfil já carregado). Redirecionar não-admins para o dashboard normal.

A tela deve conter:
- **Tabela de profissionais** com colunas: Nome, Slug, WhatsApp (número), Status (badge colorido), e ação "Editar credenciais".
  - Badge de status: verde para `conectado`, cinza para `desconectado`/`pending`, vermelho para `erro`/`banido`.
- **Edição de credenciais** (pode ser um dialog/modal ou linha expansível) com dois campos: Instance ID e Token, e botão Salvar que chama `PUT /api/admin/profissionais/:id/whatsapp`.
- **Mascaramento do token:** ao exibir um token já salvo, mostrar mascarado (ex.: primeiros 4 + últimos 4 caracteres, `F334...1CDF`) com um botão de "revelar" para mostrar o valor completo sob demanda. Isso evita exposição acidental do token em screenshots/gravações de tela.

Manter o design consistente com o resto do Kianna (mesma paleta/componentes Material já usados). Não precisa ser elaborado — funcional e limpo.

## Tarefa 5 — Validação

- Garantir que o backend compila e os tipos batem.
- Garantir que `/api/admin/*` retorna 403 para usuário não-admin e 401 para não autenticado.
- Garantir que a rota `/admin` no frontend não é acessível por não-admin.
- NÃO quebrar o fluxo de WhatsApp existente do profissional.
- Commit sugerido: `feat(admin): painel administrativo interno para gerenciar credenciais Z-API dos profissionais`

## Notas finais

- Reutilizar ao máximo o que já existe (autenticação, cliente Supabase, componentes de UI). Não reinventar.
- Reportar ao final: arquivos criados/alterados e como marcar um usuário como admin (passo no Supabase).
- Em caso de dúvida sobre nomes de campos/tabelas reais, inspecionar o schema antes de assumir.