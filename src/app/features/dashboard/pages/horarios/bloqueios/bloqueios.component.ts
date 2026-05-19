import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BloqueiosStore } from '../../../state/bloqueios.store';
import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { AddBloqueioDialogComponent } from './add-bloqueio-dialog.component';
import { Bloqueio } from '@core/types/database.types';
import { firstValueFrom } from 'rxjs';

interface BloqueioGrupo {
  chave: string;        // '2026-05'
  label: string;        // 'Maio 2026'
  bloqueios: Bloqueio[];
}

const MESES_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const DIAS_SEMANA_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MESES_CURTOS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

@Component({
  selector: 'app-bloqueios',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, SkeletonComponent,
  ],
  template: `
    <div class="bloqueios-wrap">
      <div class="bloqueios-header">
        <div>
          <h3 class="titulo">Bloqueios de agenda</h3>
          <p class="subtitulo">Bloqueie dias ou períodos específicos em que você não atenderá</p>
        </div>
        <button class="btn-primary" (click)="abrirDialog()">
          <mat-icon>add</mat-icon>
          Adicionar bloqueio
        </button>
      </div>

      @if (store.carregando()) {
        <div class="lista">
          @for (i of [1,2,3]; track i) {
            <div class="bloqueio-sk">
              <div class="bloqueio-sk-info">
                <app-skeleton width="100px" height="14px" />
                <app-skeleton width="160px" height="12px" />
              </div>
              <app-skeleton width="32px" height="32px" radius="8px" />
            </div>
          }
        </div>
      } @else if (store.erro()) {
        <div class="vazio erro">
          <mat-icon>wifi_off</mat-icon>
          <h4>Não foi possível carregar</h4>
          <p>{{ store.erro() }}</p>
          <button class="btn-ghost btn-sm" (click)="store.carregar()">Tentar novamente</button>
        </div>
      } @else if (store.bloqueios().length === 0) {
        <div class="vazio">
          <div class="vazio-ilustracao" aria-hidden="true">
            <mat-icon>event_available</mat-icon>
          </div>
          <h4>Nenhum bloqueio configurado</h4>
          <p>Bloqueios cadastrados aparecem aqui e impedem novos agendamentos no período.</p>
          <button class="btn-primary btn-sm" (click)="abrirDialog()">
            <mat-icon>add</mat-icon> Adicionar primeiro bloqueio
          </button>
        </div>
      } @else {
        <div class="grupos">
          @for (grupo of bloqueiosAgrupados(); track grupo.chave) {
            <div class="grupo">
              <h4 class="grupo-titulo">{{ grupo.label }}</h4>
              <div class="lista">
                @for (b of grupo.bloqueios; track b.id) {
                  <div class="bloqueio-item">
                    <div class="bloqueio-data-box">
                      <span class="data-dia">{{ extrairDia(b.data) }}</span>
                      <span class="data-mes">{{ extrairMesCurto(b.data) }}</span>
                    </div>

                    <div class="bloqueio-info">
                      <div class="bloqueio-linha-principal">
                        <span class="bloqueio-dia-semana">{{ extrairDiaSemana(b.data) }}</span>
                        @if (!b.hora_inicio) {
                          <span class="chip chip-dia">
                            <mat-icon>event</mat-icon> Dia inteiro
                          </span>
                        } @else {
                          <span class="chip chip-periodo">
                            <mat-icon>schedule</mat-icon>
                            {{ b.hora_inicio.slice(0,5) }}–{{ b.hora_fim!.slice(0,5) }}
                            <span class="chip-duracao">· {{ calcularDuracao(b.hora_inicio!, b.hora_fim!) }}</span>
                          </span>
                        }
                      </div>
                      @if (b.motivo) {
                        <span class="bloqueio-motivo" [title]="b.motivo">{{ b.motivo }}</span>
                      }
                    </div>

                    <button
                      class="btn-excluir"
                      type="button"
                      (click)="excluir(b)"
                      [disabled]="excluindo() === b.id"
                      matTooltip="Excluir bloqueio"
                      aria-label="Excluir bloqueio">
                      @if (excluindo() === b.id) {
                        <mat-spinner diameter="16" />
                      } @else {
                        <mat-icon>delete_outline</mat-icon>
                      }
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .bloqueios-wrap { padding: 24px; }

    .bloqueios-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
    }
    .titulo    { font: 700 18px 'Inter'; color: v.$kianna-slate-900; margin: 0; }
    .subtitulo { font: 400 13px 'Inter'; color: v.$kianna-slate-500; margin: 4px 0 0; max-width: 460px; }

    .vazio {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 8px;
      padding: 40px 16px;
      color: v.$kianna-slate-500;
      h4 { margin: 0; font: 600 15px 'Inter'; color: v.$kianna-slate-700; }
      p  { margin: 0 0 8px; max-width: 320px; font: 400 13px 'Inter'; }
      &.erro mat-icon { color: v.$status-cancelado; font-size: 32px; width: 32px; height: 32px; }
    }
    .vazio-ilustracao {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: v.$kianna-green-50;
      display: grid; place-items: center;
      margin-bottom: 4px;
      mat-icon { font-size: 32px; width: 32px; height: 32px; color: v.$kianna-green-500; }
    }

    .grupos { display: flex; flex-direction: column; gap: 24px; }
    .grupo-titulo {
      font: 600 12px 'Inter';
      text-transform: uppercase;
      letter-spacing: .5px;
      color: v.$kianna-slate-500;
      margin: 0 0 10px;
      padding-left: 4px;
    }

    .lista { display: flex; flex-direction: column; gap: 8px; }

    .bloqueio-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      background: #fff;
      border: 1px solid v.$kianna-slate-200;
      border-radius: 10px;
      transition: border-color .15s, box-shadow .15s;
      &:hover { border-color: v.$kianna-slate-300; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
    }

    .bloqueio-data-box {
      flex-shrink: 0;
      width: 48px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 6px 4px;
      border-radius: 8px;
      background: v.$kianna-green-50;
      color: v.$kianna-green-700;

      .data-dia { font: 700 18px 'Inter'; line-height: 1; }
      .data-mes { font: 600 10px 'Inter'; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
    }

    .bloqueio-info {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 4px;
    }
    .bloqueio-linha-principal {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .bloqueio-dia-semana {
      font: 600 13px 'Inter';
      color: v.$kianna-slate-900;
      text-transform: capitalize;
    }
    .bloqueio-motivo {
      font: 400 12px 'Inter';
      color: v.$kianna-slate-500;
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px;
      border-radius: 99px;
      font: 500 11px 'Inter';
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .chip-dia    { background: v.$kianna-slate-100; color: v.$kianna-slate-700; }
    .chip-periodo{ background: #FEF3C7; color: #92400E; }
    .chip-duracao{ opacity: .75; font-weight: 400; margin-left: 2px; }

    .btn-excluir {
      flex-shrink: 0;
      width: 36px; height: 36px;
      background: none; border: none; cursor: pointer;
      color: v.$kianna-slate-400;
      display: grid; place-items: center;
      border-radius: 8px;
      transition: background .15s, color .15s;
      &:hover:not(:disabled) {
        color: v.$status-cancelado;
        background: #FEF2F2;
      }
      &:disabled { opacity: .5; cursor: default; }
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
    }

    .bloqueio-sk {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
      padding: 14px;
      background: #fff;
      border: 1px solid v.$kianna-slate-200;
      border-radius: 10px;
    }
    .bloqueio-sk-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }

    @media (max-width: 480px) {
      .bloqueios-wrap { padding: 16px; }
      .bloqueios-header .btn-primary { width: 100%; justify-content: center; }
      .bloqueio-motivo { max-width: 100%; }
    }
  `],
})
export class BloqueiosComponent implements OnInit {
  readonly store    = inject(BloqueiosStore);
  private snack     = inject(MatSnackBar);
  private dialog    = inject(MatDialog);
  readonly excluindo = signal<string | null>(null);

  readonly bloqueiosAgrupados = computed<BloqueioGrupo[]>(() => {
    const lista = [...this.store.bloqueios()].sort((a, b) => a.data.localeCompare(b.data));
    const grupos = new Map<string, BloqueioGrupo>();
    for (const b of lista) {
      const [ano, mes] = b.data.split('-');
      const chave = `${ano}-${mes}`;
      if (!grupos.has(chave)) {
        grupos.set(chave, {
          chave,
          label: `${MESES_PT[Number(mes) - 1]} ${ano}`,
          bloqueios: [],
        });
      }
      grupos.get(chave)!.bloqueios.push(b);
    }
    return Array.from(grupos.values());
  });

  async ngOnInit(): Promise<void> {
    await this.store.carregar();
  }

  async abrirDialog(): Promise<void> {
    const ref = this.dialog.open(AddBloqueioDialogComponent, { width: '420px' });
    await firstValueFrom(ref.afterClosed());
  }

  async excluir(b: Bloqueio): Promise<void> {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        titulo: 'Remover bloqueio',
        mensagem: `Tem certeza que deseja remover o bloqueio de ${this.formatarDataAmigavel(b.data)}?`,
        confirmLabel: 'Remover',
        tipo: 'warn',
      },
    });
    const ok = await firstValueFrom(ref.afterClosed());
    if (!ok) return;

    this.excluindo.set(b.id);
    try {
      await this.store.excluir(b.id);
      this.snack.open('Bloqueio removido.', '', { duration: 2000 });
    } catch (e: any) {
      const msg = e?.error?.message || 'Não foi possível remover o bloqueio.';
      this.snack.open(msg, 'OK', { duration: 3000, panelClass: 'snack-error' });
    } finally {
      this.excluindo.set(null);
    }
  }

  extrairDia(data: string): string { return data.slice(8, 10); }
  extrairMesCurto(data: string): string {
    const mes = Number(data.slice(5, 7));
    return MESES_CURTOS_PT[mes - 1] ?? '';
  }
  extrairDiaSemana(data: string): string {
    const d = this.parseLocalDate(data);
    return DIAS_SEMANA_PT[d.getDay()];
  }

  calcularDuracao(inicio: string, fim: string): string {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    const totalMin = (hf * 60 + mf) - (hi * 60 + mi);
    if (totalMin <= 0) return '';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}min`;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2,'0')}`;
  }

  private formatarDataAmigavel(data: string): string {
    const d = this.parseLocalDate(data);
    return `${DIAS_SEMANA_PT[d.getDay()]}, ${this.extrairDia(data)} ${this.extrairMesCurto(data)}`;
  }

  private parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}
