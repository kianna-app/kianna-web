# TASK — Rebranding: AgendaZap → Kianna
> Repositório atual: `agendazap-web` → renomear para `kianna-web`
> Domínio atual: `agendazap.tec` → novo: `kianna.com.br`
> Pré-requisito: Módulos 1 e 2 implementados ou em desenvolvimento
> Objetivo: substituir TODAS as referências ao nome antigo, sem quebrar nada

---

## ⚠️ LEIA ANTES DE COMEÇAR

Esta task **não acrescenta features** — apenas renomeia. Mas ela toca em **muitos arquivos**, então:

1. **Faça em uma branch separada:** `git checkout -b rebranding/kianna`
2. **Commits pequenos** por TAREFA — facilita reverter se algo quebrar
3. **Rode `npm start` após cada tarefa grande** pra garantir que nada quebrou
4. **Não toque em código de lógica** — apenas strings, nomes de arquivo, configurações
5. **Não delete o que não tem certeza** — em caso de dúvida, comente e me chame

### Convenções de busca-e-substituição

Use o **Find & Replace global** do VS Code (Ctrl+Shift+H) com **case-sensitive ligado**, nesta ordem:

| De | Para | Justificativa |
|---|---|---|
| `AgendaZap` | `Kianna` | Nome de marca, capitalizado |
| `agendazap` | `kianna` | Nome em URLs, slugs, paths |
| `AGENDAZAP` | `KIANNA` | Constantes em maiúscula |
| `agenda-zap` | `kianna` | Caso apareça com hífen |
| `AgendaZap.tec` | `Kianna.com.br` | Domínio capitalizado |
| `agendazap.tec` | `kianna.com.br` | Domínio em URL |

> 🚨 **NÃO substitua palavras genéricas como `agenda`, `zap`, `whatsapp`** — essas são termos do produto, não da marca. Substitua **APENAS** as combinações exatas acima.

### Emoji da marca

- **Antigo:** 📅 (calendário)
- **Novo:** ✨ (sparkles — alinhado com significado de Kianna em havaiano: "luz das estrelas / graça divina")

Substitua `📅` por `✨` em todos os arquivos `.html` e `.ts` que usam emoji como logo.

---

## TAREFA 1 — Renomear o repositório no GitHub

### 1.1 Criar nova organização (opcional, recomendado)

Acesse https://github.com/organizations/new e crie:
- **Organization name:** `kianna-app` (ou `kianna-tech` se preferir manter padrão antigo)
- **Plan:** Free

> Se preferir reusar a organização atual `agendazap-tech`, pule essa etapa e renomeie ela depois.

### 1.2 Renomear o repositório

1. Acesse https://github.com/agendazap-tech/agendazap-web
2. **Settings → General → Rename**
3. Novo nome: `kianna-web`
4. Confirme — o GitHub mantém redirect automático do nome antigo por 1 ano

> 💡 **Dica:** GitHub faz redirect transparente. Mesmo se alguém clonar do nome antigo, ainda funciona. Mas é bom atualizar todos os links/clones manualmente.

### 1.3 Atualizar o `origin` local

Na sua máquina, dentro da pasta do projeto:

```bash
git remote set-url origin https://github.com/agendazap-tech/kianna-web.git
# ou se renomear a org também:
git remote set-url origin https://github.com/kianna-app/kianna-web.git

# Confirmar:
git remote -v
```

### 1.4 Atualizar README e descrição

No GitHub, edite a descrição do repositório:
- **Antes:** "AgendaZap — micro SaaS de agendamento via WhatsApp"
- **Depois:** "Kianna — sua secretária digital de agendamentos via WhatsApp"

---

## TAREFA 2 — Configurações do projeto Angular

### 2.1 `package.json`

Edite `package.json`:

```json
{
  "name": "kianna-web",
  "version": "0.1.0",
  "description": "Kianna — sua secretária digital de agendamentos via WhatsApp",
  ...
}
```

Reinstale dependências pra atualizar o `package-lock.json`:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2.2 `angular.json`

Abra `angular.json` e busque por `agendazap-web` (provavelmente em `projects."agendazap-web"`). Substitua **somente o nome do projeto**:

```json
{
  "projects": {
    "kianna-web": {
      "projectType": "application",
      ...
    }
  }
}
```

> ⚠️ Se aparecer em `defaultProject` (Angular antigo) ou em scripts, atualize também.

### 2.3 `README.md`

Substitua o conteúdo por algo como:

```markdown
# Kianna ✨

Sua secretária digital de agendamentos via WhatsApp.

Plataforma SaaS de agendamento online para autônomos brasileiros — cabeleireiros, barbeiros, manicures, esteticistas, tatuadores e mais. O cliente agenda sozinho pelo link exclusivo do profissional, 24 horas por dia, e a Kianna confirma e lembra automaticamente pelo WhatsApp.

## Stack
- Angular 17+ (Standalone + SSR)
- Angular Material (tema verde Kianna)
- Supabase (Auth + Storage + PostgreSQL)
- Z-API (WhatsApp)
- Stripe (pagamentos)

## Desenvolvimento

\`\`\`bash
npm install
npm start
\`\`\`

Acesse http://localhost:4200

---

© Kianna · kianna.com.br
```

---

## TAREFA 3 — Constantes da aplicação

Edite `src/app/core/constants/app.constants.ts`:

```typescript
export const APP = {
  NOME: 'Kianna',
  DOMINIO: 'kianna.com.br',
  URL_BASE: 'https://kianna.com.br',
  EMOJI: '✨',
  TAGLINE: 'Sua secretária digital de agendamentos',
} as const;

// ... mantenha o resto do arquivo (BREAKPOINTS, STATUS_CORES, etc) inalterado
```

> 📌 Se você ainda não tinha `EMOJI` e `TAGLINE` nas constantes, adicione agora — vamos centralizar pra facilitar mudanças futuras.

---

## TAREFA 4 — Environments

### 4.1 `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  supabaseUrl:    'https://ocjsscsfggzwkgitzqlk.supabase.co',
  supabaseAnonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU',
  apiUrl:         'http://localhost:3000',
};
```

> ✅ Esse arquivo não tem nada de "AgendaZap" hardcoded. Verifique se não tem comentários antigos com o nome — se tiver, remova.

### 4.2 `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  supabaseUrl:    'https://ocjsscsfggzwkgitzqlk.supabase.co',
  supabaseAnonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU',
  apiUrl:         'https://api.kianna.com.br',
};
```

> ⚠️ Note a mudança em `apiUrl`: antes era `https://api.agendazap.tec`, agora `https://api.kianna.com.br`.

### 4.3 `src/environments/environment.example.ts`

```typescript
// Copie este arquivo para environment.ts e environment.prod.ts
// e preencha as credenciais reais. Esses dois arquivos estão no .gitignore.
export const environment = {
  production: false,
  supabaseUrl:    'COLE_AQUI_SUPABASE_URL',
  supabaseAnonKey:'COLE_AQUI_SUPABASE_ANON_KEY',
  apiUrl:         'http://localhost:3000',
};
```

---

## TAREFA 5 — Configurações do Supabase

### 5.1 Atualizar Site URL e Redirect URLs

1. Acesse https://supabase.com/dashboard/project/ocjsscsfggzwkgitzqlk
2. **Authentication → URL Configuration**
3. Atualize:
   - **Site URL:** mantenha `http://localhost:4200` (dev) — em produção será `https://kianna.com.br`
   - **Redirect URLs:** adicione `https://kianna.com.br/**` e remova `https://agendazap.tec/**` se existir

### 5.2 Sobre o nome do projeto Supabase

O projeto Supabase tem URL `https://ocjsscsfggzwkgitzqlk.supabase.co` — esse identificador **não muda** ao renomear o projeto. Você pode opcionalmente renomear o projeto na dashboard:

1. **Settings → General → Project name**
2. De: `agendazap` → Para: `kianna`

A URL do banco continua a mesma. Nada quebra.

---

## TAREFA 6 — Variáveis SCSS (paleta de cores)

Edite `src/styles/_variables.scss` e renomeie as variáveis:

> ⚠️ **Atenção:** isso vai exigir busca global pra atualizar quem usa essas variáveis. Faça **busca-e-substituição** em todo o projeto.

### 6.1 Renomear variáveis

```scss
// ── ANTES ──
// $agendazap-green-500: #1D9E75;
// $agendazap-slate-900: #0F172A;
// ...

// ── DEPOIS ──
$kianna-green-50:  #E8F8F3;
$kianna-green-100: #C5EDDF;
$kianna-green-200: #9EDFCB;
$kianna-green-300: #74D1B5;
$kianna-green-400: #52C7A4;
$kianna-green-500: #1D9E75;  // ← COR PRINCIPAL (mantém o verde, é a identidade)
$kianna-green-600: #178E67;
$kianna-green-700: #107B57;
$kianna-green-800: #0A6847;
$kianna-green-900: #054835;

$kianna-slate-900: #0F172A;
$kianna-slate-800: #1E293B;
// ... e assim por diante (substituir TODOS os $agendazap-* por $kianna-*)
```

### 6.2 Busca-e-substituição global em SCSS

No VS Code (Ctrl+Shift+H), **com filtro `*.scss`**:

| De | Para |
|---|---|
| `$agendazap-green-` | `$kianna-green-` |
| `$agendazap-slate-` | `$kianna-slate-` |
| `vars.$agendazap-green-` | `vars.$kianna-green-` |
| `vars.$agendazap-slate-` | `vars.$kianna-slate-` |

> 🚨 **Verifique** que nenhum arquivo `.scss` ainda tenha referência a `$agendazap-*` antes de prosseguir. Use **Ctrl+Shift+F** com `$agendazap` e o resultado deve ser zero.

### 6.3 Comentário do tema (opcional)

Em `src/styles/_theme.scss`, se tiver comentários como `// ── Paleta verde AgendaZap ──`, atualize pra `// ── Paleta verde Kianna ──`.

---

## TAREFA 7 — Componentes que mostram o nome da marca

> 💡 **Estratégia:** todos os componentes que mostram "AgendaZap" devem usar `APP.NOME` da TAREFA 3, não strings hardcoded. Isso facilita futuros rebrandings e garante consistência.

### 7.1 Login (`src/app/features/auth/login/login.component.html`)

Substitua o bloco da logo:

```html
<!-- ── ANTES ── -->
<!-- <div class="auth-logo">
  <span class="logo-icon">📅</span>
  <span class="logo-text">AgendaZap</span>
</div> -->

<!-- ── DEPOIS ── -->
<div class="auth-logo">
  <span class="logo-icon">{{ APP.EMOJI }}</span>
  <span class="logo-text">{{ APP.NOME }}</span>
</div>
```

E no `login.component.ts`, importe e exponha as constantes:

```typescript
import { APP } from '@core/constants/app.constants';

export class LoginComponent {
  readonly APP = APP;
  // ... resto do código
}
```

### 7.2 Cadastro (`src/app/features/auth/cadastro/cadastro.component.html` e `.ts`)

Mesma substituição da TAREFA 7.1.

### 7.3 Onboarding (`src/app/features/onboarding/onboarding.component.html` e `.ts`)

Mesma substituição.

### 7.4 Sidenav do dashboard (`src/app/features/dashboard/shell/sidenav/sidenav.component.html` e `.ts`)

Mesma substituição.

### 7.5 Bottom Nav (mobile) — só verificar

`src/app/features/dashboard/shell/bottom-nav/bottom-nav.component.html` provavelmente não tem o nome da marca. Verifique e ignore se não tiver.

### 7.6 Dashboard placeholder (caso ainda exista)

Se o componente do Módulo 1 ainda mostra "AgendaZap" hardcoded em algum lugar (placeholder antes do Módulo 2 ser implementado), atualize.

---

## TAREFA 8 — Títulos de página (browser tab)

Em todos os `loadComponent` com `title` nas rotas, atualize:

### 8.1 `src/app/features/auth/auth.routes.ts`

```typescript
{
  path: 'login',
  loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  title: 'Entrar — Kianna',
},
{
  path: 'cadastro',
  loadComponent: () => import('./cadastro/cadastro.component').then(m => m.CadastroComponent),
  title: 'Criar conta — Kianna',
},
```

### 8.2 `src/app/app.routes.ts`

```typescript
{
  path: 'onboarding',
  // ...
  title: 'Configurar perfil — Kianna',
},
```

### 8.3 `src/app/features/dashboard/dashboard.routes.ts`

```typescript
{
  path: 'agenda',
  // ...
  title: 'Agenda — Kianna',
},
{
  path: 'servicos',
  // ...
  title: 'Serviços — Kianna',
},
{
  path: 'horarios',
  // ...
  title: 'Horários — Kianna',
},
```

> 💡 **Refactor opcional:** crie uma função `pageTitle(secao: string)` em `app.constants.ts` que retorna `${secao} — ${APP.NOME}`. Aí futuros rebrandings ficam triviais.

---

## TAREFA 9 — index.html

Edite `src/index.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Kianna — Sua secretária digital de agendamentos</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Plataforma de agendamento online via WhatsApp para autônomos. Seus clientes agendam sozinhos pelo link exclusivo, 24 horas por dia.">
  <meta name="theme-color" content="#1D9E75">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>
```

> 📌 O `<title>` aqui é o fallback antes do Angular hidratar — depois ele é sobrescrito pelos `title` das rotas.

---

## TAREFA 10 — Favicon

### 10.1 Gerar favicon novo

O favicon atual provavelmente é o do Angular (vermelho). Vamos trocar por um Kianna ✨.

**Opção rápida (sem design):** usar emoji como favicon. Crie `src/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y="80" font-size="80">✨</text>
</svg>
```

E atualize `src/index.html`:

```html
<link rel="icon" type="image/svg+xml" href="favicon.svg">
```

> 💡 **Opção polida (recomendada pra produção):** quando tiver logo final, gere favicon em https://realfavicongenerator.net e substitua todos os arquivos.

### 10.2 Verificar `angular.json`

Em `angular.json → architect.build.options.assets`, confirme que `favicon.ico` ou `favicon.svg` está listado:

```json
"assets": [
  "src/favicon.svg",
  "src/assets"
],
```

---

## TAREFA 11 — Comentários e mensagens internas

Faça uma busca global por `agendazap` (case insensitive) e revise cada ocorrência restante:

```bash
# No terminal, dentro da raiz do projeto:
grep -r -i "agendazap" --include="*.ts" --include="*.html" --include="*.scss" --include="*.md" --include="*.json" .
```

Revise cada resultado e substitua. Locais comuns onde pode ter sobrado:

- Comentários em código
- Console.log de debug
- Mensagens de erro mostradas ao usuário
- Strings de e-mail (`contato@agendazap.tec`)
- Links em footers ou cabeçalhos
- Schemas de banco (improvável, mas verificar)

> 🚨 **Importante:** se você usar `git mv` em algum arquivo, faça commit imediatamente. Reorganizar arquivos sem commitar gera confusão.

---

## TAREFA 12 — Banco de dados Supabase (revisão)

### 12.1 O que MUDA

Praticamente nada. As tabelas `profissionais`, `servicos`, `disponibilidades`, `agendamentos` permanecem com os mesmos nomes — eles são genéricos, não têm "agendazap" no schema.

### 12.2 Verificações

Acesse o **SQL Editor** do Supabase e rode:

```sql
-- Buscar referências a "agendazap" em qualquer dado:
select * from public.profissionais where nome ilike '%agendazap%' or bio ilike '%agendazap%';

-- Verificar bucket de storage:
select * from storage.buckets where id = 'profiles';
```

Se aparecer algo, atualize manualmente.

### 12.3 Bucket de storage (não muda)

O bucket `profiles` permanece com o mesmo nome. O caminho dos avatares (`profiles/avatars/{user_id}.{ext}`) também não muda.

---

## TAREFA 13 — Verificação final e commit

### 13.1 Busca exaustiva por menções restantes

```bash
# Termos que NÃO devem mais existir no código (exceto histórico Git):
grep -r "agendazap" --include="*.ts" --include="*.html" --include="*.scss" --include="*.md" --include="*.json" .
grep -r "AgendaZap" --include="*.ts" --include="*.html" --include="*.scss" --include="*.md" --include="*.json" .
grep -r "AGENDAZAP" --include="*.ts" --include="*.html" --include="*.scss" --include="*.md" --include="*.json" .
grep -r "📅" --include="*.ts" --include="*.html" .  # Verificar se ainda há referência ao emoji antigo
```

**Resultado esperado:** zero linhas (exceto possivelmente no `.gitignore` ou em arquivos de histórico — pode ignorar).

### 13.2 Rodar o projeto

```bash
npm start
```

### 13.3 Checklist visual

Abra `http://localhost:4200` e confirme:

- [ ] Aba do navegador mostra "Kianna" no título
- [ ] Favicon aparece como ✨ (sparkles)
- [ ] Tela de login mostra "✨ Kianna" no logo
- [ ] Tela de cadastro idem
- [ ] Onboarding mostra "✨ Kianna" no header
- [ ] Sidenav do dashboard mostra "✨ Kianna" no topo
- [ ] Header do dashboard mostra link "kianna.com.br/seu-slug"
- [ ] Botão "Copiar link" copia URL com `kianna.com.br`
- [ ] Sem strings "AgendaZap" visíveis em nenhuma tela
- [ ] Sem emoji 📅 (calendário) visível em nenhuma tela
- [ ] Console do browser sem erros vermelhos
- [ ] Login/cadastro/onboarding funcionando normalmente (regressão)
- [ ] Dashboard carrega corretamente

### 13.4 Verificar tipos do TypeScript

```bash
npm run build -- --configuration=production
```

> Se tiver erro de tipo, é porque alguma referência a `agendazap-*` em SCSS ou import path quebrou. Volte na TAREFA 6.

### 13.5 Commit final e merge

```bash
git add .
git commit -m "refactor: rebranding AgendaZap → Kianna"
git push origin rebranding/kianna

# Abrir Pull Request no GitHub e fazer merge na main
```

---

## TAREFA 14 — Pós-rebranding (operacional)

### 14.1 Comprar domínios complementares

Acesse o Registro.br e adquira:

- ✅ `kianna.com.br` (R$ 40/ano) — principal
- ✅ `kianna.app.br` (~R$ 50/ano) — opcional, pra futuro app mobile
- ✅ `kianna.tec.br` (R$ 90/ano) — opcional, pra defesa de marca

### 14.2 Reservar redes sociais (URGENTE)

Reserve **hoje** os handles antes que alguém pegue:

- [ ] Instagram: `@kianna.app` ou `@usekianna`
- [ ] TikTok: idem
- [ ] Facebook: idem
- [ ] LinkedIn: criar página da empresa "Kianna"
- [ ] YouTube: canal "Kianna"

### 14.3 Email comercial

Configure pelo menos:

- `contato@kianna.com.br`
- `suporte@kianna.com.br`
- `noreply@kianna.com.br` (para envios automáticos do app)

> 💡 **Dica:** Cloudflare oferece email forwarding grátis. Cada um desses pode redirecionar pro seu Gmail pessoal sem custo.

### 14.4 Depositar marca no INPI (PRIORITÁRIO)

Você confirmou que **Kianna está livre** no INPI. Não perca tempo — deposite essa semana:

1. Acesse https://gru.inpi.gov.br
2. Gere a GRU (R$ 142 com desconto MEI/ME — código de serviço **389**)
3. Acesse https://busca.inpi.gov.br/pePI/ → "Marca → Depositar pedido"
4. Preencha:
   - **Forma de apresentação:** Nominativa (texto puro) — mais simples por agora. Pode adicionar a versão Mista (com logo) depois
   - **Classe NCL:** **42** (principal — Software como serviço, SaaS)
   - **Especificação sugerida:** *"Software como serviço (SaaS) para gestão de agendamentos online; aplicativo móvel para profissionais autônomos; plataforma de comunicação automatizada via mensagens; consultoria em tecnologia da informação."*
5. Pague a GRU e envie o pedido
6. Anote o **número do processo** retornado e cole em algum doc seu pra acompanhar

> 💡 **Considere também depositar em classe 35** (gestão de negócios) por mais R$ 142 — proteção adicional. Total: R$ 284. Cheap insurance pra defender a marca lá na frente.

---

## TAREFA 15 — Atualizar task cards e documentação

> Esta tarefa é pra mim (Claude conversacional), não pro Claude Code.

Após você confirmar que o rebranding está funcionando localmente, me avise pra eu atualizar:

- [ ] Task card do **Módulo 3** (próximo a desenvolver) já com nome Kianna
- [ ] Task card do **Módulo 4** (WhatsApp) idem
- [ ] Documentação de arquitetura do projeto

---

## ⚠️ Erros comuns e como resolver

### "Cannot find module '@/styles/variables'"
A TAREFA 6 quebrou um import. Procure por `$agendazap-` em todos os SCSS e substitua por `$kianna-`.

### Build falha com "Property 'APP' does not exist"
Você atualizou o template (HTML) com `{{ APP.NOME }}` mas esqueceu de adicionar `readonly APP = APP;` no componente TS. Volte na TAREFA 7.

### Imagens/avatares antigas com nome AgendaZap
Avatares no Storage do Supabase ficam com nome `{user_id}.{ext}` — não tem "agendazap" no nome. Se em algum lugar você fixou um path com "agendazap", atualize.

### Git remote ainda apontando para nome antigo
Rode `git remote set-url origin https://github.com/.../kianna-web.git` (TAREFA 1.3).

### Tela em branco após rebranding
Provavelmente erro de SCSS não encontrando variável. Abra o console do browser e leia a mensagem. Geralmente é uma referência `$agendazap-*` que escapou. Use Ctrl+Shift+F.

---

## ✅ Checklist final do rebranding

Quando todos os itens abaixo estiverem ✅, você terminou:

- [ ] Repositório renomeado no GitHub
- [ ] `package.json`, `angular.json`, `README.md` atualizados
- [ ] Constantes em `app.constants.ts` com nome novo + emoji ✨
- [ ] Variáveis SCSS renomeadas (`$kianna-*`)
- [ ] Componentes usando `APP.NOME` e `APP.EMOJI` em vez de hardcoded
- [ ] Títulos de página com "— Kianna"
- [ ] `index.html` com title, meta description e favicon novos
- [ ] Favicon ✨ visível na aba do browser
- [ ] Build de produção sem erros (`npm run build -- --configuration=production`)
- [ ] Sem ocorrências de "agendazap" no código (case insensitive)
- [ ] Sem emoji 📅 no código
- [ ] Supabase URL Configuration atualizado
- [ ] Domínio kianna.com.br comprado
- [ ] Marca Kianna depositada no INPI
- [ ] Handles em redes sociais reservados

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Versão 1.0.0-rebranding
