import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '@core/services/api.service';
import { WppStatus } from '@core/types/database.types';
import {
  EditCredentialsDialogComponent,
  EditCredentialsDialogData,
} from './edit-credentials-dialog.component';

interface ProfissionalAdmin {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string;
  wpp_instance_id: string | null;
  wpp_status: WppStatus;
  tem_token: boolean;
  created_at: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly carregando = signal(true);
  readonly profissionais = signal<ProfissionalAdmin[]>([]);

  readonly colunas = ['nome', 'whatsapp', 'status', 'credenciais', 'acoes'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.api.get<ProfissionalAdmin[]>('/api/admin/profissionais');
      this.profissionais.set(lista);
    } catch {
      this.snack.open('Erro ao carregar profissionais', 'OK', { duration: 3000 });
    } finally {
      this.carregando.set(false);
    }
  }

  async abrirEdicao(prof: ProfissionalAdmin): Promise<void> {
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
    if (saved) {
      await this.carregar();
    }
  }

  statusClass(status: WppStatus): string {
    if (status === 'conectado') return 'badge badge--ok';
    if (status === 'erro') return 'badge badge--erro';
    return 'badge badge--neutro';
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
}
