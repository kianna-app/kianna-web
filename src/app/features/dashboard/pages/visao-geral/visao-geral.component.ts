import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstatisticasRepository, EstatisticasDashboard } from '@core/repositories/estatisticas.repository';
import { currentUser } from '@core/signals/app.signals';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent implements OnInit {
  private repo = inject(EstatisticasRepository);
  private snack = inject(MatSnackBar);

  readonly user = currentUser;
  readonly carregando = signal(true);
  readonly stats = signal<EstatisticasDashboard | null>(null);
  readonly copiado = signal(false);

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  get saudacao(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.repo.carregarDashboard();
      this.stats.set(data);
    } catch {
      this.snack.open('Erro ao carregar dados', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  async copiarLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.linkPublico);
      this.copiado.set(true);
      this.snack.open('Link copiado!', 'OK', { duration: 2000 });
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.snack.open('Não foi possível copiar', 'OK', { duration: 2000 });
    }
  }

  abrirLink(): void {
    window.open(this.linkPublico, '_blank');
  }
}
