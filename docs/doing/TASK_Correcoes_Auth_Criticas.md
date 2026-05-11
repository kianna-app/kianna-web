# TASK — Correções Críticas (Auth, Token Expirado, Logout, Navegação)
> Repositório: `kianna-web`
> Pré-requisitos: tasks anteriores aplicadas
> Prioridade: **CRÍTICA** — bugs estão impedindo uso real
> Estimativa total: 4-6h

---

## ⚠️ LEIA ANTES DE COMEÇAR

### Diagnóstico dos bugs (em uma frase)

| Bug | Causa raiz | Solução |
|---|---|---|
| Loading infinito após inatividade | Access token expira em 1h, requisição volta 401, Promise pendurada | Interceptor que detecta 401 → redireciona |
| Botão "Sair" não responde | Logout tenta usar token morto, falha silenciosa | Logout robusto que sempre limpa estado local |
| URL local com `/rest/v1/auth/v1/token` | `apiUrl` no environment local apontando pro Supabase + interceptor adicionando path | Garantir `apiUrl` não conter `supabase.co` |

### Branch

```bash
git checkout -b fix/auth-criticos
```

---

## TAREFA 1 — Corrigir environment local

> 🎯 **A URL local está concatenando `rest/v1/auth/v1/token` por causa de `apiUrl` errado.**

### 1.1 Verificar o problema

Abra `src/environments/environment.ts` (local). O conteúdo correto deve ser **exatamente isso**:

```typescript
export const environment = {
  production: false,
  supabaseUrl:     'https://ocjsscsfggzwkgitzqlk.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janNzY3NmZ2d6d2tnaXR6cWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjMyMjEsImV4cCI6MjA5MzQ5OTIyMX0.uhTg4ccVxuSBovRThJsJ2x5lmuS3RT-MADeaccRt6jU',
  apiUrl:          'http://localhost:3000',
};
```

### 1.2 Possíveis problemas e correções

**Problema A — `apiUrl` apontando pro Supabase:**

```typescript
// ❌ ERRADO
apiUrl: 'https://ocjsscsfggzwkgitzqlk.supabase.co/rest/v1',

// ✅ CERTO (no MVP, sem NestJS ainda)
apiUrl: 'http://localhost:3000',  // ou pode deixar vazio: ''
```

**Problema B — `supabaseUrl` com path:**

```typescript
// ❌ ERRADO
supabaseUrl: 'https://ocjsscsfggzwkgitzqlk.supabase.co/rest/v1',

// ✅ CERTO (URL base, sem path)
supabaseUrl: 'https://ocjsscsfggzwkgitzqlk.supabase.co',
```

**Problema C — Cliente Supabase recebendo URL errada:**

Abra `src/app/core/supabase/supabase.client.ts` e confirme:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,      // ← URL BASE, sem path
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

### 1.3 Validar

Após corrigir:

1. Pare o servidor (`Ctrl+C`)
2. Rode `npm start` novamente
3. Abra DevTools → Network → tente fazer login
4. Confirme que a URL é `https://ocjsscsfggzwkgitzqlk.supabase.co/auth/v1/token?grant_type=password` (sem `/rest/v1/`)

> ⚠️ **Se ainda aparecer URL errada após esses ajustes,** cole aqui o conteúdo dos seus 3 arquivos: `environment.ts`, `supabase.client.ts`, `auth.service.ts`. Tem alguma camada custom intercepting.

---

## TAREFA 2 — Detector de token expirado (redirect pra login)

> 🎯 **Quando o token expira após 1h+ de inatividade, qualquer requisição volta 401.**
> Solução: interceptor que detecta 401 do Supabase, limpa sessão e redireciona pra login com mensagem.

### 2.1 Criar serviço de sessão

Crie `src/app/core/auth/session.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

/**
 * Serviço central pra gerenciar invalidação de sessão.
 * Chamado quando:
 * - Token expira (401 do Supabase)
 * - Usuário clica em "Sair"
 * - Erro de auth detectado por interceptor ou listener
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  private invalidando = false;  // ← evita chamadas duplicadas

  /**
   * Invalida sessão local + redireciona pra login.
   * Usado quando token expira ou logout manual.
   */
  async invalidarSessao(motivo: 'expirou' | 'logout' | 'erro' = 'logout'): Promise<void> {
    if (this.invalidando) return;
    this.invalidando = true;

    try {
      // 1. Tenta signOut no Supabase (pode falhar se token já morreu — tudo bem)
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ignora — vamos limpar manualmente abaixo
      }

      // 2. Limpa estado local sempre (garante funcionar mesmo se signOut falhou)
      currentUser.set(null);
      this.limparStorageManual();

      // 3. Mensagem contextualizada
      const mensagens = {
        expirou: 'Sua sessão expirou. Entre novamente.',
        logout:  'Você saiu da sua conta.',
        erro:    'Ocorreu um erro. Entre novamente.',
      };

      // 4. Redireciona
      await this.router.navigate(['/auth/login']);

      this.snack.open(mensagens[motivo], 'OK', { duration: 3000 });
    } finally {
      // Pequeno delay pra evitar race conditions
      setTimeout(() => { this.invalidando = false; }, 500);
    }
  }

  /**
   * Limpa manualmente o localStorage do Supabase.
   * Fallback caso o signOut tenha falhado.
   */
  private limparStorageManual(): void {
    try {
      // Supabase salva sessão com prefixo 'sb-<projeto>-auth-token'
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // localStorage pode falhar em modo privado — ignora
    }
  }
}
```

### 2.2 Atualizar AuthService para usar SessionService

Edite `src/app/core/auth/auth.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, isLoading, authInitialized, AppUser } from '@core/signals/app.signals';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private session = inject(SessionService);  // ← NOVO

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

    // ── Listener de eventos do Supabase Auth ──────────────
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Login normal
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      }

      // Logout (vindo do signOut nosso ou do supabase)
      if (event === 'SIGNED_OUT') {
        currentUser.set(null);
      }

      // ── NOVO: token refresh falhou → sessão morta ────
      if (event === 'TOKEN_REFRESHED' && !session) {
        await this.session.invalidarSessao('expirou');
      }

      // ── NOVO: sessão deletada externamente (outra aba) ─
      if (event === 'USER_DELETED' || (event === 'SIGNED_OUT' && !session)) {
        currentUser.set(null);
      }
    });
  }

  async signUp(email: string, senha: string, nome: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw error;
  }

  async signIn(email: string, senha: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  /**
   * Logout robusto: sempre funciona, mesmo com token expirado.
   */
  async signOut(): Promise<void> {
    await this.session.invalidarSessao('logout');
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    });
    if (error) throw error;
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      currentUser.set(data as AppUser);
    } else {
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

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }
}
```

### 2.3 Detector de token expirado nos repositórios

> 🎯 **Adicionar detecção de erro 401/JWT expirado nas chamadas Supabase.**

Edite `src/app/core/repositories/base.repository.ts`:

```typescript
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

export function profissionalIdOrThrow(): string {
  const user = currentUser();
  if (!user?.id) {
    throw new Error('Profissional não autenticado');
  }
  return user.id;
}

/**
 * Verifica se um erro do Supabase indica token expirado/inválido.
 * Use após cada chamada que pode falhar por auth.
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  const code = error.code ?? error.status;

  return (
    code === 401 ||
    code === 'PGRST301' ||                    // JWT expirado no PostgREST
    code === 'PGRST302' ||                    // JWT inválido
    msg.includes('jwt expired') ||
    msg.includes('invalid jwt') ||
    msg.includes('unauthorized')
  );
}

export { supabase };
```

### 2.4 Atualizar stores para tratar token expirado

Edite cada store (`servicos.store.ts`, `horarios.store.ts`, `agendamentos.store.ts`) — **substitua** o método `carregar` / `carregarPeriodo` adicionando tratamento de erro de auth.

Exemplo em `agendamentos.store.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosStore {
  private repo = inject(AgendamentosRepository);
  private session = inject(SessionService);   // ← NOVO

  readonly agendamentos = signal<AgendamentoComServico[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly confirmados = computed(() =>
    this.agendamentos().filter(a => a.status === 'confirmado')
  );

  async carregarPeriodo(inicio: Date, fim: Date): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listarPorPeriodo(inicio, fim);
      this.agendamentos.set(lista);
    } catch (e: any) {
      if (isAuthError(e)) {
        await this.session.invalidarSessao('expirou');
        return;
      }
      this.erro.set(e.message ?? 'Erro ao carregar agenda');
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarStatus(id: string, status: StatusAgend): Promise<void> {
    try {
      await this.repo.atualizarStatus(id, status);
      this.agendamentos.update(arr =>
        arr.map(a => a.id === id ? { ...a, status } : a)
      );
    } catch (e: any) {
      if (isAuthError(e)) {
        await this.session.invalidarSessao('expirou');
        return;
      }
      throw e;
    }
  }
}
```

**Aplicar mesmo padrão** em `servicos.store.ts` e `horarios.store.ts`:

```typescript
// No try/catch de cada método (carregar, criar, atualizar, excluir, salvar):
} catch (e: any) {
  if (isAuthError(e)) {
    await this.session.invalidarSessao('expirou');
    return;
  }
  this.erro.set(e.message ?? 'Erro ao carregar');
}
```

> 💡 **Importante:** sempre injete `private session = inject(SessionService);` no construtor de cada store.

### 2.5 Aplicar também no `EstatisticasRepository` da Visão Geral

Em `src/app/features/dashboard/pages/visao-geral/visao-geral.component.ts`, atualize o `ngOnInit`:

```typescript
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';

export class VisaoGeralComponent implements OnInit {
  // ... existing
  private session = inject(SessionService);  // ← NOVO

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.repo.carregarDashboard();
      this.stats.set(data);
    } catch (e: any) {
      if (isAuthError(e)) {
        await this.session.invalidarSessao('expirou');
        return;
      }
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }
}
```

---

## TAREFA 3 — Logout funciona sempre

> 🎯 **Botão Sair que travava → agora funciona sempre, mesmo com token morto.**

A `TAREFA 2.2` já resolveu isso ao trocar `auth.service.signOut()` por `session.invalidarSessao('logout')`.

### 3.1 Validar nos pontos de logout

Confirme que os 3 lugares que chamam logout usam `auth.signOut()` (que internamente usa SessionService):

**Sidenav desktop** — `src/app/features/dashboard/shell/sidenav/sidenav.component.ts`:

```typescript
async logout() {
  this.itemClicked.emit();
  await this.auth.signOut();  // ← já está certo
}
```

**Avatar dropdown (header)** — `src/app/features/dashboard/shell/header/header.component.ts`:

```typescript
async logout(): Promise<void> {
  await this.auth.signOut();  // ← já está certo
}
```

**Dashboard placeholder antigo (caso ainda exista):** remover.

### 3.2 Adicionar guard de "promise pendurada"

Pra garantir que o logout não trava se algo demorar, adicione timeout no `session.service.ts`:

```typescript
async invalidarSessao(motivo: 'expirou' | 'logout' | 'erro' = 'logout'): Promise<void> {
  if (this.invalidando) return;
  this.invalidando = true;

  try {
    // Timeout de 3s pro signOut (se demorar mais, força redirect)
    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }).catch(() => null),
      new Promise(resolve => setTimeout(resolve, 3000)),
    ]);

    currentUser.set(null);
    this.limparStorageManual();

    const mensagens = {
      expirou: 'Sua sessão expirou. Entre novamente.',
      logout:  'Você saiu da sua conta.',
      erro:    'Ocorreu um erro. Entre novamente.',
    };

    await this.router.navigate(['/auth/login']);
    this.snack.open(mensagens[motivo], 'OK', { duration: 3000 });
  } finally {
    setTimeout(() => { this.invalidando = false; }, 500);
  }
}
```

---

## TAREFA 4 — Ajustes de navegação mobile

> 🎯 **Bottom-nav mobile com 4 itens só. Avatar dropdown navega pra Perfil/Configurações.**

### 4.1 Reduzir bottom-nav mobile

Edite `src/app/features/dashboard/shell/bottom-nav/bottom-nav.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface BottomNavItem {
  rota: string;
  label: string;
  icone: string;
  exact?: boolean;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { rota: '/dashboard',          label: 'Início',  icone: 'dashboard',  exact: true },
  { rota: '/dashboard/agenda',   label: 'Agenda',  icone: 'event' },
  { rota: '/dashboard/servicos', label: 'Serviços', icone: 'content_cut' },
  { rota: '/dashboard/horarios', label: 'Horários', icone: 'schedule' },
];

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  readonly menu = BOTTOM_NAV_ITEMS;
}
```

E `bottom-nav.component.html`:

```html
<nav class="bottom-nav">
  @for (item of menu; track item.rota) {
    <a [routerLink]="item.rota"
       routerLinkActive="ativo"
       [routerLinkActiveOptions]="item.exact ? { exact: true } : {}"
       class="bn-item">
      <mat-icon>{{ item.icone }}</mat-icon>
      <span>{{ item.label }}</span>
    </a>
  }
</nav>
```

### 4.2 Avatar dropdown: nome clicável → vai pra Perfil

Edite `src/app/features/dashboard/shell/header/header.component.html`:

```html
<mat-menu #menuPerfil="matMenu" xPosition="before" class="menu-perfil">
  <!-- Cabeçalho clicável → vai pra Perfil -->
  <button mat-menu-item routerLink="/dashboard/configuracoes" [queryParams]="{ aba: 'perfil' }"
          class="menu-header-btn">
    @if (user()?.foto_url) {
      <img [src]="user()!.foto_url" [alt]="user()!.nome" class="menu-avatar">
    } @else {
      <div class="menu-avatar fallback">{{ iniciais() }}</div>
    }
    <div class="menu-user-info">
      <div class="menu-nome">{{ user()?.nome }}</div>
      <div class="menu-plano">Plano {{ user()?.plano }}</div>
    </div>
  </button>
  <mat-divider></mat-divider>
  <button mat-menu-item routerLink="/dashboard/configuracoes">
    <mat-icon>settings</mat-icon>
    <span>Configurações da conta</span>
  </button>
  <button mat-menu-item (click)="logout()">
    <mat-icon>logout</mat-icon>
    <span>Sair</span>
  </button>
</mat-menu>
```

### 4.3 Estilo do menu

Atualize em `src/styles.scss` (substitua o bloco `.menu-perfil`):

```scss
.menu-perfil {
  min-width: 260px !important;

  .menu-header-btn {
    height: auto !important;
    padding: 12px 16px !important;
    display: flex !important;
    align-items: center;
    gap: 12px;
  }

  .menu-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;

    &.fallback {
      background: linear-gradient(135deg, vars.$kianna-green-400, vars.$kianna-green-600);
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .menu-user-info {
    text-align: left;
    min-width: 0;
  }

  .menu-nome {
    font-size: 14px;
    font-weight: 600;
    color: vars.$kianna-slate-900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu-plano {
    font-size: 12px;
    color: vars.$kianna-slate-500;
    text-transform: capitalize;
    margin-top: 2px;
  }
}
```

### 4.4 Configurações: ler query param pra abrir aba certa

> 🎯 **Quando clicar no nome no dropdown, abre aba "Perfil" diretamente.**

Edite `src/app/features/dashboard/pages/configuracoes/configuracoes.component.ts`:

```typescript
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PerfilComponent } from './perfil/perfil.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { RedesSociaisComponent } from './redes-sociais/redes-sociais.component';
import { EnderecoComponent } from './endereco/endereco.component';

const ABAS = ['empresa', 'endereco', 'redes', 'perfil'] as const;
type Aba = typeof ABAS[number];

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, MatTabsModule, PerfilComponent, EmpresaComponent, RedesSociaisComponent, EnderecoComponent],
  template: `
    <div class="cfg-page">
      <h1>Configurações</h1>
      <p class="cfg-sub">Personalize seu perfil, empresa e canais de contato.</p>

      <mat-tab-group [selectedIndex]="abaIndex()" (selectedIndexChange)="onTabChange($event)"
                     animationDuration="200ms" class="cfg-tabs">
        <mat-tab label="Empresa">  <app-cfg-empresa />       </mat-tab>
        <mat-tab label="Endereço"> <app-cfg-endereco />      </mat-tab>
        <mat-tab label="Redes">    <app-cfg-redes-sociais /> </mat-tab>
        <mat-tab label="Perfil">   <app-cfg-perfil />        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .cfg-page { display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; color: #0F172A; }
    .cfg-sub { font-size: 13px; color: #64748B; margin: 0 0 16px; }
    .cfg-tabs { background: #fff; border-radius: 12px; padding: 8px; }
    ::ng-deep .mat-mdc-tab-body-content { padding: 24px 16px; }
  `],
})
export class ConfiguracoesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly params = toSignal(this.route.queryParamMap);

  readonly abaIndex = computed(() => {
    const aba = (this.params()?.get('aba') ?? 'empresa') as Aba;
    const idx = ABAS.indexOf(aba);
    return idx >= 0 ? idx : 0;
  });

  onTabChange(idx: number): void {
    this.router.navigate([], {
      queryParams: { aba: ABAS[idx] },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
```

---

## TAREFA 5 — Verificação final

### 5.1 Build

```bash
npm run build -- --configuration=production
npm start
```

### 5.2 Testes manuais (simulando bugs reais)

**Teste 1 — Token expirado:**
1. Faça login
2. Abra DevTools → Application → Local Storage → kianna.com.br
3. Encontre a chave `sb-ocjsscsfggzwkgitzqlk-auth-token` e edite o valor:
   - Decodifique o JSON, mude `expires_at` pra timestamp passado (ex: `1000000000`)
   - Salve
4. Recarregue qualquer página de dashboard (Visão Geral, Agenda, Serviços)
5. **Esperado:** redireciona pra `/auth/login` com snackbar "Sua sessão expirou..."

**Teste 2 — Logout robusto:**
1. Faça login
2. Espere alguns minutos OU corrompa o token (mesmo que teste 1)
3. Clique no avatar → "Sair"
4. **Esperado:** logout funciona em menos de 3 segundos, redireciona pra login

**Teste 3 — Bottom-nav reduzido:**
1. Abra em mobile (DevTools modo iPhone)
2. **Esperado:** bottom-nav com 4 itens: Início, Agenda, Serviços, Horários
3. Avatar dropdown abre com nome clicável + Configurações + Sair

**Teste 4 — Nome clicável vai pra perfil:**
1. No avatar dropdown, clique no nome do usuário
2. **Esperado:** abre `/dashboard/configuracoes?aba=perfil`
3. Aba "Perfil" já está selecionada

**Teste 5 — URL do Supabase correta:**
1. Faça login
2. DevTools → Network → última requisição POST
3. **Esperado:** URL é `https://ocjsscsfggzwkgitzqlk.supabase.co/auth/v1/token?grant_type=password`
4. **NÃO esperado:** URL com `/rest/v1/auth/v1/token` (duplicado)

### 5.3 Checklist

- [ ] `environment.ts` local corrigido (apiUrl não aponta pro Supabase)
- [ ] `SessionService` criado
- [ ] `AuthService.signOut` usa SessionService
- [ ] Stores (servicos, horarios, agendamentos) tratam `isAuthError`
- [ ] `VisaoGeralComponent` trata `isAuthError`
- [ ] Logout funciona mesmo com token expirado (timeout 3s)
- [ ] Bottom-nav reduzido pra 4 itens
- [ ] Avatar dropdown: nome clicável → /configuracoes?aba=perfil
- [ ] Configurações lê query param `?aba=` e abre aba certa
- [ ] Build de produção sem erros

### 5.4 Commit

```bash
git add .
git commit -m "fix(auth): token expirado redireciona pra login, logout robusto, env local, nav mobile"
git push origin fix/auth-criticos
```

---

## 🔐 Nota sobre "senha visível no DevTools" (esclarecimento)

> 🎯 **NÃO É VULNERABILIDADE.** Não vai ser corrigido porque não há o que corrigir.

**Por que aparece no DevTools:**
- O DevTools mostra requisições do seu próprio browser, **decifradas localmente**
- Entre browser e servidor, a requisição vai criptografada via HTTPS/TLS
- Qualquer outra pessoa na rede vê apenas bytes embaralhados

**Comparativo:**
- Banco do Brasil, Stripe, Google, Gmail — todos enviam senha em texto plano dentro do HTTPS
- A "criptografia adicional no JS antes de enviar" geraria **falsa sensação de segurança** e não protegeria de nada

**O que protege de verdade (e você já tem):**
- ✅ HTTPS (Supabase exige)
- ✅ Senha hasheada com bcrypt no banco (Supabase faz)
- ✅ Rate limiting (Supabase tem padrão de 30 logins/hora por IP)
- ✅ Confirmação de e-mail (você desligou pra dev, religar em produção)
- ✅ Senha mínima 8 caracteres (você tem)

**O que pode adicionar futuramente (não urgente):**
- 🔲 Auth com magic link (sem senha)
- 🔲 2FA via TOTP
- 🔲 Captcha após 3 tentativas falhas

---

## 🗄️ Nota sobre localStorage

> 🎯 **Manter padrão Supabase** (decisão sua).

**O que o Supabase salva no localStorage:**
- Chave: `sb-<projeto>-auth-token`
- Valor: JSON com `access_token`, `refresh_token`, `expires_at`, `user` (dados básicos)

**Não tem dados super-sensíveis ali** — não tem senha, não tem CPF, não tem cartão. Tem apenas:
- Token JWT temporário (expira em 1h)
- Refresh token (rotaciona ao usar)
- Email + ID do usuário

**Riscos reais (baixos pro MVP):**
- XSS no app pode roubar tokens — mitigação: Angular já escapa HTML por padrão
- Acesso físico ao dispositivo — fora do escopo da Kianna proteger

**Migração futura pra cookies httpOnly:**
- Quando tiver NestJS (Módulo 4+), o backend pode setar cookie httpOnly
- JavaScript não consegue ler cookie httpOnly = XSS não rouba token
- Maior segurança, mais código

**No MVP atual:** localStorage padrão Supabase está OK. O `SessionService.limparStorageManual()` garante limpeza no logout.

---

## ⚠️ Se ainda tiver problemas

Após implementar tudo, se algum bug persistir, **cole pra mim**:

1. **Bug de URL local:** conteúdo do `environment.ts` local, do `supabase.client.ts`, e do `auth.service.ts`
2. **Loading infinito:** print do Network do DevTools mostrando a requisição travada
3. **Logout travado:** prints do Console (erros vermelhos)

Com esses 3 dados, resolvo em uma rodada.

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Correções Críticas Auth
