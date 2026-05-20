import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, AppUser } from '@core/signals/app.signals';
import { ApiService } from '@core/services/api.service';
import { LEMBRETE_OPTIONS } from '@core/constants/app.constants';
import { WppStatus } from '@core/types/database.types';
import { WppQrcodeDialogComponent } from './wpp-qrcode-dialog.component';

const STATUS_LABEL: Record<WppStatus, string> = {
  conectado:    'WhatsApp conectado',
  conectando:   'Conectando…',
  desconectado: 'WhatsApp não conectado',
  erro:         'Erro na conexão',
};

@Component({
  selector: 'app-cfg-whatsapp',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatSlideToggleModule,
    LoadingButtonComponent,
  ],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.scss',
})
export class WhatsappComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private api = inject(ApiService);

  readonly user = currentUser;
  readonly salvando = signal(false);
  readonly desconectando = signal(false);
  readonly lembreteOptions = LEMBRETE_OPTIONS;

  readonly status = computed<WppStatus>(() => this.user()?.wpp_status ?? 'desconectado');
  readonly statusLabel = computed(() => STATUS_LABEL[this.status()]);
  readonly conectado = computed(() => this.status() === 'conectado');
  readonly podeConectar = computed(() => {
    const u = this.user();
    return !!(u?.wpp_instance_id && u?.wpp_token);
  });

  form = this.fb.group({
    wpp_instance_id:           [''],
    wpp_token:                 [''],
    lembrete_horas:            [null as number | null],
    cancelamento_auto_cliente: [true],
  });

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;
    this.form.patchValue({
      wpp_instance_id:           u.wpp_instance_id ?? '',
      wpp_token:                 u.wpp_token ?? '',
      lembrete_horas:            u.lembrete_horas ?? null,
      cancelamento_auto_cliente: u.cancelamento_auto_cliente ?? true,
    });
  }

  async salvar(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.salvando.set(true);
    try {
      const v = this.form.getRawValue();
      const updates: Record<string, unknown> = {
        wpp_instance_id:           v.wpp_instance_id?.trim() || null,
        wpp_token:                 v.wpp_token?.trim() || null,
        lembrete_horas:            v.lembrete_horas,
        cancelamento_auto_cliente: !!v.cancelamento_auto_cliente,
      };

      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', u.id)
        .select()
        .single();
      if (error) throw error;

      currentUser.set({ ...u, ...data } as AppUser);
      this.snack.open('Configurações salvas', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(
        e instanceof Error ? e.message : 'Erro ao salvar',
        'OK',
        { duration: 3000 },
      );
    } finally {
      this.salvando.set(false);
    }
  }

  async conectarWhatsApp(): Promise<void> {
    if (!this.podeConectar()) {
      this.snack.open('Salve o Instance ID e Token antes de conectar', 'OK', { duration: 2500 });
      return;
    }

    const ref = this.dialog.open(WppQrcodeDialogComponent, {
      panelClass: 'wpp-qr-dialog-panel',
      width: '420px',
      maxWidth: '95vw',
      autoFocus: false,
    });

    const result = await ref.afterClosed().toPromise() as { status?: WppStatus } | undefined;

    if (result?.status === 'conectado') {
      const u = this.user();
      if (u) currentUser.set({ ...u, wpp_status: 'conectado' });
      this.snack.open('WhatsApp conectado!', 'OK', { duration: 2500 });
    } else {
      // Mesmo sem confirmar conectado, atualiza estado local do banco
      await this.recarregarStatus();
    }
  }

  async desconectar(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.desconectando.set(true);
    try {
      await this.api.post<{ status: WppStatus }>('/api/whatsapp/desconectar', {});
      currentUser.set({ ...u, wpp_status: 'desconectado' });
      this.snack.open('WhatsApp desconectado', 'OK', { duration: 2000 });
    } catch (e: unknown) {
      this.snack.open(
        e instanceof Error ? e.message : 'Erro ao desconectar',
        'OK',
        { duration: 3000 },
      );
    } finally {
      this.desconectando.set(false);
    }
  }

  private async recarregarStatus(): Promise<void> {
    const u = this.user();
    if (!u || !u.wpp_instance_id) return;
    try {
      const r = await this.api.get<{ status: WppStatus }>('/api/whatsapp/status');
      currentUser.set({ ...u, wpp_status: r.status });
    } catch {
      // silencioso — falha aqui não bloqueia o usuário
    }
  }
}
