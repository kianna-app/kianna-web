# Módulo 3 — Página Pública de Agendamento
> Task card completo · Branch: `feat/modulo-3-pagina-publica`

## Decisões confirmadas
| Questão | Decisão |
|---|---|
| Status inicial | `pendente` (profissional aprova no dashboard) |
| Janela de agendamento | 30 dias à frente |
| Visual | Minimalista · form linear · chips de data/hora |
| Campos do cliente | Nome + WhatsApp (apenas) |
| Aprovação automática | Não — profissional vê na Agenda e confirma/cancela |

## Visão geral do fluxo
```
/:slug
  │
  ├─ [SSR] Busca profissional pelo slug
  │     └─ Não encontrado? → Checa slug_redirects → 302 ou 404
  │
  ├─ Tela: perfil do profissional (foto, nome, especialidade, bio)
  │
  ├─ Step 1 — Seleciona serviço (cards clicáveis)
  │     └─ Mostra: nome, preço, duração, modalidade
  │
  ├─ Step 2 — Seleciona data (chips de dia, 30 dias)
  │     └─ Dias sem nenhum slot disponível ficam desabilitados
  │
  ├─ Step 3 — Seleciona horário (chips scrolláveis)
  │     └─ Slots = disponibilidades - agendamentos existentes
  │
  ├─ Step 4 — Dados do cliente (nome + WhatsApp)
  │
  ├─ Step 5 — Resumo + confirmação
  │
  └─ Tela de confirmação
        ├─ Status: "Aguardando confirmação do profissional"
        ├─ Resumo do agendamento
        ├─ Botão "Adicionar ao Google Agenda" (link gerado)
        └─ Botão "Compartilhar via WhatsApp" (link wa.me do profissional)
```

---

## Estrutura de arquivos a criar

```
src/app/features/booking/
├── booking.routes.ts                    ← rota pública /:slug
├── booking-shell/
│   └── booking-shell.component.ts      ← layout minimalista (sem sidenav)
├── pages/
│   └── booking-page/
│       ├── booking-page.component.ts   ← orquestra os steps
│       ├── booking-page.component.html
│       └── booking-page.component.scss
├── components/
│   ├── professional-header/            ← foto, nome, especialidade, bio
│   ├── service-selector/               ← cards de serviço clicáveis
│   ├── date-selector/                  ← chips de data horizontais com paginação
│   ├── time-selector/                  ← chips de horário scrolláveis
│   ├── client-form/                    ← nome + WhatsApp com flag BR
│   ├── booking-summary/                ← resumo antes de confirmar
│   └── booking-confirmation/           ← tela pós-agendamento
└── services/
    ├── booking.service.ts              ← orquestra chamadas ao Supabase
    └── slot-calculator.service.ts      ← lógica de slots disponíveis
```

```
src/app/core/repositories/
└── booking.repository.ts              ← queries sem RLS (anon, leitura pública)
```

---

## Task 3.1 — Roteamento e SSR

**Arquivo:** `src/app/app.routes.ts`

Adicionar ao array de rotas existente:

```typescript
{
  path: ':slug',
  loadComponent: () =>
    import('./features/booking/pages/booking-page/booking-page.component')
      .then(m => m.BookingPageComponent),
  // Sem AuthGuard — rota pública
}
```

> ⚠️ Esta rota deve ser a **última** no array para não conflitar com `/dashboard`, `/login`, etc.

**Arquivo:** `src/app/features/booking/booking.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/booking-page/booking-page.component')
        .then(m => m.BookingPageComponent),
  },
];
```

---

## Task 3.2 — Repository público (sem auth)

**Arquivo:** `src/app/core/repositories/booking.repository.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.client';
import { Profissional, Servico, Disponibilidade, Agendamento } from '../types/database.types';

@Injectable({ providedIn: 'root' })
export class BookingRepository {
  private supabase = inject(SUPABASE_CLIENT);

  /** Busca profissional pelo slug atual */
  async getProfissionalBySlug(slug: string): Promise<Profissional | null> {
    const { data } = await this.supabase
      .from('profissionais')
      .select('*')
      .eq('slug', slug)
      .eq('ativo', true)
      .maybeSingle();
    return data;
  }

  /** Checa slug_redirects se slug não encontrado */
  async getRedirectBySlug(slug: string): Promise<string | null> {
    const now = new Date().toISOString();
    const { data } = await this.supabase
      .from('slug_redirects')
      .select('profissional_id, profissionais(slug)')
      .eq('slug_antigo', slug)
      .gt('expira_em', now)
      .maybeSingle();
    return (data as any)?.profissionais?.slug ?? null;
  }

  /** Serviços ativos do profissional */
  async getServicos(profissionalId: string): Promise<Servico[]> {
    const { data } = await this.supabase
      .from('servicos')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('ativo', true)
      .order('nome');
    return data ?? [];
  }

  /** Disponibilidades configuradas pelo profissional */
  async getDisponibilidades(profissionalId: string): Promise<Disponibilidade[]> {
    const { data } = await this.supabase
      .from('disponibilidades')
      .select('*')
      .eq('profissional_id', profissionalId);
    return data ?? [];
  }

  /**
   * Agendamentos existentes num intervalo de datas
   * (para subtrair dos slots disponíveis)
   */
  async getAgendamentosNoIntervalo(
    profissionalId: string,
    de: string,   // ISO date 'YYYY-MM-DD'
    ate: string,  // ISO date 'YYYY-MM-DD'
  ): Promise<Pick<Agendamento, 'data_hora' | 'servico_id'>[]> {
    const { data } = await this.supabase
      .from('agendamentos')
      .select('data_hora, servico_id')
      .eq('profissional_id', profissionalId)
      .in('status', ['pendente', 'confirmado'])
      .gte('data_hora', `${de}T00:00:00`)
      .lte('data_hora', `${ate}T23:59:59`);
    return data ?? [];
  }

  /** Verifica limite do plano grátis (20 agendamentos/mês) */
  async contarAgendamentosNoMes(profissionalId: string): Promise<number> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { count } = await this.supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('profissional_id', profissionalId)
      .in('status', ['pendente', 'confirmado', 'concluido'])
      .gte('data_hora', inicioMes)
      .lte('data_hora', fimMes);
    return count ?? 0;
  }

  /** Cria o agendamento (status: pendente) */
  async criarAgendamento(payload: {
    profissional_id: string;
    servico_id: string;
    cliente_nome: string;
    cliente_wpp: string;
    data_hora: string; // ISO string
  }): Promise<{ id: string } | null> {
    const { data } = await this.supabase
      .from('agendamentos')
      .insert({ ...payload, status: 'pendente' })
      .select('id')
      .single();
    return data;
  }
}
```

> **Nota RLS:** as queries de leitura (`select`) precisam funcionar com a chave `anon` sem autenticação.  
> Verificar no Supabase se as policies de `SELECT` em `profissionais`, `servicos`, `disponibilidades` e `agendamentos` permitem leitura pública (ou criar policies específicas).  
> A policy de `INSERT` em `agendamentos` precisa permitir `anon` inserir com `profissional_id` válido.

---

## Task 3.3 — SlotCalculatorService

**Arquivo:** `src/app/features/booking/services/slot-calculator.service.ts`

Lógica central: gera os slots disponíveis dado disponibilidades + agendamentos existentes.

```typescript
import { Injectable } from '@angular/core';
import { Disponibilidade, Servico } from '../../../core/types/database.types';
import { format, addMinutes, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

export interface SlotInfo {
  hora: string;        // '09:00'
  dataHoraISO: string; // '2026-05-08T09:00:00'
  disponivel: boolean;
}

@Injectable({ providedIn: 'root' })
export class SlotCalculatorService {

  /**
   * Retorna os slots do dia para o serviço selecionado.
   *
   * @param data         Date do dia selecionado
   * @param servico      Serviço escolhido (duracao_min)
   * @param disponibilidades  Configuração da agenda do profissional
   * @param agendados    Agendamentos existentes (data_hora + servico_id com duracao)
   * @param servicosMap  Map<servicoId, duracao_min> para calcular bloqueio
   */
  calcularSlotsParaDia(
    data: Date,
    servico: Servico,
    disponibilidades: Disponibilidade[],
    agendados: Array<{ data_hora: string; duracao_min: number }>,
  ): SlotInfo[] {
    const diaSemana = data.getDay(); // 0=dom, 6=sab

    // Disponibilidade do profissional nesse dia
    const disp = disponibilidades.find(d => d.dia_semana === diaSemana);
    if (!disp) return [];

    const slots: SlotInfo[] = [];
    const intervalo = disp.intervalo_min ?? 30;

    // Gera todos os horários possíveis dentro do range
    let cursor = this.parseHora(data, disp.hora_inicio);
    const fim = this.parseHora(data, disp.hora_fim);
    const agora = new Date();

    while (isBefore(addMinutes(cursor, servico.duracao_min), fim) ||
           +addMinutes(cursor, servico.duracao_min) === +fim) {

      const slotFim = addMinutes(cursor, servico.duracao_min);
      const jaPAssou = isBefore(cursor, agora);

      // Checa conflito com agendamentos existentes
      const temConflito = agendados.some(ag => {
        const agInicio = parseISO(ag.data_hora);
        const agFim = addMinutes(agInicio, ag.duracao_min);
        // Conflito se os intervalos se sobrepõem
        return isBefore(cursor, agFim) && isAfter(slotFim, agInicio);
      });

      slots.push({
        hora: format(cursor, 'HH:mm'),
        dataHoraISO: cursor.toISOString(),
        disponivel: !temConflito && !jaPAssou,
      });

      cursor = addMinutes(cursor, intervalo);
    }

    return slots;
  }

  /**
   * Retorna os dias com pelo menos 1 slot disponível nos próximos 30 dias.
   * Usado para desabilitar datas sem horário.
   */
  diasComSlots(
    disponibilidades: Disponibilidade[],
    agendados: Array<{ data_hora: string; duracao_min: number }>,
    servico: Servico,
    diasAFrente = 30,
  ): Date[] {
    const hoje = startOfDay(new Date());
    const diasValidos: Date[] = [];

    for (let i = 0; i < diasAFrente; i++) {
      const dia = new Date(hoje);
      dia.setDate(hoje.getDate() + i);
      const slots = this.calcularSlotsParaDia(dia, servico, disponibilidades, agendados);
      if (slots.some(s => s.disponivel)) {
        diasValidos.push(dia);
      }
    }

    return diasValidos;
  }

  private parseHora(base: Date, horaStr: string): Date {
    const [h, m] = horaStr.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }
}
```

---

## Task 3.4 — BookingService (orquestrador)

**Arquivo:** `src/app/features/booking/services/booking.service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingRepository } from '../../../core/repositories/booking.repository';
import { SlotCalculatorService } from './slot-calculator.service';
import { Profissional, Servico, Disponibilidade } from '../../../core/types/database.types';
import { PLAN_LIMITS } from '../../../core/constants/plan.limits';

export type BookingStep = 'servico' | 'data' | 'horario' | 'dados' | 'resumo' | 'confirmado' | 'lotado' | 'not-found';

@Injectable()  // providedIn: component (não singleton)
export class BookingService {
  private repo = inject(BookingRepository);
  private slotCalc = inject(SlotCalculatorService);

  // Estado
  readonly step = signal<BookingStep>('servico');
  readonly profissional = signal<Profissional | null>(null);
  readonly servicos = signal<Servico[]>([]);
  readonly disponibilidades = signal<Disponibilidade[]>([]);
  readonly servicoSelecionado = signal<Servico | null>(null);
  readonly dataSelecionada = signal<Date | null>(null);
  readonly horarioSelecionado = signal<string | null>(null); // ISO
  readonly clienteNome = signal('');
  readonly clienteWpp = signal('');
  readonly loading = signal(false);
  readonly agendamentoId = signal<string | null>(null);
  readonly erro = signal<string | null>(null);

  // Agendamentos carregados (próximos 30 dias)
  private agendados = signal<Array<{ data_hora: string; duracao_min: number }>>([]);

  readonly slotsParaDia = computed(() => {
    const data = this.dataSelecionada();
    const servico = this.servicoSelecionado();
    if (!data || !servico) return [];
    return this.slotCalc.calcularSlotsParaDia(
      data, servico, this.disponibilidades(), this.agendados()
    );
  });

  readonly diasComSlots = computed(() => {
    const servico = this.servicoSelecionado();
    if (!servico) return [];
    return this.slotCalc.diasComSlots(
      this.disponibilidades(), this.agendados(), servico
    );
  });

  async inicializar(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      // 1. Busca profissional
      let prof = await this.repo.getProfissionalBySlug(slug);

      if (!prof) {
        // Checa redirect
        const novoSlug = await this.repo.getRedirectBySlug(slug);
        if (novoSlug) {
          window.location.replace(`/${novoSlug}`);
          return;
        }
        this.step.set('not-found');
        return;
      }

      this.profissional.set(prof);

      // 2. Checa limite plano grátis
      if (prof.plano === 'gratis') {
        const count = await this.repo.contarAgendamentosNoMes(prof.id);
        if (count >= PLAN_LIMITS['gratis'].agendamentos_mes) {
          this.step.set('lotado');
          return;
        }
      }

      // 3. Carrega dados em paralelo
      const [servicos, disps] = await Promise.all([
        this.repo.getServicos(prof.id),
        this.repo.getDisponibilidades(prof.id),
      ]);

      this.servicos.set(servicos);
      this.disponibilidades.set(disps);

      // 4. Carrega agendamentos dos próximos 30 dias (com duracao via join)
      await this.carregarAgendados(prof.id);

    } finally {
      this.loading.set(false);
    }
  }

  private async carregarAgendados(profId: string): Promise<void> {
    const hoje = new Date();
    const em30 = new Date(hoje);
    em30.setDate(hoje.getDate() + 30);

    const de = hoje.toISOString().split('T')[0];
    const ate = em30.toISOString().split('T')[0];

    const raw = await this.repo.getAgendamentosNoIntervalo(profId, de, ate);

    // Enriquece com duracao_min do serviço
    const servicosMap = new Map(this.servicos().map(s => [s.id, s.duracao_min]));
    const enriched = raw.map(ag => ({
      data_hora: ag.data_hora,
      duracao_min: servicosMap.get(ag.servico_id) ?? 60,
    }));

    this.agendados.set(enriched);
  }

  selecionarServico(servico: Servico): void {
    this.servicoSelecionado.set(servico);
    this.dataSelecionada.set(null);
    this.horarioSelecionado.set(null);
    this.step.set('data');
  }

  selecionarData(data: Date): void {
    this.dataSelecionada.set(data);
    this.horarioSelecionado.set(null);
    this.step.set('horario');
  }

  selecionarHorario(iso: string): void {
    this.horarioSelecionado.set(iso);
    this.step.set('dados');
  }

  irParaResumo(): void {
    this.step.set('resumo');
  }

  async confirmarAgendamento(): Promise<void> {
    this.loading.set(true);
    this.erro.set(null);
    try {
      const result = await this.repo.criarAgendamento({
        profissional_id: this.profissional()!.id,
        servico_id: this.servicoSelecionado()!.id,
        cliente_nome: this.clienteNome(),
        cliente_wpp: this.clienteWpp(),
        data_hora: this.horarioSelecionado()!,
      });

      if (result) {
        this.agendamentoId.set(result.id);
        this.step.set('confirmado');
      } else {
        this.erro.set('Não foi possível confirmar o agendamento. Tente novamente.');
      }
    } catch (e) {
      this.erro.set('Erro ao conectar. Verifique sua conexão e tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  voltar(): void {
    const ordem: BookingStep[] = ['servico', 'data', 'horario', 'dados', 'resumo'];
    const atual = this.step();
    const idx = ordem.indexOf(atual);
    if (idx > 0) this.step.set(ordem[idx - 1]);
  }
}
```

---

## Task 3.5 — BookingPageComponent (orquestrador de UI)

**Arquivo:** `booking-page.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
// importar sub-componentes

@Component({
  selector: 'app-booking-page',
  standalone: true,
  providers: [BookingService],  // instância por página
  imports: [CommonModule, /* sub-componentes */],
  templateUrl: './booking-page.component.html',
})
export class BookingPageComponent implements OnInit {
  readonly booking = inject(BookingService);
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);
  private title = inject(Title);

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    await this.booking.inicializar(slug);

    // Meta tags dinâmicas (SSR)
    const prof = this.booking.profissional();
    if (prof) {
      this.title.setTitle(`Agendar com ${prof.nome} · Kianna`);
      this.meta.updateTag({ name: 'description', content: prof.bio ?? `Agende com ${prof.nome} pelo Kianna` });
      this.meta.updateTag({ property: 'og:title', content: `Agende com ${prof.nome}` });
      this.meta.updateTag({ property: 'og:image', content: prof.foto_url ?? '' });
    }
  }
}
```

**Template (`booking-page.component.html`) — estrutura base:**

```html
<div class="booking-container">

  <!-- Perfil do profissional (sempre visível) -->
  <app-professional-header
    [profissional]="booking.profissional()"
  />

  <!-- Loading global -->
  @if (booking.loading()) {
    <div class="slot-loading">
      <mat-spinner diameter="32" />
    </div>
  }

  <!-- Máquina de estados por step -->
  @switch (booking.step()) {

    @case ('servico') {
      <app-service-selector
        [servicos]="booking.servicos()"
        (selecionou)="booking.selecionarServico($event)"
      />
    }

    @case ('data') {
      <app-date-selector
        [diasComSlots]="booking.diasComSlots()"
        (selecionou)="booking.selecionarData($event)"
        (voltou)="booking.voltar()"
      />
    }

    @case ('horario') {
      <app-time-selector
        [slots]="booking.slotsParaDia()"
        [data]="booking.dataSelecionada()"
        (selecionou)="booking.selecionarHorario($event)"
        (voltou)="booking.voltar()"
      />
    }

    @case ('dados') {
      <app-client-form
        [(nome)]="booking.clienteNome"
        [(wpp)]="booking.clienteWpp"
        (confirmou)="booking.irParaResumo()"
        (voltou)="booking.voltar()"
      />
    }

    @case ('resumo') {
      <app-booking-summary
        [profissional]="booking.profissional()"
        [servico]="booking.servicoSelecionado()"
        [dataHora]="booking.horarioSelecionado()"
        [cliente]="{ nome: booking.clienteNome(), wpp: booking.clienteWpp() }"
        [loading]="booking.loading()"
        [erro]="booking.erro()"
        (confirmou)="booking.confirmarAgendamento()"
        (voltou)="booking.voltar()"
      />
    }

    @case ('confirmado') {
      <app-booking-confirmation
        [profissional]="booking.profissional()"
        [servico]="booking.servicoSelecionado()"
        [dataHora]="booking.horarioSelecionado()"
        [clienteNome]="booking.clienteNome()"
      />
    }

    @case ('lotado') {
      <!-- Plano grátis esgotado -->
      <div class="estado-vazio">
        <p>Este profissional não tem horários disponíveis no momento.</p>
        <p>Entre em contato diretamente pelo WhatsApp.</p>
      </div>
    }

    @case ('not-found') {
      <!-- Slug não encontrado -->
      <div class="estado-vazio">
        <p>Profissional não encontrado.</p>
        <a routerLink="/">Conhecer o Kianna</a>
      </div>
    }

  }

</div>
```

---

## Task 3.6 — Componentes de UI

### DateSelector
- Mostra chips de dia (dom/seg/ter... · 03/mai)
- Navega em blocos de 7 dias com `< >`
- Dias fora de `diasComSlots` ficam `disabled` (estilo acinzentado)
- Dia hoje sempre visível como primeiro

```typescript
// Inputs/Outputs relevantes:
@Input() diasComSlots: Date[] = [];
@Output() selecionou = new EventEmitter<Date>();
@Output() voltou = new EventEmitter<void>();

// Internamente:
diasVisiveis = signal<Date[]>([]); // bloco atual de 7
paginaAtual = signal(0);

ngOnInit() {
  this.atualizarPagina();
}

atualizarPagina() {
  const inicio = this.paginaAtual() * 7;
  // Gera array dos próximos 30 dias, filtra bloco atual
  const todos = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  this.diasVisiveis.set(todos.slice(inicio, inicio + 7));
}

isDiaDisponivel(dia: Date): boolean {
  return this.diasComSlots().some(d =>
    d.toDateString() === dia.toDateString()
  );
}
```

### TimeSelector
- Chips `HH:mm` em wrap horizontal (scroll se necessário)
- `disabled` + `opacity: 0.4` para slots não disponíveis
- Ao selecionar, emite o ISO string

### ClientForm
- Campo "Nome" (text, required)
- Campo "WhatsApp" (tel, máscara `(00) 00000-0000`, flag BR decorativa)
- Usa o validator `whatsAppValido` já existente em `whatsapp.util.ts`
- **Não usa Angular Material** (inputs custom para visual minimalista)

### BookingConfirmation — Google Agenda link

```typescript
gerarLinkGoogleAgenda(): string {
  const servico = this.servico();
  const dataHora = this.dataHora();
  if (!servico || !dataHora) return '';

  const inicio = new Date(dataHora);
  const fim = new Date(inicio.getTime() + servico.duracao_min * 60_000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${servico.nome} com ${this.profissional()?.nome}`,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    details: `Agendado via Kianna · kianna.com.br/${this.profissional()?.slug}`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}
```

---

## Task 3.7 — Estilos (minimalista)

**Paleta da página pública** (separada do dashboard):

```scss
// booking-page.component.scss
:host {
  --booking-bg: #ffffff;
  --booking-surface: #f8f9fa;
  --booking-border: #e9ecef;
  --booking-text: #212529;
  --booking-muted: #6c757d;
  --booking-primary: #1D9E75;       // verde Kianna
  --booking-primary-light: #e8f5f0;
  --booking-chip-selected-bg: #1D9E75;
  --booking-chip-selected-text: #fff;
  --booking-chip-disabled: #dee2e6;
  --booking-radius: 8px;
  --booking-radius-lg: 12px;

  display: block;
  min-height: 100dvh;
  background: var(--booking-bg);
  font-family: 'Inter', sans-serif;  // pode usar a fonte já carregada
}

.booking-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 80px;
}

// Chip de data/horário
.chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border: 1.5px solid var(--booking-border);
  border-radius: var(--booking-radius);
  cursor: pointer;
  transition: all 0.15s;
  background: white;

  &:hover:not(.disabled) {
    border-color: var(--booking-primary);
    background: var(--booking-primary-light);
  }

  &.selected {
    border-color: var(--booking-primary);
    background: var(--booking-chip-selected-bg);
    color: var(--booking-chip-selected-text);
  }

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }
}
```

---

## Task 3.8 — Meta tags SSR + robots

**Arquivo:** `src/app/features/booking/pages/booking-page/booking-page.component.ts`

No `ngOnInit` (já mostrado acima), adicionar também:

```typescript
// Canonical
this.meta.updateTag({
  rel: 'canonical',
  href: `https://kianna.com.br/${prof.slug}`
});

// Twitter Card
this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
this.meta.updateTag({ name: 'twitter:title', content: `Agende com ${prof.nome}` });
```

**Arquivo:** `src/robots.txt` (ou via Vercel config):
```
User-agent: *
Allow: /

# Bloquear dashboard do Google
Disallow: /dashboard/
Disallow: /onboarding/
```

---

## Task 3.9 — Policies RLS no Supabase

Executar no SQL Editor do Supabase:

```sql
-- Leitura pública de profissionais ativos
CREATE POLICY "público pode ver profissionais ativos"
ON profissionais FOR SELECT
TO anon
USING (ativo = true);

-- Leitura pública de serviços ativos
CREATE POLICY "público pode ver serviços ativos"
ON servicos FOR SELECT
TO anon
USING (ativo = true);

-- Leitura pública de disponibilidades
CREATE POLICY "público pode ver disponibilidades"
ON disponibilidades FOR SELECT
TO anon
USING (true);

-- Leitura pública de agendamentos (apenas data_hora e servico_id, sem dados de cliente)
-- Usar view para não expor cliente_nome/cliente_wpp
CREATE VIEW agendamentos_publicos AS
  SELECT id, profissional_id, servico_id, data_hora, status
  FROM agendamentos
  WHERE status IN ('pendente', 'confirmado');

-- Inserção pública de agendamentos (cliente anonimo cria)
CREATE POLICY "anon pode criar agendamento"
ON agendamentos FOR INSERT
TO anon
WITH CHECK (true);

-- Leitura pública de slug_redirects
CREATE POLICY "público pode ver redirects"
ON slug_redirects FOR SELECT
TO anon
USING (expira_em > now());
```

> ⚠️ Ajustar a query `getAgendamentosNoIntervalo` para usar a view `agendamentos_publicos` ao invés da tabela diretamente.

---

## Task 3.10 — Dashboard: Aprovação de agendamentos pendentes

Como o status inicial agora é `pendente`, o profissional precisa ver e aprovar no dashboard.

### Mudanças na Visão Geral
- Badge de contagem em "Pendentes" nos KPIs
- Cor laranja/âmbar para status `pendente` (já configurado em `STATUS_CORES`?)

### Mudanças na Agenda (FullCalendar)
- Eventos `pendente` com cor diferente (ex: `#F59E0B` âmbar)
- Ao clicar no evento: dialog com botões **Confirmar** e **Cancelar**

### AgendamentosRepository (existente) — adicionar método:
```typescript
async atualizarStatus(id: string, status: 'confirmado' | 'cancelado'): Promise<void> {
  await this.supabase
    .from('agendamentos')
    .update({ status })
    .eq('id', id)
    .eq('profissional_id', await this.profissionalIdOrThrow());
}
```

### EventoDialog (novo componente):
```
dashboard/components/evento-dialog/
  evento-dialog.component.ts   ← mat-dialog
```

```html
<!-- evento-dialog.component.html -->
<h2 mat-dialog-title>{{ data.clienteNome }}</h2>
<mat-dialog-content>
  <p>{{ data.servicoNome }} · {{ data.dataHora | date:'dd/MM HH:mm' }}</p>
  <mat-chip [color]="data.status === 'pendente' ? 'warn' : 'primary'">
    {{ data.status }}
  </mat-chip>
</mat-dialog-content>
<mat-dialog-actions>
  @if (data.status === 'pendente') {
    <button mat-flat-button color="primary" (click)="confirmar()">Confirmar</button>
    <button mat-stroked-button color="warn" (click)="cancelar()">Cancelar</button>
  }
  <button mat-button mat-dialog-close>Fechar</button>
</mat-dialog-actions>
```

---

## Ordem de implementação recomendada

```
[1] Task 3.9   → Policies RLS no Supabase (pré-requisito de tudo)
[2] Task 3.1   → Roteamento (adicionar /:slug)
[3] Task 3.2   → BookingRepository
[4] Task 3.3   → SlotCalculatorService
[5] Task 3.4   → BookingService
[6] Task 3.5   → BookingPageComponent (shell + máquina de estados)
[7] Task 3.6   → Componentes de UI (em paralelo se possível):
                  professional-header
                  service-selector
                  date-selector
                  time-selector
                  client-form
                  booking-summary
                  booking-confirmation
[8] Task 3.7   → Estilos minimalistas
[9] Task 3.8   → Meta tags SSR
[10] Task 3.10 → Dashboard: aprovação de pendentes
```

---

## Critérios de aceite do Módulo 3

- [ ] `/:slug` resolve com SSR (checar `view-source:` no browser)
- [ ] Slug inexistente → checa `slug_redirects` → redireciona ou 404
- [ ] Profissional inativo → 404
- [ ] Plano grátis lotado → tela informativa com WhatsApp do profissional
- [ ] Serviços inativos não aparecem
- [ ] Dias sem disponibilidade ficam desabilitados no seletor
- [ ] Horários ocupados (pendente/confirmado) não aparecem
- [ ] Horários já passados não aparecem
- [ ] Agendamento criado com status `pendente`
- [ ] Tela de confirmação mostra resumo + link Google Agenda
- [ ] Meta tags `og:title`, `og:image`, `description` corretas por profissional
- [ ] No mobile (375px) toda a UI é usável sem zoom
- [ ] Dashboard mostra badge de pendentes
- [ ] Profissional consegue confirmar/cancelar agendamento pendente

---

## Dependências já instaladas (verificar)

- `date-fns` e `date-fns-tz` → já instalados (mencionado no doc)
- `@fullcalendar/angular` → já instalado
- `ngx-mask` → verificar; se não tiver, instalar para máscara do WhatsApp

```bash
npm i ngx-mask   # se necessário
```
