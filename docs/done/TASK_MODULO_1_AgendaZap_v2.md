# TASK — Módulo 1: Fundação do AgendaZap Web (v2)
>
> Repositório: https://github.com/agendazap-tech/agendazap-web.git
> Framework: Angular 17+ · Angular Material · Signals · Supabase Auth · SSR
> Objetivo: setup completo + auth funcional + onboarding do profissional

---

## Contexto do projeto

O **AgendaZap** é uma plataforma SaaS de agendamento via WhatsApp para autônomos brasileiros.
Este módulo estabelece toda a fundação técnica do frontend: estrutura de pastas, tema visual,
autenticação e onboarding guiado do profissional. Nenhuma outra feature deve ser implementada
antes deste módulo estar 100% concluído.

**Stack decidida:**

- Angular 17+ com Standalone Components e SSR (`@angular/ssr`)
- Angular Material (tema customizado)
- Angular Signals para estado global
- Supabase JS SDK para auth + storage
- TypeScript strict mode ativado

**Credenciais Supabase (já criadas):**

- URL: `https://ocjsscsfggzwkgitzqlk.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU`

---

## Pré-requisitos (verificar antes de iniciar)

```bash
node --version   # deve ser >= 20
npm --version    # deve ser >= 10
ng version       # Angular CLI >= 17
git --version    # qualquer versão recente
```

Se o Angular CLI não estiver instalado:
```bash
npm install -g @angular/cli@latest
```

---

## TAREFA 1 — Clonar e inicializar o repositório

### 1.1 Clonar o repositório

```bash
git clone https://github.com/agendazap-tech/agendazap-web.git
cd agendazap-web
```

### 1.2 Criar o projeto Angular dentro do repositório

> ⚠️ Se o repositório estiver vazio (sem `package.json`), rode dentro da pasta clonada:

```bash
ng new . \
  --standalone \
  --routing \
  --ssr \
  --style=scss \
  --skip-git \
  --strict
```

Responda às perguntas do CLI:

- `Which stylesheet format?` → **SCSS**
- `Enable SSR?` → **Yes**

### 1.3 Configuração inicial do TypeScript

Edite `tsconfig.json` e confirme que estas opções estão presentes (mescle com o que já existe, não substitua):

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictPropertyInitialization": false,
    "baseUrl": "./",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

---

## TAREFA 2 — Instalar todas as dependências

### 2.1 Angular Material

```bash
ng add @angular/material
```

Quando perguntado:

- `Choose a prebuilt theme` → **Custom** (vamos definir o tema manualmente)
- `Set up global Angular Material typography?` → **Yes**
- `Include the Angular animations module?` → **Yes**

### 2.2 Supabase

```bash
npm install @supabase/supabase-js
```

### 2.3 Utilitários de data

```bash
npm install date-fns date-fns-tz
```

### 2.4 Dependências de dev / auxiliares

```bash
npm install --save-dev @types/node
```

### 2.5 Verificar package.json após instalações

O `package.json` deve conter ao final:

```json
{
  "dependencies": {
    "@angular/animations": "^17.x",
    "@angular/cdk": "^17.x",
    "@angular/material": "^17.x",
    "@supabase/supabase-js": "^2.x",
    "date-fns": "^3.x",
    "date-fns-tz": "^3.x"
  }
}
```

---

## TAREFA 3 — Estrutura de pastas

Criar a seguinte estrutura dentro de `src/app/`:

```
src/
├── app/
│   ├── core/                          ← singleton services, guards, interceptors
│   │   ├── auth/
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── signals/
│   │   │   └── app.signals.ts         ← signals globais
│   │   ├── supabase/
│   │   │   └── supabase.client.ts
│   │   └── utils/
│   │       └── slug.util.ts
│   │
│   ├── features/                      ← módulos de funcionalidade
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   └── login.component.html
│   │   │   ├── cadastro/
│   │   │   │   ├── cadastro.component.ts
│   │   │   │   └── cadastro.component.html
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── onboarding.component.ts
│   │   │   └── onboarding.component.html
│   │   │
│   │   └── dashboard/                 ← implementado no Módulo 2
│   │       ├── dashboard.component.ts ← placeholder mínimo
│   │       └── dashboard.routes.ts
│   │
│   ├── shared/                        ← components reutilizáveis
│   │   └── components/
│   │       └── not-found/
│   │           └── not-found.component.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts                 ← real (NÃO COMMITAR)
│   ├── environment.prod.ts            ← real (NÃO COMMITAR)
│   └── environment.example.ts         ← placeholder commitado
│
└── styles/
    ├── _theme.scss                    ← tema Angular Material
    └── _variables.scss                ← variáveis SCSS globais
```

> ⚠️ Criar todos os arquivos listados. Arquivos de componente podem estar vazios por enquanto,
> mas a estrutura de pastas deve existir completamente.

---

## TAREFA 4 — Tema visual Angular Material

### 4.1 Paleta de cores do AgendaZap

Edite `src/styles/_variables.scss`:

```scss
// ── Cores primárias ──────────────────────────────────────────
$agendazap-green-50:  #E8F8F3;
$agendazap-green-100: #C5EDDF;
$agendazap-green-200: #9EDFCB;
$agendazap-green-300: #74D1B5;
$agendazap-green-400: #52C7A4;
$agendazap-green-500: #1D9E75;  // ← COR PRINCIPAL
$agendazap-green-600: #178E67;
$agendazap-green-700: #107B57;
$agendazap-green-800: #0A6847;
$agendazap-green-900: #054835;

// ── Cores de superfície (dark tone) ─────────────────────────
$agendazap-slate-900: #0F172A;  // ← fundo escuro sidebar
$agendazap-slate-800: #1E293B;
$agendazap-slate-700: #334155;
$agendazap-slate-600: #475569;
$agendazap-slate-500: #64748B;
$agendazap-slate-400: #94A3B8;
$agendazap-slate-300: #CBD5E1;
$agendazap-slate-200: #E2E8F0;
$agendazap-slate-100: #F1F5F9;
$agendazap-slate-50:  #F8FAFC;

// ── Cores de status ─────────────────────────────────────────
$status-confirmado:  #1D9E75;
$status-pendente:    #D97706;
$status-cancelado:   #E11D48;

// ── Tipografia ───────────────────────────────────────────────
$font-primary: 'Inter', 'Roboto', sans-serif;
$font-mono:    'Fira Code', 'JetBrains Mono', monospace;
```

### 4.2 Tema Angular Material customizado

Edite `src/styles/_theme.scss`:

```scss
@use '@angular/material' as mat;
@use 'variables' as vars;

// ── Incluir estilos base do Material ────────────────────────
@include mat.core();

// ── Paleta verde primária ────────────────────────────────────
$agendazap-primary: mat.define-palette((
  50:   vars.$agendazap-green-50,
  100:  vars.$agendazap-green-100,
  200:  vars.$agendazap-green-200,
  300:  vars.$agendazap-green-300,
  400:  vars.$agendazap-green-400,
  500:  vars.$agendazap-green-500,
  600:  vars.$agendazap-green-600,
  700:  vars.$agendazap-green-700,
  800:  vars.$agendazap-green-800,
  900:  vars.$agendazap-green-900,
  contrast: (
    50:   vars.$agendazap-slate-900,
    100:  vars.$agendazap-slate-900,
    200:  vars.$agendazap-slate-900,
    300:  vars.$agendazap-slate-900,
    400:  vars.$agendazap-slate-900,
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
  )
), 500, 300, 700);

// ── Paleta de acento (slate) ─────────────────────────────────
$agendazap-accent: mat.define-palette(mat.$blue-grey-palette, 700, 400, 900);

// ── Paleta de alerta ─────────────────────────────────────────
$agendazap-warn: mat.define-palette(mat.$red-palette, 600);

// ── Tema claro ───────────────────────────────────────────────
$agendazap-theme: mat.define-light-theme((
  color: (
    primary: $agendazap-primary,
    accent:  $agendazap-accent,
    warn:    $agendazap-warn,
  ),
  typography: mat.define-typography-config(
    $font-family: vars.$font-primary,
  ),
  density: 0,
));

// ── Aplicar tema globalmente ─────────────────────────────────
@include mat.all-component-themes($agendazap-theme);
```

### 4.3 Arquivo principal de estilos

Edite `src/styles.scss`:

```scss
@use 'styles/theme';
@use 'styles/variables' as vars;

// ── Google Fonts ─────────────────────────────────────────────
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');

// ── Reset base ───────────────────────────────────────────────
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  font-family: vars.$font-primary;
  background-color: vars.$agendazap-slate-50;
  color: vars.$agendazap-slate-900;
  -webkit-font-smoothing: antialiased;
}

// ── Utilitários globais ───────────────────────────────────────
.text-primary    { color: vars.$agendazap-green-500 !important; }
.bg-primary      { background-color: vars.$agendazap-green-500 !important; }
.text-muted      { color: vars.$agendazap-slate-500 !important; }
.full-width      { width: 100%; }

// ── Scrollbar personalizada ───────────────────────────────────
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: vars.$agendazap-slate-300;
  border-radius: 3px;
}

// ── Ajustes de componentes Material ─────────────────────────
.mat-mdc-card {
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,.08) !important;
}

.mat-mdc-raised-button.mat-primary {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: .02em;
}
```

---

## TAREFA 5 — Configuração do Supabase + .gitignore

### 5.1 Adicionar environments ao `.gitignore`

Edite `.gitignore` na raiz do projeto e **adicione no final**:

```gitignore

# ── Environments com credenciais reais ─────────────
/src/environments/environment.ts
/src/environments/environment.prod.ts
!/src/environments/environment.example.ts
```

### 5.2 Variáveis de ambiente — arquivo de exemplo (commitado)

Crie `src/environments/environment.example.ts`:

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

### 5.3 Variáveis de ambiente — desenvolvimento (NÃO commitar)

Crie `src/environments/environment.ts` com as credenciais reais:

```typescript
export const environment = {
  production: false,
  supabaseUrl:    'https://ocjsscsfggzwkgitzqlk.supabase.co',
  supabaseAnonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU',
  apiUrl:         'http://localhost:3000',
};
```

### 5.4 Variáveis de ambiente — produção (NÃO commitar)

Crie `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabaseUrl:    'https://ocjsscsfggzwkgitzqlk.supabase.co',
  supabaseAnonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU',
  apiUrl:         'https://api.agendazap.tec',
};
```

> 📌 **Nota de segurança:** a `anonKey` é projetada pra ser pública — a segurança vem do RLS no banco.
> Mesmo assim, mantemos os arquivos fora do git como boa prática (e pra facilitar trocar credenciais entre ambientes no futuro).

### 5.5 Cliente Supabase singleton

Crie `src/app/core/supabase/supabase.client.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

---

## TAREFA 6 — Signals globais de autenticação

Crie `src/app/core/signals/app.signals.ts`:

```typescript
import { signal, computed } from '@angular/core';

// ── Tipos ────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  user_id: string;
  email?: string;
  nome: string;
  slug: string;
  foto_url: string | null;
  whatsapp: string;
  especialidade?: string;
  bio?: string;
  plano: 'gratis' | 'pro' | 'studio';
  onboarding_concluido: boolean;
}

// ── Signals globais ──────────────────────────────────────────
export const currentUser     = signal<AppUser | null>(null);
export const isLoading       = signal<boolean>(true);
export const authInitialized = signal<boolean>(false);

// ── Computed (derivados) ─────────────────────────────────────
export const isAuthenticated  = computed(() => currentUser() !== null);
export const isOnboardingDone = computed(() => currentUser()?.onboarding_concluido ?? false);
export const userPlano        = computed(() => currentUser()?.plano ?? 'gratis');
export const isPro            = computed(() => userPlano() !== 'gratis');
```

---

## TAREFA 7 — Auth Service

Crie `src/app/core/auth/auth.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, isLoading, authInitialized, AppUser } from '@core/signals/app.signals';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // ── Inicializar sessão ao abrir o app ───────────────────────
  async initialize(): Promise<void> {
    isLoading.set(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } finally {
      isLoading.set(false);
      authInitialized.set(true);
    }

    // Ouvir mudanças de sessão em tempo real
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        currentUser.set(null);
      }
    });
  }

  // ── Cadastro ─────────────────────────────────────────────────
  async signUp(email: string, senha: string, nome: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw error;
    // Perfil em `profissionais` é criado no onboarding (TAREFA 12)
  }

  // ── Login ────────────────────────────────────────────────────
  async signIn(email: string, senha: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  // ── Logout ───────────────────────────────────────────────────
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Recuperar senha ──────────────────────────────────────────
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    });
    if (error) throw error;
  }

  // ── Carregar perfil do banco ─────────────────────────────────
  private async loadUserProfile(userId: string): Promise<void> {
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      currentUser.set(data as AppUser);
    } else {
      // Usuário autenticado mas SEM linha em profissionais → onboarding pendente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUser.set({
          id: '',
          user_id: user.id,
          email: user.email,
          nome: (user.user_metadata?.['nome'] as string) ?? '',
          slug: '',
          foto_url: null,
          whatsapp: '',
          plano: 'gratis',
          onboarding_concluido: false,
        });
      }
    }
  }

  // ── Token para o NestJS ──────────────────────────────────────
  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }
}
```

> ⚠️ **Diferença importante vs. v1:** Como o `Confirm email` está desabilitado no Supabase (TAREFA 14.5),
> o usuário entra direto após o cadastro **sem ter linha em `profissionais` ainda**. O guard precisa
> reconhecer esse estado como "onboarding pendente" e não como "não autenticado". Por isso o
> `loadUserProfile` cria um `AppUser` parcial com `onboarding_concluido: false` quando não acha o perfil.

---

## TAREFA 8 — Auth Guard e Interceptor

### 8.1 Guard de autenticação

Crie `src/app/core/auth/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthenticated, isOnboardingDone } from '@core/signals/app.signals';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  if (!isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Se onboarding não concluído e não está na rota de onboarding
  const requiresOnboarding = route.data?.['requiresOnboarding'] !== false;
  if (requiresOnboarding && !isOnboardingDone()) {
    router.navigate(['/onboarding']);
    return false;
  }

  return true;
};

// Guard para rotas públicas (redireciona logado para dashboard ou onboarding)
export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (isAuthenticated()) {
    if (isOnboardingDone()) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/onboarding']);
    }
    return false;
  }
  return true;
};
```

### 8.2 Interceptor HTTP (adiciona Bearer token)

Crie `src/app/core/auth/auth.interceptor.ts`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Só adicionar token nas chamadas para nossa API NestJS
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (!token) return next(req);
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
```

---

## TAREFA 9 — Rotas e configuração do app

### 9.1 Rotas principais

Edite `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  // ── Redirect raiz ───────────────────────────────────────────
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // ── Autenticação ─────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },

  // ── Onboarding ───────────────────────────────────────────────
  {
    path: 'onboarding',
    canActivate: [authGuard],
    data: { requiresOnboarding: false },
    loadComponent: () =>
      import('./features/onboarding/onboarding.component')
        .then(m => m.OnboardingComponent),
    title: 'Configurar perfil — AgendaZap',
  },

  // ── Dashboard (protegido) ────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes')
        .then(m => m.dashboardRoutes),
  },

  // ── 404 ──────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
```

> ⚠️ **Removido vs. v1:** A rota pública `/p/:slug` foi removida deste módulo — ela é responsabilidade
> do **Módulo 3** (Página pública de agendamento). Manter o stub aqui criaria erro de import.

### 9.2 Rotas de autenticação

Crie `src/app/features/auth/auth.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
    title: 'Entrar — AgendaZap',
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./cadastro/cadastro.component').then(m => m.CadastroComponent),
    title: 'Criar conta — AgendaZap',
  },
];
```

### 9.3 Rotas do dashboard (placeholder do Módulo 2)

Crie `src/app/features/dashboard/dashboard.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — AgendaZap',
  },
];
```

Crie `src/app/features/dashboard/dashboard.component.ts` (placeholder mínimo):

```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 40px; max-width: 720px; margin: 0 auto;">
      <h1 style="color: #1D9E75;">Olá, {{ currentUser()?.nome }} 👋</h1>
      <p style="color: #64748B; margin-top: 8px;">
        Seu dashboard será implementado no Módulo 2.
      </p>
      <p style="margin-top: 16px;">
        Seu link público: <strong>agendazap.tec/{{ currentUser()?.slug }}</strong>
      </p>
      <button mat-stroked-button color="warn" (click)="logout()" style="margin-top: 24px;">
        <mat-icon>logout</mat-icon> Sair
      </button>
    </div>
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  currentUser = currentUser;
  logout() { this.auth.signOut(); }
}
```

### 9.4 Componente 404

Crie `src/app/shared/components/not-found/not-found.component.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height: 100vh; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 12px; padding: 32px;">
      <h1 style="font-size: 64px; margin: 0; color: #1D9E75;">404</h1>
      <p style="color: #64748B;">Página não encontrada</p>
      <a routerLink="/" style="color: #1D9E75; font-weight: 600;">Voltar ao início</a>
    </div>
  `,
})
export class NotFoundComponent {}
```

### 9.5 App Config (providers globais)

Edite `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { AuthService } from '@core/auth/auth.service';

function initializeAuth(authService: AuthService) {
  return () => authService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    provideClientHydration(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
```

---

## TAREFA 10 — Tela de Login

### 10.1 Login Component (TS)

Crie `src/app/features/auth/login/login.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/auth/auth.service';
import { isOnboardingDone } from '@core/signals/app.signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg  = signal('');
  showSenha = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.signIn(this.form.value.email!, this.form.value.senha!);

      // Pequeno delay para o onAuthStateChange popular o currentUser
      await new Promise(r => setTimeout(r, 250));

      this.router.navigate([isOnboardingDone() ? '/dashboard' : '/onboarding']);
    } catch (err: any) {
      this.errorMsg.set('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

### 10.2 Login Component (HTML)

Crie `src/app/features/auth/login/login.component.html`:

```html
<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">
      <span class="logo-icon">📅</span>
      <span class="logo-text">AgendaZap</span>
    </div>

    <h1 class="auth-title">Bem-vindo de volta</h1>
    <p class="auth-subtitle">Entre na sua conta para acessar o dashboard</p>

    @if (errorMsg()) {
      <div class="auth-error">
        <mat-icon>error_outline</mat-icon>
        {{ errorMsg() }}
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>E-mail</mat-label>
        <input matInput formControlName="email" type="email"
               placeholder="seu@email.com" autocomplete="email">
        <mat-icon matPrefix>mail_outline</mat-icon>
        @if (form.get('email')?.hasError('email')) {
          <mat-error>Digite um e-mail válido</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Senha</mat-label>
        <input matInput formControlName="senha"
               [type]="showSenha() ? 'text' : 'password'"
               autocomplete="current-password">
        <mat-icon matPrefix>lock_outline</mat-icon>
        <button mat-icon-button matSuffix type="button"
                (click)="showSenha.set(!showSenha())">
          <mat-icon>{{ showSenha() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit"
              class="full-width submit-btn" [disabled]="isLoading()">
        @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Entrar
        }
      </button>

    </form>

    <p class="auth-footer">
      Ainda não tem conta?
      <a routerLink="/auth/cadastro">Criar conta grátis</a>
    </p>

  </div>
</div>
```

### 10.3 Estilos globais das telas de auth

Adicione ao final de `src/styles.scss`:

```scss
// ── Auth pages ───────────────────────────────────────────────
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1D9E75 100%);
  padding: 24px 16px;
}

.auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, .25);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;

  .logo-icon { font-size: 28px; }
  .logo-text  {
    font-size: 22px;
    font-weight: 700;
    color: #1D9E75;
    letter-spacing: -.5px;
  }
}

.auth-title    { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #0F172A; }
.auth-subtitle { font-size: 14px; color: #64748B; margin: 0 0 24px; }

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFF1F2;
  color: #9F1239;
  border: 1px solid #FECDD3;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 16px;
  mat-icon { font-size: 18px; }
}

.auth-form { display: flex; flex-direction: column; gap: 4px; }

.submit-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-footer {
  text-align: center;
  margin: 20px 0 0;
  font-size: 14px;
  color: #64748B;
  a { color: #1D9E75; font-weight: 600; text-decoration: none; }
}
```

---

## TAREFA 11 — Tela de Cadastro

### 11.1 Cadastro Component (TS)

Crie `src/app/features/auth/cadastro/cadastro.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '@core/auth/auth.service';

function senhasIguaisValidator(control: AbstractControl) {
  const senha    = control.get('senha');
  const confirma = control.get('confirmarSenha');
  if (senha?.value !== confirma?.value) {
    confirma?.setErrors({ senhasDiferentes: true });
  } else if (confirma?.hasError('senhasDiferentes')) {
    confirma?.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg  = signal('');
  showSenha = signal(false);

  form = this.fb.group({
    nome:           ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    senha:          ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required],
    termos:         [false, Validators.requiredTrue],
  }, { validators: senhasIguaisValidator });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.signUp(
        this.form.value.email!,
        this.form.value.senha!,
        this.form.value.nome!,
      );
      // Como Confirm email está desabilitado, faz login automático
      await this.auth.signIn(this.form.value.email!, this.form.value.senha!);
      await new Promise(r => setTimeout(r, 250));
      this.router.navigate(['/onboarding']);
    } catch (err: any) {
      const msg = (err?.message ?? '').toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        this.errorMsg.set('Esse e-mail já está cadastrado. Tente fazer login.');
      } else {
        this.errorMsg.set('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

> ⚠️ **Diferença importante vs. v1:** Como o `Confirm email` está **desabilitado** no Supabase
> durante o desenvolvimento (TAREFA 14.5), o usuário entra direto após o cadastro. A v1 mostrava
> uma tela "Verifique seu e-mail", que ficaria parada pra sempre porque não chega e-mail.
> Aqui já fazemos login automático e mandamos pro `/onboarding`.

### 11.2 Cadastro Component (HTML)

Crie `src/app/features/auth/cadastro/cadastro.component.html`:

```html
<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">
      <span class="logo-icon">📅</span>
      <span class="logo-text">AgendaZap</span>
    </div>

    <h1 class="auth-title">Criar conta grátis</h1>
    <p class="auth-subtitle">Comece a organizar seus agendamentos hoje</p>

    @if (errorMsg()) {
      <div class="auth-error">
        <mat-icon>error_outline</mat-icon>{{ errorMsg() }}
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nome completo</mat-label>
        <input matInput formControlName="nome" placeholder="Seu nome" autocomplete="name">
        <mat-icon matPrefix>person_outline</mat-icon>
        @if (form.get('nome')?.hasError('minlength')) {
          <mat-error>Mínimo 3 caracteres</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>E-mail</mat-label>
        <input matInput formControlName="email" type="email" autocomplete="email">
        <mat-icon matPrefix>mail_outline</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Senha (mín. 8 caracteres)</mat-label>
        <input matInput formControlName="senha"
               [type]="showSenha() ? 'text' : 'password'"
               autocomplete="new-password">
        <mat-icon matPrefix>lock_outline</mat-icon>
        <button mat-icon-button matSuffix type="button"
                (click)="showSenha.set(!showSenha())">
          <mat-icon>{{ showSenha() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Confirmar senha</mat-label>
        <input matInput formControlName="confirmarSenha" type="password"
               autocomplete="new-password">
        <mat-icon matPrefix>lock_outline</mat-icon>
        @if (form.get('confirmarSenha')?.hasError('senhasDiferentes')) {
          <mat-error>As senhas não coincidem</mat-error>
        }
      </mat-form-field>

      <mat-checkbox formControlName="termos" color="primary">
        <span style="font-size:13px">
          Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a>
        </span>
      </mat-checkbox>

      <button mat-raised-button color="primary" type="submit"
              class="full-width submit-btn" [disabled]="isLoading()">
        @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Criar conta grátis
        }
      </button>
    </form>

    <p class="auth-footer">
      Já tem conta? <a routerLink="/auth/login">Entrar</a>
    </p>

  </div>
</div>
```

---

## TAREFA 12 — Onboarding (Stepper em 3 passos)

### 12.1 Utilitário para gerar slug

Crie `src/app/core/utils/slug.util.ts`:

```typescript
export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')     // remove especiais
    .trim()
    .replace(/\s+/g, '-')             // espaços → hífen
    .replace(/-+/g, '-')              // hífens duplicados
    .slice(0, 50);
}

export function slugComSufixo(slug: string, sufixo: number): string {
  return `${slug}-${sufixo}`;
}
```

### 12.2 Onboarding Component (TS)

Crie `src/app/features/onboarding/onboarding.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';
import { gerarSlug, slugComSufixo } from '@core/utils/slug.util';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatStepperModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule,
  ],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: { showError: true },
  }],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  isLoading   = signal(false);
  errorMsg    = signal('');
  fotoPreview = signal<string | null>(null);
  fotoFile    = signal<File | null>(null);

  // ── Passo 1: Perfil ──────────────────────────────────────────
  perfilForm = this.fb.group({
    nome:          ['', [Validators.required, Validators.minLength(3)]],
    especialidade: ['', Validators.required],
    whatsapp:      ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    bio:           [''],
  });

  // ── Passo 2: Serviços ────────────────────────────────────────
  servicosForm = this.fb.group({
    nomeServico: ['', Validators.required],
    duracaoMin:  [60, Validators.required],
    preco:       [0, [Validators.required, Validators.min(0)]],
  });
  servicosCadastrados = signal<Array<{nome: string; duracao: number; preco: number}>>([]);

  // ── Passo 3: Horários ────────────────────────────────────────
  diasSemana = [
    { dia: 1, label: 'Seg' },
    { dia: 2, label: 'Ter' },
    { dia: 3, label: 'Qua' },
    { dia: 4, label: 'Qui' },
    { dia: 5, label: 'Sex' },
    { dia: 6, label: 'Sáb' },
    { dia: 0, label: 'Dom' },
  ];
  diasAtivos = signal<Set<number>>(new Set([1, 2, 3, 4, 5]));
  horaInicio = signal('09:00');
  horaFim    = signal('18:00');
  intervalo  = signal(60);

  duracoes = [15, 30, 45, 60, 90, 120, 180, 240];

  onFotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validação básica
    if (file.size > 2 * 1024 * 1024) {
      this.errorMsg.set('Foto muito grande (máx. 2 MB)');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('Arquivo precisa ser uma imagem');
      return;
    }
    this.errorMsg.set('');

    this.fotoFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.fotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  adicionarServico(): void {
    if (this.servicosForm.invalid) return;
    const v = this.servicosForm.value;
    this.servicosCadastrados.update(s => [
      ...s,
      { nome: v.nomeServico!, duracao: v.duracaoMin!, preco: v.preco! }
    ]);
    this.servicosForm.reset({ duracaoMin: 60, preco: 0 });
  }

  removerServico(index: number): void {
    this.servicosCadastrados.update(s => s.filter((_, i) => i !== index));
  }

  toggleDia(dia: number): void {
    this.diasAtivos.update(dias => {
      const novo = new Set(dias);
      if (novo.has(dia)) { novo.delete(dia); } else { novo.add(dia); }
      return novo;
    });
  }

  // Garante slug único: tenta o base, senão -2, -3, ...
  private async gerarSlugUnico(nomeBase: string): Promise<string> {
    const slugBase = gerarSlug(nomeBase);
    let slug = slugBase;
    let sufixo = 2;
    while (true) {
      const { data } = await supabase
        .from('profissionais')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!data) return slug;
      slug = slugComSufixo(slugBase, sufixo);
      sufixo++;
      if (sufixo > 50) throw new Error('Não foi possível gerar slug único');
    }
  }

  async concluirOnboarding(): Promise<void> {
    if (this.servicosCadastrados().length === 0) return;
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const nome = this.perfilForm.value.nome!;
      const slug = await this.gerarSlugUnico(nome);

      // 1. Upload foto (se houver)
      let foto_url: string | null = null;
      if (this.fotoFile()) {
        const ext  = this.fotoFile()!.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `avatars/${user.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('profiles')
          .upload(path, this.fotoFile()!, { upsert: true, contentType: this.fotoFile()!.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('profiles').getPublicUrl(path);
        foto_url = data.publicUrl;
      }

      // 2. Criar profissional
      const { data: profissional, error: profErr } = await supabase
        .from('profissionais')
        .insert({
          user_id:       user.id,
          nome,
          slug,
          foto_url,
          whatsapp:      this.perfilForm.value.whatsapp!,
          especialidade: this.perfilForm.value.especialidade!,
          bio:           this.perfilForm.value.bio || null,
          plano:         'gratis',
          onboarding_concluido: true,
        })
        .select()
        .single();
      if (profErr) throw profErr;

      // 3. Criar serviços
      const servicos = this.servicosCadastrados().map(s => ({
        profissional_id: profissional!.id,
        nome:        s.nome,
        duracao_min: s.duracao,
        preco:       s.preco,
        ativo:       true,
      }));
      const { error: servErr } = await supabase.from('servicos').insert(servicos);
      if (servErr) throw servErr;

      // 4. Criar disponibilidades
      const disponibilidades = Array.from(this.diasAtivos()).map(dia => ({
        profissional_id: profissional!.id,
        dia_semana:    dia,
        hora_inicio:   this.horaInicio(),
        hora_fim:      this.horaFim(),
        intervalo_min: this.intervalo(),
      }));
      const { error: dispErr } = await supabase.from('disponibilidades').insert(disponibilidades);
      if (dispErr) throw dispErr;

      // 5. Atualizar signal global
      currentUser.set({
        ...(profissional as any),
        onboarding_concluido: true,
      });

      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Erro no onboarding:', err);
      this.errorMsg.set(err.message ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

### 12.3 Onboarding Component (HTML)

Crie `src/app/features/onboarding/onboarding.component.html`:

```html
<div class="onboarding-wrapper">
  <div class="onboarding-header">
    <span class="logo-icon">📅</span>
    <span class="logo-text">AgendaZap</span>
  </div>

  @if (errorMsg()) {
    <div class="auth-error" style="max-width:680px; margin: 0 auto 16px;">
      <mat-icon>error_outline</mat-icon>{{ errorMsg() }}
    </div>
  }

  <mat-stepper [linear]="true" #stepper class="onboarding-stepper">

    <!-- PASSO 1: PERFIL -->
    <mat-step [stepControl]="perfilForm" label="Seu perfil">
      <form [formGroup]="perfilForm" class="step-form">
        <h2>Vamos configurar seu perfil</h2>
        <p class="step-desc">Essas informações aparecerão na sua página de agendamento</p>

        <!-- Foto -->
        <div class="foto-upload">
          <div class="foto-preview"
               [style.backgroundImage]="fotoPreview() ? 'url(' + fotoPreview() + ')' : 'none'">
            @if (!fotoPreview()) { <mat-icon>person</mat-icon> }
          </div>
          <label for="foto-input" class="foto-btn">
            <mat-icon>camera_alt</mat-icon> Adicionar foto
          </label>
          <input id="foto-input" type="file" accept="image/*"
                 (change)="onFotoChange($event)" style="display:none">
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome completo (aparece no link)</mat-label>
          <input matInput formControlName="nome">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Especialidade</mat-label>
          <mat-select formControlName="especialidade">
            <mat-option value="cabeleireiro">Cabeleireiro(a)</mat-option>
            <mat-option value="barbeiro">Barbeiro</mat-option>
            <mat-option value="manicure">Manicure / Nail Designer</mat-option>
            <mat-option value="esteticista">Esteticista</mat-option>
            <mat-option value="tatuador">Tatuador(a)</mat-option>
            <mat-option value="psicologo">Psicólogo(a)</mat-option>
            <mat-option value="personal">Personal Trainer</mat-option>
            <mat-option value="massoterapeuta">Massoterapeuta</mat-option>
            <mat-option value="outro">Outro</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>WhatsApp (com DDD)</mat-label>
          <input matInput formControlName="whatsapp" placeholder="(44) 99999-9999">
          <mat-icon matPrefix>phone</mat-icon>
          @if (perfilForm.get('whatsapp')?.hasError('pattern')) {
            <mat-error>Formato: (44) 99999-9999</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Bio (opcional)</mat-label>
          <textarea matInput formControlName="bio" rows="2"
                    placeholder="Uma frase curta sobre você"></textarea>
        </mat-form-field>

        <div class="step-actions">
          <button mat-raised-button color="primary" matStepperNext
                  [disabled]="perfilForm.invalid">
            Próximo <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </form>
    </mat-step>

    <!-- PASSO 2: SERVIÇOS -->
    <mat-step label="Seus serviços">
      <form [formGroup]="servicosForm" class="step-form">
        <h2>Quais serviços você oferece?</h2>
        <p class="step-desc">Adicione pelo menos 1 serviço para continuar</p>

        @if (servicosCadastrados().length > 0) {
          <div class="servicos-list">
            @for (s of servicosCadastrados(); track $index) {
              <div class="servico-chip">
                <span class="s-nome">{{ s.nome }}</span>
                <span class="s-meta">{{ s.duracao }}min · R$ {{ s.preco }}</span>
                <button type="button" class="s-remove"
                        (click)="removerServico($index)" aria-label="Remover">×</button>
              </div>
            }
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do serviço</mat-label>
          <input matInput formControlName="nomeServico" placeholder="Ex: Corte feminino">
        </mat-form-field>

        <div class="row-2col">
          <mat-form-field appearance="outline">
            <mat-label>Duração</mat-label>
            <mat-select formControlName="duracaoMin">
              @for (d of duracoes; track d) {
                <mat-option [value]="d">{{ d }} minutos</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Preço (R$)</mat-label>
            <input matInput formControlName="preco" type="number" min="0" step="0.01">
          </mat-form-field>
        </div>

        <button mat-stroked-button color="primary" type="button"
                (click)="adicionarServico()" [disabled]="servicosForm.invalid">
          <mat-icon>add</mat-icon> Adicionar serviço
        </button>

        <div class="step-actions">
          <button mat-button matStepperPrevious type="button">Voltar</button>
          <button mat-raised-button color="primary" matStepperNext
                  [disabled]="servicosCadastrados().length === 0">
            Próximo <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </form>
    </mat-step>

    <!-- PASSO 3: HORÁRIOS -->
    <mat-step label="Seus horários">
      <div class="step-form">
        <h2>Quando você atende?</h2>
        <p class="step-desc">Você pode ajustar isso a qualquer momento no dashboard</p>

        <div class="dias-grid">
          @for (item of diasSemana; track item.dia) {
            <button class="dia-btn" [class.ativo]="diasAtivos().has(item.dia)"
                    (click)="toggleDia(item.dia)" type="button">
              {{ item.label }}
            </button>
          }
        </div>

        <div class="horario-row">
          <mat-form-field appearance="outline">
            <mat-label>Início</mat-label>
            <input matInput type="time" [value]="horaInicio()"
                   (change)="horaInicio.set($any($event.target).value)">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fim</mat-label>
            <input matInput type="time" [value]="horaFim()"
                   (change)="horaFim.set($any($event.target).value)">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Intervalo</mat-label>
            <mat-select [value]="intervalo()" (selectionChange)="intervalo.set($event.value)">
              <mat-option [value]="15">15 min</mat-option>
              <mat-option [value]="30">30 min</mat-option>
              <mat-option [value]="45">45 min</mat-option>
              <mat-option [value]="60">1 hora</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="step-actions">
          <button mat-button matStepperPrevious type="button">Voltar</button>
          <button mat-raised-button color="primary" type="button"
                  (click)="concluirOnboarding()" [disabled]="isLoading() || diasAtivos().size === 0">
            @if (isLoading()) {
              <mat-spinner diameter="20"></mat-spinner> Salvando...
            } @else {
              Concluir e ir ao dashboard <mat-icon>check</mat-icon>
            }
          </button>
        </div>
      </div>
    </mat-step>

  </mat-stepper>
</div>
```

### 12.4 Estilos do onboarding

Adicione ao final de `src/styles.scss`:

```scss
// ── Onboarding ────────────────────────────────────────────────
.onboarding-wrapper {
  min-height: 100vh;
  background: vars.$agendazap-slate-50;
  padding: 24px 16px;
}

.onboarding-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  max-width: 680px;
  margin-inline: auto;

  .logo-icon { font-size: 26px; }
  .logo-text  { font-size: 20px; font-weight: 700; color: vars.$agendazap-green-500; }
}

.onboarding-stepper {
  max-width: 680px;
  margin: 0 auto;
  background: transparent !important;
}

.step-form {
  padding: 8px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h2 { font-size: 20px; font-weight: 700; margin: 0; }
}

.step-desc { color: vars.$agendazap-slate-500; font-size: 14px; margin: 0; }

.foto-upload {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.foto-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: vars.$agendazap-slate-100;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  mat-icon { color: vars.$agendazap-slate-400; font-size: 32px; }
}

.foto-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px dashed vars.$agendazap-slate-300;
  color: vars.$agendazap-slate-600;
  cursor: pointer;
  font-size: 13px;
  transition: border-color .2s;
  &:hover { border-color: vars.$agendazap-green-500; color: vars.$agendazap-green-500; }
}

.servicos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.servico-chip {
  background: vars.$agendazap-green-50;
  border: 1px solid vars.$agendazap-green-200;
  border-radius: 99px;
  padding: 4px 8px 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  .s-nome { font-size: 13px; font-weight: 500; color: vars.$agendazap-slate-900; }
  .s-meta { font-size: 12px; color: vars.$agendazap-slate-500; }
  .s-remove {
    background: transparent; border: none; cursor: pointer;
    color: vars.$agendazap-slate-500; font-size: 18px;
    padding: 0 4px; line-height: 1;
    &:hover { color: vars.$status-cancelado; }
  }
}

.row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.dia-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px solid vars.$agendazap-slate-200;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
  color: vars.$agendazap-slate-700;

  &.ativo {
    background: vars.$agendazap-green-500;
    border-color: vars.$agendazap-green-500;
    color: #fff;
  }
}

.horario-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;

  @media (max-width: 600px) { grid-template-columns: 1fr 1fr; }
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
```

---

## TAREFA 13 — App Component principal

Edite `src/app/app.component.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

Se o `ng new` gerou um `app.component.html` separado, **delete-o** — usamos só o template inline acima.

---

## TAREFA 14 — Banco de dados Supabase (SQL + Auth)

### 14.1 Acessar SQL Editor

1. Abra https://supabase.com/dashboard/project/ocjsscsfggzwkgitzqlk
2. No menu lateral, clique em **SQL Editor** (ícone `>`)
3. Clique em **New query**
4. Cole o SQL abaixo **inteiro** e clique em **Run**

### 14.2 SQL completo (tabelas + triggers + RLS + Storage)

```sql
-- ── Extensão para UUID ────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabela: profissionais ─────────────────────────────────────
create table public.profissionais (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid references auth.users(id) on delete cascade not null unique,
  nome                   text not null,
  slug                   text unique not null,
  foto_url               text,
  whatsapp               text not null,
  especialidade          text,
  bio                    text,
  plano                  text default 'gratis' check (plano in ('gratis','pro','studio')),
  wpp_instance_id        text,
  stripe_subscription_id text,
  onboarding_concluido   boolean default false,
  ativo                  boolean default true,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index idx_profissionais_slug on public.profissionais(slug) where ativo = true;
create index idx_profissionais_user_id on public.profissionais(user_id);

-- ── Tabela: servicos ──────────────────────────────────────────
create table public.servicos (
  id              uuid primary key default uuid_generate_v4(),
  profissional_id uuid references public.profissionais(id) on delete cascade not null,
  nome            text not null,
  duracao_min     integer not null check (duracao_min >= 15),
  preco           numeric(10,2) not null default 0 check (preco >= 0),
  ativo           boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_servicos_profissional on public.servicos(profissional_id) where ativo = true;

-- ── Tabela: disponibilidades ──────────────────────────────────
create table public.disponibilidades (
  id              uuid primary key default uuid_generate_v4(),
  profissional_id uuid references public.profissionais(id) on delete cascade not null,
  dia_semana      integer not null check (dia_semana between 0 and 6),
  hora_inicio     time not null,
  hora_fim        time not null,
  intervalo_min   integer default 60 check (intervalo_min >= 15),
  check (hora_fim > hora_inicio)
);

create index idx_disponibilidades_profissional on public.disponibilidades(profissional_id);

-- ── Tabela: agendamentos ──────────────────────────────────────
create table public.agendamentos (
  id               uuid primary key default uuid_generate_v4(),
  profissional_id  uuid references public.profissionais(id) on delete cascade not null,
  servico_id       uuid references public.servicos(id),
  cliente_nome     text not null,
  cliente_wpp      text not null,
  data_hora        timestamptz not null,
  status           text default 'confirmado'
                   check (status in ('pendente','confirmado','cancelado','concluido')),
  lembrete_enviado boolean default false,
  observacoes      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index idx_agendamentos_profissional_data on public.agendamentos(profissional_id, data_hora);
create index idx_agendamentos_status on public.agendamentos(status) where status in ('pendente','confirmado');

-- ── Trigger: atualizar updated_at automaticamente ─────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profissionais_updated
  before update on public.profissionais
  for each row execute function public.set_updated_at();

create trigger trg_servicos_updated
  before update on public.servicos
  for each row execute function public.set_updated_at();

create trigger trg_agendamentos_updated
  before update on public.agendamentos
  for each row execute function public.set_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────────
alter table public.profissionais    enable row level security;
alter table public.servicos         enable row level security;
alter table public.disponibilidades enable row level security;
alter table public.agendamentos     enable row level security;

-- Profissional acessa apenas seus dados
create policy "Profissional acessa próprios dados"
  on public.profissionais for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Profissional acessa próprios serviços"
  on public.servicos for all
  using (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ))
  with check (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ));

create policy "Profissional acessa próprias disponibilidades"
  on public.disponibilidades for all
  using (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ))
  with check (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ));

create policy "Profissional acessa próprios agendamentos"
  on public.agendamentos for all
  using (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ))
  with check (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ));

-- Página pública (anon) lê dados ativos
create policy "Leitura pública de perfis ativos"
  on public.profissionais for select
  to anon
  using (ativo = true);

create policy "Leitura pública de serviços ativos"
  on public.servicos for select
  to anon
  using (ativo = true);

create policy "Leitura pública de disponibilidades"
  on public.disponibilidades for select
  to anon
  using (true);

-- Clientes (anon) podem inserir agendamentos
create policy "Clientes podem agendar"
  on public.agendamentos for insert
  to anon
  with check (status = 'confirmado');

-- ── Storage: bucket para fotos de perfil ─────────────────────
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

create policy "Upload de foto autenticado"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profiles');

create policy "Atualizar própria foto"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profiles' and owner = auth.uid());

create policy "Fotos públicas"
  on storage.objects for select
  to public
  using (bucket_id = 'profiles');
```

### 14.3 Verificar criação

Após rodar, vá em **Table Editor** no menu lateral e confirme que existem 4 tabelas:

- `profissionais`, `servicos`, `disponibilidades`, `agendamentos`

Vá em **Storage** e confirme que existe o bucket `profiles` (público).

### 14.4 Configurar URL Configuration do Auth

1. No menu lateral, vá em **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:4200`
3. **Redirect URLs (Additional):** adicione:
   - `http://localhost:4200/**`
   - `https://agendazap.tec/**` (já adiciona, pra produção depois)
4. Clique em **Save**

### 14.5 Desabilitar confirmação de e-mail (apenas dev)

1. Vá em **Authentication** → **Providers** → **Email**
2. **Confirm email:** **DESLIGUE** ❌
3. **Secure email change:** pode deixar ligado
4. Clique em **Save**

> ⚠️ **Religar antes de produção** (Módulo 6). No MVP em dev, isso permite criar contas de teste sem precisar verificar e-mail.

---

## TAREFA 15 — Verificação final

### 15.1 Rodar o projeto

```bash
npm start
# ou
ng serve --open
```

### 15.2 Checklist de conclusão do Módulo 1

- [ ] Projeto sobe sem erros em `http://localhost:4200`
- [ ] Tema verde AgendaZap aplicado (botões, campos, steppers)
- [ ] Rota `/auth/login` exibe tela de login estilizada
- [ ] Rota `/auth/cadastro` exibe tela de cadastro com validações
- [ ] Cadastro cria usuário no Supabase Auth com sucesso
- [ ] Cadastro redireciona automaticamente para `/onboarding` (sem tela de "verifique seu e-mail")
- [ ] Login redireciona para `/onboarding` (se não concluído) ou `/dashboard`
- [ ] Guard bloqueia `/dashboard` se não autenticado
- [ ] Guard redireciona pra `/onboarding` se autenticado mas sem perfil
- [ ] Onboarding stepper com 3 passos funciona
- [ ] Foto faz upload no Supabase Storage e aparece no preview
- [ ] Slug gerado com unicidade (testar: criar 2 contas com mesmo nome)
- [ ] Após onboarding, `currentUser` signal está populado
- [ ] Rota `/dashboard` mostra "Olá, {nome}" e link público com slug
- [ ] Botão "Sair" no dashboard volta pra `/auth/login`
- [ ] Após logout, refresh em `/dashboard` redireciona pra `/auth/login`
- [ ] No Supabase: linha em `profissionais`, serviços e disponibilidades criadas
- [ ] No Supabase Storage: foto em `profiles/avatars/{user_id}.{ext}`
- [ ] Sem erros no console do browser
- [ ] `git status` NÃO mostra `environment.ts` nem `environment.prod.ts`

### 15.3 Commit final

```bash
git add .
git commit -m "feat: módulo 1 — auth, onboarding e tema AgendaZap"
git push origin main
```

---

## Próximo módulo

Após aprovação deste módulo: **Módulo 2 — Dashboard (agenda FullCalendar, CRUD de serviços e horários).**

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: AgendaZap · agendazap.tec · Versão 1.1.0-mvp (revisada)
