import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { currentUser } from '@core/signals/app.signals';
import { AuthService } from '@core/auth/auth.service';
import { ProfissionaisRepository } from '@core/repositories/profissionais.repository';
import { APP } from '@core/constants/app.constants';
import { AppUser } from '@core/signals/app.signals';
import { Plano } from '@core/types/database.types';
import {
  PlanoCatalogo,
  planoCatalogo,
  proximoPlanoId,
} from '@core/data/planos.catalog';
import {
  ExcluirContaDialogComponent,
  ExcluirContaDialogData,
} from './excluir-conta-dialog.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private auth   = inject(AuthService);
  private snack  = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private profissionaisRepo = inject(ProfissionaisRepository);

  readonly user      = currentUser;
  readonly copiado   = signal(false);
  readonly carregando = signal(false);
  readonly excluindo  = signal(false);

  readonly planoAtual = computed<PlanoCatalogo>(
    () => planoCatalogo(this.user()?.plano ?? 'gratis'),
  );

  readonly proximoPlano = computed<PlanoCatalogo | null>(() => {
    const prox: Plano | null = proximoPlanoId(this.user()?.plano ?? 'gratis');
    return prox ? planoCatalogo(prox) : null;
  });

  readonly noPlanoMaximo = computed(() => this.proximoPlano() === null);

  get linkPublico(): string {
    return `${APP.URL_BASE}/${this.user()?.slug ?? ''}`;
  }

  async ngOnInit(): Promise<void> {
    // Recarrega perfil para garantir e-mail e dados frescos
    if (this.user() && !this.user()?.email) {
      try {
        const fresh = await this.profissionaisRepo.me();
        currentUser.set({ ...this.user(), ...(fresh as unknown as AppUser) });
      } catch (err) {
        console.warn('[Perfil] falha ao recarregar perfil:', err);
      }
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

  irParaUpgrade(): void {
    this.router.navigate(['/dashboard/upgrade']);
  }

  editarPerfil(): void {
    this.router.navigate(['/dashboard/configuracoes'], { queryParams: { aba: 'empresa' } });
  }

  alterarSenha(): void {
    this.router.navigate(['/dashboard/configuracoes'], { queryParams: { aba: 'seguranca' } });
  }

  async excluirConta(): Promise<void> {
    const email = this.user()?.email;
    if (!email) {
      this.snack.open('Não foi possível identificar seu e-mail. Recarregue a página.', 'OK', { duration: 3500 });
      return;
    }

    const ref = this.dialog.open<ExcluirContaDialogComponent, ExcluirContaDialogData, boolean>(
      ExcluirContaDialogComponent,
      {
        data: { email },
        width: '440px',
        maxWidth: '95vw',
        autoFocus: false,
      },
    );

    const confirmou = await firstValueFrom(ref.afterClosed());
    if (!confirmou) return;

    this.excluindo.set(true);
    try {
      await this.profissionaisRepo.excluirConta();
      this.snack.open('Conta desativada. Você foi desconectado.', 'OK', { duration: 4000 });
      await this.auth.signOut();
    } catch (err) {
      console.error('[Perfil] erro ao excluir conta:', err);
      this.snack.open('Não foi possível desativar a conta. Tente novamente.', 'OK', { duration: 4000 });
      this.excluindo.set(false);
    }
  }

  logout(): void { this.auth.signOut(); }
}
