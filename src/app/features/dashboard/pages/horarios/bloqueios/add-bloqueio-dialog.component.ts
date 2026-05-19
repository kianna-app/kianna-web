import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { BloqueiosStore } from '../../../state/bloqueios.store';

@Component({
  selector: 'app-add-bloqueio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <h2 class="dialog-titulo">Novo bloqueio</h2>
        <button type="button" class="btn-icon-close" mat-dialog-close aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" class="form-body" (ngSubmit)="salvar()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput type="date" formControlName="data" [min]="hoje" required>
          @if (form.controls.data.touched && form.controls.data.errors?.['required']) {
            <mat-error>Informe uma data</mat-error>
          }
          @if (form.controls.data.touched && form.controls.data.errors?.['dataPassada']) {
            <mat-error>Data não pode ser anterior a hoje</mat-error>
          }
        </mat-form-field>

        <div class="tipo-row">
          <label class="tipo-label" id="tipo-bloqueio-label">Tipo de bloqueio</label>
          <mat-button-toggle-group
            formControlName="tipo"
            aria-labelledby="tipo-bloqueio-label"
            class="tipo-toggle">
            <mat-button-toggle value="dia">
              <mat-icon>event</mat-icon>
              <span>Dia inteiro</span>
            </mat-button-toggle>
            <mat-button-toggle value="periodo">
              <mat-icon>schedule</mat-icon>
              <span>Período</span>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        @if (form.controls.tipo.value === 'periodo') {
          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Hora início</mat-label>
              <input matInput type="time" formControlName="horaInicio" required>
              @if (form.controls.horaInicio.touched && form.controls.horaInicio.errors?.['required']) {
                <mat-error>Informe horário inicial</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Hora fim</mat-label>
              <input matInput type="time" formControlName="horaFim" required>
              @if (form.controls.horaFim.touched && form.controls.horaFim.errors?.['required']) {
                <mat-error>Informe horário final</mat-error>
              }
            </mat-form-field>
          </div>
          @if (form.errors?.['horaInvalida'] && (form.controls.horaInicio.touched || form.controls.horaFim.touched)) {
            <p class="form-error-inline">
              <mat-icon>error_outline</mat-icon>
              Hora final deve ser maior que hora inicial
            </p>
          }
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo (opcional)</mat-label>
          <input matInput formControlName="motivo" placeholder="Ex: Consulta médica" maxlength="120">
        </mat-form-field>
      </form>

      <div class="dialog-actions">
        <button type="button" class="btn-ghost" mat-dialog-close [disabled]="salvando()">
          <mat-icon>close</mat-icon> Cancelar
        </button>
        <button
          type="button"
          class="btn-primary"
          (click)="salvar()"
          [disabled]="salvando()">
          @if (salvando()) {
            <mat-spinner diameter="16" />
            Salvando...
          } @else {
            <mat-icon>save</mat-icon> Salvar
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrap {
      padding: 24px;
      min-width: 320px;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dialog-titulo {
      font: 700 18px 'Inter';
      color: #0F172A;
      margin: 0;
    }
    .btn-icon-close {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 1px solid #e9ecef;
      background: #fff;
      display: grid; place-items: center;
      cursor: pointer;
      color: #64748B;
      transition: background .15s, color .15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: #f8f9fa; color: #0F172A; }
    }
    .form-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width { width: 100%; }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    mat-form-field { width: 100%; }

    .tipo-row { display: flex; flex-direction: column; gap: 8px; }
    .tipo-label {
      font: 500 13px 'Inter';
      color: #475569;
    }
    .tipo-toggle {
      width: 100%;
      border-radius: 10px !important;
      ::ng-deep .mat-button-toggle {
        flex: 1;
        background: #fff;
      }
      ::ng-deep .mat-button-toggle-label-content {
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
        padding: 0 16px !important;
        line-height: 42px !important;
        font: 500 13px 'Inter';
      }
      ::ng-deep .mat-button-toggle-checked {
        background: #E8F8F3 !important;
        color: #0A6847 !important;
      }
      ::ng-deep .mat-button-toggle-checked .mat-button-toggle-label-content {
        font-weight: 600;
      }
      ::ng-deep mat-icon {
        font-size: 16px; width: 16px; height: 16px;
      }
    }

    .form-error-inline {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: -8px 0 0;
      color: #C0392B;
      font: 500 12px 'Inter';
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 4px;
      border-top: 1px solid #F1F5F9;
      padding-top: 16px;
    }
    .dialog-actions .btn-primary { min-width: 120px; justify-content: center; }
    .dialog-actions mat-spinner { display: inline-block; }
  `],
})
export class AddBloqueioDialogComponent {
  private fb    = inject(FormBuilder);
  private store = inject(BloqueiosStore);
  private snack = inject(MatSnackBar);
  private ref   = inject(MatDialogRef<AddBloqueioDialogComponent>);

  readonly salvando = signal(false);

  readonly hoje = new Date().toISOString().slice(0, 10);

  form = this.fb.group(
    {
      data:       ['', [Validators.required, this.dataNaoPassada.bind(this)]],
      tipo:       ['dia' as 'dia' | 'periodo', [Validators.required]],
      horaInicio: [''],
      horaFim:    [''],
      motivo:     [''],
    },
    { validators: [this.horaPeriodoValidator] },
  );

  constructor() {
    this.form.controls.tipo.valueChanges.subscribe(tipo => {
      const inicio = this.form.controls.horaInicio;
      const fim    = this.form.controls.horaFim;
      if (tipo === 'periodo') {
        inicio.addValidators(Validators.required);
        fim.addValidators(Validators.required);
      } else {
        inicio.clearValidators();
        fim.clearValidators();
        inicio.setValue('', { emitEvent: false });
        fim.setValue('', { emitEvent: false });
      }
      inicio.updateValueAndValidity({ emitEvent: false });
      fim.updateValueAndValidity({ emitEvent: false });
    });
  }

  private dataNaoPassada(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value < this.hoje ? { dataPassada: true } : null;
  }

  private horaPeriodoValidator(group: AbstractControl): ValidationErrors | null {
    const tipo = group.get('tipo')?.value;
    if (tipo !== 'periodo') return null;
    const ini = group.get('horaInicio')?.value;
    const fim = group.get('horaFim')?.value;
    if (ini && fim && fim <= ini) return { horaInvalida: true };
    return null;
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { data, tipo, horaInicio, horaFim, motivo } = this.form.getRawValue();
    this.salvando.set(true);
    try {
      await this.store.adicionar({
        data: data!,
        ...(tipo === 'periodo' ? { hora_inicio: horaInicio!, hora_fim: horaFim! } : {}),
        motivo: motivo?.trim() || undefined,
      });
      this.snack.open('Bloqueio adicionado.', '', { duration: 2500 });
      this.ref.close(true);
    } catch (e: unknown) {
      const msg = this.extrairMensagemErro(e);
      this.snack.open(msg, 'OK', { duration: 4000, panelClass: 'snack-error' });
    } finally {
      this.salvando.set(false);
    }
  }

  private extrairMensagemErro(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const apiMsg = (e.error?.message as string) || (e.error?.error as string);
      if (apiMsg) return apiMsg;
      if (e.status === 409) return 'Já existe um bloqueio nesse horário.';
      if (e.status === 400) return 'Dados inválidos. Revise os campos.';
    }
    if (e instanceof Error && e.message) return e.message;
    return 'Não foi possível salvar o bloqueio. Tente novamente.';
  }
}
