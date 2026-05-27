import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { Plano } from '@core/types/database.types';
import { PLANOS_CATALOGO } from '@core/data/planos.catalog';

export interface AlterarPlanoDialogData {
  id: string;
  nome: string;
  planoAtual: Plano;
}

export interface AlterarPlanoResult {
  plano: Plano;
}

@Component({
  selector: 'app-alterar-plano-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="ios-sheet">
      <header class="sheet-header">
        <button type="button" class="sheet-btn" (click)="cancelar()">Cancelar</button>
        <h2 class="sheet-title">Alterar plano</h2>
        <button
          type="button"
          class="sheet-btn sheet-btn--primary"
          [disabled]="!podeSalvar() || salvando()"
          (click)="salvar()"
        >
          {{ salvando() ? 'Salvando…' : 'Salvar' }}
        </button>
      </header>

      <div class="sheet-body">
        <p class="hint">
          Profissional: <strong>{{ data.nome }}</strong>
        </p>
        <p class="hint">
          Sem cobrança — o pagamento online ainda não está integrado. Esta ação
          serve para testes e gestão manual.
        </p>

        <h3 class="group-label">Planos disponíveis</h3>
        <section class="group">
          @for (p of planos; track p.id) {
            <label class="row row--column plano-opt" style="cursor: pointer;">
              <div style="display:flex; align-items:center; gap:12px; width:100%;">
                <input
                  type="radio"
                  name="plano"
                  [value]="p.id"
                  [checked]="selecionado() === p.id"
                  (change)="selecionar(p.id)"
                />
                <span class="row-label" style="min-width:0; flex:1; text-align:left;">
                  {{ p.nome }}
                  @if (p.id === data.planoAtual) {
                    <span class="tag-atual">atual</span>
                  }
                </span>
                <span class="row-hint" style="margin-top:0; text-align:right;">{{ p.precoLabel }}</span>
              </div>
              <span class="row-hint" style="text-align:left; width:100%;">{{ p.resumo }}</span>
            </label>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .tag-atual {
        display: inline-block;
        font-size: 0.7rem;
        padding: 2px 8px;
        margin-left: 8px;
        border-radius: 999px;
        background: #e5f1ff;
        color: #0066cc;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .plano-opt input[type='radio'] {
        accent-color: #007aff;
        width: 18px;
        height: 18px;
      }
    `,
  ],
  styleUrl: './ios-sheet.scss',
})
export class AlterarPlanoDialogComponent {
  readonly data = inject<AlterarPlanoDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<AlterarPlanoDialogComponent, AlterarPlanoResult | null>,
  );
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);

  readonly planos = PLANOS_CATALOGO;
  readonly salvando = signal(false);
  readonly selecionado = signal<Plano>(this.data.planoAtual);

  podeSalvar(): boolean {
    return this.selecionado() !== this.data.planoAtual;
  }

  selecionar(plano: Plano): void {
    this.selecionado.set(plano);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  async salvar(): Promise<void> {
    const plano = this.selecionado();
    if (plano === this.data.planoAtual) return;

    this.salvando.set(true);
    try {
      await this.api.put<{ ok: true; plano: Plano }>(
        `/api/admin/profissionais/${this.data.id}/plano`,
        { plano },
      );
      this.snack.open('Plano alterado', 'OK', { duration: 2000 });
      this.dialogRef.close({ plano });
    } catch (e: unknown) {
      const err = e as { error?: { message?: string }; message?: string };
      this.snack.open(
        err?.error?.message ?? err?.message ?? 'Erro ao alterar plano',
        'OK',
        { duration: 3000 },
      );
    } finally {
      this.salvando.set(false);
    }
  }
}
