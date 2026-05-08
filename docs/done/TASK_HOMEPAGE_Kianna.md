# TASK — Homepage Pública do Kianna (Landing Page)
> Repositório: `kianna-web`
> Pré-requisitos: Módulos 1 e 2 implementados, rebranding concluído
> Objetivo: construir a página inicial pública (landing page) do kianna.com.br, focada em conversão
> Rota destino: `/` (raiz pública, **não autenticada**)
> Referências: análise de concorrentes em `ANALISE_CONCORRENTES_Estrategia.md`

---

## ⚠️ LEIA ANTES DE COMEÇAR

### Princípios de design e código

1. **Componente burro, lógica zero.** A homepage é estática — sem chamadas de API, sem services. Apenas seções declarativas.
2. **Dados em arquivos `.ts` separados.** Listas de features, depoimentos, planos, FAQ ficam em arquivos `.data.ts` dentro de `home/data/`. Não hardcoded no template.
3. **Reuso máximo de variáveis SCSS** já criadas no Módulo 2 (`$kianna-green-*`, `$kianna-slate-*`).
4. **SSR-first.** Esta é a página de entrada — DEVE renderizar no servidor pra SEO e velocidade.
5. **Mobile-first.** A maioria dos cabeleireiros vai abrir no celular. Cada seção deve ficar bonita primeiro em 375px de largura.
6. **Sem libraries extras.** Use só Angular Material e CSS puro. Nenhum slider, nenhum carousel library.

### Estratégia de conteúdo (resumo da análise)

A homepage segue **modelo Agendar Agora** (concorrente analisado), com algumas adaptações:

- ✅ Headline emocional + quantitativa
- ✅ Mockup do produto no hero
- ✅ Seção "Custo invisível" com gráfico de impacto
- ✅ 3 features principais (não mais)
- ✅ 3 passos simples de onboarding
- ✅ Depoimentos com foto + nome + cidade
- ✅ Apenas 2 planos pagos (Pro + Studio) + grátis
- ✅ FAQ com 7 perguntas
- ✅ CTA final em banner destaque

**Tom geral:** direto, brasileiro, foco no benefício do profissional autônomo de beleza.

### Identidade visual

- **Cor primária:** `#1D9E75` (verde Kianna, mantida do Módulo 2)
- **Cor secundária:** `#0F172A` (slate dark pra fundos contrastantes)
- **Acento:** `#FBBF24` (amarelo pra estrelas/destaques)
- **Emoji da marca:** ✨

---

## TAREFA 1 — Estrutura de pastas

Crie a estrutura completa:

```
src/app/features/
├── home/
│   ├── home.component.ts                    ← componente shell da landing
│   ├── home.component.html
│   ├── home.component.scss
│   ├── home.routes.ts
│   │
│   ├── sections/                            ← cada seção é um componente
│   │   ├── hero/
│   │   │   ├── hero.component.ts
│   │   │   ├── hero.component.html
│   │   │   └── hero.component.scss
│   │   ├── trust-bar/
│   │   ├── custo-invisivel/
│   │   ├── features/
│   │   ├── como-funciona/
│   │   ├── nichos/
│   │   ├── personalizacao/
│   │   ├── depoimentos/
│   │   ├── planos/
│   │   ├── faq/
│   │   ├── cta-final/
│   │   ├── header-publico/
│   │   └── footer-publico/
│   │
│   └── data/                                ← dados estáticos
│       ├── nichos.data.ts
│       ├── features.data.ts
│       ├── passos.data.ts
│       ├── depoimentos.data.ts
│       ├── planos.data.ts
│       └── faq.data.ts
```

> 💡 Cada seção como componente separado facilita iteração futura (A/B test, swap de seção, ordenação).

---

## TAREFA 2 — Rota pública e configuração

### 2.1 Adicionar rota raiz pública

Edite `src/app/app.routes.ts`. **Substitua** o redirect de `/` para dashboard por algo condicional ao login:

```typescript
import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  // ── Home pública (raiz) ──────────────────────────────────────
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Kianna — Sua secretária digital de agendamentos',
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
    title: 'Configurar perfil — Kianna',
  },

  // ── Dashboard ────────────────────────────────────────────────
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

> ⚠️ **Importante:** o `authGuard` deve continuar redirecionando user logado pra `/dashboard` quando ele tentar acessar `/`. Isso é o comportamento desejado — quem já tem conta vai direto pro app.
>
> **Implementação sugerida:** adicione um `canMatch` na rota da home que redireciona logados:
>
> ```typescript
> {
>   path: '',
>   pathMatch: 'full',
>   canMatch: [() => {
>     const router = inject(Router);
>     if (isAuthenticated()) {
>       router.navigate([isOnboardingDone() ? '/dashboard' : '/onboarding']);
>       return false;
>     }
>     return true;
>   }],
>   loadComponent: () => ...
> }
> ```

---

## TAREFA 3 — Dados estáticos das seções

### 3.1 Nichos (`src/app/features/home/data/nichos.data.ts`)

```typescript
export interface Nicho {
  id: string;
  icone: string;        // material icon
  emoji: string;
  titulo: string;
  descricao: string;
}

export const NICHOS: Nicho[] = [
  {
    id: 'cabeleireiro',
    icone: 'content_cut',
    emoji: '💇‍♀️',
    titulo: 'Cabeleireiros',
    descricao: 'Salões pequenos ou autônomos que perdem horas no WhatsApp negociando horário.',
  },
  {
    id: 'manicure',
    icone: 'spa',
    emoji: '💅',
    titulo: 'Manicures',
    descricao: 'Profissionais que oferecem múltiplos serviços e querem organizar a agenda.',
  },
  {
    id: 'esteticista',
    icone: 'face',
    emoji: '✨',
    titulo: 'Esteticistas',
    descricao: 'Limpeza de pele, design de sobrancelha, e procedimentos com tempo certo.',
  },
  {
    id: 'barbeiro',
    icone: 'cut',
    emoji: '💈',
    titulo: 'Barbeiros',
    descricao: 'Cortes, barbas e combos com cliente sempre na hora certa.',
  },
  {
    id: 'tatuador',
    icone: 'edit',
    emoji: '🎨',
    titulo: 'Tatuadores',
    descricao: 'Sessões longas que precisam de bloqueio de horário sem confusão.',
  },
  {
    id: 'massagista',
    icone: 'self_improvement',
    emoji: '💆',
    titulo: 'Massoterapeutas',
    descricao: 'Sessões de relaxamento agendadas com lembretes que reduzem faltas.',
  },
];
```

### 3.2 Features (`src/app/features/home/data/features.data.ts`)

```typescript
export interface Feature {
  icone: string;
  titulo: string;
  descricao: string;
}

export const FEATURES: Feature[] = [
  {
    icone: 'schedule',
    titulo: 'Agendamento 24h por dia',
    descricao: 'Chega de perder tempo respondendo "tem horário?" no WhatsApp. Seu cliente acessa seu link, vê seus horários livres e agenda sozinho — a qualquer hora, até de madrugada.',
  },
  {
    icone: 'notifications_active',
    titulo: 'Lembretes automáticos no WhatsApp',
    descricao: 'Esqueceu do horário? Nunca mais. A Kianna envia lembretes automáticos pelo WhatsApp 24h antes do compromisso, reduzindo faltas em até 80%.',
  },
  {
    icone: 'palette',
    titulo: 'Sua página, sua cara',
    descricao: 'Página de agendamento personalizada com seu nome, suas cores, sua foto e seus serviços. Profissionalismo imediato pra impressionar seu cliente.',
  },
];
```

### 3.3 Passos (`src/app/features/home/data/passos.data.ts`)

```typescript
export interface Passo {
  numero: number;
  titulo: string;
  descricao: string;
}

export const PASSOS: Passo[] = [
  {
    numero: 1,
    titulo: 'Configure suas regras',
    descricao: 'Define seus horários de trabalho, pausas, almoço e a duração de cada serviço. Em 2 minutos você está pronta.',
  },
  {
    numero: 2,
    titulo: 'Compartilhe seu link',
    descricao: 'Coloca no perfil do Instagram, manda no WhatsApp do cliente ou imprime no cartão de visitas. Ele agenda sozinho.',
  },
  {
    numero: 3,
    titulo: 'Receba notificações',
    descricao: '"Novo agendamento confirmado." A Kianna avisa você no WhatsApp e adiciona automaticamente na sua agenda.',
  },
];
```

### 3.4 Depoimentos (`src/app/features/home/data/depoimentos.data.ts`)

> ⚠️ **NOTA IMPORTANTE:** os depoimentos abaixo são **representativos** (não de clientes reais) — a Kianna ainda está em estágio inicial. Sinalize isso no rodapé da seção: "Depoimentos representativos baseados em pesquisa de mercado".
>
> Quando tiver clientes reais, **substitua** por depoimentos verdadeiros e remova o aviso. **Nunca passe depoimentos fictícios como reais** — Lei do Consumidor.

```typescript
export interface Depoimento {
  estrelas: number;
  texto: string;
  nome: string;
  cargo: string;
  cidade: string;
  fotoUrl: string;  // pode ser null e mostrar iniciais
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    estrelas: 5,
    texto: 'Eu perdia pelo menos 1 hora do meu dia respondendo cliente pra marcar horário. Agora mando o link e elas que se organizam. Mudou minha vida!',
    nome: 'Mariana Silva',
    cargo: 'Cabeleireira',
    cidade: 'São Paulo, SP',
    fotoUrl: '',
  },
  {
    estrelas: 5,
    texto: 'A automação dos lembretes fez minhas faltas caírem 70%. O sistema se paga logo no primeiro mês.',
    nome: 'Patrícia Rocha',
    cargo: 'Esteticista',
    cidade: 'Curitiba, PR',
    fotoUrl: '',
  },
  {
    estrelas: 5,
    texto: 'Antes eu anotava tudo na agenda de papel e vivia perdendo horário. Hoje minhas clientes elogiam o sistema.',
    nome: 'Camila Andrade',
    cargo: 'Manicure',
    cidade: 'Maringá, PR',
    fotoUrl: '',
  },
];
```

### 3.5 Planos (`src/app/features/home/data/planos.data.ts`)

```typescript
export interface Plano {
  id: 'gratis' | 'pro' | 'studio';
  nome: string;
  descricao: string;
  precoMensal: number;     // 0 para grátis
  precoAnual: number;      // por mês quando pago anual
  destaque: boolean;
  ctaTexto: string;
  features: string[];
  selo?: string;           // ex: "Mais escolhido"
}

export const PLANOS: Plano[] = [
  {
    id: 'gratis',
    nome: 'Grátis',
    descricao: 'Perfeito pra testar e começar.',
    precoMensal: 0,
    precoAnual: 0,
    destaque: false,
    ctaTexto: 'Criar conta grátis',
    features: [
      'Até 20 agendamentos por mês',
      '1 serviço cadastrado',
      'Página pública personalizada',
      'Confirmação automática no WhatsApp',
      '"Powered by Kianna" na página',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    descricao: 'Pra profissional que não quer perder cliente.',
    precoMensal: 39.90,
    precoAnual: 31.90,
    destaque: true,
    selo: 'Mais escolhido',
    ctaTexto: 'Começar agora',
    features: [
      'Agendamentos ilimitados',
      'Serviços ilimitados',
      'Lembretes automáticos no WhatsApp',
      'Personalização total da página',
      'Sem marca Kianna',
      'Relatórios mensais',
      'Suporte prioritário',
    ],
  },
  {
    id: 'studio',
    nome: 'Studio',
    descricao: 'Pra estúdios e equipes pequenas.',
    precoMensal: 79.90,
    precoAnual: 63.90,
    destaque: false,
    ctaTexto: 'Começar agora',
    features: [
      'Tudo do Pro',
      'Até 3 profissionais na mesma conta',
      'Agenda compartilhada',
      'Relatórios por profissional',
      'Suporte prioritário',
    ],
  },
];
```

### 3.6 FAQ (`src/app/features/home/data/faq.data.ts`)

```typescript
export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export const FAQ: FaqItem[] = [
  {
    pergunta: 'Minhas clientes vão saber usar?',
    resposta: 'Com certeza. A página de agendamento é tão simples quanto pedir comida no iFood — escolhe o serviço, escolhe o horário e pronto. Funciona no celular sem instalar nada.',
  },
  {
    pergunta: 'Funciona pro meu tipo de negócio?',
    resposta: 'A Kianna funciona pra qualquer profissional que atende com hora marcada: cabeleireiros, manicures, esteticistas, barbeiros, tatuadores, massoterapeutas e similares. Se você marca horário com cliente, funciona pra você.',
  },
  {
    pergunta: 'Como funciona o teste grátis?',
    resposta: 'Você cria sua conta sem cartão de crédito e pode usar o plano Grátis pra sempre — com até 20 agendamentos por mês. Quando quiser ilimitado, troca pro Pro com 1 clique.',
  },
  {
    pergunta: 'Preciso ter site ou conhecimento técnico?',
    resposta: 'Não. A Kianna cria sua página de agendamento automaticamente quando você cadastra. É só compartilhar o link.',
  },
  {
    pergunta: 'Posso cancelar quando quiser?',
    resposta: 'Pode sim. Sem multa, sem fidelidade. Você cancela direto pelo dashboard — leva 1 minuto.',
  },
  {
    pergunta: 'Como meus clientes vão receber as confirmações?',
    resposta: 'Direto no WhatsApp deles. Quando cliente agenda, ela recebe a confirmação imediatamente. 24h antes do compromisso, recebe um lembrete pra confirmar, reagendar ou cancelar.',
  },
  {
    pergunta: 'Quanto custa pra começar?',
    resposta: 'Zero. O plano Grátis funciona pra sempre, sem precisar de cartão. Quando você crescer, pode passar pro Pro (R$ 39,90/mês) ou Studio (R$ 79,90/mês).',
  },
];
```

---

## TAREFA 4 — Header público

### 4.1 Componente `header-publico`

Crie `src/app/features/home/sections/header-publico/header-publico.component.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-header-publico',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './header-publico.component.html',
  styleUrl: './header-publico.component.scss',
})
export class HeaderPublicoComponent {
  readonly APP = APP;
  readonly menuAberto = signal(false);

  readonly secoes = [
    { id: 'features', label: 'Funcionalidades' },
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'planos', label: 'Preços' },
    { id: 'faq', label: 'Dúvidas' },
  ];

  scrollPara(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuAberto.set(false);
  }
}
```

Template `header-publico.component.html`:

```html
<header class="header-pub">
  <div class="header-inner">
    <a routerLink="/" class="logo">
      <span class="logo-emoji">{{ APP.EMOJI }}</span>
      <span class="logo-text">{{ APP.NOME }}</span>
    </a>

    <nav class="nav-desktop">
      @for (s of secoes; track s.id) {
        <button class="nav-link" (click)="scrollPara(s.id)">{{ s.label }}</button>
      }
    </nav>

    <div class="cta-group">
      <a routerLink="/auth/login" class="btn-entrar">Entrar</a>
      <a routerLink="/auth/cadastro" mat-flat-button color="primary" class="btn-cadastrar">
        Criar conta grátis
      </a>
      <button class="btn-menu" (click)="menuAberto.set(!menuAberto())" aria-label="Menu">
        <mat-icon>{{ menuAberto() ? 'close' : 'menu' }}</mat-icon>
      </button>
    </div>
  </div>

  @if (menuAberto()) {
    <div class="nav-mobile">
      @for (s of secoes; track s.id) {
        <button class="nav-link-mobile" (click)="scrollPara(s.id)">{{ s.label }}</button>
      }
      <a routerLink="/auth/login" class="nav-link-mobile">Entrar</a>
    </div>
  }
</header>
```

Estilo `header-publico.component.scss`:

```scss
@use 'styles/variables' as v;

.header-pub {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid v.$kianna-slate-100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 600px) { padding: 10px 16px; }
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: v.$kianna-slate-900;
  font-weight: 700;
  font-size: 20px;

  .logo-emoji { font-size: 22px; }
  .logo-text { color: v.$kianna-green-600; }
}

.nav-desktop {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;

  @media (max-width: 880px) { display: none; }
}

.nav-link {
  background: transparent;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: v.$kianna-slate-700;
  cursor: pointer;
  border-radius: 6px;
  transition: background .15s, color .15s;

  &:hover { background: v.$kianna-slate-100; color: v.$kianna-green-600; }
}

.cta-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-entrar {
  font-size: 14px;
  font-weight: 500;
  color: v.$kianna-slate-700;
  text-decoration: none;
  padding: 8px 12px;

  @media (max-width: 600px) { display: none; }
}

.btn-cadastrar {
  font-size: 14px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;

  @media (max-width: 600px) { display: none !important; }
}

.btn-menu {
  display: none;
  background: transparent;
  border: 1px solid v.$kianna-slate-200;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 880px) { display: flex; }
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  border-top: 1px solid v.$kianna-slate-100;
  padding: 8px 16px 16px;
  background: #fff;

  @media (min-width: 881px) { display: none; }
}

.nav-link-mobile {
  background: transparent;
  border: none;
  text-align: left;
  padding: 12px 8px;
  font-size: 15px;
  color: v.$kianna-slate-700;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid v.$kianna-slate-100;

  &:last-child { border-bottom: none; color: v.$kianna-green-600; font-weight: 600; }
}
```

---

## TAREFA 5 — Hero (a seção mais importante)

> 🎯 **Lembrete da análise:** o hero é responsável por 80% da decisão do usuário de continuar lendo. Não economize esforço aqui.

### 5.1 Hero component

Crie `src/app/features/home/sections/hero/hero.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
```

Template `hero.component.html`:

```html
<section class="hero">
  <div class="hero-inner">
    <div class="hero-content">
      <span class="badge">⚡ A partir de R$ 39,90/mês</span>

      <h1 class="hero-title">
        Sua agenda <span class="grifo">cheia</span>,<br>
        sem você responder<br>
        <span class="grifo">um único WhatsApp</span>.
      </h1>

      <p class="hero-sub">
        Sua secretária digital recebe agendamentos 24h por dia, confirma sozinha
        e lembra seu cliente — direto pelo WhatsApp. Tudo pronto em 2 minutos.
      </p>

      <div class="hero-cta">
        <a routerLink="/auth/cadastro" mat-flat-button color="primary" class="cta-principal">
          Criar minha agenda grátis
          <mat-icon>arrow_forward</mat-icon>
        </a>
        <span class="cta-sub">
          <mat-icon class="check-icon">check_circle</mat-icon>
          Sem cartão de crédito · Pronto em 2 minutos
        </span>
      </div>

      <div class="hero-rating">
        <div class="estrelas">
          @for (i of [1,2,3,4,5]; track i) {
            <mat-icon class="estrela">star</mat-icon>
          }
        </div>
        <span class="rating-text">5,0 — Avaliação dos primeiros usuários</span>
      </div>
    </div>

    <div class="hero-mockup">
      <!-- Mockup placeholder do produto -->
      <div class="mockup-frame">
        <div class="mockup-header">
          <div class="mockup-dot"></div>
          <div class="mockup-dot"></div>
          <div class="mockup-dot"></div>
          <span class="mockup-url">kianna.com.br/maria</span>
        </div>
        <div class="mockup-body">
          <div class="mock-perfil">
            <div class="mock-avatar">M</div>
            <div>
              <div class="mock-nome">Maria Cabeleireira</div>
              <div class="mock-tag">Salão de beleza · Maringá</div>
            </div>
          </div>

          <div class="mock-servicos">
            <div class="mock-servico">
              <span class="m-titulo">Corte feminino</span>
              <span class="m-meta">45 min · R$ 80</span>
            </div>
            <div class="mock-servico ativo">
              <span class="m-titulo">Escova progressiva</span>
              <span class="m-meta">2h · R$ 250</span>
            </div>
            <div class="mock-servico">
              <span class="m-titulo">Coloração</span>
              <span class="m-meta">1h30 · R$ 180</span>
            </div>
          </div>

          <button class="mock-cta">Ver horários disponíveis</button>
        </div>
      </div>
    </div>
  </div>
</section>
```

Estilo `hero.component.scss`:

```scss
@use 'styles/variables' as v;

.hero {
  background: linear-gradient(180deg, #fff 0%, v.$kianna-green-50 100%);
  padding: 64px 24px 80px;

  @media (max-width: 600px) { padding: 32px 16px 48px; }
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.hero-content { display: flex; flex-direction: column; gap: 20px; }

.badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  background: v.$kianna-green-100;
  color: v.$kianna-green-800;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  color: v.$kianna-slate-900;
  margin: 0;

  .grifo { color: v.$kianna-green-600; }

  @media (max-width: 880px) { font-size: 36px; }
  @media (max-width: 600px) { font-size: 30px; }
}

.hero-sub {
  font-size: 17px;
  color: v.$kianna-slate-600;
  line-height: 1.5;
  margin: 0;
  max-width: 540px;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  margin-top: 8px;
}

.cta-principal {
  height: 52px !important;
  padding: 0 24px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
}

.cta-sub {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: v.$kianna-slate-500;

  .check-icon {
    color: v.$kianna-green-500;
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;

  .estrelas { display: flex; gap: 2px; }
  .estrela { color: #FBBF24; font-size: 18px; width: 18px; height: 18px; }
  .rating-text { font-size: 13px; color: v.$kianna-slate-500; }
}

// ── Mockup ─────────────────────────────────────────────────
.hero-mockup {
  display: flex;
  justify-content: center;
}

.mockup-frame {
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 20px 60px -20px rgba(15, 23, 42, .25),
    0 8px 24px -8px rgba(29, 158, 117, .15);
  width: 100%;
  max-width: 380px;
  overflow: hidden;
}

.mockup-header {
  background: v.$kianna-slate-100;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;

  .mockup-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: v.$kianna-slate-300;
    &:nth-child(1) { background: #EF4444; }
    &:nth-child(2) { background: #F59E0B; }
    &:nth-child(3) { background: #10B981; }
  }
  .mockup-url {
    margin-left: 12px;
    font-size: 12px;
    color: v.$kianna-slate-500;
    font-family: monospace;
  }
}

.mockup-body { padding: 20px; }

.mock-perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mock-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, v.$kianna-green-400, v.$kianna-green-600);
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-nome { font-weight: 600; color: v.$kianna-slate-900; }
.mock-tag  { font-size: 12px; color: v.$kianna-slate-500; }

.mock-servicos { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.mock-servico {
  padding: 12px;
  border: 1px solid v.$kianna-slate-200;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;

  .m-titulo { font-weight: 500; color: v.$kianna-slate-800; }
  .m-meta { color: v.$kianna-slate-500; font-size: 12px; }

  &.ativo {
    border-color: v.$kianna-green-500;
    background: v.$kianna-green-50;
    .m-titulo { color: v.$kianna-green-800; font-weight: 600; }
  }
}

.mock-cta {
  width: 100%;
  background: v.$kianna-green-500;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
```

---

## TAREFA 6 — Trust Bar (logos representativos)

Crie `src/app/features/home/sections/trust-bar/trust-bar.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="trust-bar">
      <div class="trust-inner">
        <p class="trust-label">Em breve, profissionais de beleza de todo o Brasil usando a Kianna pra parar de perder tempo no WhatsApp.</p>
      </div>
    </section>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .trust-bar {
      background: v.$kianna-slate-50;
      padding: 24px;
      border-top: 1px solid v.$kianna-slate-100;
      border-bottom: 1px solid v.$kianna-slate-100;
    }
    .trust-inner {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    .trust-label {
      font-size: 13px;
      color: v.$kianna-slate-500;
      margin: 0;
      font-style: italic;
    }
  `],
})
export class TrustBarComponent {}
```

> 💡 **Nota sobre o trust bar:** como Kianna está em estágio inicial, **não invente "3.500 profissionais"** como o Agendar Agora faz. Use mensagem honesta: "em breve". Substitua por números reais quando tiver.

---

## TAREFA 7 — Custo Invisível (gráfico de impacto)

Esta é uma das seções mais importantes — quantifica o problema do agendamento manual.

Crie `src/app/features/home/sections/custo-invisivel/custo-invisivel.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custo-invisivel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './custo-invisivel.component.html',
  styleUrl: './custo-invisivel.component.scss',
})
export class CustoInvisivelComponent {}
```

Template `custo-invisivel.component.html`:

```html
<section class="custo-section">
  <div class="custo-inner">
    <div class="custo-content">
      <h2 class="custo-titulo">O custo invisível do<br>agendamento manual</h2>

      <p class="custo-desc">
        Pesquisas com profissionais autônomos mostram um padrão: <strong>5 a 8 horas por semana</strong>
        perdidas só negociando horário pelo WhatsApp e sofrendo com faltas.
        É um dia inteiro de trabalho, todo mês, jogado fora.
      </p>

      <ul class="custo-bullets">
        <li>
          <mat-icon>check_circle</mat-icon>
          <span>Recupere até <strong>20+ horas por mês</strong> de produtividade</span>
        </li>
        <li>
          <mat-icon>check_circle</mat-icon>
          <span>Reduza faltas em até <strong>80%</strong> com lembretes automáticos</span>
        </li>
        <li>
          <mat-icon>check_circle</mat-icon>
          <span>Ganhe imagem profissional: cliente vê seu trabalho, não sua agenda confusa</span>
        </li>
      </ul>
    </div>

    <div class="custo-grafico">
      <div class="grafico-titulo">HORAS PERDIDAS POR SEMANA</div>
      <div class="grafico-bars">
        <div class="bar-group">
          <div class="bar bar-antes" style="--altura: 100%">
            <span class="bar-valor">8h</span>
          </div>
          <div class="bar-label">Sem Kianna</div>
        </div>
        <div class="bar-group">
          <div class="bar bar-depois" style="--altura: 25%">
            <span class="bar-valor">2h</span>
          </div>
          <div class="bar-label">Com Kianna</div>
        </div>
      </div>

      <div class="grafico-legenda">
        <span class="legenda-item">
          <span class="legenda-cor cor-antes"></span> Negociação WhatsApp + faltas
        </span>
      </div>
    </div>
  </div>
</section>
```

Estilo `custo-invisivel.component.scss`:

```scss
@use 'styles/variables' as v;

.custo-section {
  background: #fff;
  padding: 80px 24px;

  @media (max-width: 600px) { padding: 48px 16px; }
}

.custo-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.custo-titulo {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 16px;
  color: v.$kianna-slate-900;

  @media (max-width: 600px) { font-size: 28px; }
}

.custo-desc {
  font-size: 16px;
  line-height: 1.6;
  color: v.$kianna-slate-600;
  margin: 0 0 24px;

  strong { color: v.$kianna-slate-900; }
}

.custo-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 15px;
    color: v.$kianna-slate-700;

    mat-icon {
      color: v.$kianna-green-500;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    strong { color: v.$kianna-green-700; font-weight: 700; }
  }
}

// ── Gráfico ───────────────────────────────────────────────
.custo-grafico {
  background: v.$kianna-slate-50;
  border-radius: 16px;
  padding: 32px;
}

.grafico-titulo {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  color: v.$kianna-slate-500;
  text-align: center;
  margin-bottom: 24px;
}

.grafico-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 240px;
  margin-bottom: 16px;
  border-bottom: 2px solid v.$kianna-slate-200;
  padding-bottom: 8px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 100%;
  justify-content: flex-end;
  gap: 12px;
}

.bar {
  width: 64px;
  height: var(--altura);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height .8s ease-out;

  &.bar-antes  { background: linear-gradient(180deg, #FEE2E2, #EF4444); }
  &.bar-depois { background: linear-gradient(180deg, v.$kianna-green-300, v.$kianna-green-600); }
}

.bar-valor {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 800;
  color: v.$kianna-slate-800;
}

.bar-label {
  font-size: 13px;
  font-weight: 600;
  color: v.$kianna-slate-700;
  text-align: center;
}

.grafico-legenda {
  display: flex;
  justify-content: center;
  font-size: 11px;
  color: v.$kianna-slate-500;
}

.legenda-item { display: flex; align-items: center; gap: 4px; }

.legenda-cor {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  &.cor-antes { background: #EF4444; }
}
```

---

## TAREFA 8 — Demais seções (forma resumida)

> ⚠️ **As seções abaixo seguem o mesmo padrão de estrutura das anteriores** (TS + HTML + SCSS, dados de `data/`, layout responsivo). Pra economizar espaço neste task card, descrevo os requisitos. Implemente seguindo o estilo das anteriores.

### 8.1 Seção `features` (3 cards de features)

- **Título:** "Tudo que você precisa para focar no seu trabalho"
- **Subtítulo:** "Uma plataforma completa de agendamento, feita sob medida para o profissional autônomo brasileiro."
- **Layout:** grid de 3 cards lado a lado (desktop), empilhados (mobile)
- **Fonte de dados:** `FEATURES` de `features.data.ts`
- **Cada card:** ícone material colorido + título + descrição

### 8.2 Seção `como-funciona` (3 passos)

- **Título:** "Sua nova rotina em 3 passos simples"
- **Layout:** timeline vertical com numeração (1, 2, 3) + cards explicativos
- **Fonte:** `PASSOS` de `passos.data.ts`
- **Visual:** cada passo tem ícone numerado em verde + título + descrição

### 8.3 Seção `nichos` ("para quem é")

- **Título:** "Pra qualquer profissional que atende com hora marcada"
- **Layout:** grid responsivo de 6 cards (3x2 desktop, 2x3 tablet, 1x6 mobile)
- **Fonte:** `NICHOS` de `nichos.data.ts`
- **Cada card:** emoji grande + título + descrição curta

### 8.4 Seção `personalizacao`

- **Título:** "Sua página, sua marca"
- **Layout:** texto + carrossel horizontal de 5-7 mockups de cores diferentes (CSS, sem libraries)
- **Conteúdo:** mostra que cada profissional pode personalizar a aparência da página pública
- **Implementação simples:** divs lado a lado com `overflow-x: auto`

### 8.5 Seção `depoimentos`

- **Título:** "Quem testa, não volta pra agenda de papel"
- **Layout:** 2-3 cards lado a lado (desktop), carrossel horizontal scroll (mobile)
- **Fonte:** `DEPOIMENTOS` de `depoimentos.data.ts`
- **Aviso:** "Depoimentos representativos baseados em pesquisa de mercado" (rodapé pequeno da seção)
- **Cada card:** 5 estrelas + texto + foto/iniciais + nome + cargo + cidade

### 8.6 Seção `planos` (mais complexa)

- **Título:** "Escolha o plano que cabe no seu momento"
- **Subtítulo:** "Sem fidelidade. Sem taxa escondida. Cancele quando quiser."
- **Toggle Mensal/Anual:** signal local (`mensal = signal(true)`)
- **Layout:** 3 cards lado a lado (Grátis, Pro destaque, Studio)
- **Fonte:** `PLANOS` de `planos.data.ts`
- **Card destaque (Pro):** borda verde + selo "Mais escolhido" no topo
- **Cada card:** nome + descrição + preço + lista de features + CTA
- **CTAs:** linkam pra `/auth/cadastro`

> 💡 **Implementação do toggle anual/mensal:** quando anual, mostra `precoAnual` com texto pequeno "/mês, cobrado anualmente" e exibe selo "-20%" no toggle.

### 8.7 Seção `faq`

- **Título:** "Ainda tem dúvidas?"
- **Layout:** acordeão (use `mat-expansion-panel`)
- **Fonte:** `FAQ` de `faq.data.ts`
- **Comportamento:** clica e expande, fecha as outras

### 8.8 Seção `cta-final`

- **Layout:** banner de fundo escuro (gradient slate→green)
- **Conteúdo:** badge "Pronto pra começar?" + título grande + descrição + botão principal + microcopy "Sem cartão, sem fidelidade"
- **Estilo:** parecido com a seção CTA do Módulo 1 (login wrapper), mas em formato banner horizontal

### 8.9 Footer público

Crie `src/app/features/home/sections/footer-publico/footer-publico.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-footer-publico',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './footer-publico.component.html',
  styleUrl: './footer-publico.component.scss',
})
export class FooterPublicoComponent {
  readonly APP = APP;
  readonly ano = new Date().getFullYear();
}
```

Template:
- Logo Kianna ✨ + tagline curta
- 3 colunas de links: Produto (Features, Preços, FAQ), Suporte (Contato, Ajuda), Legal (Termos, Privacidade)
- Redes sociais (Instagram, Facebook, LinkedIn) — placeholder
- Copyright "© 2026 Kianna · Todos os direitos reservados"

---

## TAREFA 9 — Componente `home` (composição)

Crie `src/app/features/home/home.component.ts`:

```typescript
import { Component } from '@angular/core';
import { HeaderPublicoComponent } from './sections/header-publico/header-publico.component';
import { HeroComponent } from './sections/hero/hero.component';
import { TrustBarComponent } from './sections/trust-bar/trust-bar.component';
import { CustoInvisivelComponent } from './sections/custo-invisivel/custo-invisivel.component';
import { FeaturesComponent } from './sections/features/features.component';
import { ComoFuncionaComponent } from './sections/como-funciona/como-funciona.component';
import { NichosComponent } from './sections/nichos/nichos.component';
import { PersonalizacaoComponent } from './sections/personalizacao/personalizacao.component';
import { DepoimentosComponent } from './sections/depoimentos/depoimentos.component';
import { PlanosComponent } from './sections/planos/planos.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaFinalComponent } from './sections/cta-final/cta-final.component';
import { FooterPublicoComponent } from './sections/footer-publico/footer-publico.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderPublicoComponent, HeroComponent, TrustBarComponent,
    CustoInvisivelComponent, FeaturesComponent, ComoFuncionaComponent,
    NichosComponent, PersonalizacaoComponent, DepoimentosComponent,
    PlanosComponent, FaqComponent, CtaFinalComponent, FooterPublicoComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
```

Template `home.component.html`:

```html
<app-header-publico />

<main>
  <app-hero id="hero" />
  <app-trust-bar />
  <app-custo-invisivel />
  <app-features id="features" />
  <app-como-funciona id="como-funciona" />
  <app-nichos />
  <app-personalizacao />
  <app-depoimentos />
  <app-planos id="planos" />
  <app-faq id="faq" />
  <app-cta-final />
</main>

<app-footer-publico />
```

---

## TAREFA 10 — Verificação final

### 10.1 Rodar e testar

```bash
npm start
```

Acesse `http://localhost:4200/` e verifique:

### 10.2 Checklist de qualidade

**SEO e meta tags:**
- [ ] Title da aba: "Kianna — Sua secretária digital de agendamentos"
- [ ] Meta description com 150 caracteres exatos
- [ ] Página renderiza no servidor (view source mostra HTML completo, não só `<app-root>`)

**Conteúdo e copy:**
- [ ] Headline emocional + impactante (não genérica)
- [ ] CTAs claros: "Criar minha agenda grátis" / "Começar agora"
- [ ] "Sem cartão de crédito" aparece pelo menos 2 vezes
- [ ] FAQ aborda objeções principais (cancelamento, preço, dificuldade do cliente)

**Visual:**
- [ ] Logo e cores Kianna em todas as seções
- [ ] Mockup do produto no hero é convincente
- [ ] Gráfico de barras na seção custo invisível com animação
- [ ] Cards de feature, nichos e planos consistentes em estilo
- [ ] Sem strings "AgendaZap" em lugar nenhum
- [ ] Sem emoji 📅 (apenas ✨)

**Responsividade:**
- [ ] Desktop (≥1280px): hero em 2 colunas, planos em 3 colunas
- [ ] Tablet (≥600px e <1280px): hero em 1 coluna, planos em 1 coluna
- [ ] Mobile (<600px): tudo empilhado, fontes reduzidas, botões grandes pra toque
- [ ] Header com hamburguer abre menu mobile
- [ ] Footer não estica feio em telas largas

**Performance:**
- [ ] Tempo de carregamento < 3s em conexão 4G
- [ ] Sem warnings no console
- [ ] Lighthouse score > 80 em todas as métricas

**Funcionamento:**
- [ ] CTA "Criar conta grátis" → navega pra `/auth/cadastro`
- [ ] CTA "Entrar" → navega pra `/auth/login`
- [ ] Links de menu fazem scroll smooth pra seção correta
- [ ] Toggle Mensal/Anual nos planos funciona (atualiza preços)
- [ ] FAQ acordeão expande/recolhe corretamente
- [ ] Usuário logado em `/` é redirecionado pra `/dashboard` ou `/onboarding`

### 10.3 Testes em devices reais

Teste em:
- [ ] iPhone (Safari iOS) — público feminino tem alta penetração de iPhone
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Firefox

### 10.4 Commit final

```bash
git add .
git commit -m "feat: homepage pública com 12 seções (hero, custo, features, planos, faq)"
git push origin main
```

---

## Próximos passos (após esta task)

Após validação dessa homepage, considere:

1. **Aterrissagem por nicho** — `/cabeleireiro`, `/manicure` com headline e mockup específicos pra cada
2. **Blog** em `/blog` com artigos SEO ("Como reduzir faltas no salão", etc)
3. **Página de Termos de Uso e Privacidade** — obrigatório por LGPD
4. **Google Analytics** ou Plausible — pra medir conversão
5. **Hotjar** ou Microsoft Clarity — pra ver onde usuários clicam/abandonam

---

## ⚠️ Decisões importantes pra você confirmar comigo antes de produção

Antes de subir essa homepage pra produção:

1. **Depoimentos representativos** — você está confortável em rotular como "representativos baseados em pesquisa"? Alternativa: deixar a seção de fora até ter clientes reais.

2. **Trust bar** — a versão atual diz "em breve". Quando você tiver 50+ clientes, atualizar pra "junte-se a +50 profissionais usando a Kianna".

3. **Preços R$ 39,90/Pro e R$ 79,90/Studio** — confirmados ou ajustar? Sugestão da análise era começar mais barato (R$ 29,90) pra captura de mercado e subir depois quando tiver tração.

4. **Nicho de lançamento** — tela atual cobre 6 nichos (cabeleireiro, manicure, estética, barbeiro, tatuador, massoterapeuta). Manter ou focar só nos 3 primeiros?

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Versão 1.0.0-homepage
