import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AvisosRepository, LeituraDetalhada } from '@core/repositories/avisos.repository';

export interface LeiturasDialogData {
  avisoId: string;
  titulo: string;
}

@Component({
  selector: 'app-leituras-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      Status de leitura
      <small class="aviso-titulo">{{ data.titulo }}</small>
    </h2>

    <mat-dialog-content class="leituras-content">
      @if (carregando()) {
        <div class="info"><mat-icon class="spin">progress_activity</mat-icon> Carregando…</div>
      } @else if (erro()) {
        <div class="info erro"><mat-icon>error_outline</mat-icon> {{ erro() }}</div>
      } @else {
        <div class="resumo">
          <span class="chip lido">
            <mat-icon>check_circle</mat-icon>
            {{ totalLidas() }} leram
          </span>
          <span class="chip nao-lido">
            <mat-icon>schedule</mat-icon>
            {{ totalNaoLidas() }} pendentes
          </span>
          <span class="chip total">de {{ leituras().length }}</span>
        </div>

        <ul class="lista">
          @for (l of leituras(); track l.profissional_id) {
            <li class="item" [class.lido]="!!l.lida_em">
              <mat-icon>{{ l.lida_em ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <div class="info-row">
                <strong>{{ l.nome }}</strong>
                @if (l.lida_em) {
                  <span class="data">Leu em {{ formatar(l.lida_em) }}</span>
                } @else {
                  <span class="data nao">Ainda não leu</span>
                }
              </div>
            </li>
          }
        </ul>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" class="btn-ghost" (click)="ref.close()">
        <mat-icon>close</mat-icon> Fechar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .aviso-titulo {
      display: block;
      font-size: 12px;
      font-weight: 400;
      color: #64748B;
      margin-top: 4px;
    }

    .leituras-content {
      min-width: min(92vw, 460px);
      max-height: 60vh;
    }

    .info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748B;
      padding: 24px 0;
      justify-content: center;
      font-size: 13px;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &.erro { color: #be123c; }
    }

    .spin { animation: spin 1s linear infinite; color: #1D9E75; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .resumo {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 0 12px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
      background: #F1F5F9;
      color: #475569;

      mat-icon { font-size: 14px; width: 14px; height: 14px; }

      &.lido     { background: #dcfce7; color: #166534; }
      &.nao-lido { background: #fef3c7; color: #92400e; }
      &.total    { background: transparent; color: #94A3B8; }
    }

    .lista {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 360px;
      overflow-y: auto;
      border-top: 1px solid #E2E8F0;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 4px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 13.5px;

      mat-icon {
        font-size: 18px; width: 18px; height: 18px;
        color: #CBD5E1;
        flex-shrink: 0;
      }

      &.lido mat-icon { color: #1D9E75; }
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;

      strong { color: #0F172A; font-weight: 600; }

      .data { font-size: 11px; color: #94A3B8; }
      .data.nao { color: #e11d48; }
    }
  `],
})
export class LeiturasDialogComponent implements OnInit {
  private repo = inject(AvisosRepository);
  ref  = inject(MatDialogRef<LeiturasDialogComponent>);
  data = inject<LeiturasDialogData>(MAT_DIALOG_DATA);

  readonly leituras   = signal<LeituraDetalhada[]>([]);
  readonly carregando = signal(true);
  readonly erro       = signal<string | null>(null);

  readonly totalLidas    = computed(() => this.leituras().filter(l => l.lida_em).length);
  readonly totalNaoLidas = computed(() => this.leituras().filter(l => !l.lida_em).length);

  async ngOnInit(): Promise<void> {
    try {
      const lista = await this.repo.leituras(this.data.avisoId);
      lista.sort((a, b) => {
        // lidas primeiro (mais antigas primeiro entre lidas), depois pendentes
        if (!!a.lida_em === !!b.lida_em) {
          if (a.lida_em && b.lida_em) return a.lida_em.localeCompare(b.lida_em);
          return a.nome.localeCompare(b.nome);
        }
        return a.lida_em ? -1 : 1;
      });
      this.leituras.set(lista);
    } catch (err) {
      console.error('[LeiturasDialog] erro:', err);
      this.erro.set('Não foi possível carregar o status de leitura.');
    } finally {
      this.carregando.set(false);
    }
  }

  formatar(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
