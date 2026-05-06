import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HorariosStore } from '../../state/horarios.store';
import { DiaSemana, DisponibilidadeInput } from '@core/types/database.types';
import { DIAS_SEMANA } from '@core/constants/app.constants';

interface DiaConfig {
  dia: DiaSemana;
  label: string;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatSlideToggleModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent implements OnInit {
  protected store = inject(HorariosStore);
  private snack   = inject(MatSnackBar);

  readonly intervalos = [15, 30, 45, 60];
  readonly config          = signal<DiaConfig[]>(this.configPadrao());
  readonly temAlteracoes   = signal(false);

  readonly diasAtivosCount = computed(() => this.config().filter(c => c.ativo).length);
  readonly horasSemanais   = computed(() =>
    this.config()
      .filter(c => c.ativo)
      .reduce((acc, c) => acc + this.minutosEntre(c.hora_inicio, c.hora_fim) / 60, 0)
  );
  readonly slotsSemanais = computed(() =>
    this.config()
      .filter(c => c.ativo)
      .reduce((acc, c) => acc + Math.floor(this.minutosEntre(c.hora_inicio, c.hora_fim) / c.intervalo_min), 0)
  );

  ngOnInit(): void {
    this.store.carregar().then(() => {
      const existentes = this.store.disponibilidades();
      if (existentes.length === 0) return;

      const map = new Map(existentes.map(d => [d.dia_semana, d]));
      this.config.set(this.config().map(c => {
        const d = map.get(c.dia);
        return d ? {
          ...c, ativo: true,
          hora_inicio:   d.hora_inicio.slice(0, 5),
          hora_fim:      d.hora_fim.slice(0, 5),
          intervalo_min: d.intervalo_min,
        } : { ...c, ativo: false };
      }));
    });
  }

  private configPadrao(): DiaConfig[] {
    return DIAS_SEMANA.map(d => ({
      dia:          d.dia as DiaSemana,
      label:        d.label,
      ativo:        d.dia >= 1 && d.dia <= 5,
      hora_inicio:  '09:00',
      hora_fim:     '18:00',
      intervalo_min: 60,
    }));
  }

  private minutosEntre(inicio: string, fim: string): number {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    const diff = (hf * 60 + mf) - (hi * 60 + mi);
    return Math.max(0, diff);
  }

  toggleDia(dia: DiaSemana, ativo: boolean): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, ativo } : c));
    this.temAlteracoes.set(true);
  }

  atualizar<K extends keyof DiaConfig>(dia: DiaSemana, campo: K, valor: DiaConfig[K]): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, [campo]: valor } : c));
    this.temAlteracoes.set(true);
  }

  async salvar(): Promise<void> {
    const invalido = this.config().find(c => c.ativo && this.minutosEntre(c.hora_inicio, c.hora_fim) <= 0);
    if (invalido) {
      this.snack.open(`${invalido.label}: hora final deve ser maior que inicial`, 'OK', { duration: 3000 });
      return;
    }

    const inputs: DisponibilidadeInput[] = this.config()
      .filter(c => c.ativo)
      .map(c => ({
        dia_semana:    c.dia,
        hora_inicio:   c.hora_inicio,
        hora_fim:      c.hora_fim,
        intervalo_min: c.intervalo_min,
      }));

    try {
      await this.store.salvar(inputs);
      this.temAlteracoes.set(false);
      this.snack.open('Horários salvos com sucesso!', 'OK', { duration: 2500 });
    } catch (e: unknown) {
      this.snack.open(e instanceof Error ? e.message : 'Erro ao salvar', 'OK', { duration: 3000 });
    }
  }
}
