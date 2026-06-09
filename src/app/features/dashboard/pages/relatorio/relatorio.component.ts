import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ContagemPorServico,
  ContagemPorStatus,
  RelatorioRepository,
  RelatorioResponse,
} from '@core/repositories/relatorio.repository';
import { hasRelatorio } from '@core/signals/app.signals';
import { UpgradeNavigationService } from '@core/services/upgrade-navigation.service';

interface StatusInfo {
  label: string;
  icone: string;
  cor: string;
  bg: string;
}

const STATUS_META: Record<string, StatusInfo> = {
  pendente:   { label: 'Pendentes',   icone: 'schedule',         cor: '#92400e', bg: '#fef3c7' },
  confirmado: { label: 'Confirmados', icone: 'event_available',  cor: '#166534', bg: '#dcfce7' },
  cancelado:  { label: 'Cancelados',  icone: 'event_busy',       cor: '#be123c', bg: '#ffe4e6' },
  concluido:  { label: 'Concluídos',  icone: 'check_circle',     cor: '#1e40af', bg: '#dbeafe' },
};

// Status conhecidos a exibir mesmo quando zerados (na ordem visual desejada)
const STATUS_ORDEM = ['pendente', 'confirmado', 'concluido', 'cancelado'];

const PIE_CORES = [
  '#1D9E75', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444',
  '#0EA5E9', '#22C55E', '#EC4899', '#14B8A6', '#F97316',
];

interface FatiaPie extends ContagemPorServico {
  cor: string;
  pct: number;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.scss',
})
export class RelatorioComponent implements OnInit {
  private repo   = inject(RelatorioRepository);
  readonly upgradeNav = inject(UpgradeNavigationService);

  readonly temAcesso = hasRelatorio;

  readonly hoje = new Date();
  readonly ano  = signal(this.hoje.getFullYear());
  readonly mes  = signal(this.hoje.getMonth() + 1);

  readonly carregando = signal(true);
  readonly erro       = signal<string | null>(null);
  readonly relatorio  = signal<RelatorioResponse | null>(null);

  readonly mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  readonly mesLabel = computed(
    () => `${this.mesesNomes[this.mes() - 1]} de ${this.ano()}`,
  );

  readonly podeAvancar = computed(() => {
    const ano = this.ano();
    const mes = this.mes();
    return ano < this.hoje.getFullYear()
      || (ano === this.hoje.getFullYear() && mes < this.hoje.getMonth() + 1);
  });

  readonly statusCards = computed<(ContagemPorStatus & StatusInfo)[]>(() => {
    const dados = this.relatorio()?.por_status ?? [];
    const map = new Map(dados.map(d => [d.status, d.total]));
    return STATUS_ORDEM.map(s => ({
      status: s,
      total: map.get(s) ?? 0,
      ...(STATUS_META[s] ?? { label: s, icone: 'help', cor: '#475569', bg: '#F1F5F9' }),
    }));
  });

  // Calcula fatias do pie (SVG, baseado em stroke-dasharray sobre um círculo)
  readonly fatias = computed<FatiaPie[]>(() => {
    const rel = this.relatorio();
    if (!rel) return [];
    const servicos = rel.por_servico ?? [];
    const total = servicos.reduce((s, x) => s + x.total, 0);
    if (total === 0) return [];

    const CIRC = 2 * Math.PI * 50; // r=50
    let acumulado = 0;
    return servicos.map((s, i) => {
      const pct = s.total / total;
      const len = CIRC * pct;
      const fatia: FatiaPie = {
        ...s,
        cor: PIE_CORES[i % PIE_CORES.length],
        pct: Math.round(pct * 1000) / 10, // 1 casa
        dashArray:  `${len} ${CIRC - len}`,
        dashOffset: -acumulado,
      };
      acumulado += len;
      return fatia;
    });
  });

  readonly temServicos = computed(() => this.fatias().length > 0);
  readonly totalAgendamentos = computed(() => this.relatorio()?.total ?? 0);

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const r = await this.repo.mensal(this.ano(), this.mes());
      this.relatorio.set(r);
    } catch (err) {
      console.error('[Relatorio] erro:', err);
      this.erro.set('Não foi possível carregar o relatório.');
    } finally {
      this.carregando.set(false);
    }
  }

  async mesAnterior(): Promise<void> {
    let m = this.mes() - 1;
    let a = this.ano();
    if (m < 1) { m = 12; a--; }
    this.mes.set(m);
    this.ano.set(a);
    await this.carregar();
  }

  async mesSeguinte(): Promise<void> {
    if (!this.podeAvancar()) return;
    let m = this.mes() + 1;
    let a = this.ano();
    if (m > 12) { m = 1; a++; }
    this.mes.set(m);
    this.ano.set(a);
    await this.carregar();
  }

  async voltarMesAtual(): Promise<void> {
    this.ano.set(this.hoje.getFullYear());
    this.mes.set(this.hoje.getMonth() + 1);
    await this.carregar();
  }

  trackByStatus(_: number, c: { status: string }): string { return c.status; }
  trackByServico(_: number, c: { servico_id: string | null; nome: string }): string {
    return c.servico_id ?? c.nome;
  }
}
