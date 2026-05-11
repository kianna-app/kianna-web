# TASK — Melhorias Mobile UX/UI
> Repositório: `kianna-web`
> Pré-requisitos: Grupo A + Módulo 2 Aprimoramentos concluídos
> Objetivo: paridade mobile com concorrentes (Agenda Zap, Agendar Agora) + correção de bugs identificados
> Estimativa total: 8-10h

---

## ⚠️ LEIA ANTES DE COMEÇAR

### Branch e princípios

```bash
git checkout -b feat/mobile-ux-melhorias
```

- **Reaproveitar tudo que já existe** (`<app-loading-button>`, signals, repositórios)
- **Mobile-first:** cada ajuste pensado primeiro em 375px
- **Sem quebrar desktop:** todas as mudanças preservam o layout ≥960px
- **Commits pequenos por TAREFA**

### Resumo do que muda

| Antes | Depois |
|---|---|
| Header mobile com chip do link público gigante | Header limpo: hamburguer à esquerda + ícones à direita |
| Sem menu lateral no mobile | Drawer lateral (mat-sidenav modo `over`) |
| Logout só na sidenav desktop | Avatar dropdown com "Configurações" e "Sair" |
| Spinner do FullCalendar eterno | Spinner some quando carrega de fato |
| Mensagens de erro de URL sem explicação | Mensagens claras: "Use uma URL completa, com https://" |
| Configurações apertadas | Cards com seções, mais respiro |
| Lista de serviços simples | Cards expansíveis com busca + ações claras |

---

## TAREFA 1 — Header mobile reorganizado

> 🎯 **Esconder o link público chip no mobile, adicionar hamburguer à esquerda e ícones de ação à direita.**
> 🐛 **Bug que resolve:** chip do link rouba 60% do header em telas pequenas.

### 1.1 Refatorar `header.component.ts`

Edite `src/app/features/dashboard/shell/header/header.component.ts`:

```typescript
import { Component, inject, signal, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';
import { BreakpointService } from '@core/services/breakpoint.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatMenuModule, MatBadgeModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private snack = inject(MatSnackBar);
  private auth = inject(AuthService);
  private bp = inject(BreakpointService);

  readonly user = currentUser;
  readonly isMobile = this.bp.isMobile;
  readonly copiado = signal(false);

  // Emite quando usuário clica no hamburguer (controla o drawer no shell)
  @Output() abrirMenu = new EventEmitter<void>();

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  // Iniciais pra fallback do avatar
  readonly iniciais = computed(() => {
    const nome = this.user()?.nome ?? '';
    return nome.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
  });

  async copiarLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.linkPublico);
      this.copiado.set(true);
      this.snack.open('Link copiado!', 'OK', { duration: 2000 });
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.snack.open('Não foi possível copiar', 'OK', { duration: 2000 });
    }
  }

  logout(): void {
    this.auth.signOut();
  }
}
```

### 1.2 Template `header.component.html`

```html
<header class="dash-header">
  <!-- ── Esquerda: hamburguer (mobile) ─────────────────── -->
  @if (isMobile()) {
    <button mat-icon-button class="btn-menu" (click)="abrirMenu.emit()" aria-label="Abrir menu">
      <mat-icon>menu</mat-icon>
    </button>
  }

  <!-- ── Centro: link público (só desktop) ─────────────── -->
  @if (!isMobile()) {
    <div class="link-chip">
      <mat-icon>link</mat-icon>
      <span class="link-text">{{ linkPublico }}</span>
      <button mat-button color="primary" (click)="copiarLink()">
        <mat-icon>{{ copiado() ? 'check' : 'content_copy' }}</mat-icon>
        {{ copiado() ? 'Copiado' : 'Copiar' }}
      </button>
    </div>
  }

  <!-- ── Direita: ícones de ação (mobile + desktop) ─────── -->
  <div class="header-actions">
    <button mat-icon-button class="header-action-btn" aria-label="Notificações" disabled
            matTooltip="Em breve">
      <mat-icon>notifications_none</mat-icon>
    </button>

    <button mat-icon-button class="avatar-btn" [matMenuTriggerFor]="menuPerfil"
            aria-label="Menu da conta">
      @if (user()?.foto_url) {
        <img [src]="user()!.foto_url" [alt]="user()!.nome" class="avatar-img">
      } @else {
        <div class="avatar-fallback">{{ iniciais() }}</div>
      }
    </button>

    <mat-menu #menuPerfil="matMenu" xPosition="before" class="menu-perfil">
      <div class="menu-header" (click)="$event.stopPropagation()">
        <div class="menu-nome">{{ user()?.nome }}</div>
        <div class="menu-plano">Plano {{ user()?.plano }}</div>
      </div>
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
  </div>
</header>
```

### 1.3 Estilo `header.component.scss`

```scss
@use 'styles/variables' as v;

.dash-header {
  background: #fff;
  border-bottom: 1px solid v.$kianna-slate-200;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  gap: 12px;

  @media (min-width: 960px) {
    padding: 12px 24px;
    height: 64px;
    justify-content: flex-end;
  }
}

.btn-menu {
  flex-shrink: 0;

  mat-icon { color: v.$kianna-slate-700; }
}

// ── Link chip (só desktop) ─────────────────────────────
.link-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: v.$kianna-green-50;
  border: 1px solid v.$kianna-green-200;
  border-radius: 99px;
  padding: 4px 4px 4px 12px;
  margin-left: auto;
  margin-right: 16px;

  mat-icon {
    color: v.$kianna-green-700;
    font-size: 16px; width: 16px; height: 16px;
  }
}

.link-text {
  font-size: 13px;
  font-weight: 500;
  color: v.$kianna-slate-700;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ── Ações à direita ────────────────────────────────────
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.header-action-btn {
  width: 40px;
  height: 40px;

  &[disabled] mat-icon { color: v.$kianna-slate-400; }
}

.avatar-btn {
  width: 40px;
  height: 40px;
  padding: 4px !important;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, v.$kianna-green-400, v.$kianna-green-600);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 1.4 Estilos do menu dropdown (no styles.scss global)

Adicione ao final de `src/styles.scss`:

```scss
// ── Menu de perfil (header) ───────────────────────────
.menu-perfil {
  min-width: 220px !important;

  .menu-header {
    padding: 12px 16px 8px;
    cursor: default;

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
}
```

---

## TAREFA 2 — Drawer lateral mobile (substituir bottom-nav por menu lateral)

> 🎯 **Adicionar menu lateral acionado pelo hamburguer no mobile.**
> Hoje só tem `bottom-nav` no rodapé. Vamos adicionar drawer também (não substituir, complementar).

### 2.1 Atualizar shell do dashboard

Edite `src/app/features/dashboard/dashboard.component.ts`:

```typescript
import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointService } from '@core/services/breakpoint.service';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './shell/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, MatSidenavModule,
    SidenavComponent, BottomNavComponent, HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  @ViewChild('drawerMobile') drawerMobile?: MatSidenav;

  private bp = inject(BreakpointService);
  readonly isMobile = this.bp.isMobile;

  abrirDrawer(): void {
    this.drawerMobile?.toggle();
  }

  fecharDrawer(): void {
    this.drawerMobile?.close();
  }
}
```

### 2.2 Template `dashboard.component.html`

```html
<!-- ── Mobile: drawer lateral ─────────────────────── -->
@if (isMobile()) {
  <mat-sidenav-container class="dash-shell mobile" autosize>
    <mat-sidenav #drawerMobile mode="over" position="start" class="mobile-drawer">
      <app-sidenav (itemClicked)="fecharDrawer()" />
    </mat-sidenav>

    <mat-sidenav-content>
      <app-dashboard-header (abrirMenu)="abrirDrawer()" />
      <main class="dash-content">
        <router-outlet />
      </main>
      <app-bottom-nav />
    </mat-sidenav-content>
  </mat-sidenav-container>
}

<!-- ── Desktop: sidenav fixa ─────────────────────────── -->
@if (!isMobile()) {
  <div class="dash-shell">
    <app-sidenav />
    <div class="dash-main">
      <app-dashboard-header />
      <main class="dash-content">
        <router-outlet />
      </main>
    </div>
  </div>
}
```

### 2.3 Atualizar `dashboard.component.scss`

```scss
@use 'styles/variables' as v;

.dash-shell {
  display: flex;
  min-height: 100vh;
  background: v.$kianna-slate-50;

  &.mobile {
    height: 100vh;
    display: block;
  }
}

.dash-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dash-content {
  flex: 1;
  padding: 24px;

  @media (max-width: 600px) {
    padding: 16px;
    padding-bottom: 76px;  // ← reserva espaço pro bottom-nav
  }
}

// ── Drawer mobile ─────────────────────────────────────
.mobile-drawer {
  width: 280px;
}

::ng-deep .mat-drawer-inner-container {
  overflow: hidden !important;
}
```

### 2.4 Atualizar sidenav pra emitir clique

Edite `src/app/features/dashboard/shell/sidenav/sidenav.component.ts`:

```typescript
import { Component, EventEmitter, Output, inject } from '@angular/core';
// ... outros imports iguais

export class SidenavComponent {
  private auth = inject(AuthService);
  readonly menu = MENU_ITEMS;
  readonly user = currentUser;

  @Output() itemClicked = new EventEmitter<void>();   // ← NOVO

  logout() {
    this.itemClicked.emit();
    this.auth.signOut();
  }

  navegarItem() {
    this.itemClicked.emit();
  }
}
```

E em `sidenav.component.html`, adicione `(click)="navegarItem()"` em cada `<a>`:

```html
@for (item of menu; track item.rota) {
  <a [routerLink]="item.rota" routerLinkActive="ativo"
     [routerLinkActiveOptions]="item.rota === '/dashboard' ? { exact: true } : {}"
     (click)="navegarItem()"
     class="menu-item" [class.disabled]="item.implementadoEm">
    <mat-icon>{{ item.icone }}</mat-icon>
    <span>{{ item.label }}</span>
  </a>
}
```

> 💡 **Atenção:** quando estiver em mobile e clicar num item do menu, o drawer fecha automaticamente. Em desktop, sidenav é fixa, o emit não tem efeito.

---

## TAREFA 3 — Bug do FullCalendar: spinner eterno

> 🎯 **O spinner ao lado do título "Agenda" fica girando pra sempre, mesmo após carregar.**
> 🐛 Causa: o `store.carregando()` fica true antes do primeiro `datesSet`, mas só vira false depois. Em mobile, parece que ele "volta" porque o componente re-renderiza.

### 3.1 Editar `agenda.component.ts`

Em `src/app/features/dashboard/pages/agenda/agenda.component.ts`, **adicionar timeout de segurança** + **lógica idempotente**:

```typescript
import { Component, OnInit, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
// ... outros imports iguais

export class AgendaComponent implements OnInit, OnDestroy {
  // ... resto igual

  private periodoCarregado = signal<string | null>(null);
  private carregandoTimeout: any = null;

  // ... outras propriedades iguais

  ngOnInit(): void {
    // Não faz nada — datesSet vai disparar
  }

  ngOnDestroy(): void {
    if (this.carregandoTimeout) clearTimeout(this.carregandoTimeout);
  }

  private async aoTrocarPeriodo(inicio: Date, fim: Date): Promise<void> {
    // Identificador único do período (evita carregamento duplicado)
    const chave = `${inicio.toISOString()}_${fim.toISOString()}`;
    if (this.periodoCarregado() === chave) return;
    this.periodoCarregado.set(chave);

    // Timeout de segurança: se carregamento demorar +10s, força fim do loading
    if (this.carregandoTimeout) clearTimeout(this.carregandoTimeout);
    this.carregandoTimeout = setTimeout(() => {
      // Se ainda estiver carregando após 10s, algo travou
      if (this.store.carregando()) {
        console.warn('[Agenda] Timeout de carregamento — forçando fim do loading');
        // O store não expõe setter, mas podemos chamar carregar com período vazio
        // OU, melhor, exibir mensagem de erro
        this.snack.open('Conexão lenta. Tente novamente.', 'Recarregar', { duration: 5000 })
          .onAction().subscribe(() => location.reload());
      }
    }, 10000);

    await this.store.carregarPeriodo(inicio, fim);

    if (this.carregandoTimeout) {
      clearTimeout(this.carregandoTimeout);
      this.carregandoTimeout = null;
    }
  }
}
```

### 3.2 Garantir que o store não fica preso em loading

Em `src/app/features/dashboard/state/agendamentos.store.ts`, **garantir que `carregando` SEMPRE volta a false** (já estava no `finally`, mas reforçar com try/catch defensivo):

```typescript
async carregarPeriodo(inicio: Date, fim: Date): Promise<void> {
  this.carregando.set(true);
  this.erro.set(null);
  try {
    const lista = await this.repo.listarPorPeriodo(inicio, fim);
    this.agendamentos.set(lista);
  } catch (e: any) {
    this.erro.set(e.message ?? 'Erro ao carregar agenda');
    // Não quebra: mantém lista anterior
  } finally {
    this.carregando.set(false);  // ← SEMPRE executa
  }
}
```

### 3.3 Mostrar spinner SÓ na primeira carga

Em `agenda.component.html`, **substituir** o spinner inline por um overlay condicional:

```html
<div class="agenda-page">
  <div class="page-header">
    <h1>Agenda</h1>
  </div>

  <div class="calendar-wrapper">
    <full-calendar #calendar [options]="calendarOptions()" class="calendar" />

    <!-- Spinner overlay SÓ na primeira carga (quando agendamentos vazio E carregando) -->
    @if (store.carregando() && store.agendamentos().length === 0) {
      <div class="agenda-loading">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Carregando agenda...</p>
      </div>
    }
  </div>

  @if (store.erro()) {
    <div class="agenda-erro">
      <mat-icon>warning</mat-icon>
      <span>{{ store.erro() }}</span>
    </div>
  }
</div>
```

### 3.4 Adicionar estilos do overlay

Em `agenda.component.scss`, adicione:

```scss
.calendar-wrapper {
  position: relative;
}

.agenda-loading {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  border-radius: 12px;

  p { font-size: 13px; color: v.$kianna-slate-600; margin: 0; }
}

.agenda-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEE2E2;
  color: #991B1B;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 8px;

  mat-icon { font-size: 18px; width: 18px; height: 18px; }
}
```

> 💡 **Importante:** com essa lógica, o spinner **só aparece na primeira carga**. Em navegações subsequentes (trocar mês/semana), o calendário mostra os dados antigos enquanto recarrega — UX muito melhor.

---

## TAREFA 4 — Mensagens de erro de URL (redes sociais)

> 🐛 **Bug:** campo Instagram/Facebook fica vermelho sem explicar por quê quando URL inválida.

### 4.1 Atualizar template `redes-sociais.component.html`

Para CADA campo (Instagram, Facebook, X, YouTube), adicionar `<mat-error>` explicando:

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Instagram</mat-label>
  <mat-icon matPrefix>photo_camera</mat-icon>
  <input matInput formControlName="instagram_url" placeholder="https://instagram.com/seuusuario">
  @if (form.get('instagram_url')?.hasError('pattern')) {
    <mat-error>Use a URL completa, começando com https://</mat-error>
  }
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>Facebook</mat-label>
  <mat-icon matPrefix>thumb_up</mat-icon>
  <input matInput formControlName="facebook_url" placeholder="https://facebook.com/seunegocio">
  @if (form.get('facebook_url')?.hasError('pattern')) {
    <mat-error>Use a URL completa, começando com https://</mat-error>
  }
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>X (Twitter)</mat-label>
  <mat-icon matPrefix>chat</mat-icon>
  <input matInput formControlName="twitter_url" placeholder="https://x.com/seuusuario">
  @if (form.get('twitter_url')?.hasError('pattern')) {
    <mat-error>Use a URL completa, começando com https://</mat-error>
  }
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>YouTube</mat-label>
  <mat-icon matPrefix>play_circle</mat-icon>
  <input matInput formControlName="youtube_url" placeholder="https://youtube.com/@seucanal">
  @if (form.get('youtube_url')?.hasError('pattern')) {
    <mat-error>Use a URL completa, começando com https://</mat-error>
  }
</mat-form-field>
```

### 4.2 No campo de links personalizados, adicionar erro também

```html
<mat-form-field appearance="outline" class="link-url">
  <mat-label>URL</mat-label>
  <input matInput formControlName="url" placeholder="https://...">
  @if (linksArray.at(i).get('url')?.hasError('pattern')) {
    <mat-error>Comece com https://</mat-error>
  }
</mat-form-field>
```

> 💡 **Detalhe técnico:** o validator `Validators.pattern(/^https?:\/\//)` usado anteriormente está correto — o problema era só **não exibir** a mensagem de erro.

---

## TAREFA 5 — Configurações com mais respiro (cards por seção)

> 🎯 **Trocar layout apertado por cards visualmente separados em cada aba.**

### 5.1 Aba Empresa — refatorar template

Em `src/app/features/dashboard/pages/configuracoes/empresa/empresa.component.html`, **substituir** todo o conteúdo:

```html
<form [formGroup]="form" class="cfg-tabs-form" (ngSubmit)="salvar()">

  <!-- ── Card 1: Informações da empresa ─────────────────── -->
  <mat-card class="cfg-card">
    <h3 class="cfg-card-titulo">Informações da empresa</h3>
    <p class="cfg-card-desc">Como seu negócio aparece pros clientes</p>

    <div class="cfg-card-form">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nome do negócio</mat-label>
        <input matInput formControlName="nome">
        <mat-hint>Esse nome aparece na sua página pública</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Bio / descrição (opcional)</mat-label>
        <textarea matInput formControlName="bio" rows="3" maxlength="200"></textarea>
        <mat-hint>Frase curta sobre seu trabalho · máx 200 caracteres</mat-hint>
      </mat-form-field>
    </div>
  </mat-card>

  <!-- ── Card 2: Link da página ─────────────────────────── -->
  <mat-card class="cfg-card">
    <h3 class="cfg-card-titulo">Link da sua página</h3>
    <p class="cfg-card-desc">O endereço onde seus clientes vão agendar</p>

    <div class="cfg-card-form">
      <mat-form-field appearance="outline" class="full-width slug-field">
        <mat-label>Link personalizado</mat-label>
        <span matPrefix class="slug-prefix">kianna.com.br/&nbsp;</span>
        <input matInput formControlName="slug" (input)="formatarSlugLive()">
        @if (!podeAlterarSlug()) {
          <mat-hint>⏳ Próxima alteração em {{ proximaAlteracaoEm() | date:'dd/MM/yyyy' }}</mat-hint>
        } @else {
          <mat-hint>Pode alterar 1x por mês. O link antigo redireciona por 90 dias.</mat-hint>
        }
      </mat-form-field>
    </div>
  </mat-card>

  <!-- ── Card 3: Política de cancelamento ────────────────── -->
  <mat-card class="cfg-card">
    <h3 class="cfg-card-titulo">Política de cancelamento</h3>
    <p class="cfg-card-desc">Texto livre que aparece pro cliente na hora de agendar</p>

    <div class="cfg-card-form">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Sua política (opcional)</mat-label>
        <textarea matInput formControlName="politica_cancelamento" rows="3"
                  placeholder="Ex: Cancelamentos permitidos até 24h antes do horário."></textarea>
      </mat-form-field>
    </div>
  </mat-card>

  <!-- ── Botão salvar fixo no final ─────────────────────── -->
  <div class="cfg-actions">
    <app-loading-button
      type="submit"
      variant="flat"
      color="primary"
      [loading]="salvando()"
      icon="save"
      iconPosition="start">
      Salvar alterações
    </app-loading-button>
  </div>
</form>
```

### 5.2 Atualizar estilo `empresa.component.scss`

```scss
@use 'styles/variables' as v;

.cfg-tabs-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.cfg-card {
  padding: 20px !important;
  display: flex !important;
  flex-direction: column;
  gap: 4px;
}

.cfg-card-titulo {
  font-size: 16px;
  font-weight: 700;
  color: v.$kianna-slate-900;
  margin: 0;
}

.cfg-card-desc {
  font-size: 13px;
  color: v.$kianna-slate-500;
  margin: 0 0 12px;
}

.cfg-card-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.full-width { width: 100%; }

.slug-prefix {
  color: v.$kianna-slate-500;
  font-size: 14px;
  font-family: 'Fira Code', monospace;
}

.cfg-actions {
  display: flex;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: linear-gradient(180deg, transparent, v.$kianna-slate-50 30%);
  padding: 12px 0;
  margin-top: 8px;
}
```

### 5.3 Replicar mesmo padrão em Endereço e Redes

> 💡 **Padrão a replicar:** envolver cada grupo de campos relacionados em `<mat-card class="cfg-card">` com título + descrição + form. Aplicar em:
> - **Endereço:** 2 cards (Endereço de atendimento, ele todo num card mesmo)
> - **Redes sociais:** 2 cards (Redes principais, Links personalizados)
> - **Perfil:** 2 cards (Sua conta, Trocar senha)
>
> Reutilizar as mesmas classes CSS (`cfg-card`, `cfg-card-titulo`, etc) — adicionar essas classes globalmente.

### 5.4 Mover estilos pra global (DRY)

Como serão reutilizados nas 4 abas, **mover** essas classes pra `src/styles.scss` (ou criar `_settings.scss`):

```scss
// ── Cards de configurações (reutilizado em todas as abas) ──
.cfg-tabs-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.cfg-card {
  padding: 20px !important;
  display: flex !important;
  flex-direction: column;
  gap: 4px;
}

.cfg-card-titulo {
  font-size: 16px;
  font-weight: 700;
  color: vars.$kianna-slate-900;
  margin: 0;
}

.cfg-card-desc {
  font-size: 13px;
  color: vars.$kianna-slate-500;
  margin: 0 0 12px;
}

.cfg-card-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cfg-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  margin-top: 8px;
}
```

---

## TAREFA 6 — Página de Serviços: redesign

> 🎯 **Cards expansíveis com busca e ações claras.**

### 6.1 Atualizar componente `servicos.component.ts`

Adicionar busca e estado de expansão:

```typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';
// ... outros imports iguais

export class ServicosComponent implements OnInit {
  // ... existing properties

  readonly busca = signal('');
  readonly servicoExpandido = signal<string | null>(null);

  // Lista filtrada por busca
  readonly servicosFiltrados = computed(() => {
    const termo = this.busca().toLowerCase().trim();
    const todos = this.store.servicos();
    if (!termo) return todos;
    return todos.filter(s =>
      s.nome.toLowerCase().includes(termo) ||
      MODALIDADE_LABELS[s.modalidade].label.toLowerCase().includes(termo)
    );
  });

  ngOnInit(): void { this.store.carregar(); }

  toggleExpandir(id: string): void {
    this.servicoExpandido.update(atual => atual === id ? null : id);
  }

  // ... métodos existentes
}
```

### 6.2 Template `servicos.component.html`

```html
<div class="servicos-page">
  <!-- Header com contador e CTA -->
  <div class="page-header">
    <div>
      <h1>Serviços</h1>
      <p class="page-sub">
        {{ store.total() }} de
        {{ store.limite() === -1 ? 'ilimitados' : store.limite() }}
        no plano atual
      </p>
    </div>
    <button mat-flat-button color="primary" (click)="abrirDialogNovo()"
            [disabled]="store.atingiuLimite()">
      <mat-icon>add</mat-icon> Novo serviço
    </button>
  </div>

  <!-- Busca -->
  @if (store.servicos().length > 0) {
    <mat-form-field appearance="outline" class="busca-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput type="search" placeholder="Buscar serviço por nome ou modalidade..."
             [value]="busca()" (input)="busca.set($any($event.target).value)">
      @if (busca()) {
        <button mat-icon-button matSuffix (click)="busca.set('')" aria-label="Limpar">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  }

  @if (store.carregando()) {
    <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
  } @else if (store.servicos().length === 0) {
    <!-- Empty state inicial -->
    <div class="empty-state">
      <mat-icon>cut</mat-icon>
      <h3>Nenhum serviço cadastrado</h3>
      <p>Adicione seus serviços para começar a receber agendamentos</p>
      <button mat-flat-button color="primary" (click)="abrirDialogNovo()">
        <mat-icon>add</mat-icon> Adicionar primeiro serviço
      </button>
    </div>
  } @else if (servicosFiltrados().length === 0) {
    <!-- Empty state busca sem resultado -->
    <div class="empty-state empty-busca">
      <mat-icon>search_off</mat-icon>
      <h3>Nenhum serviço encontrado</h3>
      <p>Tente buscar por outro termo</p>
    </div>
  } @else {
    <!-- Lista de cards expansíveis -->
    <div class="servicos-list">
      @for (s of servicosFiltrados(); track s.id) {
        <mat-card class="servico-card" [class.inativo]="!s.ativo"
                  [class.expandido]="servicoExpandido() === s.id">

          <!-- Cabeçalho clicável -->
          <div class="card-head" (click)="toggleExpandir(s.id)">
            <div class="card-head-info">
              <div class="card-head-titulo">
                <h3>{{ s.nome }}</h3>
                @if (!s.ativo) {
                  <span class="tag-inativo">Inativo</span>
                }
              </div>
              <div class="card-head-meta">
                <span class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  {{ formatarDuracao(s.duracao_min) }}
                </span>
                <span class="meta-item modalidade">
                  <mat-icon>{{ MODALIDADE_LABELS[s.modalidade].icone }}</mat-icon>
                  {{ MODALIDADE_LABELS[s.modalidade].label }}
                </span>
                <span class="meta-item preco">{{ formatarPreco(s.preco) }}</span>
              </div>
            </div>
            <button mat-icon-button class="btn-expandir" aria-label="Expandir">
              <mat-icon>{{ servicoExpandido() === s.id ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>

          <!-- Conteúdo expansível: ações -->
          @if (servicoExpandido() === s.id) {
            <div class="card-body">
              <div class="card-toggle">
                <mat-slide-toggle color="primary" [checked]="s.ativo" (change)="toggle(s)">
                  {{ s.ativo ? 'Serviço ativo' : 'Serviço inativo' }}
                </mat-slide-toggle>
                <p class="toggle-help">
                  {{ s.ativo
                    ? 'Aparece na sua página pública pra clientes agendarem'
                    : 'Não aparece na página. Clientes não conseguem escolher.' }}
                </p>
              </div>

              <div class="card-actions">
                <button mat-stroked-button (click)="abrirDialogEdicao(s); $event.stopPropagation()">
                  <mat-icon>edit</mat-icon> Editar
                </button>
                <button mat-stroked-button color="warn" (click)="excluir(s); $event.stopPropagation()">
                  <mat-icon>delete_outline</mat-icon> Excluir
                </button>
              </div>
            </div>
          }
        </mat-card>
      }
    </div>
  }
</div>
```

### 6.3 Estilo `servicos.component.scss`

```scss
@use 'styles/variables' as v;

.servicos-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: v.$kianna-slate-900;
  }
  .page-sub {
    font-size: 13px;
    color: v.$kianna-slate-500;
    margin: 4px 0 0;
  }
}

.busca-field {
  width: 100%;
  max-width: 480px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  gap: 12px;
  color: v.$kianna-slate-500;
  text-align: center;

  mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }
  h3 { margin: 0; color: v.$kianna-slate-700; }
  p  { margin: 0; max-width: 320px; }
}

.servicos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ── Card do serviço ──────────────────────────────────────
.servico-card {
  padding: 0 !important;
  overflow: hidden;
  transition: opacity .2s, box-shadow .2s;

  &.inativo { opacity: .7; }
  &.expandido { box-shadow: 0 4px 12px rgba(0,0,0,.08) !important; }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;

  &:hover { background: v.$kianna-slate-50; }
}

.card-head-info {
  flex: 1;
  min-width: 0;
}

.card-head-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: v.$kianna-slate-900;
  }
}

.tag-inativo {
  background: v.$kianna-slate-100;
  color: v.$kianna-slate-500;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-head-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 13px;
  color: v.$kianna-slate-600;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    mat-icon { font-size: 14px; width: 14px; height: 14px; }
  }

  .modalidade {
    background: v.$kianna-green-50;
    color: v.$kianna-green-700;
    padding: 2px 8px;
    border-radius: 99px;
    font-weight: 500;
    mat-icon { color: v.$kianna-green-600; }
  }

  .preco {
    font-weight: 700;
    color: v.$kianna-green-700;
    font-size: 14px;
    margin-left: auto;
  }
}

.btn-expandir {
  flex-shrink: 0;
  color: v.$kianna-slate-500;
}

// ── Corpo expansível ─────────────────────────────────────
.card-body {
  border-top: 1px solid v.$kianna-slate-100;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: v.$kianna-slate-50;
  animation: expandir .2s ease-out;
}

@keyframes expandir {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-help {
  font-size: 12px;
  color: v.$kianna-slate-500;
  margin: 0;
  padding-left: 36px;  // alinha com label do toggle
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  button { flex: 1; }

  @media (min-width: 600px) {
    button { flex: 0 1 auto; }
  }
}
```

---

## TAREFA 7 — Verificação final

### 7.1 Build e testes manuais

```bash
npm run build -- --configuration=production
npm start
```

### 7.2 Checklist mobile (375px - DevTools modo iPhone SE)

**Header:**
- [ ] Hamburguer aparece à esquerda no mobile
- [ ] Chip do link público sumiu no mobile
- [ ] Ícone de notificações (desabilitado) + avatar à direita
- [ ] Avatar abre dropdown com nome, plano, "Configurações da conta", "Sair"

**Drawer:**
- [ ] Tap no hamburguer abre menu lateral
- [ ] Tap em item do menu navega + fecha drawer
- [ ] Tap fora do drawer fecha
- [ ] Sidenav verde escuro com mesmo conteúdo do desktop

**Bottom-nav:**
- [ ] Ainda funciona (não foi removida) — Visão Geral, Agenda, Serviços
- [ ] Conteúdo principal não é coberto pela bottom-nav (padding-bottom 76px)

**Agenda:**
- [ ] Spinner aparece SÓ na primeira carga
- [ ] Após carregar, spinner some completamente
- [ ] Trocar mês não mostra spinner (carrega em background)

**Serviços:**
- [ ] Campo de busca aparece se há serviços
- [ ] Cards começam recolhidos (só cabeçalho visível)
- [ ] Tap no cabeçalho expande/recolhe
- [ ] Botões editar/excluir aparecem só no card expandido
- [ ] Toggle ativo/inativo dentro do card expandido
- [ ] Busca filtra por nome E modalidade

**Configurações:**
- [ ] Cada aba tem cards visualmente separados
- [ ] Espaçamento generoso entre seções
- [ ] Mensagens de erro aparecem quando URL inválida (Instagram, Facebook, X, YouTube)
- [ ] Botão "Salvar" sticky no rodapé

### 7.3 Checklist desktop (≥960px)

- [ ] Sidenav fixa funcionando (não sumiu)
- [ ] Header mostra chip do link público + ícones (sem hamburguer)
- [ ] Drawer mobile NÃO renderiza (verifica DOM)
- [ ] Avatar dropdown também funciona
- [ ] Configurações em cards (mesmo padrão mobile)
- [ ] Serviços em cards expansíveis (mesmo padrão)

### 7.4 Commit

```bash
git add .
git commit -m "feat(mobile-ux): header reorganizado, drawer lateral, fix loading agenda, redesign serviços"
git push origin feat/mobile-ux-melhorias
```

---

## ⚠️ Possíveis problemas e soluções

### Drawer não fecha ao clicar em item
Confirma que `(itemClicked)="fecharDrawer()"` está no `<app-sidenav>` no template do dashboard, e que o sidenav tem `(click)="navegarItem()"` em cada `<a>`.

### Spinner do FullCalendar volta após primeira carga
O `periodoCarregado` precisa ser resetado em **alguns casos** (ex: usuário vai pra outra rota e volta). Se isso acontecer, adicione `this.periodoCarregado.set(null)` no `ngOnInit` da agenda.

### Build falha com "Cannot find module"
Confirme imports em `header.component.ts` e `dashboard.component.ts`. Quaisquer novos `MatMenuModule`, `MatBadgeModule`, `MatSidenavModule` precisam estar no `imports`.

### Avatar dropdown não aparece
Verifique que `MatMenuModule` está importado E que `[matMenuTriggerFor]="menuPerfil"` aponta pro `<mat-menu #menuPerfil>` correto.

### Cards de serviço não expandem
Confirma que `(click)="toggleExpandir(s.id)"` está no `.card-head` e que os botões de edit/excluir têm `$event.stopPropagation()` pra não disparar o toggle.

---

## ✅ Checklist final

- [ ] Header mobile reorganizado (hamburguer + ícones + dropdown avatar)
- [ ] Drawer lateral mobile funcionando
- [ ] Sidenav emite evento ao clicar em item (fecha drawer)
- [ ] Spinner da agenda só aparece na primeira carga
- [ ] Mensagens de erro de URL claras nos 4 campos de redes
- [ ] Configurações em cards visualmente separados
- [ ] Serviços com busca + cards expansíveis
- [ ] Build de produção sem erros
- [ ] Funciona em iPhone SE (375px) e desktop ≥1280px
- [ ] Branch mergeada na main

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Melhorias Mobile UX
