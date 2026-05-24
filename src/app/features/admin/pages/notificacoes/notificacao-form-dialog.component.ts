import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import {
  AvisosRepository,
  CriarAvisoPayload,
  AvisoComStats,
  AvisoDestino,
} from '@core/repositories/avisos.repository';

export interface NotificacaoFormDialogData {
  aviso?: AvisoComStats; // editar
}

interface ProfissionalLite {
  id: string;
  nome: string;
  ativo: boolean;
}

function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  // datetime-local espera YYYY-MM-DDTHH:mm (local)
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function fromLocalInput(local: string): string {
  return new Date(local).toISOString();
}

@Component({
  selector: 'app-notificacao-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar notificação' : 'Nova notificação' }}</h2>

    <mat-dialog-content class="form-content">
      <label class="campo">
        <span class="label">Título</span>
        <input
          type="text"
          [ngModel]="titulo()"
          (ngModelChange)="titulo.set($event)"
          maxlength="200"
          placeholder="Ex.: Manutenção programada"
          required>
      </label>

      <label class="campo">
        <span class="label">Mensagem</span>
        <textarea
          rows="5"
          [ngModel]="corpo()"
          (ngModelChange)="corpo.set($event)"
          maxlength="5000"
          placeholder="Escreva a mensagem que os profissionais verão…"
          required></textarea>
      </label>

      <label class="campo">
        <span class="label">Publicar em</span>
        <input
          type="datetime-local"
          [ngModel]="publicarEmLocal()"
          (ngModelChange)="publicarEmLocal.set($event)">
        <span class="hint">
          Se a data for futura, a notificação aparece como
          <strong>agendada</strong> e só chegará aos profissionais quando a data passar.
        </span>
      </label>

      <fieldset class="campo destino-group">
        <legend class="label">Destinatários</legend>
        <label class="radio">
          <input
            type="radio"
            name="destino"
            value="todos"
            [checked]="destino() === 'todos'"
            (change)="destino.set('todos')">
          <span><strong>Todos os profissionais</strong> ativos</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="destino"
            value="selecionados"
            [checked]="destino() === 'selecionados'"
            (change)="destino.set('selecionados')">
          <span><strong>Selecionar</strong> profissionais específicos</span>
        </label>

        @if (destino() === 'selecionados') {
          <div class="profs-lista">
            @if (carregandoProfs()) {
              <span class="hint">Carregando profissionais…</span>
            } @else if (profissionais().length === 0) {
              <span class="hint">Nenhum profissional ativo encontrado.</span>
            } @else {
              @for (p of profissionais(); track p.id) {
                <label class="prof-check">
                  <input
                    type="checkbox"
                    [checked]="selecionados().has(p.id)"
                    (change)="toggleProf(p.id)">
                  <span>{{ p.nome }}</span>
                </label>
              }
            }
          </div>
          @if (destino() === 'selecionados' && selecionados().size === 0) {
            <span class="hint erro">Selecione ao menos um profissional.</span>
          }
        }
      </fieldset>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button type="button" class="btn-ghost" (click)="ref.close()">
        <mat-icon>close</mat-icon> Cancelar
      </button>
      <button
        type="button"
        class="btn-primary"
        [disabled]="!valido() || salvando()"
        (click)="salvar()">
        <mat-icon>{{ salvando() ? 'progress_activity' : 'send' }}</mat-icon>
        {{ editando ? 'Salvar alterações' : 'Publicar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-content { max-width: 520px; min-width: min(92vw, 480px); display: flex; flex-direction: column; gap: 14px; }

    .campo {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .label {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      input[type=text], input[type=datetime-local], textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        color: #0F172A;
        background: #fff;
        box-sizing: border-box;
        outline: none;
        transition: border-color .15s ease, box-shadow .15s ease;
      }

      textarea { resize: vertical; min-height: 100px; }

      input:focus, textarea:focus {
        border-color: #1D9E75;
        box-shadow: 0 0 0 3px rgba(29,158,117,.15);
      }

      .hint {
        font-size: 12px;
        color: #64748B;
        line-height: 1.4;
      }
      .hint.erro { color: #be123c; font-weight: 600; }
    }

    .destino-group {
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      margin: 0;

      legend {
        padding: 0 6px;
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .radio {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 8px 4px;
        font-size: 14px;
        color: #334155;
        cursor: pointer;
      }
    }

    .profs-lista {
      margin-top: 8px;
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .prof-check {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 6px 8px;
      font-size: 13px;
      cursor: pointer;
      border-radius: 6px;

      &:hover { background: #F1F5F9; }

      input { margin: 0; }
    }

    button[disabled] { opacity: 0.55; cursor: not-allowed; }
  `],
})
export class NotificacaoFormDialogComponent implements OnInit {
  private api    = inject(ApiService);
  private snack  = inject(MatSnackBar);
  private repo   = inject(AvisosRepository);
  ref            = inject(MatDialogRef<NotificacaoFormDialogComponent, AvisoComStats | null>);
  data           = inject<NotificacaoFormDialogData>(MAT_DIALOG_DATA);

  readonly titulo          = signal('');
  readonly corpo           = signal('');
  readonly publicarEmLocal = signal<string>(toLocalInput());
  readonly destino         = signal<AvisoDestino>('todos');
  readonly selecionados    = signal<Set<string>>(new Set());

  readonly profissionais     = signal<ProfissionalLite[]>([]);
  readonly carregandoProfs   = signal(false);
  readonly salvando          = signal(false);

  get editando(): boolean { return !!this.data?.aviso; }

  readonly valido = computed(() => {
    if (!this.titulo().trim() || !this.corpo().trim() || !this.publicarEmLocal()) return false;
    if (this.destino() === 'selecionados' && this.selecionados().size === 0) return false;
    return true;
  });

  async ngOnInit(): Promise<void> {
    if (this.data?.aviso) {
      const a = this.data.aviso;
      this.titulo.set(a.titulo);
      this.corpo.set(a.corpo);
      this.publicarEmLocal.set(toLocalInput(a.publicar_em));
      this.destino.set(a.destino);
      this.selecionados.set(new Set(a.destinatarios));
    }
    await this.carregarProfissionais();
  }

  toggleProf(id: string): void {
    const next = new Set(this.selecionados());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.selecionados.set(next);
  }

  private async carregarProfissionais(): Promise<void> {
    this.carregandoProfs.set(true);
    try {
      const lista = await this.api.get<ProfissionalLite[]>('/api/admin/profissionais');
      this.profissionais.set(lista.filter(p => p.ativo));
    } catch (err) {
      console.error('[NotificacaoForm] erro ao listar profissionais:', err);
      this.snack.open('Erro ao carregar profissionais', 'OK', { duration: 3000 });
    } finally {
      this.carregandoProfs.set(false);
    }
  }

  async salvar(): Promise<void> {
    if (!this.valido() || this.salvando()) return;
    this.salvando.set(true);
    try {
      const payload: CriarAvisoPayload = {
        titulo: this.titulo().trim(),
        corpo:  this.corpo().trim(),
        publicar_em: fromLocalInput(this.publicarEmLocal()),
        destino: this.destino(),
        destinatarios: this.destino() === 'selecionados' ? [...this.selecionados()] : undefined,
      };

      const salvo = this.data?.aviso
        ? await this.repo.atualizar(this.data.aviso.id, payload)
        : await this.repo.criar(payload);

      this.snack.open(
        this.data?.aviso ? 'Notificação atualizada' : 'Notificação publicada',
        'OK', { duration: 2500 },
      );
      this.ref.close(salvo);
    } catch (err) {
      console.error('[NotificacaoForm] erro ao salvar:', err);
      this.snack.open('Não foi possível salvar. Tente novamente.', 'OK', { duration: 4000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
