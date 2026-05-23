import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { WppStatus } from '@core/types/database.types';
import {
  EditCredentialsDialogComponent,
  EditCredentialsDialogData,
} from './edit-credentials-dialog.component';
import {
  EditPerfilDialogComponent,
  EditPerfilDialogData,
} from './edit-perfil-dialog.component';
import { CriarProfissionalDialogComponent } from './criar-profissional-dialog.component';
import {
  ConfirmDestrutivoDialogComponent,
  ConfirmDestrutivoData,
} from './confirm-destrutivo-dialog.component';

interface ProfissionalAdmin {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string;
  foto_url: string | null;
  bio: string | null;
  wpp_instance_id: string | null;
  wpp_status: WppStatus;
  tem_token: boolean;
  ativo: boolean;
  created_at: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly profissionais = signal<ProfissionalAdmin[]>([]);
  readonly mostrarInativos = signal(false);
  readonly menuAberto = signal<string | null>(null);

  readonly ativos = computed(() => this.profissionais().filter((p) => p.ativo));
  readonly inativos = computed(() => this.profissionais().filter((p) => !p.ativo));

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.api.get<ProfissionalAdmin[]>(
        '/api/admin/profissionais?incluirInativos=true',
      );
      this.profissionais.set(lista);
    } catch {
      this.snack.open('Erro ao carregar profissionais', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  toggleMenu(id: string): void {
    this.menuAberto.set(this.menuAberto() === id ? null : id);
  }

  fecharMenu(): void {
    this.menuAberto.set(null);
  }

  iniciais(nome: string): string {
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  urlPublica(slug: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/${slug}`;
  }

  statusLabel(status: WppStatus): string {
    const labels: Record<WppStatus, string> = {
      conectado: 'Conectado',
      conectando: 'Conectando',
      desconectado: 'Desconectado',
      erro: 'Erro',
    };
    return labels[status] ?? status;
  }

  statusClass(status: WppStatus): string {
    if (status === 'conectado') return 'pill pill--ok';
    if (status === 'erro') return 'pill pill--erro';
    if (status === 'conectando') return 'pill pill--neutro';
    return 'pill pill--neutro';
  }

  async novoProfissional(): Promise<void> {
    this.fecharMenu();
    const ref = this.dialog.open(CriarProfissionalDialogComponent, {
      panelClass: 'ios-dialog-panel',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const criado = await ref.afterClosed().toPromise();
    if (criado) await this.carregar();
  }

  async editarPerfil(prof: ProfissionalAdmin): Promise<void> {
    this.fecharMenu();
    const data: EditPerfilDialogData = {
      id: prof.id,
      nome: prof.nome,
      slug: prof.slug,
      bio: prof.bio,
      foto_url: prof.foto_url,
    };
    const ref = this.dialog.open(EditPerfilDialogComponent, {
      data,
      panelClass: 'ios-dialog-panel',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const salvo = await ref.afterClosed().toPromise();
    if (salvo) await this.carregar();
  }

  async editarCredenciais(prof: ProfissionalAdmin): Promise<void> {
    this.fecharMenu();
    let wpp_token: string | null = null;
    try {
      const detalhe = await this.api.get<{ wpp_token: string | null }>(
        `/api/admin/profissionais/${prof.id}`,
      );
      wpp_token = detalhe.wpp_token;
    } catch {
      this.snack.open('Erro ao carregar credenciais', 'OK', { duration: 3000 });
      return;
    }

    const data: EditCredentialsDialogData = {
      id: prof.id,
      nome: prof.nome,
      wpp_instance_id: prof.wpp_instance_id,
      wpp_token,
    };
    const ref = this.dialog.open(EditCredentialsDialogComponent, {
      data,
      width: '420px',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const saved = await ref.afterClosed().toPromise();
    if (saved) await this.carregar();
  }

  async arquivar(prof: ProfissionalAdmin): Promise<void> {
    this.fecharMenu();
    const data: ConfirmDestrutivoData = {
      titulo: 'Arquivar profissional',
      mensagem:
        'O perfil ficará oculto e a URL pública deixará de funcionar. Os dados (agendamentos, clientes) são preservados e o perfil pode ser restaurado depois.',
      labelConfirmacao: `Digite o slug para confirmar`,
      textoConfirmacao: prof.slug,
      botaoAcao: 'Arquivar',
    };
    const ref = this.dialog.open(ConfirmDestrutivoDialogComponent, {
      data,
      panelClass: 'ios-dialog-panel',
      maxWidth: '95vw',
      autoFocus: false,
    });
    const ok = await ref.afterClosed().toPromise();
    if (!ok) return;

    try {
      await this.api.delete(`/api/admin/profissionais/${prof.id}`);
      this.snack.open('Profissional arquivado', 'OK', { duration: 2000 });
      await this.carregar();
    } catch (e: unknown) {
      const err = e as { error?: { message?: string }; message?: string };
      this.snack.open(
        err?.error?.message ?? err?.message ?? 'Erro ao arquivar',
        'OK',
        { duration: 3000 },
      );
    }
  }

  async restaurar(prof: ProfissionalAdmin): Promise<void> {
    this.fecharMenu();
    try {
      await this.api.post(`/api/admin/profissionais/${prof.id}/restaurar`, {});
      this.snack.open('Profissional restaurado', 'OK', { duration: 2000 });
      await this.carregar();
    } catch (e: unknown) {
      const err = e as { error?: { message?: string }; message?: string };
      this.snack.open(
        err?.error?.message ?? err?.message ?? 'Erro ao restaurar',
        'OK',
        { duration: 3000 },
      );
    }
  }
}
