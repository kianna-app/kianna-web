# Objetivo desta Task (versão refinada)
Garantir que os requisitos definidos nesta etapa estejam **alinhados, não duplicados e coerentes** com o que foi analisado, decidido e entregue no **Módulo 1**, preparando uma **task clara, executável e validável** para continuidade do trabalho.

## Diretrizes de Análise (versão melhorada)

- Verificar **aderência total** ao que já foi definido no Módulo 1  
- Eliminar **duplicidade de ideias, decisões ou requisitos**
- Refinar a **definição do requisito**, deixando explícito:
  - O que será feito
  - O que **não** será feito
- Identificar **lacunas, ambiguidades ou dependências ocultas**
- Focar apenas nas **decisões mínimas necessárias** para iniciar a implementação
- Formular **perguntas objetivas**, que desbloqueiem a execução
- Preparar insumos para transformar a análise em um **Taskcard claro e acionável**

## Fluxo de Trabalho Refinado
### 01. Análise Crítica
- Revisar o conteúdo desta task à luz do Módulo 1  
- Identificar:
  - Conflitos conceituais
  - Repetições desnecessárias
  - Pontos vagos ou incompletos
- Listar os **principais problemas encontrados** de forma direta

### 02. Perguntas para Desbloqueio
- Elaborar apenas **perguntas objetivas e decisórias**, evitando:
  - Perguntas abertas demais
  - Discussões conceituais já resolvidas no Módulo 1
- Priorizar perguntas que destravem:
  - Escopo
  - Responsáveis
  - Ordem de execução
  - Critérios técnicos ou de negócio

### 03. Consolidação no Taskcard
- Após receber as respostas:
- Atualizar o taskcard com **escopo claro**
- Definir ação concreta (*verbo + objeto*)
- Garantir continuidade lógica com o Módulo 1
- O resultado deve ser uma **task pronta para execução**, sem dependência de novas análises conceituais

## ✅ Novo Tópico Adicionado (Essencial para Execução)

### Critérios de Aceite (Definition of Done)
Incluir explicitamente no taskcard:

- Quais condições precisam ser atendidas para a task ser considerada concluída?
- Qual evidência valida a entrega?  
  *(ex: documento, tela, decisão formal, validação do stakeholder)*
- Quem aprova o resultado final?

> **Sem critérios de aceite claros, a task corre risco de retrabalho ou interpretações divergentes.**

## Resultado Esperado

Ao final desta task, deve existir:

- ✅ Alinhamento explícito com o Módulo 1  
- ✅ Nenhuma duplicidade de conceito ou decisão  
- ✅ Perguntas respondidas que destravam a execução  
- ✅ Taskcard claro, objetivo e executável  
- ✅ Critérios de aceite bem definidos  

## Gere um Arquivo que será executado sem caracteres especiais desnecessários, ícones ou espaços desnecessários para o entendimento da Claude Code que irá executar a task, afim de economizar tokens, sem perder qualidade.

---


## TASK — Módulo 2: Dashboard (Agenda, Serviços e Horários)
>
> Repositório: <git@github.com>:agendazap-tech/agendazap-web.git
> Pré-requisito: Módulo 1 concluído e validado
> Objetivo: dashboard completo com shell responsivo, agenda visual, CRUD de serviços e configuração de horários

## Princípios de código (LER ANTES DE COMEÇAR)

Este módulo é maior que o anterior. Pra evitar dúvida técnica, todo código deve seguir:

1. **Componente burro, lógica em service.** Componentes só têm `inject()`, signals locais de UI e métodos que delegam para services. Zero acesso direto ao Supabase em componentes.
2. **Repositório por entidade.** Cada tabela do banco tem um único repositório (`AgendamentosRepository`, `ServicosRepository`, `DisponibilidadesRepository`). Componentes nunca chamam `supabase.from(...)` diretamente.
3. **Store com Signals.** Estado compartilhado entre componentes (lista de serviços, agendamentos do mês) vive em stores baseados em signals, não em propriedades de componente.
4. **Limites de plano centralizados.** Toda regra "plano grátis = 3 serviços" está em **um arquivo só** (`plan.limits.ts`). Outros arquivos consultam, nunca duplicam o número.
5. **Sem any.** Toda função do Supabase tem tipo de retorno explícito. Use as interfaces de `database.types.ts` (TAREFA 0).
6. **Sem if-else gigante em templates.** Use `@if` / `@for` / `@switch`, mas se passar de 3 ramos, mova pra computed signal.
7. **Constantes nomeadas.** Cores, tamanhos de breakpoint, durações de animação ficam em `_variables.scss` ou `app.constants.ts`. Nada de magic numbers.
8. **Nada de classes utilitárias inline (`style="..."`).** O placeholder de dashboard do Módulo 1 vai ser substituído inteiro nesse módulo.

## TAREFA 0 — Tipos do banco de dados

> ⚠️ Faça PRIMEIRO. Todos os repositórios e stores dependem desses tipos.

Crie `src/app/core/types/database.types.ts`:

```typescript
// ── Domínio ──────────────────────────────────────────────────
export type Plano       = 'gratis' | 'pro' | 'studio';
export type StatusAgend = 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
export type DiaSemana   = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Dom, 6 = Sáb

// ── Tabelas ──────────────────────────────────────────────────
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
}

export interface Servico {
  id: string;
  profissional_id: string;
  nome: string;
  duracao_min: number;
  preco: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Disponibilidade {
  id: string;
  profissional_id: string;
  dia_semana: DiaSemana;
  hora_inicio: string;  // 'HH:mm' ou 'HH:mm:ss'
  hora_fim: string;
  intervalo_min: number;
}

export interface Agendamento {
  id: string;
  profissional_id: string;
  servico_id: string | null;
  cliente_nome: string;
  cliente_wpp: string;
  data_hora: string;       // ISO timestamp
  status: StatusAgend;
  lembrete_enviado: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Agendamento com serviço populado (join)
export interface AgendamentoComServico extends Agendamento {
  servico: Pick<Servico, 'id' | 'nome' | 'duracao_min' | 'preco'> | null;
}

// ── Inputs (DTO) ─────────────────────────────────────────────
export type ServicoInput = Pick<Servico, 'nome' | 'duracao_min' | 'preco' | 'ativo'>;

export interface DisponibilidadeInput {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}
```
## TAREFA 1 — Constantes globais e limites de plano

### 1.1 Constantes da aplicação

Crie `src/app/core/constants/app.constants.ts`:

```typescript
export const APP = {
  NOME: 'AgendaZap',
  DOMINIO: 'agendazap.tech',
  URL_BASE: 'https://agendazap.tech',
} as const;

export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 960,
  DESKTOP: 1280,
} as const;

export const STATUS_CORES: Record<string, string> = {
  confirmado: '#1D9E75',
  pendente:   '#D97706',
  cancelado:  '#E11D48',
  concluido:  '#64748B',
};

export const DURACOES_SERVICO = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240] as const;

export const DIAS_SEMANA = [
  { dia: 1, label: 'Segunda',  curto: 'Seg' },
  { dia: 2, label: 'Terça',    curto: 'Ter' },
  { dia: 3, label: 'Quarta',   curto: 'Qua' },
  { dia: 4, label: 'Quinta',   curto: 'Qui' },
  { dia: 5, label: 'Sexta',    curto: 'Sex' },
  { dia: 6, label: 'Sábado',   curto: 'Sáb' },
  { dia: 0, label: 'Domingo',  curto: 'Dom' },
] as const;
```

### 1.2 Limites por plano (FONTE ÚNICA DA VERDADE)

Crie `src/app/core/constants/plan.limits.ts`:

```typescript
import { Plano } from '@core/types/database.types';

export interface PlanoLimits {
  servicos: number;          // -1 = ilimitado
  agendamentosMes: number;   // -1 = ilimitado
  lembretes: boolean;
  linkPersonalizado: boolean;
  relatorio: boolean;
  multiProfissional: number; // -1 = ilimitado
}

export const PLAN_LIMITS: Record<Plano, PlanoLimits> = {
  gratis: {
    servicos: 3,
    agendamentosMes: 20,
    lembretes: false,
    linkPersonalizado: false,
    relatorio: false,
    multiProfissional: 1,
  },
  pro: {
    servicos: -1,
    agendamentosMes: -1,
    lembretes: true,
    linkPersonalizado: true,
    relatorio: true,
    multiProfissional: 1,
  },
  studio: {
    servicos: -1,
    agendamentosMes: -1,
    lembretes: true,
    linkPersonalizado: true,
    relatorio: true,
    multiProfissional: 3,
  },
};

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function exceededLimit(atual: number, limite: number): boolean {
  if (isUnlimited(limite)) return false;
  return atual >= limite;
}
```

> ⚠️ **Regra de ouro:** se você precisa do número "3 serviços" em qualquer outro arquivo, **importe daqui**. Nunca digite o número `3` ou a string `'gratis'` em outro lugar.


## TAREFA 2 — Repositórios (acesso ao Supabase)

> Cada repositório recebe `profissional_id` no construtor via DI dinâmica. Componentes **NUNCA** chamam `supabase.from(...)` diretamente — sempre via repositório.

### 2.1 Base genérica (opcional, mas reduz duplicação)

Crie `src/app/core/repositories/base.repository.ts`:

```typescript
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

/**
 * Helper: retorna o profissional_id do usuário autenticado.
 * Lança erro se não houver usuário — fail-fast intencional.
 */
export function profissionalIdOrThrow(): string {
  const user = currentUser();
  if (!user?.id) {
    throw new Error('Profissional não autenticado');
  }
  return user.id;
}

export { supabase };
```

### 2.2 Repositório de Serviços

Crie `src/app/core/repositories/servicos.repository.ts`:

```typescript
import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Servico, ServicoInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class ServicosRepository {

  async listar(): Promise<Servico[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('profissional_id', profissional_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Servico[];
  }

  async criar(input: ServicoInput): Promise<Servico> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('servicos')
      .insert({ ...input, profissional_id })
      .select()
      .single();
    if (error) throw error;
    return data as Servico;
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Servico;
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .update({ ativo })
      .eq('id', id);
    if (error) throw error;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) throw error;
  }
}
```

### 2.3 Repositório de Disponibilidades

Crie `src/app/core/repositories/disponibilidades.repository.ts`:

```typescript
import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class DisponibilidadesRepository {

  async listar(): Promise<Disponibilidade[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('disponibilidades')
      .select('*')
      .eq('profissional_id', profissional_id)
      .order('dia_semana', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Disponibilidade[];
  }

  /**
   * Substitui TODA a configuração de horários (delete + insert).
   * Mais simples e consistente que diff por linha — config de horários muda raramente.
   */
  async substituirTodas(inputs: DisponibilidadeInput[]): Promise<void> {
    const profissional_id = profissionalIdOrThrow();

    const { error: delErr } = await supabase
      .from('disponibilidades')
      .delete()
      .eq('profissional_id', profissional_id);
    if (delErr) throw delErr;

    if (inputs.length === 0) return;

    const rows = inputs.map(i => ({ ...i, profissional_id }));
    const { error: insErr } = await supabase.from('disponibilidades').insert(rows);
    if (insErr) throw insErr;
  }
}
```

### 2.4 Repositório de Agendamentos

Crie `src/app/core/repositories/agendamentos.repository.ts`:

```typescript
import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Agendamento, AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosRepository {

  /**
   * Carrega agendamentos no intervalo [inicio, fim) com serviço populado.
   * Usado pelo FullCalendar — chamado a cada navegação de mês/semana.
   */
  async listarPorPeriodo(inicio: Date, fim: Date): Promise<AgendamentoComServico[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servicos ( id, nome, duracao_min, preco )
      `)
      .eq('profissional_id', profissional_id)
      .gte('data_hora', inicio.toISOString())
      .lt('data_hora', fim.toISOString())
      .order('data_hora', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as AgendamentoComServico[];
  }

  async atualizarStatus(id: string, status: StatusAgend): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Agendamento;
  }

  /** Conta agendamentos do mês atual — usado pra checar limite de plano. */
  async contarDoMesAtual(): Promise<number> {
    const profissional_id = profissionalIdOrThrow();
    const inicio = new Date();
    inicio.setDate(1); inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + 1);

    const { count, error } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('profissional_id', profissional_id)
      .gte('data_hora', inicio.toISOString())
      .lt('data_hora', fim.toISOString())
      .neq('status', 'cancelado');
    if (error) throw error;
    return count ?? 0;
  }
}
```

---

## TAREFA 3 — Stores (estado compartilhado com Signals)

### 3.1 Store de Serviços

Crie `src/app/features/dashboard/state/servicos.store.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { ServicosRepository } from '@core/repositories/servicos.repository';
import { Servico, ServicoInput } from '@core/types/database.types';
import { userPlano } from '@core/signals/app.signals';
import { PLAN_LIMITS, exceededLimit } from '@core/constants/plan.limits';

@Injectable({ providedIn: 'root' })
export class ServicosStore {
  private repo = inject(ServicosRepository);

  // ── Estado ─────────────────────────────────────────────────
  readonly servicos = signal<Servico[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  // ── Derivados ──────────────────────────────────────────────
  readonly ativos    = computed(() => this.servicos().filter(s => s.ativo));
  readonly inativos  = computed(() => this.servicos().filter(s => !s.ativo));
  readonly total     = computed(() => this.servicos().length);
  readonly limite    = computed(() => PLAN_LIMITS[userPlano()].servicos);
  readonly atingiuLimite = computed(() => exceededLimit(this.total(), this.limite()));

  // ── Ações ──────────────────────────────────────────────────
  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listar();
      this.servicos.set(lista);
    } catch (e: any) {
      this.erro.set(e.message ?? 'Erro ao carregar serviços');
    } finally {
      this.carregando.set(false);
    }
  }

  async criar(input: ServicoInput): Promise<void> {
    if (this.atingiuLimite()) {
      throw new Error(`Limite do plano atingido (${this.limite()} serviços).`);
    }
    const novo = await this.repo.criar(input);
    this.servicos.update(arr => [...arr, novo]);
  }

  async atualizar(id: string, input: Partial<ServicoInput>): Promise<void> {
    const atualizado = await this.repo.atualizar(id, input);
    this.servicos.update(arr => arr.map(s => s.id === id ? atualizado : s));
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    await this.repo.toggleAtivo(id, ativo);
    this.servicos.update(arr => arr.map(s => s.id === id ? { ...s, ativo } : s));
  }

  async excluir(id: string): Promise<void> {
    await this.repo.excluir(id);
    this.servicos.update(arr => arr.filter(s => s.id !== id));
  }
}
```

### 3.2 Store de Horários

Crie `src/app/features/dashboard/state/horarios.store.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { DisponibilidadesRepository } from '@core/repositories/disponibilidades.repository';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class HorariosStore {
  private repo = inject(DisponibilidadesRepository);

  readonly disponibilidades = signal<Disponibilidade[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly diasAtivos = computed(() =>
    new Set(this.disponibilidades().map(d => d.dia_semana))
  );

  /** Total de horas semanais atendidas (preview). */
  readonly horasSemanais = computed(() => {
    return this.disponibilidades().reduce((acc, d) => {
      const [hi, mi] = d.hora_inicio.split(':').map(Number);
      const [hf, mf] = d.hora_fim.split(':').map(Number);
      return acc + (hf * 60 + mf - (hi * 60 + mi)) / 60;
    }, 0);
  });

  /** Total de slots disponíveis por semana (com base no menor intervalo). */
  readonly slotsSemanais = computed(() => {
    return this.disponibilidades().reduce((acc, d) => {
      const [hi, mi] = d.hora_inicio.split(':').map(Number);
      const [hf, mf] = d.hora_fim.split(':').map(Number);
      const minutos = hf * 60 + mf - (hi * 60 + mi);
      return acc + Math.floor(minutos / d.intervalo_min);
    }, 0);
  });

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await this.repo.listar();
      this.disponibilidades.set(lista);
    } catch (e: any) {
      this.erro.set(e.message ?? 'Erro ao carregar horários');
    } finally {
      this.carregando.set(false);
    }
  }

  async salvar(inputs: DisponibilidadeInput[]): Promise<void> {
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.repo.substituirTodas(inputs);
      await this.carregar();
    } catch (e: any) {
      this.erro.set(e.message ?? 'Erro ao salvar horários');
      throw e;
    } finally {
      this.salvando.set(false);
    }
  }
}
```

### 3.3 Store de Agendamentos

Crie `src/app/features/dashboard/state/agendamentos.store.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class AgendamentosStore {
  private repo = inject(AgendamentosRepository);

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
      this.erro.set(e.message ?? 'Erro ao carregar agenda');
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarStatus(id: string, status: StatusAgend): Promise<void> {
    await this.repo.atualizarStatus(id, status);
    this.agendamentos.update(arr =>
      arr.map(a => a.id === id ? { ...a, status } : a)
    );
  }
}
```

---

## TAREFA 4 — Instalar dependências

### 4.1 FullCalendar

```bash
npm install @fullcalendar/core @fullcalendar/angular @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction
```

### 4.2 CDK (Layout + BreakpointObserver)

Já vem com Angular Material — não precisa instalar.

---

## TAREFA 5 — Layout do Dashboard (Shell)

### 5.1 Service de breakpoint (responsivo)

Crie `src/app/core/services/breakpoint.service.ts`:

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BREAKPOINTS } from '@core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private bp = inject(BreakpointObserver);

  private readonly _isMobile = signal(false);
  readonly isMobile  = this._isMobile.asReadonly();
  readonly isDesktop = computed(() => !this._isMobile());

  constructor() {
    this.bp.observe(`(max-width: ${BREAKPOINTS.TABLET - 1}px)`)
      .pipe(takeUntilDestroyed())
      .subscribe(r => this._isMobile.set(r.matches));
  }
}
```

### 5.2 Itens do menu (constante)

Crie `src/app/features/dashboard/shell/menu.config.ts`:

```typescript
export interface MenuItem {
  rota: string;
  label: string;
  icone: string;        // material icon name
  implementadoEm?: string; // 'modulo-X' — para placeholders
}

export const MENU_ITEMS: MenuItem[] = [
  { rota: '/dashboard/agenda',         label: 'Agenda',         icone: 'event' },
  { rota: '/dashboard/servicos',       label: 'Serviços',       icone: 'cut' },
  { rota: '/dashboard/horarios',       label: 'Horários',       icone: 'schedule' },
  { rota: '/dashboard/clientes',       label: 'Clientes',       icone: 'people',           implementadoEm: 'modulo-5' },
  { rota: '/dashboard/relatorio',      label: 'Relatório',      icone: 'insert_chart',     implementadoEm: 'modulo-5' },
  { rota: '/dashboard/configuracoes',  label: 'Config.',        icone: 'settings',         implementadoEm: 'modulo-5' },
];
```

### 5.3 Componente de Sidenav (desktop)

Crie `src/app/features/dashboard/shell/sidenav/sidenav.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
import { MENU_ITEMS } from '../menu.config';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  private auth = inject(AuthService);
  readonly menu = MENU_ITEMS;
  readonly user = currentUser;

  logout() { this.auth.signOut(); }
}
```

Crie `src/app/features/dashboard/shell/sidenav/sidenav.component.html`:

```html
<aside class="sidenav">
  <div class="sidenav-logo">
    <span class="logo-icon">📅</span>
    <span class="logo-text">AgendaZap</span>
  </div>

  <nav class="sidenav-menu">
    @for (item of menu; track item.rota) {
      <a [routerLink]="item.rota" routerLinkActive="ativo"
         [matTooltip]="item.implementadoEm ? 'Disponível em breve' : ''"
         class="menu-item" [class.disabled]="item.implementadoEm">
        <mat-icon>{{ item.icone }}</mat-icon>
        <span>{{ item.label }}</span>
      </a>
    }
  </nav>

  <div class="sidenav-footer">
    <div class="user-card">
      @if (user()?.foto_url) {
        <img [src]="user()!.foto_url" [alt]="user()!.nome" class="user-avatar">
      } @else {
        <div class="user-avatar fallback"><mat-icon>person</mat-icon></div>
      }
      <div class="user-info">
        <div class="user-nome">{{ user()?.nome }}</div>
        <div class="user-plano">Plano {{ user()?.plano }}</div>
      </div>
    </div>
    <button class="logout-btn" (click)="logout()" matTooltip="Sair">
      <mat-icon>logout</mat-icon>
    </button>
  </div>
</aside>
```

Crie `src/app/features/dashboard/shell/sidenav/sidenav.component.scss`:

```scss
@use 'styles/variables' as v;

.sidenav {
  width: 240px;
  background: v.$agendazap-slate-900;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidenav-logo {
  padding: 24px 20px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,.08);

  .logo-icon { font-size: 22px; }
  .logo-text { font-size: 18px; font-weight: 700; color: v.$agendazap-green-400; }
}

.sidenav-menu {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: v.$agendazap-slate-300;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background .15s;

  mat-icon { font-size: 20px; width: 20px; height: 20px; }

  &:hover { background: rgba(255,255,255,.06); color: #fff; }

  &.ativo {
    background: v.$agendazap-green-500;
    color: #fff;
  }

  &.disabled {
    opacity: .45;
    pointer-events: none;
  }
}

.sidenav-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  &.fallback {
    background: v.$agendazap-slate-700;
    display: flex; align-items: center; justify-content: center;
    mat-icon { font-size: 20px; color: v.$agendazap-slate-400; }
  }
}

.user-info { min-width: 0; }
.user-nome  { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-plano { font-size: 11px; color: v.$agendazap-slate-400; text-transform: capitalize; }

.logout-btn {
  background: transparent;
  border: none;
  color: v.$agendazap-slate-400;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(255,255,255,.06); color: v.$status-cancelado; }
  mat-icon { font-size: 20px; }
}
```

### 5.4 Componente de Bottom Navigation (mobile)

Crie `src/app/features/dashboard/shell/bottom-nav/bottom-nav.component.ts`:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MENU_ITEMS } from '../menu.config';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  // Mobile: só os 4 itens implementados (Agenda, Serviços, Horários, Mais)
  readonly menu = MENU_ITEMS.filter(m => !m.implementadoEm).slice(0, 3);
}
```

Crie `src/app/features/dashboard/shell/bottom-nav/bottom-nav.component.html`:

```html
<nav class="bottom-nav">
  @for (item of menu; track item.rota) {
    <a [routerLink]="item.rota" routerLinkActive="ativo" class="bn-item">
      <mat-icon>{{ item.icone }}</mat-icon>
      <span>{{ item.label }}</span>
    </a>
  }
</nav>
```

Crie `src/app/features/dashboard/shell/bottom-nav/bottom-nav.component.scss`:

```scss
@use 'styles/variables' as v;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid v.$agendazap-slate-200;
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.bn-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: v.$agendazap-slate-500;
  font-size: 11px;
  font-weight: 500;
  transition: color .15s;

  mat-icon { font-size: 22px; width: 22px; height: 22px; }

  &.ativo { color: v.$agendazap-green-500; }
}
```

### 5.5 Header com link único

Crie `src/app/features/dashboard/shell/header/header.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private snack = inject(MatSnackBar);

  readonly user = currentUser;
  readonly copiado = signal(false);

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
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
}
```

Crie `src/app/features/dashboard/shell/header/header.component.html`:

```html
<header class="dash-header">
  <div class="link-chip">
    <mat-icon>link</mat-icon>
    <span class="link-text">{{ linkPublico }}</span>
    <button mat-button color="primary" (click)="copiarLink()">
      <mat-icon>{{ copiado() ? 'check' : 'content_copy' }}</mat-icon>
      {{ copiado() ? 'Copiado' : 'Copiar' }}
    </button>
  </div>
</header>
```

Crie `src/app/features/dashboard/shell/header/header.component.scss`:

```scss
@use 'styles/variables' as v;

.dash-header {
  background: #fff;
  border-bottom: 1px solid v.$agendazap-slate-200;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 64px;
}

.link-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: v.$agendazap-green-50;
  border: 1px solid v.$agendazap-green-200;
  border-radius: 99px;
  padding: 4px 4px 4px 12px;

  mat-icon {
    color: v.$agendazap-green-700;
    font-size: 16px; width: 16px; height: 16px;
  }
}

.link-text {
  font-size: 13px;
  font-weight: 500;
  color: v.$agendazap-slate-700;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .dash-header { padding: 8px 12px; height: 56px; }
  .link-text { max-width: 140px; font-size: 12px; }
}
```

### 5.6 Layout do dashboard (componente shell)

> ⚠️ **Substitui o placeholder do Módulo 1 inteiro.** Apague `dashboard.component.ts` antigo se existir.

Crie `src/app/features/dashboard/dashboard.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '@core/services/breakpoint.service';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './shell/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent, BottomNavComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private bp = inject(BreakpointService);
  readonly isMobile = this.bp.isMobile;
}
```

Crie `src/app/features/dashboard/dashboard.component.html`:

```html
<div class="dash-shell" [class.mobile]="isMobile()">
  @if (!isMobile()) {
    <app-sidenav />
  }

  <div class="dash-main">
    <app-dashboard-header />
    <main class="dash-content">
      <router-outlet />
    </main>
  </div>

  @if (isMobile()) {
    <app-bottom-nav />
  }
</div>
```

Crie `src/app/features/dashboard/dashboard.component.scss`:

```scss
@use 'styles/variables' as v;

.dash-shell {
  display: flex;
  min-height: 100vh;
  background: v.$agendazap-slate-50;

  &.mobile { padding-bottom: 60px; }
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

  @media (max-width: 600px) { padding: 12px; }
}
```

### 5.7 Rotas do dashboard

Substitua `src/app/features/dashboard/dashboard.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./pages/agenda/agenda.component').then(m => m.AgendaComponent),
        title: 'Agenda — AgendaZap',
      },
      {
        path: 'servicos',
        loadComponent: () =>
          import('./pages/servicos/servicos.component').then(m => m.ServicosComponent),
        title: 'Serviços — AgendaZap',
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./pages/horarios/horarios.component').then(m => m.HorariosComponent),
        title: 'Horários — AgendaZap',
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Clientes' },
      },
      {
        path: 'relatorio',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Relatório' },
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/em-breve/em-breve.component').then(m => m.EmBreveComponent),
        data: { titulo: 'Configurações' },
      },
    ],
  },
];
```

### 5.8 Página "em breve" (placeholder reutilizável)

Crie `src/app/features/dashboard/pages/em-breve/em-breve.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-em-breve',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="em-breve">
      <mat-icon>construction</mat-icon>
      <h2>{{ titulo }}</h2>
      <p>Esta seção será implementada em breve.</p>
    </div>
  `,
  styles: [`
    .em-breve {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px 16px; gap: 12px;
      color: var(--mat-sys-on-surface-variant, #64748B);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }
      h2 { margin: 0; }
    }
  `],
})
export class EmBreveComponent {
  private route = inject(ActivatedRoute);
  titulo = (this.route.snapshot.data['titulo'] as string) ?? 'Em breve';
}
```

---

## TAREFA 6 — Página Serviços (CRUD)

### 6.1 Dialog de criar/editar serviço

Crie `src/app/features/dashboard/pages/servicos/servico-dialog/servico-dialog.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Servico, ServicoInput } from '@core/types/database.types';
import { DURACOES_SERVICO } from '@core/constants/app.constants';

export interface ServicoDialogData {
  servico?: Servico;
}

@Component({
  selector: 'app-servico-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './servico-dialog.component.html',
  styleUrl: './servico-dialog.component.scss',
})
export class ServicoDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<ServicoDialogComponent>);
  data = inject<ServicoDialogData>(MAT_DIALOG_DATA);

  readonly duracoes = DURACOES_SERVICO;
  readonly isEdicao = !!this.data.servico;

  form = this.fb.group({
    nome:        [this.data.servico?.nome ?? '', [Validators.required, Validators.minLength(2)]],
    duracao_min: [this.data.servico?.duracao_min ?? 60, [Validators.required, Validators.min(15)]],
    preco:       [this.data.servico?.preco ?? 0, [Validators.required, Validators.min(0)]],
    ativo:       [this.data.servico?.ativo ?? true],
  });

  fechar(): void { this.ref.close(); }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const input: ServicoInput = {
      nome: v.nome!.trim(),
      duracao_min: v.duracao_min!,
      preco: Number(v.preco) || 0,
      ativo: v.ativo!,
    };
    this.ref.close(input);
  }
}
```

Crie `src/app/features/dashboard/pages/servicos/servico-dialog/servico-dialog.component.html`:

```html
<h2 mat-dialog-title>{{ isEdicao ? 'Editar serviço' : 'Novo serviço' }}</h2>

<mat-dialog-content>
  <form [formGroup]="form" class="servico-form">

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Nome do serviço</mat-label>
      <input matInput formControlName="nome" placeholder="Ex: Corte feminino">
      @if (form.get('nome')?.hasError('minlength')) {
        <mat-error>Mínimo 2 caracteres</mat-error>
      }
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Duração</mat-label>
      <mat-select formControlName="duracao_min">
        @for (d of duracoes; track d) {
          <mat-option [value]="d">{{ d }} minutos</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Preço (R$)</mat-label>
      <input matInput formControlName="preco" type="number" min="0" step="0.01">
      @if (form.get('preco')?.hasError('min')) {
        <mat-error>Preço não pode ser negativo</mat-error>
      }
    </mat-form-field>

  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="fechar()">Cancelar</button>
  <button mat-raised-button color="primary" (click)="salvar()" [disabled]="form.invalid">
    {{ isEdicao ? 'Salvar' : 'Criar' }}
  </button>
</mat-dialog-actions>
```

Crie `src/app/features/dashboard/pages/servicos/servico-dialog/servico-dialog.component.scss`:

```scss
.servico-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 320px;
  padding-top: 8px;
}
.full-width { width: 100%; }
```

### 6.2 Página de Serviços

Crie `src/app/features/dashboard/pages/servicos/servicos.component.ts`:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServicosStore } from '../../state/servicos.store';
import { Servico } from '@core/types/database.types';
import { ServicoDialogComponent, ServicoDialogData } from './servico-dialog/servico-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatProgressSpinnerModule,
  ],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss',
})
export class ServicosComponent implements OnInit {
  protected store = inject(ServicosStore);
  private dialog  = inject(MatDialog);
  private snack   = inject(MatSnackBar);

  ngOnInit(): void { this.store.carregar(); }

  formatarPreco(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarDuracao(min: number): string {
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}h` : `${h}h${m}`;
  }

  async abrirDialogNovo(): Promise<void> {
    if (this.store.atingiuLimite()) {
      this.snack.open(
        `Plano ${this.store.limite()} serviços atingido. Faça upgrade para Pro.`,
        'OK',
        { duration: 4000 }
      );
      return;
    }
    const ref = this.dialog.open<ServicoDialogComponent, ServicoDialogData>(
      ServicoDialogComponent, { data: {} }
    );
    const input = await firstValueFrom(ref.afterClosed());
    if (!input) return;
    try {
      await this.store.criar(input);
      this.snack.open('Serviço criado', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao criar', 'OK', { duration: 3000 });
    }
  }

  async abrirDialogEdicao(servico: Servico): Promise<void> {
    const ref = this.dialog.open<ServicoDialogComponent, ServicoDialogData>(
      ServicoDialogComponent, { data: { servico } }
    );
    const input = await firstValueFrom(ref.afterClosed());
    if (!input) return;
    try {
      await this.store.atualizar(servico.id, input);
      this.snack.open('Serviço atualizado', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao atualizar', 'OK', { duration: 3000 });
    }
  }

  async toggle(servico: Servico): Promise<void> {
    try {
      await this.store.toggleAtivo(servico.id, !servico.ativo);
    } catch {
      this.snack.open('Erro ao alterar status', 'OK', { duration: 2000 });
    }
  }

  async excluir(servico: Servico): Promise<void> {
    if (!confirm(`Excluir o serviço "${servico.nome}"?`)) return;
    try {
      await this.store.excluir(servico.id);
      this.snack.open('Serviço excluído', 'OK', { duration: 2000 });
    } catch {
      this.snack.open('Erro ao excluir', 'OK', { duration: 2000 });
    }
  }
}
```

Crie `src/app/features/dashboard/pages/servicos/servicos.component.html`:

```html
<div class="page-header">
  <div>
    <h1>Serviços</h1>
    <p class="page-sub">
      {{ store.total() }} de
      {{ store.limite() === -1 ? 'ilimitados' : store.limite() }}
      no plano atual
    </p>
  </div>
  <button mat-raised-button color="primary" (click)="abrirDialogNovo()"
          [disabled]="store.atingiuLimite()">
    <mat-icon>add</mat-icon> Novo serviço
  </button>
</div>

@if (store.carregando()) {
  <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
} @else if (store.servicos().length === 0) {
  <div class="empty-state">
    <mat-icon>cut</mat-icon>
    <h3>Nenhum serviço cadastrado</h3>
    <p>Adicione seus serviços para começar a receber agendamentos</p>
    <button mat-raised-button color="primary" (click)="abrirDialogNovo()">
      <mat-icon>add</mat-icon> Adicionar primeiro serviço
    </button>
  </div>
} @else {
  <div class="servicos-grid">
    @for (s of store.servicos(); track s.id) {
      <mat-card class="servico-card" [class.inativo]="!s.ativo">
        <div class="card-top">
          <h3>{{ s.nome }}</h3>
          <mat-slide-toggle color="primary" [checked]="s.ativo" (change)="toggle(s)" />
        </div>

        <div class="card-meta">
          <span class="meta-item">
            <mat-icon>schedule</mat-icon> {{ formatarDuracao(s.duracao_min) }}
          </span>
          <span class="meta-item preco">{{ formatarPreco(s.preco) }}</span>
        </div>

        <div class="card-actions">
          <button mat-button (click)="abrirDialogEdicao(s)">
            <mat-icon>edit</mat-icon> Editar
          </button>
          <button mat-button color="warn" (click)="excluir(s)">
            <mat-icon>delete_outline</mat-icon> Excluir
          </button>
        </div>
      </mat-card>
    }
  </div>
}
```

Crie `src/app/features/dashboard/pages/servicos/servicos.component.scss`:

```scss
@use 'styles/variables' as v;

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;

  h1 { font-size: 24px; font-weight: 700; margin: 0; color: v.$agendazap-slate-900; }
  .page-sub { font-size: 13px; color: v.$agendazap-slate-500; margin: 4px 0 0; }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  gap: 12px;
  color: v.$agendazap-slate-500;
  text-align: center;

  mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }
  h3 { margin: 0; color: v.$agendazap-slate-700; }
  p  { margin: 0; max-width: 320px; }
}

.servicos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.servico-card {
  padding: 16px !important;
  display: flex !important;
  flex-direction: column;
  gap: 12px;
  transition: opacity .2s;

  &.inativo { opacity: .55; }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  h3 { margin: 0; font-size: 16px; font-weight: 600; color: v.$agendazap-slate-900; }
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: v.$agendazap-slate-600;
    mat-icon { font-size: 16px; width: 16px; height: 16px; }
  }
  .preco { font-weight: 700; color: v.$agendazap-green-700; font-size: 15px; }
}

.card-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  border-top: 1px solid v.$agendazap-slate-100;
  padding-top: 8px;
  margin-top: auto;
}
```

---

## TAREFA 7 — Página Horários

Crie `src/app/features/dashboard/pages/horarios/horarios.component.ts`:

```typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HorariosStore } from '../../state/horarios.store';
import { DiaSemana, DisponibilidadeInput } from '@core/types/database.types';
import { DIAS_SEMANA } from '@core/constants/app.constants';

interface DiaConfig {
  dia: DiaSemana;
  label: string;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatSlideToggleModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent implements OnInit {
  protected store = inject(HorariosStore);
  private snack   = inject(MatSnackBar);

  readonly intervalos = [15, 30, 45, 60];
  readonly config = signal<DiaConfig[]>(this.configPadrao());

  readonly diasAtivosCount = computed(() => this.config().filter(c => c.ativo).length);
  readonly horasSemanais = computed(() =>
    this.config()
      .filter(c => c.ativo)
      .reduce((acc, c) => acc + this.minutosEntre(c.hora_inicio, c.hora_fim) / 60, 0)
  );
  readonly slotsSemanais = computed(() =>
    this.config()
      .filter(c => c.ativo)
      .reduce((acc, c) => acc + Math.floor(this.minutosEntre(c.hora_inicio, c.hora_fim) / c.intervalo_min), 0)
  );

  ngOnInit(): void {
    this.store.carregar().then(() => {
      const existentes = this.store.disponibilidades();
      if (existentes.length === 0) return;

      const map = new Map(existentes.map(d => [d.dia_semana, d]));
      this.config.set(this.config().map(c => {
        const d = map.get(c.dia);
        return d ? {
          ...c, ativo: true,
          hora_inicio: d.hora_inicio.slice(0, 5),
          hora_fim:    d.hora_fim.slice(0, 5),
          intervalo_min: d.intervalo_min,
        } : { ...c, ativo: false };
      }));
    });
  }

  private configPadrao(): DiaConfig[] {
    return DIAS_SEMANA.map(d => ({
      dia: d.dia as DiaSemana,
      label: d.label,
      ativo: d.dia >= 1 && d.dia <= 5,    // seg–sex por padrão
      hora_inicio: '09:00',
      hora_fim: '18:00',
      intervalo_min: 60,
    }));
  }

  private minutosEntre(inicio: string, fim: string): number {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    const diff = (hf * 60 + mf) - (hi * 60 + mi);
    return Math.max(0, diff);
  }

  toggleDia(dia: DiaSemana, ativo: boolean): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, ativo } : c));
  }

  atualizar<K extends keyof DiaConfig>(dia: DiaSemana, campo: K, valor: DiaConfig[K]): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, [campo]: valor } : c));
  }

  async salvar(): Promise<void> {
    const inputs: DisponibilidadeInput[] = this.config()
      .filter(c => c.ativo)
      .map(c => ({
        dia_semana: c.dia,
        hora_inicio: c.hora_inicio,
        hora_fim: c.hora_fim,
        intervalo_min: c.intervalo_min,
      }));

    // Validação: hora_fim > hora_inicio
    const invalido = this.config().find(c => c.ativo && this.minutosEntre(c.hora_inicio, c.hora_fim) <= 0);
    if (invalido) {
      this.snack.open(`${invalido.label}: hora final deve ser maior que inicial`, 'OK', { duration: 3000 });
      return;
    }

    try {
      await this.store.salvar(inputs);
      this.snack.open('Horários salvos', 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao salvar', 'OK', { duration: 3000 });
    }
  }
}
```

Crie `src/app/features/dashboard/pages/horarios/horarios.component.html`:

```html
<div class="page-header">
  <div>
    <h1>Horários de atendimento</h1>
    <p class="page-sub">Configure quando você está disponível para receber clientes</p>
  </div>
</div>

@if (store.carregando()) {
  <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
} @else {
  <mat-card class="preview-card">
    <div class="preview-item">
      <span class="pv-label">Dias ativos</span>
      <span class="pv-value">{{ diasAtivosCount() }}</span>
    </div>
    <div class="preview-item">
      <span class="pv-label">Horas/semana</span>
      <span class="pv-value">{{ horasSemanais() | number:'1.0-1' }}h</span>
    </div>
    <div class="preview-item">
      <span class="pv-label">Slots/semana</span>
      <span class="pv-value">{{ slotsSemanais() }}</span>
    </div>
  </mat-card>

  <div class="dias-list">
    @for (c of config(); track c.dia) {
      <mat-card class="dia-card" [class.inativo]="!c.ativo">
        <div class="dia-row">
          <div class="dia-toggle">
            <mat-slide-toggle color="primary" [checked]="c.ativo"
                              (change)="toggleDia(c.dia, $event.checked)" />
            <span class="dia-label">{{ c.label }}</span>
          </div>

          @if (c.ativo) {
            <div class="dia-campos">
              <mat-form-field appearance="outline">
                <mat-label>Início</mat-label>
                <input matInput type="time" [value]="c.hora_inicio"
                       (change)="atualizar(c.dia, 'hora_inicio', $any($event.target).value)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fim</mat-label>
                <input matInput type="time" [value]="c.hora_fim"
                       (change)="atualizar(c.dia, 'hora_fim', $any($event.target).value)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Intervalo</mat-label>
                <mat-select [value]="c.intervalo_min"
                            (selectionChange)="atualizar(c.dia, 'intervalo_min', $event.value)">
                  @for (i of intervalos; track i) {
                    <mat-option [value]="i">{{ i }} min</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          }
        </div>
      </mat-card>
    }
  </div>

  <div class="actions">
    <button mat-raised-button color="primary"
            (click)="salvar()" [disabled]="store.salvando()">
      @if (store.salvando()) {
        <mat-spinner diameter="20"></mat-spinner> Salvando...
      } @else {
        <mat-icon>save</mat-icon> Salvar horários
      }
    </button>
  </div>
}
```

Crie `src/app/features/dashboard/pages/horarios/horarios.component.scss`:

```scss
@use 'styles/variables' as v;

.page-header {
  margin-bottom: 24px;
  h1 { font-size: 24px; font-weight: 700; margin: 0; color: v.$agendazap-slate-900; }
  .page-sub { font-size: 13px; color: v.$agendazap-slate-500; margin: 4px 0 0; }
}

.preview-card {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px !important;
  margin-bottom: 24px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .pv-label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: v.$agendazap-slate-500; }
  .pv-value { font-size: 22px; font-weight: 700; color: v.$agendazap-green-700; margin-top: 4px; }
}

.dias-list { display: flex; flex-direction: column; gap: 8px; }

.dia-card {
  padding: 16px !important;
  transition: opacity .2s;
  &.inativo { opacity: .6; }
}

.dia-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.dia-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;

  .dia-label { font-weight: 600; color: v.$agendazap-slate-800; }
}

.dia-campos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-width: 280px;

  mat-form-field { width: 100%; }
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.loading-state {
  display: flex; justify-content: center; padding: 64px;
}
```

---

## TAREFA 8 — Página Agenda (FullCalendar)

### 8.1 Bottom sheet de detalhes do agendamento

Crie `src/app/features/dashboard/pages/agenda/agendamento-sheet/agendamento-sheet.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

export interface SheetData {
  agendamento: AgendamentoComServico;
}
export type SheetResult = { acao: 'confirmar' | 'cancelar' } | undefined;

@Component({
  selector: 'app-agendamento-sheet',
  standalone: true,
  imports: [CommonModule, DatePipe, MatBottomSheetModule, MatButtonModule, MatIconModule],
  templateUrl: './agendamento-sheet.component.html',
  styleUrl: './agendamento-sheet.component.scss',
})
export class AgendamentoSheetComponent {
  data = inject<SheetData>(MAT_BOTTOM_SHEET_DATA);
  private ref = inject(MatBottomSheetRef<AgendamentoSheetComponent, SheetResult>);

  get a(): AgendamentoComServico { return this.data.agendamento; }
  get podeConfirmar(): boolean { return this.a.status === 'pendente'; }
  get podeCancelar(): boolean { return this.a.status !== 'cancelado' && this.a.status !== 'concluido'; }

  acao(a: 'confirmar' | 'cancelar'): void { this.ref.dismiss({ acao: a }); }
  fechar(): void { this.ref.dismiss(); }

  abrirWhatsApp(): void {
    const num = this.a.cliente_wpp.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${this.a.cliente_nome}!`);
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank');
  }

  rotulo(s: StatusAgend): string {
    return ({ pendente: 'Pendente', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s]);
  }
}
```

Crie `src/app/features/dashboard/pages/agenda/agendamento-sheet/agendamento-sheet.component.html`:

```html
<div class="sheet">
  <div class="sheet-header" [attr.data-status]="a.status">
    <span class="status-tag">{{ rotulo(a.status) }}</span>
    <button mat-icon-button (click)="fechar()" aria-label="Fechar">
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <h2>{{ a.cliente_nome }}</h2>
  <p class="data-hora">
    <mat-icon>event</mat-icon>
    {{ a.data_hora | date:"EEEE, d 'de' MMMM 'às' HH:mm":'':'pt-BR' }}
  </p>

  @if (a.servico) {
    <div class="info-row">
      <mat-icon>cut</mat-icon>
      <span>{{ a.servico.nome }} · {{ a.servico.duracao_min }}min · R$ {{ a.servico.preco }}</span>
    </div>
  }

  <div class="info-row">
    <mat-icon>phone</mat-icon>
    <span>{{ a.cliente_wpp }}</span>
    <button mat-button color="primary" (click)="abrirWhatsApp()">
      <mat-icon>chat</mat-icon> Abrir WhatsApp
    </button>
  </div>

  @if (a.observacoes) {
    <div class="info-row">
      <mat-icon>notes</mat-icon>
      <span>{{ a.observacoes }}</span>
    </div>
  }

  <div class="sheet-actions">
    @if (podeConfirmar) {
      <button mat-raised-button color="primary" (click)="acao('confirmar')">
        <mat-icon>check_circle</mat-icon> Confirmar
      </button>
    }
    @if (podeCancelar) {
      <button mat-stroked-button color="warn" (click)="acao('cancelar')">
        <mat-icon>cancel</mat-icon> Cancelar
      </button>
    }
  </div>
</div>
```

Crie `src/app/features/dashboard/pages/agenda/agendamento-sheet/agendamento-sheet.component.scss`:

```scss
@use 'styles/variables' as v;

.sheet { padding: 16px 8px; max-width: 520px; margin: 0 auto; }

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .status-tag {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 4px 10px;
    border-radius: 99px;
  }

  &[data-status="confirmado"] .status-tag { background: #DCFCE7; color: #14532D; }
  &[data-status="pendente"]   .status-tag { background: #FEF3C7; color: #92400E; }
  &[data-status="cancelado"]  .status-tag { background: #FFE4E6; color: #9F1239; }
  &[data-status="concluido"]  .status-tag { background: #F1F5F9; color: #334155; }
}

h2 { font-size: 18px; margin: 0 0 4px; color: v.$agendazap-slate-900; }

.data-hora {
  display: flex; align-items: center; gap: 6px;
  color: v.$agendazap-slate-600; font-size: 14px; margin: 0 0 16px;
  text-transform: capitalize;
  mat-icon { font-size: 18px; width: 18px; height: 18px; }
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid v.$agendazap-slate-100;
  font-size: 14px;
  color: v.$agendazap-slate-700;

  mat-icon { font-size: 18px; width: 18px; height: 18px; color: v.$agendazap-slate-500; flex-shrink: 0; }
  span { flex: 1; }
}

.sheet-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid v.$agendazap-slate-100;

  button { flex: 1; }
}
```

### 8.2 Página de Agenda

Crie `src/app/features/dashboard/pages/agenda/agenda.component.ts`:

```typescript
import { Component, OnInit, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgendamentosStore } from '../../state/agendamentos.store';
import { AgendamentoComServico } from '@core/types/database.types';
import { STATUS_CORES } from '@core/constants/app.constants';
import { BreakpointService } from '@core/services/breakpoint.service';
import { AgendamentoSheetComponent, SheetData, SheetResult } from './agendamento-sheet/agendamento-sheet.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatProgressSpinnerModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  @ViewChild('calendar') calendarRef?: FullCalendarComponent;

  protected store = inject(AgendamentosStore);
  private bp     = inject(BreakpointService);
  private sheet  = inject(MatBottomSheet);
  private snack  = inject(MatSnackBar);

  readonly events = computed<EventInput[]>(() =>
    this.store.agendamentos().map(a => this.toEvent(a))
  );

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin],
    initialView: this.bp.isMobile() ? 'listWeek' : 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: this.bp.isMobile() ? 'listWeek,timeGridDay' : 'timeGridDay,timeGridWeek,listWeek',
    },
    locale: ptBrLocale,
    firstDay: 1, // Segunda
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    allDaySlot: false,
    nowIndicator: true,
    height: 'auto',
    expandRows: true,
    editable: false,                  // sem drag-and-drop no MVP
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    events: this.events(),
    eventClick: (arg) => this.aoClicarEvento(arg),
    datesSet: (info) => this.aoTrocarPeriodo(info.start, info.end),
  }));

  ngOnInit(): void {
    // datesSet dispara automaticamente no primeiro render
  }

  private toEvent(a: AgendamentoComServico): EventInput {
    const inicio = new Date(a.data_hora);
    const dur = a.servico?.duracao_min ?? 60;
    const fim = new Date(inicio.getTime() + dur * 60_000);
    return {
      id: a.id,
      title: a.cliente_nome,
      start: inicio,
      end: fim,
      backgroundColor: STATUS_CORES[a.status],
      borderColor:     STATUS_CORES[a.status],
      extendedProps:   { agendamento: a },
    };
  }

  private async aoTrocarPeriodo(inicio: Date, fim: Date): Promise<void> {
    await this.store.carregarPeriodo(inicio, fim);
  }

  private async aoClicarEvento(arg: EventClickArg): Promise<void> {
    const agendamento = arg.event.extendedProps['agendamento'] as AgendamentoComServico;
    const ref = this.sheet.open<AgendamentoSheetComponent, SheetData, SheetResult>(
      AgendamentoSheetComponent, { data: { agendamento } }
    );
    const r = await firstValueFrom(ref.afterDismissed());
    if (!r) return;
    try {
      const novoStatus = r.acao === 'confirmar' ? 'confirmado' : 'cancelado';
      await this.store.atualizarStatus(agendamento.id, novoStatus);
      this.snack.open(`Agendamento ${novoStatus}`, 'OK', { duration: 2000 });
    } catch (e: any) {
      this.snack.open(e.message ?? 'Erro ao atualizar', 'OK', { duration: 3000 });
    }
  }
}
```

Crie `src/app/features/dashboard/pages/agenda/agenda.component.html`:

```html
<div class="agenda-page">
  <div class="page-header">
    <h1>Agenda</h1>
    @if (store.carregando()) {
      <mat-spinner diameter="20"></mat-spinner>
    }
  </div>

  <full-calendar #calendar [options]="calendarOptions()" class="calendar" />
</div>
```

Crie `src/app/features/dashboard/pages/agenda/agenda.component.scss`:

```scss
@use 'styles/variables' as v;

.agenda-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;

  h1 { font-size: 24px; font-weight: 700; margin: 0; color: v.$agendazap-slate-900; }
}

.calendar {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);

  // ── Customizações do FullCalendar ─────────────────────────
  ::ng-deep {
    .fc-toolbar-title { font-size: 16px !important; font-weight: 600; }
    .fc-button-primary {
      background: v.$agendazap-slate-100 !important;
      border-color: v.$agendazap-slate-200 !important;
      color: v.$agendazap-slate-700 !important;
      text-transform: capitalize;
      font-weight: 500 !important;

      &:hover { background: v.$agendazap-slate-200 !important; }
      &.fc-button-active {
        background: v.$agendazap-green-500 !important;
        border-color: v.$agendazap-green-500 !important;
        color: #fff !important;
      }
    }
    .fc-event { cursor: pointer; border-radius: 4px; padding: 2px 4px; }
    .fc-timegrid-now-indicator-line { border-color: v.$agendazap-green-500 !important; }
    .fc-col-header-cell-cushion { font-weight: 600; color: v.$agendazap-slate-700; text-decoration: none; }
  }

  @media (max-width: 600px) {
    padding: 8px;
    ::ng-deep .fc-toolbar { flex-direction: column; gap: 8px; }
  }
}
```

---

## TAREFA 9 — Verificação final

### 9.1 Rodar o projeto

```bash
npm start
```

### 9.2 Cadastrar dados de teste

Pra testar a agenda, abra o **SQL Editor** do Supabase e rode este script (depois de fazer login no app pelo menos uma vez):

```sql
-- Pegue o seu profissional_id antes (substitua abaixo)
-- select id from public.profissionais where user_id = auth.uid();

-- Insira agendamentos de exemplo (substitua o UUID abaixo pelo seu profissional_id)
insert into public.agendamentos (profissional_id, servico_id, cliente_nome, cliente_wpp, data_hora, status)
select
  p.id,
  (select id from public.servicos where profissional_id = p.id limit 1),
  cliente,
  '44999998888',
  data_hora,
  status::text
from public.profissionais p
cross join (values
  ('Maria Silva',    now() + interval '1 day' + interval '10 hours',  'confirmado'),
  ('João Santos',    now() + interval '1 day' + interval '14 hours',  'pendente'),
  ('Ana Pereira',    now() + interval '2 days' + interval '9 hours',  'confirmado'),
  ('Carla Costa',    now() + interval '3 days' + interval '15 hours', 'confirmado'),
  ('Pedro Oliveira', now() - interval '1 day' + interval '11 hours',  'cancelado')
) as t(cliente, data_hora, status)
where p.user_id = auth.uid();
```

### 9.3 Checklist de conclusão do Módulo 2

**Shell e responsividade**

- [ ] Sidenav verde-escuro fixa em desktop (≥960px) com avatar e nome
- [ ] Bottom navigation aparece em mobile (<960px) e some no desktop
- [ ] Header com chip do link público e botão "Copiar"
- [ ] Botão "Copiar" copia o link e mostra "Copiado" por 2s
- [ ] Logout funciona pela sidenav e volta pra `/auth/login`
- [ ] Itens do menu desabilitados (Clientes, Relatório, Configurações) levam à página "em breve"

**Serviços**

- [ ] `/dashboard/servicos` lista todos os serviços do profissional
- [ ] Botão "Novo serviço" abre dialog com nome, duração (select) e preço
- [ ] Dialog valida: nome ≥ 2 caracteres, duração ≥ 15min, preço ≥ 0
- [ ] Edição preenche os campos com valores atuais
- [ ] Toggle ativo/inativo funciona (visual fica esmaecido quando inativo)
- [ ] Excluir mostra confirmação e remove
- [ ] Plano grátis: 4ª tentativa de criar serviço mostra erro de limite
- [ ] Estado vazio aparece quando não há serviços

**Horários**

- [ ] `/dashboard/horarios` mostra os 7 dias (Seg → Dom)
- [ ] Toggle por dia ativa/desativa atendimento
- [ ] Cada dia ativo mostra início, fim e intervalo
- [ ] Preview no topo: "X dias ativos · Y horas/semana · Z slots/semana"
- [ ] Salvar persiste no Supabase (substitui todas as disponibilidades)
- [ ] Validação: hora fim > hora início bloqueia salvar
- [ ] Após salvar e recarregar a página, valores se mantêm

**Agenda**

- [ ] `/dashboard/agenda` carrega com locale pt-BR
- [ ] Visualizações timeGridWeek (default desktop), timeGridDay e listWeek (default mobile)
- [ ] Eventos coloridos por status: verde, âmbar, vermelho
- [ ] Click no evento abre bottom sheet
- [ ] Bottom sheet mostra: nome, data formatada em português, serviço, telefone, observações
- [ ] Botão "Abrir WhatsApp" abre wa.me em nova aba
- [ ] "Confirmar" só aparece em pendente; "Cancelar" some em cancelado/concluído
- [ ] Após ação, evento muda de cor sem reload
- [ ] Trocar de mês/semana dispara nova carga (verificar Network tab)
- [ ] Sem erros no console

### 9.4 Commit

```bash
git add .
git commit -m "feat: módulo 2 — dashboard, agenda, serviços e horários"
git push origin main
```

---

## Próximo módulo

Após aprovação: **Módulo 3 — Página pública de agendamento** (rota `/p/:slug` com SSR, sem autenticação).

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: AgendaZap · agendazap.tec · Versão 1.0.0-mvp
