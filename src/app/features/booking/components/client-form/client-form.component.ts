import { Component, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { limparWhatsApp, whatsAppValido, formatarWhatsApp } from '@core/utils/whatsapp.util';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="step">
      <div class="step-header">
        <button class="btn-voltar" (click)="voltou.emit()">← Voltar</button>
        <h2 class="step-titulo">Seus dados</h2>
      </div>

      <form (ngSubmit)="confirmar()" #form="ngForm">
        <div class="campo" [class.erro]="nomeInvalido()">
          <label class="campo-label" for="nome">Nome completo</label>
          <input
            id="nome"
            class="campo-input"
            type="text"
            placeholder="Seu nome"
            [(ngModel)]="nome"
            name="nome"
            autocomplete="name"
          />
          @if (nomeInvalido()) {
            <span class="campo-erro">Por favor, informe seu nome.</span>
          }
        </div>

        <div class="campo" [class.erro]="wppInvalido()">
          <label class="campo-label" for="wpp">
            <span class="flag-br">🇧🇷</span> WhatsApp
          </label>
          <input
            id="wpp"
            class="campo-input"
            type="tel"
            placeholder="(00) 00000-0000"
            [value]="wppFormatado"
            (input)="onWppInput($event)"
            name="wpp"
            autocomplete="tel"
            maxlength="15"
          />
          @if (wppInvalido()) {
            <span class="campo-erro">Informe um WhatsApp válido com DDD.</span>
          }
        </div>

        <button type="submit" class="btn-confirmar">
          Revisar agendamento →
        </button>
      </form>
    </div>
  `,
  styles: [`
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .step-titulo {
      font-size: 16px;
      font-weight: 600;
      color: var(--booking-text, #212529);
      margin: 0;
    }

    .btn-voltar {
      background: none;
      border: none;
      color: var(--booking-primary, #1D9E75);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .campo {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .campo-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--booking-text, #212529);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .flag-br {
      font-size: 16px;
    }

    .campo-input {
      padding: 12px 14px;
      border: 1.5px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius, 8px);
      font-size: 15px;
      color: var(--booking-text, #212529);
      background: #fff;
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;

      &:focus {
        border-color: var(--booking-primary, #1D9E75);
      }
    }

    .campo.erro .campo-input {
      border-color: #E11D48;
    }

    .campo-erro {
      font-size: 12px;
      color: #E11D48;
    }

    .btn-confirmar {
      padding: 14px;
      background: var(--booking-primary, #1D9E75);
      color: #fff;
      border: none;
      border-radius: var(--booking-radius, 8px);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover { opacity: 0.9; }
    }
  `],
})
export class ClientFormComponent {
  @Output() confirmou = new EventEmitter<{ nome: string; wpp: string }>();
  @Output() voltou    = new EventEmitter<void>();

  nome = '';
  wppRaw = '';
  get wppFormatado(): string { return formatarWhatsApp(this.wppRaw); }

  readonly nomeInvalido = signal(false);
  readonly wppInvalido  = signal(false);

  onWppInput(event: Event): void {
    const raw = limparWhatsApp((event.target as HTMLInputElement).value);
    this.wppRaw = raw.slice(0, 11);
    (event.target as HTMLInputElement).value = formatarWhatsApp(this.wppRaw);
  }

  confirmar(): void {
    this.nomeInvalido.set(!this.nome.trim());
    this.wppInvalido.set(!whatsAppValido(this.wppRaw));
    if (this.nomeInvalido() || this.wppInvalido()) return;
    this.confirmou.emit({ nome: this.nome.trim(), wpp: this.wppRaw });
  }
}
