# TASK — Módulo 2 Aprimoramentos
> Repositório: `kianna-web`
> Pré-requisitos: Módulos 1+2, rebranding, Grupo A (bugs UI) concluídos
> Objetivo: 5 aprimoramentos coesos no dashboard antes de avançar pro Módulo 3
> Gere um arquivo neste formato do ue ficou de fora e não foi implementado.
---

## ⚠️ LEIA ANTES DE COMEÇAR

### Princípios

1. **Branch dedicada:** `git checkout -b feat/modulo-2-aprimoramentos`
2. **Commits pequenos por TAREFA** — facilita reverter
3. **Reaproveitar tudo que já existe** — repositórios, stores, signals do Módulo 2
4. **Não tocar em página pública (/:slug)** — isso é Módulo 3 separado
5. **Adiada:** página de Assinatura (vai junto com Stripe no Módulo 6)

### Decisões já tomadas (não voltar a discutir)

- **Modalidades:** 1 por serviço, mesmo preço (sem variação)
- **Slug:** alterável 1x por mês, redirect 90 dias do antigo
- **Visão Geral:** nova rota `/dashboard` (root), agenda continua em `/dashboard/agenda`
- **Cancelamento:** campo informativo apenas, sem cobrança automática
- **Configurações:** redes sociais textuais, endereço só texto (sem mapa)

### Terminologia (importante)

- **Profissional** = nosso cliente (assinante da Kianna, autônomo de beleza)
- **Cliente** = cliente do profissional (consumidor final, agenda no link público)

---

## TAREFA 1 — Migration SQL (rodar primeiro!)

> 🎯 **Roda PRIMEIRO de tudo no Supabase SQL Editor.** Sem essa migration, o resto não funciona.

Acesse https://supabase.com/dashboard/project/ocjsscsfggzwkgitzqlk → **SQL Editor** → **New query** → cola e roda:

```sql
-- ── 1. Modalidades de serviço (enum + coluna) ──────────────────
create type modalidade_atendimento as enum ('presencial', 'domiciliar', 'online');

alter table public.servicos
  add column modalidade modalidade_atendimento not null default 'presencial';

-- ── 2. Política de cancelamento + endereço + redes sociais ────
alter table public.profissionais
  add column politica_cancelamento text,
  add column endereco_cep        text,
  add column endereco_rua        text,
  add column endereco_numero     text,
  add column endereco_complemento text,
  add column endereco_bairro     text,
  add column endereco_cidade     text,
  add column endereco_estado     char(2),
  add column instagram_url       text,
  add column facebook_url        text,
  add column twitter_url         text,
  add column youtube_url         text,
  add column links_personalizados jsonb default '[]'::jsonb,
  add column slug_alterado_em    timestamptz;

-- Constraint: links personalizados máx. 3 (validação no app, mas reforço no banco)
-- jsonb permite array dinâmico tipo [{"label":"Site","url":"https://..."}]

-- ── 3. Tabela de redirects de slug antigo (90 dias) ────────────
create table public.slug_redirects (
  id              uuid primary key default uuid_generate_v4(),
  slug_antigo     text not null unique,
  profissional_id uuid not null references public.profissionais(id) on delete cascade,
  expira_em       timestamptz not null,
  created_at      timestamptz default now()
);

create index idx_slug_redirects_antigo on public.slug_redirects(slug_antigo)
  where expira_em > now();

-- RLS: leitura pública (página pública precisa consultar pra redirect)
alter table public.slug_redirects enable row level security;

create policy "Leitura pública de redirects ativos"
  on public.slug_redirects for select
  to anon
  using (expira_em > now());

create policy "Profissional gerencia próprios redirects"
  on public.slug_redirects for all
  using (profissional_id in (
    select id from public.profissionais where user_id = auth.uid()
  ));

-- ── 4. View materializada pra Visão Geral (performance) ────────
-- Ao invés de view, usaremos query no app pra simplicidade no MVP.
-- Se Visão Geral ficar lenta, criar view aqui depois.
```

Após rodar, validar em **Table Editor**:
- [ ] Tabela `servicos` tem coluna `modalidade`
- [ ] Tabela `profissionais` tem `politica_cancelamento`, endereço, redes sociais, `slug_alterado_em`
- [ ] Tabela nova `slug_redirects` existe com RLS

---

## TAREFA 2 — Atualizar tipos TypeScript

Edite `src/app/core/types/database.types.ts` — adicione e atualize:

```typescript
// ── Modalidades ───────────────────────────────────────────────
export type ModalidadeAtendimento = 'presencial' | 'domiciliar' | 'online';

export const MODALIDADE_LABELS: Record<ModalidadeAtendimento, { label: string; icone: string; descricao: string }> = {
  presencial:  { label: 'Presencial',  icone: 'storefront',     descricao: 'Cliente vai até você' },
  domiciliar:  { label: 'Domiciliar',  icone: 'directions_car', descricao: 'Você vai até o cliente' },
  online:      { label: 'Online',      icone: 'videocam',       descricao: 'Atendimento por vídeo' },
};

// ── Atualizar Servico (adicionar modalidade) ─────────────────
export interface Servico {
  id: string;
  profissional_id: string;
  nome: string;
  duracao_min: number;
  preco: number;
  modalidade: ModalidadeAtendimento;   // ← NOVO
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type ServicoInput = Pick<Servico, 'nome' | 'duracao_min' | 'preco' | 'modalidade' | 'ativo'>;

// ── Atualizar Profissional (campos novos) ────────────────────
export interface LinkPersonalizado {
  label: string;
  url: string;
}

export interface Profissional {
  id: string;
  user_id: string;
  nome: string;
  slug: string;
  foto_url: string | null;
  whatsapp: string;
  especialidade: string | null;
  bio: string | null;
  plano: Plano;
  wpp_instance_id: string | null;
  stripe_subscription_id: string | null;
  onboarding_concluido: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;

  // ── NOVOS ──
  politica_cancelamento: string | null;
  endereco_cep: string | null;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  links_personalizados: LinkPersonalizado[];
  slug_alterado_em: string | null;
}

// ── Slug redirects ────────────────────────────────────────────
export interface SlugRedirect {
  id: string;
  slug_antigo: string;
  profissional_id: string;
  expira_em: string;
  created_at: string;
}
```

---

## TAREFA 3 — Visão Geral do Dashboard (nova rota)

> 🎯 **Cria visão executiva do negócio.** Substitui `/dashboard` (que hoje redireciona pra agenda) por uma página própria.

### 3.1 Atualizar rotas do dashboard

Em `src/app/features/dashboard/dashboard.routes.ts`, **substitua** o redirect:

```typescript
// ── ANTES (remover) ──
// { path: '', redirectTo: 'agenda', pathMatch: 'full' },

// ── DEPOIS ──
{
  path: '',
  loadComponent: () =>
    import('./pages/visao-geral/visao-geral.component').then(m => m.VisaoGeralComponent),
  title: 'Visão Geral — Kianna',
},
```

### 3.2 Adicionar item "Visão Geral" no menu

Em `src/app/features/dashboard/shell/menu.config.ts`, **adicione no início**:

```typescript
export const MENU_ITEMS: MenuItem[] = [
  { rota: '/dashboard',          label: 'Visão Geral',  icone: 'dashboard' },  // ← NOVO no topo
  { rota: '/dashboard/agenda',   label: 'Agenda',       icone: 'event' },
  { rota: '/dashboard/servicos', label: 'Serviços',     icone: 'cut' },
  { rota: '/dashboard/horarios', label: 'Horários',     icone: 'schedule' },
  // ... resto igual
];
```

> ⚠️ **Atenção routerLinkActive:** o item "Visão Geral" tem rota `/dashboard` que é prefixo dos outros (`/dashboard/agenda`, etc). No template do sidenav, garanta `[routerLinkActiveOptions]="{exact: true}"` SÓ pra esse item, ou ele fica sempre marcado como ativo.

### 3.3 Service de estatísticas

Crie `src/app/core/repositories/estatisticas.repository.ts`:

```typescript
import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { AgendamentoComServico } from '@core/types/database.types';

export interface EstatisticasDashboard {
  proximosAgendamentos: AgendamentoComServico[];   // próximos 5
  totalDoMes: number;                               // confirmados + concluídos do mês
  doDia: number;                                    // confirmados/concluídos de hoje
  cancelamentosDoMes: number;                       // cancelados no mês
  taxaOcupacao: number;                             // 0-100, futuro: deixar 0 por enquanto
}

@Injectable({ providedIn: 'root' })
export class EstatisticasRepository {

  async carregarDashboard(): Promise<EstatisticasDashboard> {
    const profissional_id = profissionalIdOrThrow();
    const agora = new Date();
    const inicioHoje = startOfDay(agora);
    const fimHoje = endOfDay(agora);
    const inicioMes = startOfMonth(agora);
    const fimMes = endOfMonth(agora);
    const fimSemana = addDays(agora, 7);

    // Próximos 5 agendamentos (de hoje em diante, próximos 7 dias)
    const { data: proximos, error: e1 } = await supabase
      .from('agendamentos')
      .select(`*, servico:servicos ( id, nome, duracao_min, preco )`)
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'pendente'])
      .gte('data_hora', agora.toISOString())
      .lte('data_hora', fimSemana.toISOString())
      .order('data_hora', { ascending: true })
      .limit(5);
    if (e1) throw e1;

    // Total do mês (confirmados + concluídos)
    const { count: totalMes, error: e2 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'concluido'])
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    if (e2) throw e2;

    // Do dia
    const { count: doDia, error: e3 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .in('status', ['confirmado', 'concluido'])
      .gte('data_hora', inicioHoje.toISOString())
      .lte('data_hora', fimHoje.toISOString());
    if (e3) throw e3;

    // Cancelamentos do mês
    const { count: cancelados, error: e4 } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .eq('status', 'cancelado')
      .gte('data_hora', inicioMes.toISOString())
      .lte('data_hora', fimMes.toISOString());
    if (e4) throw e4;

    return {
      proximosAgendamentos: (proximos ?? []) as unknown as AgendamentoComServico[],
      totalDoMes: totalMes ?? 0,
      doDia: doDia ?? 0,
      cancelamentosDoMes: cancelados ?? 0,
      taxaOcupacao: 0,  // TODO: calcular em versão futura
    };
  }
}
```

### 3.4 Componente Visão Geral

Crie `src/app/features/dashboard/pages/visao-geral/visao-geral.component.ts`:

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstatisticasRepository, EstatisticasDashboard } from '@core/repositories/estatisticas.repository';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent implements OnInit {
  private repo = inject(EstatisticasRepository);
  private snack = inject(MatSnackBar);

  readonly user = currentUser;
  readonly carregando = signal(true);
  readonly stats = signal<EstatisticasDashboard | null>(null);
  readonly copiado = signal(false);

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  get saudacao(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.repo.carregarDashboard();
      this.stats.set(data);
    } catch (e: any) {
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

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

  abrirLink(): void {
    window.open(this.linkPublico, '_blank');
  }
}
```

### 3.5 Template `visao-geral.component.html`

```html
<div class="vg-page">
  <!-- ── Cabeçalho com saudação ────────────────────── -->
  <div class="vg-header">
    <div>
      <h1>{{ saudacao }}, {{ user()?.nome?.split(' ')?.[0] }} ✨</h1>
      <p class="vg-sub">Aqui está o resumo do seu negócio hoje.</p>
    </div>
  </div>

  <!-- ── Card destaque: link público ─────────────────── -->
  <mat-card class="link-publico-card">
    <div class="lp-content">
      <div class="lp-info">
        <span class="lp-label">🔗 Seu link de agendamento</span>
        <code class="lp-url">{{ linkPublico }}</code>
        <p class="lp-help">Compartilhe este link no Instagram, WhatsApp, cartão de visita. É por aqui que seus clientes agendam.</p>
      </div>
      <div class="lp-actions">
        <button mat-flat-button color="primary" (click)="copiarLink()">
          <mat-icon>{{ copiado() ? 'check' : 'content_copy' }}</mat-icon>
          {{ copiado() ? 'Copiado!' : 'Copiar link' }}
        </button>
        <button mat-stroked-button (click)="abrirLink()">
          <mat-icon>open_in_new</mat-icon>
          Visualizar
        </button>
      </div>
    </div>
  </mat-card>

  <!-- ── Loading state ─────────────────────────────── -->
  @if (carregando()) {
    <div class="loading-state">
      <mat-spinner diameter="32"></mat-spinner>
    </div>
  } @else if (stats(); as s) {
    <!-- ── Cards de KPIs ────────────────────────────── -->
    <div class="kpi-grid">
      <mat-card class="kpi-card kpi-hoje">
        <mat-icon class="kpi-icone">today</mat-icon>
        <div class="kpi-conteudo">
          <span class="kpi-numero">{{ s.doDia }}</span>
          <span class="kpi-label">{{ s.doDia === 1 ? 'agendamento' : 'agendamentos' }} hoje</span>
        </div>
      </mat-card>

      <mat-card class="kpi-card kpi-mes">
        <mat-icon class="kpi-icone">event_available</mat-icon>
        <div class="kpi-conteudo">
          <span class="kpi-numero">{{ s.totalDoMes }}</span>
          <span class="kpi-label">no mês atual</span>
        </div>
      </mat-card>

      <mat-card class="kpi-card kpi-cancelados">
        <mat-icon class="kpi-icone">cancel</mat-icon>
        <div class="kpi-conteudo">
          <span class="kpi-numero">{{ s.cancelamentosDoMes }}</span>
          <span class="kpi-label">cancelados no mês</span>
        </div>
      </mat-card>
    </div>

    <!-- ── Próximos agendamentos ────────────────────── -->
    <section class="vg-section">
      <div class="section-header">
        <h2>Próximos agendamentos</h2>
        <a routerLink="/dashboard/agenda" class="section-link">
          Ver agenda completa <mat-icon>arrow_forward</mat-icon>
        </a>
      </div>

      @if (s.proximosAgendamentos.length === 0) {
        <mat-card class="empty-card">
          <mat-icon>event_busy</mat-icon>
          <h3>Nenhum agendamento próximo</h3>
          <p>Compartilhe seu link pra começar a receber!</p>
        </mat-card>
      } @else {
        <div class="proximos-list">
          @for (a of s.proximosAgendamentos; track a.id) {
            <mat-card class="prox-card" [attr.data-status]="a.status">
              <div class="prox-data">
                <span class="prox-dia">{{ a.data_hora | date:'dd' }}</span>
                <span class="prox-mes">{{ a.data_hora | date:'MMM':'':'pt-BR' }}</span>
              </div>
              <div class="prox-info">
                <strong>{{ a.cliente_nome }}</strong>
                <span class="prox-meta">
                  {{ a.servico?.nome ?? 'Serviço' }} · {{ a.data_hora | date:'HH:mm' }}
                </span>
              </div>
              <span class="prox-status">{{ a.status }}</span>
            </mat-card>
          }
        </div>
      }
    </section>
  }
</div>
```

### 3.6 Estilo `visao-geral.component.scss`

```scss
@use 'styles/variables' as v;

.vg-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vg-header {
  h1 { font-size: 24px; font-weight: 700; margin: 0; color: v.$kianna-slate-900; }
  .vg-sub { font-size: 14px; color: v.$kianna-slate-500; margin: 4px 0 0; }
}

// ── Card link público (destaque máximo) ──────────────
.link-publico-card {
  padding: 20px !important;
  background: linear-gradient(135deg, v.$kianna-green-50, #fff) !important;
  border: 1px solid v.$kianna-green-200 !important;
}

.lp-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.lp-info { flex: 1; min-width: 280px; }

.lp-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  color: v.$kianna-green-700;
  text-transform: uppercase;
}

.lp-url {
  display: block;
  background: #fff;
  border: 1px solid v.$kianna-slate-200;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 500;
  color: v.$kianna-slate-900;
  margin: 8px 0;
  word-break: break-all;
}

.lp-help {
  font-size: 13px;
  color: v.$kianna-slate-600;
  margin: 0;
  line-height: 1.5;
}

.lp-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

// ── KPIs ──────────────────────────────────────────────
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  padding: 20px !important;
  display: flex !important;
  align-items: center;
  gap: 16px;
}

.kpi-icone {
  font-size: 32px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.kpi-hoje .kpi-icone        { color: v.$kianna-green-600; }
.kpi-mes .kpi-icone         { color: #3B82F6; }
.kpi-cancelados .kpi-icone  { color: v.$status-cancelado; }

.kpi-conteudo { display: flex; flex-direction: column; }

.kpi-numero {
  font-size: 28px;
  font-weight: 800;
  color: v.$kianna-slate-900;
  line-height: 1;
}

.kpi-label {
  font-size: 13px;
  color: v.$kianna-slate-500;
  margin-top: 4px;
}

// ── Seções ────────────────────────────────────────────
.vg-section { display: flex; flex-direction: column; gap: 12px; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h2 { font-size: 16px; font-weight: 700; margin: 0; color: v.$kianna-slate-800; }
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: v.$kianna-green-600;
  text-decoration: none;

  mat-icon { font-size: 16px; width: 16px; height: 16px; }
  &:hover { color: v.$kianna-green-700; }
}

.empty-card {
  padding: 40px 20px !important;
  text-align: center;
  color: v.$kianna-slate-500;

  mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: .4; }
  h3 { margin: 8px 0 4px; color: v.$kianna-slate-700; }
  p  { margin: 0; font-size: 13px; }
}

.proximos-list { display: flex; flex-direction: column; gap: 8px; }

.prox-card {
  display: flex !important;
  align-items: center;
  gap: 16px;
  padding: 14px 16px !important;
}

.prox-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;

  .prox-dia { font-size: 20px; font-weight: 800; color: v.$kianna-slate-900; line-height: 1; }
  .prox-mes { font-size: 11px; text-transform: uppercase; color: v.$kianna-slate-500; }
}

.prox-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong { color: v.$kianna-slate-900; font-size: 14px; }
  .prox-meta { font-size: 12px; color: v.$kianna-slate-500; }
}

.prox-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 99px;
  background: v.$kianna-slate-100;
  color: v.$kianna-slate-600;
}

[data-status="confirmado"] .prox-status { background: #DCFCE7; color: #14532D; }
[data-status="pendente"] .prox-status   { background: #FEF3C7; color: #92400E; }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}
```

---

## TAREFA 4 — Modalidades nos serviços

> 🎯 **Adicionar dropdown de modalidade no dialog de criar/editar serviço.**

### 4.1 Atualizar dialog de serviço

Em `src/app/features/dashboard/pages/servicos/servico-dialog/servico-dialog.component.ts`:

```typescript
// Adicionar ao import
import { ModalidadeAtendimento, MODALIDADE_LABELS } from '@core/types/database.types';

// Adicionar propriedades na classe
readonly modalidades: { valor: ModalidadeAtendimento; label: string; icone: string; descricao: string }[] = [
  { valor: 'presencial', ...MODALIDADE_LABELS.presencial },
  { valor: 'domiciliar', ...MODALIDADE_LABELS.domiciliar },
  { valor: 'online',     ...MODALIDADE_LABELS.online },
];

// Atualizar o form (ADICIONAR campo modalidade):
form = this.fb.group({
  nome:        [this.data.servico?.nome ?? '', [Validators.required, Validators.minLength(2)]],
  duracao_min: [this.data.servico?.duracao_min ?? 60, [Validators.required, Validators.min(15)]],
  preco:       [this.data.servico?.preco ?? 0, [Validators.required, Validators.min(0)]],
  modalidade:  [this.data.servico?.modalidade ?? 'presencial' as ModalidadeAtendimento, Validators.required],
  ativo:       [this.data.servico?.ativo ?? true],
});

// Atualizar o salvar (ADICIONAR modalidade):
salvar(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  const v = this.form.getRawValue();
  const input: ServicoInput = {
    nome: v.nome!.trim(),
    duracao_min: v.duracao_min!,
    preco: Number(v.preco) || 0,
    modalidade: v.modalidade!,    // ← NOVO
    ativo: v.ativo!,
  };
  this.ref.close(input);
}
```

### 4.2 Atualizar HTML do dialog

Em `servico-dialog.component.html`, **adicione** após o campo de duração e antes do preço:

```html
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Modalidade</mat-label>
  <mat-select formControlName="modalidade">
    @for (m of modalidades; track m.valor) {
      <mat-option [value]="m.valor">
        {{ m.label }} — {{ m.descricao }}
      </mat-option>
    }
  </mat-select>
  <mat-hint>Como você atende esse serviço</mat-hint>
</mat-form-field>
```

### 4.3 Mostrar modalidade no card do serviço

Em `src/app/features/dashboard/pages/servicos/servicos.component.ts`, adicione um helper:

```typescript
import { MODALIDADE_LABELS } from '@core/types/database.types';

// Na classe:
readonly MODALIDADE_LABELS = MODALIDADE_LABELS;
```

Em `servicos.component.html`, **dentro de `.card-meta`**, adicione um terceiro item:

```html
<div class="card-meta">
  <span class="meta-item">
    <mat-icon>schedule</mat-icon> {{ formatarDuracao(s.duracao_min) }}
  </span>
  <span class="meta-item modalidade">
    <mat-icon>{{ MODALIDADE_LABELS[s.modalidade].icone }}</mat-icon>
    {{ MODALIDADE_LABELS[s.modalidade].label }}
  </span>
  <span class="meta-item preco">{{ formatarPreco(s.preco) }}</span>
</div>
```

Em `servicos.component.scss`, ajustar o gap do `.card-meta`:

```scss
.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  // ... resto igual
}

.modalidade {
  background: v.$kianna-green-50;
  color: v.$kianna-green-700;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 500;

  mat-icon { color: v.$kianna-green-600; }
}
```

---

## TAREFA 5 — Modal de agendamento melhorado

> 🎯 **Adicionar ações rápidas no bottom sheet existente:** botão WhatsApp já tem, mas vamos garantir que detalhes estão completos e ações estão claras.

### 5.1 Revisão do componente existente

O bottom sheet já existe em `src/app/features/dashboard/pages/agenda/agendamento-sheet/`. **Verifique** se ele já mostra:

- ✅ Cliente nome + WhatsApp
- ✅ Serviço (nome, duração, preço)
- ✅ Data formatada em pt-BR
- ✅ Status visual
- ✅ Botão WhatsApp
- ✅ Confirmar / Cancelar

Se faltar **modalidade do serviço**, adicione uma linha:

```html
<!-- Em agendamento-sheet.component.html, dentro da info do serviço -->
@if (a.servico) {
  <div class="info-row">
    <mat-icon>cut</mat-icon>
    <span>{{ a.servico.nome }} · {{ a.servico.duracao_min }}min · R$ {{ a.servico.preco }}</span>
  </div>
}
```

> ⚠️ **Limitação atual:** o tipo `Pick<Servico, 'id' | 'nome' | 'duracao_min' | 'preco'>` no agendamento-sheet **não inclui modalidade**. Pra mostrar, adicione `'modalidade'` no Pick em `database.types.ts`:

```typescript
// Em AgendamentoComServico:
servico: Pick<Servico, 'id' | 'nome' | 'duracao_min' | 'preco' | 'modalidade'> | null;
```

E no repositório `agendamentos.repository.ts`, atualize o select:

```typescript
.select(`
  *,
  servico:servicos ( id, nome, duracao_min, preco, modalidade )
`)
```

Aí no template do sheet, adicione abaixo da linha do serviço:

```html
@if (a.servico?.modalidade) {
  <div class="info-row">
    <mat-icon>{{ MODALIDADE_LABELS[a.servico!.modalidade].icone }}</mat-icon>
    <span>{{ MODALIDADE_LABELS[a.servico!.modalidade].label }}</span>
  </div>
}
```

E importe `MODALIDADE_LABELS` no TS do sheet.

---

## TAREFA 6 — Página de Configurações

> 🎯 **Centralizar perfil, empresa, redes sociais, endereço.**
> A página `/dashboard/configuracoes` hoje é placeholder "em breve". Substituir por algo real.

### 6.1 Estrutura

Crie `src/app/features/dashboard/pages/configuracoes/`:

```
configuracoes/
├── configuracoes.component.ts          ← shell com tabs
├── configuracoes.component.html
├── configuracoes.component.scss
├── perfil/
│   └── perfil.component.ts             ← email, senha (apenas exibe email, troca senha via Supabase)
├── empresa/
│   └── empresa.component.ts            ← nome, foto, bio, slug, política
├── redes-sociais/
│   └── redes-sociais.component.ts      ← Instagram, Facebook, X, YouTube, links custom
└── endereco/
    └── endereco.component.ts           ← CEP, rua, número, etc
```

### 6.2 Atualizar rota

Em `dashboard.routes.ts`, **substitua** o placeholder:

```typescript
// ── ANTES ──
// {
//   path: 'configuracoes',
//   loadComponent: () => import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
//   data: { titulo: 'Configurações' },
// },

// ── DEPOIS ──
{
  path: 'configuracoes',
  loadComponent: () =>
    import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
  title: 'Configurações — Kianna',
},
```

E **remova** o `implementadoEm: 'modulo-5'` do item Configurações no `menu.config.ts`:

```typescript
{ rota: '/dashboard/configuracoes',  label: 'Config.',  icone: 'settings' },  // sem implementadoEm
```

### 6.3 Shell de Configurações com tabs

Crie `configuracoes.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { PerfilComponent } from './perfil/perfil.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { RedesSociaisComponent } from './redes-sociais/redes-sociais.component';
import { EnderecoComponent } from './endereco/endereco.component';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, MatTabsModule, PerfilComponent, EmpresaComponent, RedesSociaisComponent, EnderecoComponent],
  template: `
    <div class="cfg-page">
      <h1>Configurações</h1>
      <p class="cfg-sub">Personalize seu perfil, empresa e canais de contato.</p>

      <mat-tab-group animationDuration="200ms" class="cfg-tabs">
        <mat-tab label="Empresa">    <app-cfg-empresa />        </mat-tab>
        <mat-tab label="Endereço">   <app-cfg-endereco />       </mat-tab>
        <mat-tab label="Redes">      <app-cfg-redes-sociais />  </mat-tab>
        <mat-tab label="Perfil">     <app-cfg-perfil />         </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .cfg-page { display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; color: var(--mat-sys-on-surface, #0F172A); }
    .cfg-sub { font-size: 13px; color: #64748B; margin: 0 0 16px; }
    .cfg-tabs { background: #fff; border-radius: 12px; padding: 8px; }
    ::ng-deep .mat-mdc-tab-body-content { padding: 24px 16px; }
  `],
})
export class ConfiguracoesComponent {}
```

### 6.4 Aba Empresa

Crie `configuracoes/empresa/empresa.component.ts`:

```typescript
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';
import { gerarSlug } from '@core/utils/slug.util';
import { differenceInDays, addDays } from 'date-fns';

@Component({
  selector: 'app-cfg-empresa',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, LoadingButtonComponent,
  ],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss',
})
export class EmpresaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user = currentUser;

  form = this.fb.group({
    nome:                  ['', [Validators.required, Validators.minLength(2)]],
    bio:                   [''],
    slug:                  ['', [Validators.required, Validators.minLength(3)]],
    politica_cancelamento: [''],
  });

  // ── Slug: pode alterar 1x/mês ────────────────────────────────
  readonly slugUltimaAlteracao = computed(() => {
    const data = this.user()?.slug_alterado_em;
    return data ? new Date(data) : null;
  });

  readonly podeAlterarSlug = computed(() => {
    const ultima = this.slugUltimaAlteracao();
    if (!ultima) return true;  // nunca alterou
    return differenceInDays(new Date(), ultima) >= 30;
  });

  readonly proximaAlteracaoEm = computed(() => {
    const ultima = this.slugUltimaAlteracao();
    if (!ultima) return null;
    return addDays(ultima, 30);
  });

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;
    this.form.patchValue({
      nome: u.nome,
      bio: (u as any).bio ?? '',
      slug: u.slug,
      politica_cancelamento: (u as any).politica_cancelamento ?? '',
    });

    if (!this.podeAlterarSlug()) {
      this.form.get('slug')?.disable();
    }
  }

  formatarSlugLive(): void {
    const valor = this.form.get('slug')?.value ?? '';
    const limpo = gerarSlug(valor);
    if (limpo !== valor) {
      this.form.get('slug')?.setValue(limpo, { emitEvent: false });
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Usuário não autenticado');

      const v = this.form.getRawValue();
      const slugMudou = v.slug !== u.slug;

      // Se slug mudou, precisa: 1) verificar disponibilidade, 2) criar redirect, 3) atualizar
      if (slugMudou) {
        // Verificar disponibilidade
        const { data: existente } = await supabase
          .from('profissionais')
          .select('id')
          .eq('slug', v.slug)
          .neq('id', u.id)
          .maybeSingle();

        if (existente) {
          this.snack.open('Este link já está em uso', 'OK', { duration: 3000 });
          return;
        }

        // Criar redirect do slug antigo (90 dias)
        await supabase.from('slug_redirects').insert({
          slug_antigo: u.slug,
          profissional_id: u.id,
          expira_em: addDays(new Date(), 90).toISOString(),
        });
      }

      // Atualizar profissional
      const updates: any = {
        nome: v.nome,
        bio: v.bio || null,
        politica_cancelamento: v.politica_cancelamento || null,
      };
      if (slugMudou) {
        updates.slug = v.slug;
        updates.slug_alterado_em = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar signal global
      currentUser.set({ ...u, ...data } as AppUser);

      this.snack.open('Configurações salvas', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
```

### 6.5 Template de Empresa `empresa.component.html`

```html
<form [formGroup]="form" class="cfg-form" (ngSubmit)="salvar()">

  <h2>Informações da empresa</h2>

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

  <h2>Link da sua página</h2>

  <mat-form-field appearance="outline" class="full-width slug-field">
    <mat-label>Link personalizado</mat-label>
    <span matPrefix class="slug-prefix">kianna.com.br/&nbsp;</span>
    <input matInput formControlName="slug" (input)="formatarSlugLive()">
    @if (!podeAlterarSlug()) {
      <mat-hint>
        ⏳ Próxima alteração em {{ proximaAlteracaoEm() | date:'dd/MM/yyyy' }}
      </mat-hint>
    } @else {
      <mat-hint>Pode alterar 1x por mês. O link antigo redireciona por 90 dias.</mat-hint>
    }
  </mat-form-field>

  <h2>Política de cancelamento</h2>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Sua política (opcional)</mat-label>
    <textarea matInput formControlName="politica_cancelamento" rows="3"
              placeholder="Ex: Cancelamentos permitidos até 24h antes do horário."></textarea>
    <mat-hint>Texto livre que aparece pro cliente na hora de agendar</mat-hint>
  </mat-form-field>

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

### 6.6 Estilo `empresa.component.scss`

```scss
@use 'styles/variables' as v;

.cfg-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}

h2 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: v.$kianna-slate-600;
  margin: 8px 0 0;
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
  margin-top: 16px;
}
```

### 6.7 Aba Endereço `endereco/endereco.component.ts`

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

@Component({
  selector: 'app-cfg-endereco',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, LoadingButtonComponent,
  ],
  templateUrl: './endereco.component.html',
  styleUrl: './endereco.component.scss',
})
export class EnderecoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly buscandoCep = signal(false);
  readonly user = currentUser;
  readonly estados = ESTADOS;

  form = this.fb.group({
    cep:          ['', Validators.pattern(/^\d{5}-?\d{3}$/)],
    rua:          [''],
    numero:       [''],
    complemento:  [''],
    bairro:       [''],
    cidade:       [''],
    estado:       [''],
  });

  ngOnInit(): void {
    const u = this.user() as any;
    if (!u) return;
    this.form.patchValue({
      cep:          u.endereco_cep,
      rua:          u.endereco_rua,
      numero:       u.endereco_numero,
      complemento:  u.endereco_complemento,
      bairro:       u.endereco_bairro,
      cidade:       u.endereco_cidade,
      estado:       u.endereco_estado,
    });
  }

  async buscarCep(): Promise<void> {
    const cep = (this.form.value.cep ?? '').replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.buscandoCep.set(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        this.snack.open('CEP não encontrado', 'OK', { duration: 2000 });
        return;
      }
      this.form.patchValue({
        rua:    data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      });
    } catch {
      this.snack.open('Erro ao buscar CEP', 'OK', { duration: 2000 });
    } finally {
      this.buscandoCep.set(false);
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Não autenticado');

      const v = this.form.value;
      const { data, error } = await supabase
        .from('profissionais')
        .update({
          endereco_cep:         v.cep || null,
          endereco_rua:         v.rua || null,
          endereco_numero:      v.numero || null,
          endereco_complemento: v.complemento || null,
          endereco_bairro:      v.bairro || null,
          endereco_cidade:      v.cidade || null,
          endereco_estado:      v.estado || null,
        })
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;
      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Endereço salvo', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
```

Template `endereco.component.html`:

```html
<form [formGroup]="form" class="cfg-form" (ngSubmit)="salvar()">
  <h2>Endereço de atendimento</h2>
  <p class="cfg-help">Endereço onde você atende. Aparece na sua página pública pra clientes que escolherem modalidade Presencial.</p>

  <div class="row-cep">
    <mat-form-field appearance="outline" class="cep-field">
      <mat-label>CEP</mat-label>
      <input matInput formControlName="cep" maxlength="9" (blur)="buscarCep()" placeholder="00000-000">
      @if (buscandoCep()) {
        <mat-hint>Buscando...</mat-hint>
      }
    </mat-form-field>
  </div>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Rua</mat-label>
    <input matInput formControlName="rua">
  </mat-form-field>

  <div class="row-2col">
    <mat-form-field appearance="outline">
      <mat-label>Número</mat-label>
      <input matInput formControlName="numero">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Complemento</mat-label>
      <input matInput formControlName="complemento">
    </mat-form-field>
  </div>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Bairro</mat-label>
    <input matInput formControlName="bairro">
  </mat-form-field>

  <div class="row-2col">
    <mat-form-field appearance="outline">
      <mat-label>Cidade</mat-label>
      <input matInput formControlName="cidade">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Estado</mat-label>
      <mat-select formControlName="estado">
        @for (uf of estados; track uf) {
          <mat-option [value]="uf">{{ uf }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  </div>

  <div class="cfg-actions">
    <app-loading-button type="submit" variant="flat" color="primary"
                        [loading]="salvando()" icon="save" iconPosition="start">
      Salvar endereço
    </app-loading-button>
  </div>
</form>
```

Estilo `endereco.component.scss`:

```scss
@use 'styles/variables' as v;

.cfg-form { display: flex; flex-direction: column; gap: 16px; max-width: 640px; }

h2 {
  font-size: 14px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; color: v.$kianna-slate-600; margin: 0;
}

.cfg-help { font-size: 13px; color: v.$kianna-slate-500; margin: 0 0 8px; }

.full-width { width: 100%; }

.row-cep .cep-field { width: 200px; }

.row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.cfg-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
```

### 6.8 Aba Redes Sociais `redes-sociais/redes-sociais.component.ts`

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-cfg-redes-sociais',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, LoadingButtonComponent,
  ],
  templateUrl: './redes-sociais.component.html',
  styleUrl: './redes-sociais.component.scss',
})
export class RedesSociaisComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user = currentUser;
  readonly MAX_LINKS = 3;

  form = this.fb.group({
    instagram_url: ['', Validators.pattern(/^https?:\/\//)],
    facebook_url:  ['', Validators.pattern(/^https?:\/\//)],
    twitter_url:   ['', Validators.pattern(/^https?:\/\//)],
    youtube_url:   ['', Validators.pattern(/^https?:\/\//)],
    links_personalizados: this.fb.array([]),
  });

  get linksArray(): FormArray {
    return this.form.get('links_personalizados') as FormArray;
  }

  ngOnInit(): void {
    const u = this.user() as any;
    if (!u) return;

    this.form.patchValue({
      instagram_url: u.instagram_url,
      facebook_url:  u.facebook_url,
      twitter_url:   u.twitter_url,
      youtube_url:   u.youtube_url,
    });

    const links = (u.links_personalizados ?? []) as { label: string; url: string }[];
    links.forEach(l => this.adicionarLink(l.label, l.url));
  }

  adicionarLink(label = '', url = ''): void {
    if (this.linksArray.length >= this.MAX_LINKS) {
      this.snack.open(`Máximo ${this.MAX_LINKS} links personalizados`, 'OK', { duration: 2000 });
      return;
    }
    this.linksArray.push(this.fb.group({
      label: [label, [Validators.required, Validators.maxLength(30)]],
      url:   [url,   [Validators.required, Validators.pattern(/^https?:\/\//)]],
    }));
  }

  removerLink(index: number): void {
    this.linksArray.removeAt(index);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);

    try {
      const u = this.user();
      if (!u) throw new Error('Não autenticado');

      const v = this.form.value;
      const { data, error } = await supabase
        .from('profissionais')
        .update({
          instagram_url: v.instagram_url || null,
          facebook_url:  v.facebook_url || null,
          twitter_url:   v.twitter_url || null,
          youtube_url:   v.youtube_url || null,
          links_personalizados: v.links_personalizados ?? [],
        })
        .eq('id', u.id)
        .select()
        .single();

      if (error) throw error;
      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Redes sociais salvas', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao salvar', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
```

Template `redes-sociais.component.html`:

```html
<form [formGroup]="form" class="cfg-form" (ngSubmit)="salvar()">
  <h2>Redes sociais</h2>
  <p class="cfg-help">Aparecem como ícones na sua página pública. Use a URL completa (com https://).</p>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Instagram</mat-label>
    <mat-icon matPrefix>photo_camera</mat-icon>
    <input matInput formControlName="instagram_url" placeholder="https://instagram.com/seuusuario">
  </mat-form-field>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Facebook</mat-label>
    <mat-icon matPrefix>thumb_up</mat-icon>
    <input matInput formControlName="facebook_url" placeholder="https://facebook.com/...">
  </mat-form-field>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>X (Twitter)</mat-label>
    <mat-icon matPrefix>chat</mat-icon>
    <input matInput formControlName="twitter_url" placeholder="https://x.com/...">
  </mat-form-field>

  <mat-form-field appearance="outline" class="full-width">
    <mat-label>YouTube</mat-label>
    <mat-icon matPrefix>play_circle</mat-icon>
    <input matInput formControlName="youtube_url" placeholder="https://youtube.com/...">
  </mat-form-field>

  <h2>Links personalizados (máx. 3)</h2>
  <p class="cfg-help">Útil pra site próprio, blog, agenda externa, lista de preços.</p>

  <div formArrayName="links_personalizados" class="links-list">
    @for (link of linksArray.controls; track $index; let i = $index) {
      <div [formGroupName]="i" class="link-item">
        <mat-form-field appearance="outline" class="link-label">
          <mat-label>Nome do link</mat-label>
          <input matInput formControlName="label" maxlength="30" placeholder="Ex: Meu site">
        </mat-form-field>
        <mat-form-field appearance="outline" class="link-url">
          <mat-label>URL</mat-label>
          <input matInput formControlName="url" placeholder="https://...">
        </mat-form-field>
        <button mat-icon-button type="button" (click)="removerLink(i)" aria-label="Remover">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
    }
  </div>

  @if (linksArray.length < MAX_LINKS) {
    <button mat-stroked-button type="button" (click)="adicionarLink()">
      <mat-icon>add</mat-icon> Adicionar link
    </button>
  }

  <div class="cfg-actions">
    <app-loading-button type="submit" variant="flat" color="primary"
                        [loading]="salvando()" icon="save" iconPosition="start">
      Salvar redes
    </app-loading-button>
  </div>
</form>
```

Estilo `redes-sociais.component.scss`:

```scss
@use 'styles/variables' as v;

.cfg-form { display: flex; flex-direction: column; gap: 16px; max-width: 640px; }

h2 {
  font-size: 14px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; color: v.$kianna-slate-600; margin: 16px 0 0;
}

.cfg-help { font-size: 13px; color: v.$kianna-slate-500; margin: 0 0 8px; }
.full-width { width: 100%; }

.links-list { display: flex; flex-direction: column; gap: 8px; }

.link-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 8px;
  align-items: start;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.cfg-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
```

### 6.9 Aba Perfil `perfil/perfil.component.ts`

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

@Component({
  selector: 'app-cfg-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, LoadingButtonComponent,
  ],
  template: `
    <div class="cfg-form">
      <h2>Sua conta</h2>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>E-mail</mat-label>
        <input matInput [value]="user()?.email" readonly>
        <mat-hint>Para mudar o e-mail, entre em contato pelo suporte.</mat-hint>
      </mat-form-field>

      <h2>Trocar senha</h2>

      <form [formGroup]="form" (ngSubmit)="trocarSenha()" class="senha-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nova senha (mín. 8 caracteres)</mat-label>
          <input matInput formControlName="senha" type="password" autocomplete="new-password">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmar nova senha</mat-label>
          <input matInput formControlName="confirmar" type="password" autocomplete="new-password">
          @if (form.hasError('naoCoincidem') && form.get('confirmar')?.touched) {
            <mat-error>As senhas não coincidem</mat-error>
          }
        </mat-form-field>

        <div class="cfg-actions">
          <app-loading-button type="submit" variant="flat" color="primary"
                              [loading]="salvando()" [disabled]="form.invalid"
                              icon="lock_reset" iconPosition="start">
            Atualizar senha
          </app-loading-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as v;
    .cfg-form { display: flex; flex-direction: column; gap: 16px; max-width: 480px; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase;
         letter-spacing: .04em; color: v.$kianna-slate-600; margin: 8px 0 0; }
    .full-width { width: 100%; }
    .senha-form { display: flex; flex-direction: column; gap: 8px; }
    .cfg-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `],
})
export class PerfilComponent {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  readonly salvando = signal(false);
  readonly user = currentUser;

  form = this.fb.group({
    senha:     ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', Validators.required],
  }, { validators: (group) => {
    const s = group.get('senha')?.value;
    const c = group.get('confirmar')?.value;
    return s !== c ? { naoCoincidem: true } : null;
  }});

  async trocarSenha(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: this.form.value.senha! });
      if (error) throw error;
      this.snack.open('Senha atualizada', 'OK', { duration: 2000 });
      this.form.reset();
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao atualizar senha', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
```

### 6.10 Atualizar AppUser pra incluir email

Em `src/app/core/signals/app.signals.ts`, **garantir** que `email` está no AppUser (já está no Módulo 1, conferir).

---

## TAREFA 7 — Verificação final

### 7.1 Build de produção

```bash
npm run build -- --configuration=production
```

### 7.2 Checklist visual

**Migration SQL:**
- [ ] Tabelas atualizadas com novas colunas
- [ ] `slug_redirects` criada com RLS

**Dashboard → Visão Geral (`/dashboard`):**
- [ ] Saudação dinâmica (Bom dia/tarde/noite)
- [ ] Card destaque do link público com botão Copiar e Visualizar
- [ ] 3 KPIs: hoje, mês, cancelados
- [ ] Lista dos próximos 5 agendamentos
- [ ] Estado vazio se não há agendamentos
- [ ] Sidenav agora mostra "Visão Geral" como primeiro item

**Serviços (`/dashboard/servicos`):**
- [ ] Dialog tem campo "Modalidade" (presencial / domiciliar / online)
- [ ] Card mostra modalidade como tag verde

**Agenda (`/dashboard/agenda`):**
- [ ] Bottom sheet mostra modalidade do serviço

**Configurações (`/dashboard/configuracoes`):**
- [ ] 4 abas: Empresa, Endereço, Redes, Perfil
- [ ] Aba Empresa: salvar nome, bio, slug, política de cancelamento
- [ ] Slug bloqueia se alterado nos últimos 30 dias
- [ ] Trocar slug cria redirect na tabela `slug_redirects`
- [ ] Aba Endereço: ViaCEP preenche automaticamente
- [ ] Aba Redes: 4 redes principais + até 3 links personalizados
- [ ] Aba Perfil: troca de senha funciona

### 7.3 Commit

```bash
git add .
git commit -m "feat(modulo-2): aprimoramentos — visão geral, modalidades, configurações completas"
git push origin feat/modulo-2-aprimoramentos
```

---

## ⚠️ Notas finais

### Itens NÃO implementados (intencionalmente)

- ❌ **Página de Assinatura** — adiada pra Módulo 6 (junto com Stripe)
- ❌ **Mapa do endereço** — pós-MVP
- ❌ **QR Code do link público** — pós-MVP
- ❌ **Página de agendamento (cliente)** — Módulo 3 separado
- ❌ **Multi-profissional** — fase 2 do produto
- ❌ **Cobrança de taxa de cancelamento** — pós-MVP

### Próximos passos após esta task

1. **Módulo 3** — Página pública de agendamento (`/:slug`) com SSR
2. Slug redirect na página pública (consulta `slug_redirects` se slug atual não existe)
3. Módulos 4, 5, 6 conforme roadmap

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Módulo 2 Aprimoramentos
