# ROTEIRO CLAUDE CODE — 01: Página de Perfil

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md` (design + não-funcionais).
**Objetivo:** Criar a página de **Perfil** do profissional, acessível por um novo link no sidebar, reunindo dados da conta, ações de gestão e upsell de plano.

---

## Acesso e navegação

- Adicionar item **"Perfil"** no sidebar do dashboard do profissional (ícone + label), apontando para a rota nova (ex.: `/perfil`). Posição: junto aos itens de conta/configuração.
- Rota protegida pela auth de profissional existente.

## Conteúdo da página

Organizar em seções (estilo lista agrupada / cards):

### 1. Identificação
- **Nome** do profissional.
- **E-mail** — hoje não está visível; exibir aqui. (Inspecionar de onde vem o e-mail no `me`/perfil; se não estiver no payload, incluir.)
- Foto/avatar, se já existir no modelo.

### 2. Plano atual (destaque)
- **Destacar o tipo de plano** que o profissional usa (Essencial / Pro / Studio — conforme V3).
- **Card de upsell:** comparar o plano atual com o **plano imediatamente superior**, salientando **o que o cliente está perdendo** por não ter o de cima.
  - Ex.: se está no Essencial, mostrar que o Pro inclui **WhatsApp completo** (destaque — é o coração do produto), e o que mais o diferencia.
  - Se já está no plano topo (Studio), não mostrar upsell — mostrar estado "Você está no plano máximo".
  - Botão do card leva à **Página de Upgrade** (roteiro 02).
- Fonte dos dados de plano: inspecionar como o plano do profissional está modelado. Se ainda não houver, usar a estrutura do V3 e marcar `[[ ]]` onde faltar dado real.

### 3. Link público (com nota LGPD)
- Exibir o **link da página pública** do profissional (`/{slug}`).
- Botão **"Copiar link"** (copia para a área de transferência + feedback de sucesso).
- **Nota LGPD curta** próxima ao link: lembrar que a página pública expõe dados e que o profissional é responsável pelos dados de seus clientes ali tratados. (Texto enxuto; ligado às páginas /termos e /privacidade quando existirem.)

### 4. Ações da conta (botões)
- **Editar perfil** — abre formulário de edição (nome, bio, foto, slug conforme o modelo). Reaproveitar validação de slug (unicidade/formato) se já existir.
- **Alterar senha** — fluxo de troca de senha (senha atual + nova + confirmação, ou o fluxo que a auth do projeto já suporta; se for Supabase Auth, usar o método correspondente).
- **Excluir conta** — **soft-delete** (desativa, recuperável), com **modal de confirmação** exigindo confirmação explícita (ex.: digitar e-mail ou palavra de confirmação). Após excluir: logout + mensagem. NÃO apagar dados vinculados (agendamentos, clientes, instância) — apenas marcar a conta como inativa. Deixar claro na UI o que acontece (conta desativada, dados preservados conforme política).
- **Logout** — encerra a sessão.

## Backend

- Endpoint(s) para: ler perfil completo (incluindo e-mail e plano), atualizar perfil, alterar senha, soft-delete da própria conta.
- Soft-delete: marcar `deleted_at`/`ativo=false` (usar o que combinar com o schema); a conta desativada não deve mais autenticar.
- Logar as operações de edição/alteração de senha/exclusão (observabilidade), sem logar dados sensíveis.

## Critérios de aceite

- [ ] Link "Perfil" no sidebar, rota protegida.
- [ ] E-mail visível.
- [ ] Plano atual destacado.
- [ ] Card de upsell comparando com plano superior (ou estado "plano máximo"), com WhatsApp em destaque, levando ao Upgrade.
- [ ] Link público exibido + botão copiar + nota LGPD.
- [ ] Botões: editar perfil, alterar senha, excluir conta (soft-delete + confirmação), logout — todos funcionais.
- [ ] Estados de loading/erro/sucesso tratados.
- [ ] Build sem erros.
