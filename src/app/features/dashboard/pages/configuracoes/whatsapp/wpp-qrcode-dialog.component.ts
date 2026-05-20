import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-wpp-qrcode-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="qr-dialog">
      <div class="qr-header">
        <h2>Conectar WhatsApp</h2>
        <button
          type="button"
          class="btn-icon-close"
          (click)="fechar()"
          aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <ol class="qr-steps">
        <li>Abra o WhatsApp no celular</li>
        <li>Toque em <strong>Configurações → Aparelhos conectados</strong></li>
        <li>Toque em <strong>Conectar aparelho</strong> e aponte para o QR</li>
      </ol>

      <div class="qr-area">
        @if (loading()) {
          <div class="qr-loading">
            <mat-spinner diameter="48" />
            <span>Gerando QR Code…</span>
          </div>
        } @else if (erro()) {
          <div class="qr-erro">
            <mat-icon>error_outline</mat-icon>
            <p>{{ erro() }}</p>
          </div>
        } @else if (qrCode()) {
          <img
            [src]="'data:image/png;base64,' + qrCode()"
            alt="QR Code WhatsApp"
            class="qr-image" />
          <p class="qr-hint">O QR Code expira em alguns segundos — toque em atualizar se necessário.</p>
        }
      </div>

      <div class="qr-acoes">
        <button type="button" class="btn-ghost" (click)="fechar()">
          Cancelar
        </button>
        <button
          type="button"
          class="btn-primary"
          [disabled]="loading()"
          (click)="gerarQrCode()">
          <mat-icon>refresh</mat-icon>
          Atualizar QR
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .qr-dialog {
      padding: 20px;
      max-width: 380px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .qr-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      color: #0F172A;
      letter-spacing: -0.2px;
    }

    .btn-icon-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: grid;
      place-items: center;
      color: #64748B;

      &:hover { background: #F1F5F9; color: #0F172A; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .qr-steps {
      margin: 0;
      padding-left: 20px;
      font: 400 13px 'Inter', sans-serif;
      color: #475569;
      line-height: 1.55;

      li { margin-bottom: 2px; }
      strong { color: #0F172A; font-weight: 600; }
    }

    .qr-area {
      min-height: 260px;
      display: grid;
      place-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
    }

    .qr-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748B;
      font: 400 13px 'Inter';
    }

    .qr-erro {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #DC2626;
      text-align: center;

      mat-icon { font-size: 32px; width: 32px; height: 32px; }
      p { margin: 0; font: 400 13px 'Inter'; line-height: 1.5; }
    }

    .qr-image {
      width: 232px;
      height: 232px;
      border-radius: 8px;
      background: #fff;
    }

    .qr-hint {
      margin: 8px 0 0;
      font: 400 12px 'Inter';
      color: #94A3B8;
      text-align: center;
    }

    .qr-acoes {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn-ghost, .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font: 600 13px 'Inter', sans-serif;
      transition: background 0.15s ease;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .btn-ghost {
      background: transparent;
      color: #475569;
      &:hover { background: #F1F5F9; }
    }

    .btn-primary {
      background: #1D9E75;
      color: #fff;
      &:hover:not(:disabled) { background: #178A65; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    @media (max-width: 480px) {
      .qr-dialog { padding: 16px; }
      .qr-image { width: 200px; height: 200px; }
    }
  `],
})
export class WppQrcodeDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<WppQrcodeDialogComponent>);
  private api = inject(ApiService);

  readonly loading = signal(true);
  readonly qrCode = signal<string | null>(null);
  readonly erro = signal<string | null>(null);

  private statusTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    void this.gerarQrCode();
    // Verifica status a cada 4s — fecha o dialog quando conectar
    this.statusTimer = setInterval(() => void this.checarStatus(), 4000);
  }

  ngOnDestroy(): void {
    if (this.statusTimer) clearInterval(this.statusTimer);
  }

  async gerarQrCode(): Promise<void> {
    this.loading.set(true);
    this.erro.set(null);
    this.qrCode.set(null);
    try {
      const r = await this.api.post<{ qrCode: string }>('/api/whatsapp/qr-code', {});
      this.qrCode.set(r.qrCode);
    } catch (e: unknown) {
      const msg = this.extrairMensagem(e);
      this.erro.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  private async checarStatus(): Promise<void> {
    try {
      const r = await this.api.get<{ status: string }>('/api/whatsapp/status');
      if (r.status === 'conectado') {
        this.dialogRef.close({ status: 'conectado' });
      }
    } catch {
      // Silencioso — polling pode falhar enquanto Z-API ainda não respondeu
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }

  private extrairMensagem(e: unknown): string {
    if (typeof e === 'object' && e !== null) {
      const obj = e as { error?: { message?: string }; message?: string };
      return (
        obj.error?.message ??
        obj.message ??
        'Não foi possível gerar o QR Code. Verifique as credenciais.'
      );
    }
    return 'Não foi possível gerar o QR Code.';
  }
}
