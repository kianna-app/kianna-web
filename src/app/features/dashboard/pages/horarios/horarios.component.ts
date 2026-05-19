import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HorariosStore } from '../../state/horarios.store';
import { DiaSemana, DisponibilidadeInput } from '@core/types/database.types';
import { DIAS_SEMANA } from '@core/constants/app.constants';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { BloqueiosComponent } from './bloqueios/bloqueios.component';

interface DiaConfig {
  dia: DiaSemana;
  label: string;
  curto: string;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  intervalo_min: number;
}

const DEFAULT_INICIO = '09:00';
const DEFAULT_FIM = '18:00';
const DEFAULT_INTERVALO = 60;

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSlideToggleModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatTabsModule, MatTooltipModule,
    SkeletonComponent, BloqueiosComponent,
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class HorariosComponent implements OnInit {
  protected store = inject(HorariosStore);
  private snack   = inject(MatSnackBar);

  readonly intervalos = [15, 30, 45, 60];
  readonly config        = signal<DiaConfig[]>(this.configPadrao());
  readonly temAlteracoes = signal(false);
  readonly expanded      = signal<Record<number, boolean>>({});

  readonly resumoSemana = computed(() => {
    const ativos = this.config().filter(c => c.ativo).length;
    return { ativos, total: this.config().length };
  });

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
      curto:        d.curto,
      ativo:        d.dia >= 1 && d.dia <= 5,
      hora_inicio:  DEFAULT_INICIO,
      hora_fim:     DEFAULT_FIM,
      intervalo_min: DEFAULT_INTERVALO,
    }));
  }

  private minutosEntre(inicio: string, fim: string): number {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    return (hf * 60 + mf) - (hi * 60 + mi);
  }

  isCustomizado(c: DiaConfig): boolean {
    return c.ativo && (
      c.hora_inicio !== DEFAULT_INICIO ||
      c.hora_fim !== DEFAULT_FIM ||
      c.intervalo_min !== DEFAULT_INTERVALO
    );
  }

  isInvalido(c: DiaConfig): boolean {
    return c.ativo && this.minutosEntre(c.hora_inicio, c.hora_fim) <= 0;
  }

  toggleExpand(dia: DiaSemana): void {
    this.expanded.update(e => ({ ...e, [dia]: !e[dia] }));
  }

  toggleDia(dia: DiaSemana, ativo: boolean): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, ativo } : c));
    this.temAlteracoes.set(true);
  }

  atualizar<K extends keyof DiaConfig>(dia: DiaSemana, campo: K, valor: DiaConfig[K]): void {
    this.config.update(arr => arr.map(c => c.dia === dia ? { ...c, [campo]: valor } : c));
    this.temAlteracoes.set(true);
  }

  copiarParaTodos(origem: DiaSemana): void {
    const ref = this.config().find(c => c.dia === origem);
    if (!ref) return;
    this.config.update(arr => arr.map(c => c.dia === origem ? c : {
      ...c,
      ativo: true,
      hora_inicio:   ref.hora_inicio,
      hora_fim:      ref.hora_fim,
      intervalo_min: ref.intervalo_min,
    }));
    this.temAlteracoes.set(true);
    this.snack.open('Aplicado a todos os dias', 'OK', { duration: 2000 });
  }

  copiarParaUteis(origem: DiaSemana): void {
    const ref = this.config().find(c => c.dia === origem);
    if (!ref) return;
    this.config.update(arr => arr.map(c => (c.dia >= 1 && c.dia <= 5 && c.dia !== origem) ? {
      ...c,
      ativo: true,
      hora_inicio:   ref.hora_inicio,
      hora_fim:      ref.hora_fim,
      intervalo_min: ref.intervalo_min,
    } : c));
    this.temAlteracoes.set(true);
    this.snack.open('Aplicado aos dias úteis', 'OK', { duration: 2000 });
  }

  async salvar(): Promise<void> {
    const invalido = this.config().find(c => this.isInvalido(c));
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
