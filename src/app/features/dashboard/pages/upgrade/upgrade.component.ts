import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { currentUser } from '@core/signals/app.signals';
import { Plano } from '@core/types/database.types';
import { PLANOS_CATALOGO, PLANO_CHIPS_LEGENDA, PlanoCatalogo } from '@core/data/planos.catalog';
import { PlanosRepository } from '@core/repositories/planos.repository';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './upgrade.component.html',
  styleUrl: './upgrade.component.scss',
})
export class UpgradeComponent implements OnInit {
  private snack    = inject(MatSnackBar);
  private location = inject(Location);
  private planosRepo = inject(PlanosRepository);

  readonly user     = currentUser;
  readonly planos   = PLANOS_CATALOGO;
  readonly legenda  = PLANO_CHIPS_LEGENDA;

  readonly carregando   = signal(true);
  readonly selecionado  = signal<Plano | null>(null);
  readonly expandido    = signal<Plano | null>(null);
  readonly enviando     = signal(false);

  readonly planoAtual = computed<Plano>(() => this.user()?.plano ?? 'gratis');

  readonly linkPublico = computed<string>(
    () => `${APP.URL_BASE}/${this.user()?.slug ?? ''}`,
  );

  readonly podeContinuar = computed(() => {
    const sel = this.selecionado();
    return sel !== null && sel !== this.planoAtual();
  });

  async ngOnInit(): Promise<void> {
    try {
      const cat = await this.planosRepo.catalogo();
      // Pré-seleciona o plano imediatamente acima do atual, se houver
      const idxAtual = this.planos.findIndex(p => p.id === cat.atual);
      const sugerido = this.planos[idxAtual + 1] ?? null;
      if (sugerido && sugerido.id !== cat.atual) {
        this.selecionado.set(sugerido.id);
        this.expandido.set(sugerido.id);
      }
    } catch (err) {
      console.error('[Upgrade] erro ao carregar catálogo:', err);
      // Funciona offline com o catálogo do front; sem bloquear UI.
    } finally {
      this.carregando.set(false);
    }
  }

  selecionar(planoId: Plano): void {
    this.selecionado.set(planoId);
  }

  toggleExpand(planoId: Plano, ev?: Event): void {
    ev?.stopPropagation();
    this.expandido.set(this.expandido() === planoId ? null : planoId);
  }

  isAtual(plano: PlanoCatalogo): boolean {
    return plano.id === this.planoAtual();
  }

  voltar(): void {
    this.location.back();
  }

  async continuar(): Promise<void> {
    const planoId = this.selecionado();
    if (!planoId || planoId === this.planoAtual()) return;

    this.enviando.set(true);
    try {
      const res = await this.planosRepo.iniciarUpgrade(planoId);
      this.snack.open(res.mensagem, 'OK', { duration: 5000 });
    } catch (err) {
      console.error('[Upgrade] erro ao iniciar upgrade:', err);
      this.snack.open(
        'Não foi possível registrar sua solicitação. Tente novamente.',
        'OK',
        { duration: 4000 },
      );
    } finally {
      this.enviando.set(false);
    }
  }
}
