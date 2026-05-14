import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { AgendamentosStore } from '../../state/agendamentos.store';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';
import { MODALIDADE_LABELS } from '@core/types/database.types';
import { WeekStripComponent } from '../agenda/components/week-strip/week-strip.component';
import { ApptCardComponent, AgendamentoView } from '../agenda/components/appt-card/appt-card.component';

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    WeekStripComponent, ApptCardComponent,
  ],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent implements OnInit {
  private snack   = inject(MatSnackBar);
  private session = inject(SessionService);
  private router  = inject(Router);
  readonly agendamentosStore = inject(AgendamentosStore);

  readonly user        = currentUser;
  readonly carregando  = signal(true);
  readonly copiado     = signal(false);

  // ── Mini-agenda ───────────────────────────────────────
  readonly diaSelecionado = signal<Date>(new Date());

  readonly semana = computed(() => {
    const hoje       = new Date();
    const diasLetras = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() - hoje.getDay() + i);
      const k        = d.toDateString();
      const ocupacao = Math.min(this.ocupacaoPorDia().get(k) ?? 0, 3);
      return {
        data:        d,
        letra:       diasLetras[d.getDay()],
        numero:      d.getDate(),
        hoje:        d.toDateString() === hoje.toDateString(),
        selecionado: d.toDateString() === this.diaSelecionado().toDateString(),
        ocupacao,
      };
    });
  });

  readonly ocupacaoPorDia = computed(() => {
    const map = new Map<string, number>();
    this.agendamentosStore.agendamentos()
      .filter(a => a.status !== 'cancelado')
      .forEach(a => {
        const k = new Date(a.data_hora).toDateString();
        map.set(k, (map.get(k) ?? 0) + 1);
      });
    return map;
  });

  readonly agendamentosDoDia = computed<AgendamentoView[]>(() => {
    const diaSel = this.diaSelecionado().toDateString();
    return this.agendamentosStore.agendamentos()
      .filter(a => new Date(a.data_hora).toDateString() === diaSel)
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora))
      .map(a => {
        const svc   = a.servico;
        const inicio = new Date(a.data_hora);
        const fim    = svc ? new Date(inicio.getTime() + svc.duracao_min * 60000) : inicio;
        return {
          id:          a.id,
          inicio:      inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          fim:         fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status:      a.status,
          clienteNome: a.cliente_nome,
          servicoNome: svc?.nome ?? '—',
          duracao:     svc ? `${svc.duracao_min} min` : '',
          modalidade:  svc ? (MODALIDADE_LABELS[svc.modalidade]?.label ?? svc.modalidade) : '',
          data_hora:   a.data_hora,
        };
      });
  });

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
    const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio); fim.setDate(fim.getDate() + 30); fim.setHours(23, 59, 59, 999);

    try {
      await this.agendamentosStore.carregarPeriodo(inicio, fim);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  abrirEdicao(ag: AgendamentoView): void {
    this.router.navigate(['/dashboard/agenda', ag.id]);
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
