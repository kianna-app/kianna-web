import { Component, Input, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Profissional, Servico } from '@core/types/database.types';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="confirmacao">
      <div class="confirmacao-icon">✅</div>
      <h2 class="confirmacao-titulo">Agendamento solicitado!</h2>
      <p class="confirmacao-status">Aguardando confirmação do profissional</p>

      <div class="resumo-card">
        <div class="resumo-linha">
          <span class="resumo-label">Com</span>
          <span class="resumo-valor">{{ profissional?.nome }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Serviço</span>
          <span class="resumo-valor">{{ servico?.nome }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Data e hora</span>
          <span class="resumo-valor">{{ dataHora | date:"dd/MM/yyyy 'às' HH:mm" }}</span>
        </div>
        @if (clienteNome) {
          <div class="resumo-linha">
            <span class="resumo-label">Para</span>
            <span class="resumo-valor">{{ clienteNome }}</span>
          </div>
        }
      </div>

      <div class="acoes">
        @if (linkGoogleAgenda) {
          <a class="btn-agenda" [href]="linkGoogleAgenda" target="_blank">
            📅 Adicionar ao Google Agenda
          </a>
        }
        @if (linkWpp) {
          <a class="btn-wpp" [href]="linkWpp" target="_blank">
            💬 Falar pelo WhatsApp
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .confirmacao {
      text-align: center;
      padding: 32px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .confirmacao-icon {
      font-size: 56px;
    }

    .confirmacao-titulo {
      font-size: 20px;
      font-weight: 700;
      color: var(--booking-text, #212529);
      margin: 0;
    }

    .confirmacao-status {
      font-size: 13px;
      color: var(--booking-muted, #6c757d);
      margin: 0;
      padding: 6px 14px;
      background: #FEF3C7;
      border-radius: 20px;
      color: #92400E;
    }

    .resumo-card {
      width: 100%;
      background: var(--booking-surface, #f8f9fa);
      border: 1px solid var(--booking-border, #e9ecef);
      border-radius: var(--booking-radius-lg, 12px);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
      text-align: left;
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .resumo-label {
      font-size: 13px;
      color: var(--booking-muted, #6c757d);
    }

    .resumo-valor {
      font-size: 14px;
      font-weight: 500;
      color: var(--booking-text, #212529);
      text-align: right;
    }

    .acoes {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .btn-agenda, .btn-wpp {
      display: block;
      padding: 13px;
      border-radius: var(--booking-radius, 8px);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }

    .btn-agenda {
      background: #fff;
      border: 1.5px solid var(--booking-border, #e9ecef);
      color: var(--booking-text, #212529);
    }

    .btn-wpp {
      background: #25D366;
      color: #fff;
    }
  `],
})
export class BookingConfirmationComponent {
  @Input() profissional: Profissional | null = null;
  @Input() servico: Servico | null = null;
  @Input() dataHora: string | null = null;
  @Input() clienteNome = '';

  get linkGoogleAgenda(): string {
    if (!this.servico || !this.dataHora) return '';
    const inicio = new Date(this.dataHora);
    const fim    = new Date(inicio.getTime() + this.servico.duracao_min * 60_000);
    const fmt    = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
      action:  'TEMPLATE',
      text:    `${this.servico.nome} com ${this.profissional?.nome}`,
      dates:   `${fmt(inicio)}/${fmt(fim)}`,
      details: `Agendado via Kianna · kianna.com.br/${this.profissional?.slug}`,
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  get linkWpp(): string {
    const num = (this.profissional?.whatsapp ?? '').replace(/\D/g, '');
    if (!num) return '';
    return `https://wa.me/55${num}`;
  }
}
