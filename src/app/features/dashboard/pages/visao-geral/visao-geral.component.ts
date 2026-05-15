import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { AgendamentoComServico, StatusAgend } from '@core/types/database.types';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  recusado: 'Recusado',
  cancelado: 'Cancelado',
  reagendado: 'Reagendado',
  finalizado: 'Finalizado',
  nao_compareceu: 'Não compareceu',
};

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent implements OnInit {
  private snack   = inject(MatSnackBar);
  private session = inject(SessionService);
  readonly agendamentosStore = inject(AgendamentosStore);

  readonly user       = currentUser;
  readonly carregando = signal(true);
  readonly copiado    = signal(false);

  readonly actionLoading = signal<Map<string, string>>(new Map());

  // ── Próximos agendamentos (futuros, não cancelados/recusados/finalizados) ──
  readonly proximosAgendamentos = computed<AgendamentoComServico[]>(() => {
    const agora = new Date();
    return this.agendamentosStore.agendamentos()
      .filter(a => {
        const dt = new Date(a.data_hora);
        return dt >= agora &&
          !['cancelado', 'recusado', 'finalizado', 'nao_compareceu'].includes(a.status);
      })
      .sort((a, b) => a.data_hora.localeCompare(b.data_hora));
  });

  // ── Confirmações pendentes (passados sem status final) ──
  readonly confirmacoesPendentes = computed<AgendamentoComServico[]>(() => {
    const agora = new Date();
    return this.agendamentosStore.agendamentos()
      .filter(a => {
        const dt = new Date(a.data_hora);
        return dt < agora && ['pendente', 'confirmado'].includes(a.status);
      })
      .sort((a, b) => b.data_hora.localeCompare(a.data_hora));
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
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 14);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);
    fim.setHours(23, 59, 59, 999);

    try {
      await this.agendamentosStore.carregarPeriodo(inicio, fim);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  async recarregar(): Promise<void> {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 14);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date();
    fim.setDate(fim.getDate() + 30);
    fim.setHours(23, 59, 59, 999);
    try {
      await this.agendamentosStore.carregarPeriodo(inicio, fim);
    } catch (e: unknown) {
      if (isAuthError(e)) { await this.session.invalidarSessao('expirou'); return; }
      this.snack.open('Erro ao atualizar', 'OK', { duration: 3000 });
    }
  }

  async confirmar(ag: AgendamentoComServico): Promise<void> {
    this._setLoading(ag.id, 'confirmar');
    try {
      await this.agendamentosStore.atualizarStatus(ag.id, 'confirmado');
      this.snack.open('Agendamento confirmado!', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('Erro ao confirmar', 'OK', { duration: 3000 });
    } finally {
      this._clearLoading(ag.id);
    }
  }

  async recusar(ag: AgendamentoComServico): Promise<void> {
    this._setLoading(ag.id, 'recusar');
    try {
      await this.agendamentosStore.atualizarStatus(ag.id, 'recusado');
      this.snack.open('Agendamento recusado.', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('Erro ao recusar', 'OK', { duration: 3000 });
    } finally {
      this._clearLoading(ag.id);
    }
  }

  async marcarRealizado(ag: AgendamentoComServico): Promise<void> {
    this._setLoading(ag.id, 'realizado');
    try {
      await this.agendamentosStore.atualizarStatus(ag.id, 'finalizado');
      this.snack.open('Marcado como realizado!', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('Erro ao atualizar', 'OK', { duration: 3000 });
    } finally {
      this._clearLoading(ag.id);
    }
  }

  async marcarFaltou(ag: AgendamentoComServico): Promise<void> {
    this._setLoading(ag.id, 'faltou');
    try {
      await this.agendamentosStore.atualizarStatus(ag.id, 'nao_compareceu');
      this.snack.open('Marcado: cliente não compareceu.', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('Erro ao atualizar', 'OK', { duration: 3000 });
    } finally {
      this._clearLoading(ag.id);
    }
  }

  async marcarCancelado(ag: AgendamentoComServico): Promise<void> {
    this._setLoading(ag.id, 'cancelado');
    try {
      await this.agendamentosStore.atualizarStatus(ag.id, 'cancelado');
      this.snack.open('Agendamento cancelado.', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('Erro ao cancelar', 'OK', { duration: 3000 });
    } finally {
      this._clearLoading(ag.id);
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

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  formatarData(dataHora: string): string {
    return new Date(dataHora).toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short',
    });
  }

  formatarHora(dataHora: string): string {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  isLoadingAction(id: string, action: string): boolean {
    return this.actionLoading().get(id) === action;
  }

  isAnyLoading(id: string): boolean {
    return this.actionLoading().has(id);
  }

  private _setLoading(id: string, action: string): void {
    this.actionLoading.update(m => { const n = new Map(m); n.set(id, action); return n; });
  }

  private _clearLoading(id: string): void {
    this.actionLoading.update(m => { const n = new Map(m); n.delete(id); return n; });
  }
}
