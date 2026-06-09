import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { ServicosStore } from '../../state/servicos.store';
import { Servico, MODALIDADE_LABELS } from '@core/types/database.types';
import { ServicoDialogComponent, ServicoDialogData } from './servico-dialog/servico-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { firstValueFrom } from 'rxjs';
import { PlanLimitDialogService } from '@core/services/plan-limit-dialog.service';
import { UpgradeNavigationService } from '@core/services/upgrade-navigation.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatButtonToggleModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonComponent,
  ],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss',
})
export class ServicosComponent implements OnInit {
  protected store  = inject(ServicosStore);
  private dialog   = inject(MatDialog);
  private snack    = inject(MatSnackBar);
  private limitDialog = inject(PlanLimitDialogService);
  readonly upgradeNav = inject(UpgradeNavigationService);

  readonly MODALIDADE_LABELS = MODALIDADE_LABELS;
  readonly busca = signal('');

  private readonly VIEW_STORAGE_KEY = 'kianna:servicos:view';
  readonly viewMode = signal<'lista' | 'card'>(this.recuperarViewMode());

  setViewMode(modo: 'lista' | 'card'): void {
    this.viewMode.set(modo);
    try { localStorage.setItem(this.VIEW_STORAGE_KEY, modo); } catch { /* private mode */ }
  }

  private recuperarViewMode(): 'lista' | 'card' {
    try {
      const v = localStorage.getItem(this.VIEW_STORAGE_KEY);
      return v === 'card' ? 'card' : 'lista';
    } catch { return 'lista'; }
  }

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
      await this.limitDialog.abrir({ resource: 'services', limit: this.store.limite() });
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
    } catch (e: unknown) {
      if (await this.limitDialog.abrirPorErro(e)) return;
      this.snack.open(this.mensagemErro(e, 'Erro ao criar serviço'), 'OK',
        { duration: 4000, panelClass: 'snack-error' });
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
    } catch (e: unknown) {
      this.snack.open(this.mensagemErro(e, 'Erro ao atualizar serviço'), 'OK',
        { duration: 4000, panelClass: 'snack-error' });
    }
  }

  async toggle(servico: Servico): Promise<void> {
    const novoAtivo = !servico.ativo;
    try {
      await this.store.toggleAtivo(servico.id, novoAtivo);
      this.snack.open(
        novoAtivo ? `"${servico.nome}" ativado` : `"${servico.nome}" desativado`,
        'OK', { duration: 2000 }
      );
    } catch (e: unknown) {
      this.snack.open(this.mensagemErro(e, 'Erro ao alterar status'), 'OK',
        { duration: 3000, panelClass: 'snack-error' });
    }
  }

  async excluir(servico: Servico): Promise<void> {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir serviço',
        mensagem: `Tem certeza que deseja excluir "${servico.nome}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        tipo: 'warn',
      },
    });
    const confirmado = await firstValueFrom(ref.afterClosed());
    if (!confirmado) return;
    try {
      await this.store.excluir(servico.id);
      this.snack.open('Serviço excluído', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      const { mensagem, vinculado } = this.mapearErroExclusao(e);
      this.snack.open(
        mensagem,
        vinculado ? 'Entendi' : 'OK',
        { duration: vinculado ? 7000 : 4000, panelClass: vinculado ? 'snack-warn' : 'snack-error' },
      );
      console.error('[Serviços] erro ao excluir:', e);
    }
  }

  private mensagemErro(e: unknown, fallback: string): string {
    if (e instanceof HttpErrorResponse) {
      return (e.error?.message as string) || (e.error?.error as string) || fallback;
    }
    return e instanceof Error && e.message ? e.message : fallback;
  }

  private mapearErroExclusao(e: unknown): { mensagem: string; vinculado: boolean } {
    const err = e as any;
    const code = err?.code ?? err?.error?.code;
    const msgApi = err instanceof HttpErrorResponse
      ? (err.error?.message as string) || (err.error?.error as string)
      : err?.message as string | undefined;

    const ehVinculo =
      code === '23503' ||
      err?.status === 409 ||
      (typeof msgApi === 'string' &&
        (msgApi.toLowerCase().includes('foreign key') ||
         msgApi.toLowerCase().includes('agendamento')));

    if (ehVinculo) {
      return {
        mensagem: 'Não é possível excluir: serviço possui agendamentos vinculados. Cancele ou conclua os agendamentos antes de excluir.',
        vinculado: true,
      };
    }

    if (msgApi) return { mensagem: msgApi, vinculado: false };
    return { mensagem: 'Não foi possível excluir o serviço. Tente novamente.', vinculado: false };
  }
}
