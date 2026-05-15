import { Component, ChangeDetectorRef, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgendamentosStore } from '../../state/agendamentos.store';
import { ServicosStore } from '../../state/servicos.store';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';
import { StatusAgend } from '@core/types/database.types';

@Component({
  selector: 'app-agendamento-detalhe',
  standalone: true,
  imports: [
    CommonModule, DatePipe, TitleCasePipe,
    ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './agendamento-detalhe.component.html',
  styleUrl: './agendamento-detalhe.component.scss',
})
export class AgendamentoDetalheComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private fb      = inject(FormBuilder);
  private snack   = inject(MatSnackBar);
  private cdr     = inject(ChangeDetectorRef);
  private agStore = inject(AgendamentosStore);
  private svStore = inject(ServicosStore);
  private agRepo  = inject(AgendamentosRepository);

  loading            = signal(false);
  salvando           = signal(false);
  mostrarCampoMotivo = signal(false);
  motivoRecusa       = signal('');
  editarExpandido    = signal(false);

  agendamento = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.agStore.agendamentos().find(a => a.id === id) ?? null;
  });

  servicos = computed(() => this.svStore.servicos().filter(s => s.ativo));

  form = this.fb.group({
    servico_id:   ['', Validators.required],
    data_hora:    ['', Validators.required],
    cliente_nome: ['', Validators.required],
    cliente_wpp:  ['', Validators.required],
    observacoes:  [''],
  });

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      if (!this.svStore.servicos().length) await this.svStore.carregar();
      if (!this.agStore.agendamentos().length) {
        const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
        const fim = new Date(inicio); fim.setDate(fim.getDate() + 30); fim.setHours(23, 59, 59, 999);
        await this.agStore.carregarPeriodo(inicio, fim);
      }

      const ag = this.agendamento();
      if (!ag) { this.router.navigate(['/dashboard/agenda']); return; }

      // datetime-local precisa de YYYY-MM-DDTHH:mm sem TZ
      const dh = new Date(ag.data_hora);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dataHoraLocal =
        `${dh.getFullYear()}-${pad(dh.getMonth() + 1)}-${pad(dh.getDate())}T${pad(dh.getHours())}:${pad(dh.getMinutes())}`;

      this.form.patchValue({
        servico_id:   ag.servico_id ?? '',
        data_hora:    dataHoraLocal,
        cliente_nome: ag.cliente_nome,
        cliente_wpp:  ag.cliente_wpp,
        observacoes:  ag.observacoes ?? '',
      });
      this.form.markAllAsTouched();
    } finally {
      this.loading.set(false);
      this.cdr.detectChanges();
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard/agenda']);
  }

  async salvarEdicao(): Promise<void> {
    if (this.form.invalid) return;
    this.salvando.set(true);
    try {
      const ag = this.agendamento();
      if (!ag) return;
      const v = this.form.value;
      const dataHoraISO = v.data_hora ? new Date(v.data_hora).toISOString() : undefined;
      const payload = {
        ...(v.servico_id   ? { servico_id:   v.servico_id }   : {}),
        ...(dataHoraISO    ? { data_hora:    dataHoraISO }    : {}),
        ...(v.cliente_nome ? { cliente_nome: v.cliente_nome } : {}),
        ...(v.cliente_wpp  ? { cliente_wpp:  v.cliente_wpp }  : {}),
        observacoes: v.observacoes ?? '',
      };
      await this.agRepo.atualizar(ag.id, payload);
      const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
      const fim = new Date(inicio); fim.setDate(fim.getDate() + 30); fim.setHours(23, 59, 59, 999);
      await this.agStore.carregarPeriodo(inicio, fim);
      this.snack.open('Agendamento atualizado.', '', { duration: 3000 });
      this.voltar();
    } catch (e) {
      console.error(e);
      this.snack.open('Erro ao salvar. Tente novamente.', '', { duration: 4000 });
    } finally {
      this.salvando.set(false);
    }
  }

  confirmar()           { return this.executarAcao('confirmado'); }
  cancelar()            { return this.executarAcao('cancelado'); }
  naoCompareceu()       { return this.executarAcao('nao_compareceu'); }
  confirmarRecusa()     { return this.executarAcao('recusado', this.motivoRecusa()); }

  reagendar(): void {
    const ag = this.agendamento();
    if (!ag) return;
    const slug = currentUser()?.slug ?? '';
    const link = `${APP.URL_BASE}/${slug}?reagendar=${ag.id}`;
    navigator.clipboard.writeText(link)
      .then(() => this.snack.open('Link de reagendamento copiado!', 'OK', { duration: 4000 }))
      .catch(() => this.snack.open('Não foi possível copiar o link.', 'OK', { duration: 4000 }));
  }

  private async executarAcao(status: StatusAgend, motivo?: string): Promise<void> {
    const ag = this.agendamento();
    if (!ag) return;
    this.salvando.set(true);
    try {
      await this.agRepo.atualizarStatus(ag.id, status, motivo);
      this.agStore.atualizarStatusLocal(ag.id, status);
      this.snack.open('Status atualizado.', '', { duration: 3000 });
      this.voltar();
    } catch (e) {
      console.error(e);
      this.snack.open('Erro ao atualizar. Tente novamente.', '', { duration: 4000 });
    } finally {
      this.salvando.set(false);
    }
  }
}
