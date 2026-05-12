import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstatisticasRepository, EstatisticasDashboard } from '@core/repositories/estatisticas.repository';
import { isAuthError } from '@core/repositories/base.repository';
import { SessionService } from '@core/auth/session.service';
import { AgendamentosStore } from '../../state/agendamentos.store';
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
  private repo              = inject(EstatisticasRepository);
  private snack             = inject(MatSnackBar);
  private session           = inject(SessionService);
  readonly agendamentosStore = inject(AgendamentosStore);

  readonly user       = currentUser;
  readonly carregando = signal(true);
  readonly stats      = signal<EstatisticasDashboard | null>(null);
  readonly copiado    = signal(false);
  readonly processando = signal(new Set<string>());

  readonly pendentes = this.agendamentosStore.pendentes;

  readonly agendamentosHoje = computed(() => {
    const hoje = new Date().toDateString();
    return this.agendamentosStore.agendamentos().filter(a =>
      new Date(a.data_hora).toDateString() === hoje &&
      a.status !== 'cancelado'
    );
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
      const [data] = await Promise.all([
        this.repo.carregarDashboard(),
        this.agendamentosStore.carregarPeriodo(inicio, fim),
      ]);
      this.stats.set(data);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  async confirmar(id: string): Promise<void> {
    this.processando.update(s => { const n = new Set(s); n.add(id); return n; });
    try {
      await this.agendamentosStore.atualizarStatus(id, 'confirmado');
    } catch (e) {
      console.error('[VisaoGeral] erro ao confirmar:', e);
      this.snack.open('Erro ao confirmar agendamento', 'OK', { duration: 2000 });
    } finally {
      this.processando.update(s => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  async cancelar(id: string): Promise<void> {
    this.processando.update(s => { const n = new Set(s); n.add(id); return n; });
    try {
      await this.agendamentosStore.atualizarStatus(id, 'cancelado');
    } catch (e) {
      console.error('[VisaoGeral] erro ao cancelar:', e);
      this.snack.open('Erro ao cancelar agendamento', 'OK', { duration: 2000 });
    } finally {
      this.processando.update(s => { const n = new Set(s); n.delete(id); return n; });
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
