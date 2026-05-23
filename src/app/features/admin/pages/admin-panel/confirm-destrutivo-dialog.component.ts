import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

export interface ConfirmDestrutivoData {
  titulo: string;
  mensagem: string;
  textoConfirmacao: string;
  labelConfirmacao: string;
  botaoAcao: string;
}

@Component({
  selector: 'app-confirm-destrutivo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="ios-sheet ios-sheet--narrow">
      <header class="sheet-header">
        <button type="button" class="sheet-btn" (click)="cancelar()">Cancelar</button>
        <h2 class="sheet-title">{{ data.titulo }}</h2>
        <button
          type="button"
          class="sheet-btn sheet-btn--destructive"
          [disabled]="!confere()"
          (click)="confirmar()"
        >
          {{ data.botaoAcao }}
        </button>
      </header>

      <div class="sheet-body">
        <p class="aviso">{{ data.mensagem }}</p>

        <h3 class="group-label">{{ data.labelConfirmacao }}</h3>
        <section class="group">
          <label class="row row--column">
            <input
              class="row-input row-input--mono"
              type="text"
              [(ngModel)]="digitado"
              [placeholder]="data.textoConfirmacao"
              spellcheck="false"
              autocomplete="off"
            />
          </label>
        </section>

        @if (digitado() && !confere()) {
          <p class="hint">
            Não confere. Digite exatamente: <strong>{{ data.textoConfirmacao }}</strong>
          </p>
        }
      </div>
    </div>
  `,
  styleUrl: './ios-sheet.scss',
  styles: [`
    .ios-sheet--narrow { max-width: 440px; min-width: min(440px, 92vw); }
    .aviso {
      font-size: 0.95rem;
      line-height: 1.4;
      color: #6e6e73;
      margin: 12px 16px 4px;
    }
  `],
})
export class ConfirmDestrutivoDialogComponent {
  readonly data = inject<ConfirmDestrutivoData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDestrutivoDialogComponent, boolean>);

  readonly digitado = signal('');
  readonly confere = computed(
    () => this.digitado().trim() === this.data.textoConfirmacao,
  );

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    if (this.confere()) this.dialogRef.close(true);
  }
}
