import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AgendamentosStore } from '../../../../state/agendamentos.store'
import { ServicosStore } from '../../../../state/servicos.store'
import { AgendamentoView } from '../appt-card/appt-card.component'

export interface AgendamentoFormDialogData {
  modo: 'criar' | 'editar'
  diaSelecionado?: Date
  agendamento?: AgendamentoView & { servico_id?: string; cliente_wpp?: string; observacoes?: string }
}

@Component({
  selector: 'app-agendamento-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <h2 class="dialog-titulo">{{ data.modo === 'criar' ? 'Novo agendamento' : 'Editar agendamento' }}</h2>
        <button class="btn-icon-close" mat-dialog-close aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nome do cliente</mat-label>
          <input matInput formControlName="cliente_nome" placeholder="Ex: Ana Silva">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>WhatsApp do cliente</mat-label>
          <input matInput formControlName="cliente_wpp" placeholder="(11) 99999-9999" type="tel">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Serviço</mat-label>
          <mat-select formControlName="servico_id">
            @for (s of servicosStore.ativos(); track s.id) {
              <mat-option [value]="s.id">{{ s.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Data</mat-label>
            <input matInput type="date" formControlName="data">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Horário</mat-label>
            <input matInput type="time" formControlName="hora">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="pendente">Pendente</mat-option>
            <mat-option value="confirmado">Confirmado</mat-option>
            <mat-option value="concluido">Concluído</mat-option>
            <mat-option value="cancelado">Cancelado</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Observações (opcional)</mat-label>
          <textarea matInput formControlName="observacoes" rows="2"></textarea>
        </mat-form-field>

        <div class="dialog-actions">
          @if (data.modo === 'editar') {
            <button type="button" class="btn-danger btn-sm" (click)="excluir()" [disabled]="salvando()">
              Excluir
            </button>
          }
          <div class="actions-right">
            <button type="button" class="btn-ghost" mat-dialog-close>Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || salvando()">
              @if (salvando()) { <mat-spinner diameter="16" /> }
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 24px; min-width: 340px; max-width: 480px; }

    .dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .dialog-titulo { font: 700 18px 'Inter'; color: #212529; margin: 0; }
    .btn-icon-close {
      width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e9ecef;
      background: #fff; display: grid; place-items: center; cursor: pointer;
      color: #868e96;
      &:hover { background: #f8f9fa; color: #212529; }
    }

    .dialog-form { display: flex; flex-direction: column; gap: 4px; }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .dialog-actions {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 8px; gap: 8px;
    }
    .actions-right { display: flex; gap: 8px; margin-left: auto; }

    mat-form-field { width: 100%; }
  `]
})
export class AgendamentoFormDialogComponent implements OnInit {
  private fb      = inject(FormBuilder)
  private ref     = inject(MatDialogRef<AgendamentoFormDialogComponent>)
  private snack   = inject(MatSnackBar)
  readonly data   = inject<AgendamentoFormDialogData>(MAT_DIALOG_DATA)
  readonly agendamentosStore = inject(AgendamentosStore)
  readonly servicosStore     = inject(ServicosStore)

  readonly salvando = signal(false)

  form = this.fb.group({
    cliente_nome: ['', Validators.required],
    cliente_wpp:  ['', Validators.required],
    servico_id:   ['', Validators.required],
    data:         ['', Validators.required],
    hora:         ['', Validators.required],
    status:       ['pendente', Validators.required],
    observacoes:  [''],
  })

  ngOnInit() {
    this.servicosStore.carregar()

    if (this.data.modo === 'editar' && this.data.agendamento) {
      const ag   = this.data.agendamento
      const dt   = new Date(ag.data_hora)
      const data = dt.toISOString().slice(0, 10)
      const hora = ag.inicio

      this.form.patchValue({
        cliente_nome: ag.clienteNome,
        cliente_wpp:  ag['cliente_wpp'] ?? '',
        servico_id:   ag['servico_id'] ?? '',
        data,
        hora,
        status:       ag.status,
        observacoes:  ag['observacoes'] ?? '',
      })
    } else if (this.data.diaSelecionado) {
      const d = this.data.diaSelecionado
      this.form.patchValue({ data: d.toISOString().slice(0, 10) })
    }
  }

  async salvar() {
    if (this.form.invalid) return
    this.salvando.set(true)

    const v          = this.form.getRawValue()
    const data_hora  = new Date(`${v.data}T${v.hora}`).toISOString()

    try {
      if (this.data.modo === 'criar') {
        await this.agendamentosStore.criar({
          servico_id:   v.servico_id!,
          cliente_nome: v.cliente_nome!,
          cliente_wpp:  v.cliente_wpp!,
          data_hora,
          status:       v.status!,
          observacoes:  v.observacoes ?? undefined,
        })
        this.snack.open('Agendamento criado!', '', { duration: 2500 })
      } else {
        await this.agendamentosStore.atualizar(this.data.agendamento!.id, {
          servico_id:   v.servico_id!,
          cliente_nome: v.cliente_nome!,
          cliente_wpp:  v.cliente_wpp!,
          data_hora,
          status:       v.status!,
          observacoes:  v.observacoes ?? '',
        })
        this.snack.open('Agendamento atualizado!', '', { duration: 2500 })
      }
      this.ref.close(true)
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Erro ao salvar agendamento.', 'OK', { duration: 3000 })
    } finally {
      this.salvando.set(false)
    }
  }

  async excluir() {
    if (!this.data.agendamento) return
    this.salvando.set(true)
    try {
      await this.agendamentosStore.excluir(this.data.agendamento.id)
      this.snack.open('Agendamento excluído.', '', { duration: 2500 })
      this.ref.close(true)
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Erro ao excluir.', 'OK', { duration: 3000 })
    } finally {
      this.salvando.set(false)
    }
  }
}
