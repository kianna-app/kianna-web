import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServicosStore } from '../../state/servicos.store';
import { Servico, MODALIDADE_LABELS } from '@core/types/database.types';
import { ServicoDialogComponent, ServicoDialogData } from './servico-dialog/servico-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss',
})
export class ServicosComponent implements OnInit {
  protected store = inject(ServicosStore);
  private dialog  = inject(MatDialog);
  private snack   = inject(MatSnackBar);

  readonly MODALIDADE_LABELS = MODALIDADE_LABELS;

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
      const limite = this.store.limite();
      this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
        data: {
          titulo: 'Limite de serviços atingido',
          mensagem: `Seu plano gratuito permite cadastrar até ${limite} serviço${limite === 1 ? '' : 's'}. Faça upgrade para o plano Pro e cadastre serviços ilimitados.`,
          confirmLabel: 'Entendido',
          tipo: 'primary',
          ocultarCancelar: true,
        },
      });
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
      this.snack.open(e instanceof Error ? e.message : 'Erro ao criar', 'OK', { duration: 3000 });
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
      this.snack.open(e instanceof Error ? e.message : 'Erro ao atualizar', 'OK', { duration: 3000 });
    }
  }

  async toggle(servico: Servico): Promise<void> {
    const novoAtivo = !servico.ativo;
    try {
      await this.store.toggleAtivo(servico.id, novoAtivo);
      this.snack.open(
        novoAtivo ? `"${servico.nome}" ativado` : `"${servico.nome}" desativado`,
        'OK',
        { duration: 2000 }
      );
    } catch {
      this.snack.open('Erro ao alterar status', 'OK', { duration: 2000 });
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
    } catch {
      this.snack.open('Erro ao excluir', 'OK', { duration: 2000 });
    }
  }
}
