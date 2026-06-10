import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgendamentosStore } from '../../../../state/agendamentos.store';
import { ServicosStore } from '../../../../state/servicos.store';
import { AgendamentoView } from '../appt-card/appt-card.component';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';
import { MatIcon } from '@angular/material/icon';
import { KiannaValidators } from '@core/validators/form.validators';
import { FieldErrorComponent } from '@shared/components/field-error/field-error.component';
import { DisponibilidadesRepository } from '@core/repositories/disponibilidades.repository';
import { BloqueiosRepository } from '@core/repositories/bloqueios.repository';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { SlotCalculatorService, SlotInfo } from '@features/booking/services/slot-calculator.service';
import { Bloqueio, Disponibilidade } from '@core/types/database.types';

export interface AgendamentoFormDialogData {
  modo: 'criar' | 'editar';
  diaSelecionado?: Date;
  agendamento?: AgendamentoView & {
    servico_id?: string;
    cliente_wpp?: string;
    observacoes?: string;
  };
}

@Component({
  selector: 'app-agendamento-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIcon,
    FieldErrorComponent,
  ],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <h2 class="dialog-titulo">
          {{ data.modo === 'criar' ? 'Novo agendamento' : 'Editar agendamento' }}
        </h2>
        <button class="btn-icon-close" mat-dialog-close aria-label="Fechar">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nome do cliente</mat-label>
          <input matInput formControlName="cliente_nome" placeholder="Ex: Ana Silva" />
          <app-field-error [control]="form.controls.cliente_nome" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>WhatsApp do cliente</mat-label>
          <input matInput formControlName="cliente_wpp" placeholder="(11) 99999-9999" type="tel" />
          <app-field-error [control]="form.controls.cliente_wpp" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Serviço</mat-label>
          <mat-select formControlName="servico_id">
            @for (s of servicosStore.ativos(); track s.id) {
              <mat-option [value]="s.id">{{ s.nome }}</mat-option>
            }
          </mat-select>
          <app-field-error [control]="form.controls.servico_id" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="date-field">
          <mat-label>Data</mat-label>
          <input
            #dataInput
            matInput
            type="date"
            class="picker-input"
            formControlName="data"
            [min]="hoje"
            (click)="abrirPicker(dataInput)"
            (keydown)="bloquearDigitacaoPicker($event)"
            (paste)="$event.preventDefault()" />
          <button
            matSuffix
            type="button"
            class="picker-suffix"
            aria-label="Selecionar data"
            (click)="$event.stopPropagation(); abrirPicker(dataInput)">
            <mat-icon>calendar_month</mat-icon>
          </button>
          @if (form.controls.data.hasError('dataPassada') && form.controls.data.touched) {
            <mat-error>Data não pode ser anterior a hoje.</mat-error>
          } @else if (form.controls.data.hasError('diaSemAtendimento') && form.controls.data.touched) {
            <mat-error>Não há atendimento configurado para este dia.</mat-error>
          } @else if (form.controls.data.hasError('semSlots') && form.controls.data.touched) {
            <mat-error>Nenhum horário disponível nesta data.</mat-error>
          }
        </mat-form-field>

        @if (form.controls.data.value && form.controls.servico_id.value && (carregandoSlots() || horariosDisponiveis().length > 0)) {
          <section
            class="slots-section"
            [class.slots-section-error]="form.controls.hora.invalid && form.controls.hora.touched"
            aria-labelledby="slots-title"
            [attr.aria-describedby]="form.controls.hora.invalid && form.controls.hora.touched ? 'slots-legend slots-error' : 'slots-legend'">
            <div class="slots-header">
              <div class="slots-title-wrap">
                <span class="slots-icon" aria-hidden="true">
                  <mat-icon>schedule</mat-icon>
                </span>
                <div>
                  <h3 id="slots-title" class="slots-title">Horários disponíveis</h3>
                  <p id="slots-legend" class="slots-legend">
                    Selecione um horário abaixo para preencher o agendamento.
                  </p>
                </div>
              </div>
              @if (horariosDisponiveis().length > 0) {
                <span class="slots-count">
                  {{ horariosDisponiveis().length }} horário{{ horariosDisponiveis().length === 1 ? '' : 's' }}
                </span>
              }
            </div>

            @if (carregandoSlots()) {
              <div class="slots-loading">
                <mat-spinner diameter="18" />
                <span>Buscando horários...</span>
              </div>
            } @else if (horariosDisponiveis().length > 0) {
              <div class="slots-list" role="radiogroup" aria-label="Escolha um horário disponível">
                @for (slot of horariosDisponiveis(); track slot.dataHoraISO) {
                  <button
                    type="button"
                    class="slot-chip"
                    role="radio"
                    [attr.aria-checked]="form.controls.hora.value === slot.hora"
                    [class.ativo]="form.controls.hora.value === slot.hora"
                    (click)="selecionarHorario(slot.hora)">
                    {{ slot.hora }}
                  </button>
                }
              </div>
            }

            @if (form.controls.hora.invalid && form.controls.hora.touched) {
              <p id="slots-error" class="slots-error">Escolha um dos horários disponíveis.</p>
            }
          </section>
        }

        <mat-form-field appearance="outline">
          <mat-label>Observações (opcional)</mat-label>
          <textarea matInput formControlName="observacoes" rows="2"></textarea>
        </mat-form-field>

        <!-- Ações de status (apenas modo editar) -->
        @if (data.modo === 'editar' && data.agendamento) {
          <div class="status-acoes">
            @if (statusAtual === 'pendente') {
              <div class="acoes-row">
                <button
                  type="button"
                  class="btn-primary"
                  (click)="confirmar()"
                  [disabled]="salvando()"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  class="btn-danger"
                  (click)="mostrarRecusa.set(!mostrarRecusa())"
                  [disabled]="salvando()"
                >
                  Recusar
                </button>
              </div>
              @if (mostrarRecusa()) {
                <mat-form-field appearance="outline" class="motivo-field">
                  <mat-label>Motivo da recusa (opcional)</mat-label>
                  <textarea
                    matInput
                    [(ngModel)]="motivoRecusa"
                    [ngModelOptions]="{ standalone: true }"
                    rows="2"
                  ></textarea>
                </mat-form-field>
                <button
                  type="button"
                  class="btn-danger btn-full"
                  (click)="confirmarRecusa()"
                  [disabled]="salvando()"
                >
                  Confirmar recusa
                </button>
              }
            }

            @if (statusAtual === 'confirmado') {
              <div class="acoes-row">
                <button
                  type="button"
                  class="btn-ghost"
                  (click)="reagendar()"
                  [disabled]="salvando()"
                >
                  Reagendar
                </button>
                <button
                  type="button"
                  class="btn-ghost"
                  (click)="naoCompareceu()"
                  [disabled]="salvando()"
                >
                  Não compareceu
                </button>
                <button
                  type="button"
                  class="btn-danger"
                  (click)="cancelar()"
                  [disabled]="salvando()"
                >
                  Cancelar
                </button>
              </div>
            }

            @if (statusAtual === 'finalizado') {
              <div class="acoes-row">
                <button
                  type="button"
                  class="btn-ghost"
                  (click)="naoCompareceu()"
                  [disabled]="salvando()"
                >
                  Marcar não compareceu
                </button>
              </div>
            }
          </div>
        }

        <div class="dialog-actions">
          @if (data.modo === 'editar') {
            <button
              type="button"
              class="btn-danger btn-sm"
              (click)="excluir()"
              [disabled]="salvando()"
            >
              Excluir
            </button>
          }
          <div class="actions-right">
            <button type="button" class="btn-ghost btn-lg" mat-dialog-close><mat-icon> close </mat-icon>Cancelar</button>
            <!-- <button type="submit" class="btn-primary" [disabled]="form.invalid || salvando()">
              @if (salvando()) { <mat-spinner diameter="16" /> }
              Salvar
            </button> -->

            <button
              type="submit"
              class="btn-primary btn-lg"
              [disabled]="form.invalid || salvando() || carregandoSlots()"
            >
              <mat-icon> save </mat-icon>
              <span>
                @if (salvando()) {
                  <mat-spinner diameter="16" />
                }
                Salvar</span
              >
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .dialog-wrap {
        padding: 24px;
        min-width: 340px;
        max-width: 480px;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .dialog-titulo {
        font: 700 18px 'Inter';
        color: #212529;
        margin: 0;
      }
      .btn-icon-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #e9ecef;
        background: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        color: #868e96;
        &:hover {
          background: #f8f9fa;
          color: #212529;
        }
      }

      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .date-field {
        width: 100%;
      }
      .picker-input {
        cursor: pointer;
      }
      .picker-input::-webkit-calendar-picker-indicator {
        display: none;
      }
      .picker-suffix {
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        display: grid;
        place-items: center;
        margin-right: -8px;
      }
      .picker-suffix:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
      .picker-suffix mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .slots-section {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        padding: 12px;
        margin: -2px 0 8px;
      }
      .slots-section-error {
        border-color: #fda4af;
        background: #fff7f8;
      }
      .slots-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }
      .slots-title-wrap {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
      }
      .slots-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        background: #e8f5f0;
        color: #0f5c44;
      }
      .slots-icon mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .slots-title {
        margin: 0;
        color: #1e293b;
        font: 700 13px 'Inter';
      }
      .slots-legend {
        margin: 2px 0 0;
        color: #64748b;
        font: 500 12px/1.35 'Inter';
      }
      .slots-count {
        flex: 0 0 auto;
        border-radius: 999px;
        background: #e8f5f0;
        color: #0f5c44;
        border: 1px solid #a7f3d0;
        padding: 4px 9px;
        font: 700 11px 'Inter';
        white-space: nowrap;
      }
      .slots-loading {
        min-height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #64748b;
        background: #fff;
        border: 1px dashed #cbd5e1;
        font: 600 12px 'Inter';
      }
      .slots-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
        gap: 8px;
      }
      .slot-chip {
        min-height: 44px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid #dbe4ea;
        background: #fff;
        color: #334155;
        font: 600 13px 'Inter';
        cursor: pointer;
        transition: background .15s, border-color .15s, box-shadow .15s, color .15s;
      }
      .slot-chip:hover {
        background: #f8fafc;
        border-color: #b6c4d0;
      }
      .slot-chip:focus-visible {
        outline: 3px solid rgba(29, 158, 117, .22);
        outline-offset: 2px;
        border-color: #1d9e75;
      }
      .slot-chip.ativo {
        background: #1d9e75;
        border-color: #1d9e75;
        color: #fff;
        box-shadow: 0 4px 10px rgba(29, 158, 117, .24);
      }
      .slots-error {
        color: #b4233c;
        font: 600 12px 'Inter';
        margin: 8px 2px 0;
      }

      .status-acoes {
        border-top: 1px solid #e9ecef;
        padding-top: 12px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .acoes-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .motivo-field {
        width: 100%;
      }
      .btn-full {
        width: 100%;
      }

      .dialog-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        gap: 8px;
        border-top: 1px solid #f1f3f5;
        padding-top: 12px;
      }
      .actions-right {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }
      mat-form-field {
        width: 100%;
      }
      @media (max-width: 480px) {
        .dialog-wrap {
          min-width: 0;
          width: min(100vw, 360px);
          padding: 20px;
        }
        .slots-section {
          padding: 12px 10px;
        }
        .slots-header {
          flex-direction: column;
          gap: 8px;
        }
        .slots-list {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .slot-chip {
          padding-inline: 8px;
        }
        .dialog-actions,
        .actions-right {
          flex-direction: column-reverse;
          align-items: stretch;
          width: 100%;
        }
        .actions-right {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class AgendamentoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<AgendamentoFormDialogComponent>);
  private snack = inject(MatSnackBar);
  private disponibilidadesRepo = inject(DisponibilidadesRepository);
  private bloqueiosRepo = inject(BloqueiosRepository);
  private agendamentosRepo = inject(AgendamentosRepository);
  private slotCalculator = inject(SlotCalculatorService);
  readonly data = inject<AgendamentoFormDialogData>(MAT_DIALOG_DATA);
  readonly agendamentosStore = inject(AgendamentosStore);
  readonly servicosStore = inject(ServicosStore);

  readonly salvando = signal(false);
  readonly mostrarRecusa = signal(false);
  readonly carregandoSlots = signal(false);
  readonly disponibilidades = signal<Disponibilidade[]>([]);
  readonly bloqueios = signal<Bloqueio[]>([]);
  readonly slots = signal<SlotInfo[]>([]);
  readonly slotsCalculados = signal(false);
  motivoRecusa = '';
  readonly hoje = new Intl.DateTimeFormat('en-CA').format(new Date());

  form = this.fb.group({
    cliente_nome: ['', Validators.required],
    cliente_wpp: ['', KiannaValidators.whatsapp()],
    servico_id: ['', Validators.required],
    data: ['', [Validators.required, this.dataValidator.bind(this)]],
    hora: ['', [Validators.required, this.horaValidator.bind(this)]],
    observacoes: [''],
  });

  readonly horariosDisponiveis = computed(() => this.slots().filter(s => s.disponivel));

  get statusAtual() {
    return this.data.agendamento?.status;
  }

  async ngOnInit() {
    await Promise.all([
      this.servicosStore.carregar(),
      this.carregarRestricoes(),
    ]);

    if (this.data.modo === 'editar' && this.data.agendamento) {
      const ag = this.data.agendamento;
      const dt = new Date(ag.data_hora);
      const data = dt.toISOString().slice(0, 10);
      const hora = ag.inicio;

      this.form.patchValue({
        cliente_nome: ag.clienteNome,
        cliente_wpp: ag['cliente_wpp'] ?? '',
        servico_id: ag['servico_id'] ?? '',
        data,
        hora,
        observacoes: ag['observacoes'] ?? '',
      });
    } else if (this.data.diaSelecionado) {
      const d = this.data.diaSelecionado;
      this.form.patchValue({ data: d.toISOString().slice(0, 10) });
    }

    await this.recalcularSlots();
    this.form.controls.servico_id.valueChanges.subscribe(() => void this.recalcularSlots());
    this.form.controls.data.valueChanges.subscribe(() => void this.recalcularSlots());
  }

  selecionarHorario(hora: string): void {
    this.form.controls.hora.setValue(hora);
    this.form.controls.hora.markAsTouched();
  }

  abrirPicker(input: HTMLInputElement): void {
    input.focus();
    const picker = input as HTMLInputElement & { showPicker?: () => void };
    try {
      picker.showPicker?.();
    } catch {
      // Alguns browsers só permitem abrir o seletor em interações específicas.
    }
  }

  bloquearDigitacaoPicker(event: KeyboardEvent): void {
    const teclasPermitidas = ['Tab', 'Shift', 'Enter', 'Escape'];
    if (!teclasPermitidas.includes(event.key)) {
      event.preventDefault();
    }
  }

  private async carregarRestricoes(): Promise<void> {
    try {
      const [disponibilidades, bloqueios] = await Promise.all([
        this.disponibilidadesRepo.listar(),
        this.bloqueiosRepo.listar(),
      ]);
      this.disponibilidades.set(disponibilidades);
      this.bloqueios.set(bloqueios);
    } catch {
      this.snack.open('Não foi possível carregar horários disponíveis.', 'OK', { duration: 3000 });
    }
  }

  private async recalcularSlots(): Promise<void> {
    const data = this.form.controls.data.value;
    const servicoId = this.form.controls.servico_id.value;
    const servico = this.servicosStore.servicos().find(s => s.id === servicoId);

    this.slots.set([]);
    this.slotsCalculados.set(false);
    this.form.controls.data.updateValueAndValidity({ emitEvent: false });
    this.form.controls.hora.updateValueAndValidity({ emitEvent: false });

    if (!data || !servico) return;

    this.carregandoSlots.set(true);
    try {
      const inicio = new Date(`${data}T00:00:00`);
      const fim = new Date(`${data}T23:59:59`);
      const agendamentos = await this.agendamentosRepo.listarPorPeriodo(inicio, fim);
      const user = currentUser();
      const slots = this.slotCalculator.calcularSlotsParaDia(
        inicio,
        servico,
        this.disponibilidades(),
        agendamentos
          .filter(a => a.status === 'confirmado' && a.id !== this.data.agendamento?.id)
          .map(a => ({ data_hora: a.data_hora })),
        this.bloqueios(),
        user?.timezone ?? 'America/Sao_Paulo',
        user?.antecedencia_minima_horas ?? 0,
        user?.antecedencia_maxima_dias ?? 30,
      );
      this.slots.set(this.incluirSlotAtualSeNecessario(slots));
      this.slotsCalculados.set(true);
    } catch {
      this.snack.open('Erro ao calcular horários disponíveis.', 'OK', { duration: 3000 });
    } finally {
      this.carregandoSlots.set(false);
      this.form.controls.data.updateValueAndValidity({ emitEvent: false });
      this.form.controls.hora.updateValueAndValidity({ emitEvent: false });
    }
  }

  private incluirSlotAtualSeNecessario(slots: SlotInfo[]): SlotInfo[] {
    if (this.data.modo !== 'editar' || !this.data.agendamento) return slots;
    const horaAtual = this.form.controls.hora.value;
    const dataAtual = this.form.controls.data.value;
    if (!horaAtual || !dataAtual) return slots;
    if (slots.some(s => s.hora === horaAtual)) return slots;
    return [
      ...slots,
      {
        hora: horaAtual,
        dataHoraISO: new Date(`${dataAtual}T${horaAtual}`).toISOString(),
        disponivel: true,
      },
    ].sort((a, b) => a.hora.localeCompare(b.hora));
  }

  private dataValidator(control: AbstractControl): ValidationErrors | null {
    const data = control.value as string;
    if (!data) return null;
    if (data < this.hoje) return { dataPassada: true };
    if (this.disponibilidades().length > 0 && !this.disponibilidadeDaData(data)) {
      return { diaSemAtendimento: true };
    }
    const servicoId = this.form?.controls.servico_id.value;
    if (servicoId && this.slotsCalculados() && this.horariosDisponiveis().length === 0) {
      return { semSlots: true };
    }
    return null;
  }

  private horaValidator(control: AbstractControl): ValidationErrors | null {
    const hora = control.value as string;
    const data = this.form?.controls.data.value;
    const servicoId = this.form?.controls.servico_id.value;
    if (!hora || !data || !servicoId || this.carregandoSlots()) return null;
    if (this.horariosDisponiveis().length === 0) return { horaIndisponivel: true };
    return this.horariosDisponiveis().some(s => s.hora === hora)
      ? null
      : { horaIndisponivel: true };
  }

  private disponibilidadeDaData(data: string): Disponibilidade | null {
    if (!data) return null;
    const diaSemana = new Date(`${data}T00:00:00`).getDay();
    return this.disponibilidades().find(d => d.dia_semana === diaSemana) ?? null;
  }

  async confirmar() {
    await this.executarAcao(() =>
      this.agendamentosStore.atualizarStatus(this.data.agendamento!.id, 'confirmado'),
    );
  }

  async confirmarRecusa() {
    await this.executarAcao(() =>
      this.agendamentosStore.atualizarStatus(
        this.data.agendamento!.id,
        'recusado',
        this.motivoRecusa || undefined,
      ),
    );
  }

  async cancelar() {
    await this.executarAcao(() =>
      this.agendamentosStore.atualizarStatus(this.data.agendamento!.id, 'cancelado'),
    );
  }

  async naoCompareceu() {
    await this.executarAcao(() =>
      this.agendamentosStore.atualizarStatus(this.data.agendamento!.id, 'nao_compareceu'),
    );
  }

  reagendar() {
    const slug = currentUser()?.slug ?? '';
    const id = this.data.agendamento!.id;
    const link = `${APP.URL_BASE}/${slug}?reagendar=${id}`;
    navigator.clipboard.writeText(link).catch(() => null);
    this.snack.open('Link de reagendamento copiado!', '', { duration: 3000 });
  }

  private async executarAcao(fn: () => Promise<void>) {
    this.salvando.set(true);
    try {
      await fn();
      this.ref.close(true);
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Erro ao atualizar status.', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }

  async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);

    const v = this.form.getRawValue();
    const data_hora = new Date(`${v.data}T${v.hora}`).toISOString();

    try {
      if (this.data.modo === 'criar') {
        await this.agendamentosStore.criar({
          servico_id: v.servico_id!,
          cliente_nome: v.cliente_nome!,
          cliente_wpp: v.cliente_wpp!,
          data_hora,
          status: 'pendente',
          observacoes: v.observacoes ?? undefined,
        });
        this.snack.open('Agendamento criado!', '', { duration: 2500 });
      } else {
        await this.agendamentosStore.atualizar(this.data.agendamento!.id, {
          servico_id: v.servico_id!,
          cliente_nome: v.cliente_nome!,
          cliente_wpp: v.cliente_wpp!,
          data_hora,
          observacoes: v.observacoes ?? '',
        });
        this.snack.open('Agendamento atualizado!', '', { duration: 2500 });
      }
      this.ref.close(true);
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Erro ao salvar agendamento.', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }

  async excluir() {
    if (!this.data.agendamento) return;
    this.salvando.set(true);
    try {
      await this.agendamentosStore.excluir(this.data.agendamento.id);
      this.snack.open('Agendamento excluído.', '', { duration: 2500 });
      this.ref.close(true);
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Erro ao excluir.', 'OK', { duration: 3000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
