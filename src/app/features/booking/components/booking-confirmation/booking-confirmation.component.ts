import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Profissional, Servico } from '@core/types/database.types';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="conf">

      <!-- Ícone de sucesso -->
      <div class="conf-icon-ring">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 class="conf-titulo">Agendamento realizado!</h2>
      <p class="conf-desc">Seu agendamento foi solicitado com sucesso.</p>

      <!-- Status badge -->
      <div class="conf-status">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Aguardando confirmação do profissional
      </div>

      <!-- Card resumo -->
      <div class="conf-resumo">
        <p class="conf-resumo-label">Resumo do agendamento</p>

        @if (clienteNome) {
          <div class="conf-linha">
            <span class="conf-key">Cliente</span>
            <span class="conf-val">{{ clienteNome }}</span>
          </div>
        }

        <div class="conf-linha">
          <span class="conf-key">Serviço</span>
          <span class="conf-val">{{ servico?.nome ?? '—' }}</span>
        </div>

        <div class="conf-linha">
          <span class="conf-key">Profissional</span>
          <span class="conf-val">{{ profissional?.nome }}</span>
        </div>

        <div class="conf-linha">
          <span class="conf-key">Data</span>
          <span class="conf-val">{{ dataFormatada }}</span>
        </div>

        <div class="conf-linha">
          <span class="conf-key">Horário</span>
          <span class="conf-val">{{ horaFormatada }}</span>
        </div>

        @if (servico?.duracao_min) {
          <div class="conf-linha">
            <span class="conf-key">Duração</span>
            <span class="conf-val">{{ servico!.duracao_min }} min</span>
          </div>
        }

        @if (servico?.preco) {
          <div class="conf-linha conf-linha--destaque">
            <span class="conf-key">Valor</span>
            <span class="conf-val conf-val--preco">R$ {{ servico!.preco | number:'1.2-2' }}</span>
          </div>
        }
      </div>

      <!-- Botões de ação -->
      <div class="conf-acoes">
        @if (linkGoogleAgenda) {
          <a class="conf-btn conf-btn--agenda" [href]="linkGoogleAgenda"
             target="_blank" rel="noopener noreferrer">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Adicionar ao Google Agenda
          </a>
        }
        @if (linkWpp) {
          <a class="conf-btn conf-btn--wpp" [href]="linkWpp"
             target="_blank" rel="noopener noreferrer">
            <svg width="17" height="17" viewBox="0 0 28 28" fill="currentColor">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 2.47.643 4.793 1.77 6.803L0 28l7.363-1.737A13.94 13.94 0 0014 28c7.732 0 14-6.268 14-14S21.732 0 14 0zm7.38 19.77c-.31.87-1.54 1.6-2.52 1.81-.67.14-1.55.25-4.51-1.01-3.79-1.59-6.23-5.42-6.42-5.67-.19-.25-1.55-2.06-1.55-3.93s.98-2.77 1.33-3.15c.35-.38.76-.48 1.01-.48.25 0 .5.002.72.012.23.01.54-.087.85.648.31.74 1.05 2.55 1.14 2.74.09.19.15.41.03.66-.12.25-.18.4-.35.62-.17.22-.36.49-.51.66-.17.19-.35.39-.15.77.2.38.89 1.47 1.91 2.38 1.31 1.17 2.42 1.53 2.76 1.7.34.17.54.14.74-.08.2-.22.85-.99 1.08-1.33.23-.34.46-.28.77-.17.31.11 1.97.93 2.31 1.1.34.17.57.25.65.39.08.14.08.82-.23 1.69z"/>
            </svg>
            Compartilhar via WhatsApp
          </a>
        }
      </div>

    </div>
  `,
  styles: [`
    .conf {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 8px 0 16px;
      text-align: center;
    }

    /* Ícone de sucesso */
    .conf-icon-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1D9E75, #3FB58A);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(29,158,117,0.3);
      margin-bottom: 4px;
    }

    /* Título e descrição */
    .conf-titulo {
      font-size: 22px;
      font-weight: 700;
      color: #0B0F19;
      margin: 0;
      letter-spacing: -.4px;
    }

    .conf-desc {
      font-size: 14px;
      color: #6c757d;
      margin: -4px 0 0;
    }

    /* Status badge */
    .conf-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      background: #FEF3C7;
      color: #92400E;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #FDE68A;
    }

    /* Resumo */
    .conf-resumo {
      width: 100%;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 6px 0;
      margin-top: 4px;
      text-align: left;
    }

    .conf-resumo-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #94A3B8;
      margin: 10px 20px 6px;
    }

    .conf-linha {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      border-top: 1px solid #EEF0F4;

      &--destaque {
        background: #F0FDF8;
        border-top-color: #C7F0E2;
      }
    }

    .conf-key {
      font-size: 13px;
      color: #64748B;
    }

    .conf-val {
      font-size: 14px;
      font-weight: 500;
      color: #0B0F19;
      text-align: right;
    }

    .conf-val--preco {
      font-size: 15px;
      font-weight: 700;
      color: #1D9E75;
    }

    /* Botões */
    .conf-acoes {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 4px;
    }

    .conf-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all .15s;
      box-sizing: border-box;

      &--agenda {
        background: #fff;
        border: 1.5px solid #E2E8F0;
        color: #0B0F19;

        &:hover { border-color: #1D9E75; color: #1D9E75; background: #F0FDF8; }
      }

      &--wpp {
        background: #22C55E;
        color: #fff;
        border: 1.5px solid transparent;

        &:hover { background: #16A34A; }
      }
    }
  `],
})
export class BookingConfirmationComponent {
  @Input() profissional: Profissional | null = null;
  @Input() servico: Servico | null = null;
  @Input() dataHora: string | null = null;
  @Input() clienteNome = '';

  get dataFormatada(): string {
    if (!this.dataHora) return '—';
    return new Date(this.dataHora).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long',
    });
  }

  get horaFormatada(): string {
    if (!this.dataHora) return '—';
    return new Date(this.dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  get linkGoogleAgenda(): string {
    if (!this.servico || !this.dataHora) return '';
    const inicio = new Date(this.dataHora);
    const fim    = new Date(inicio.getTime() + this.servico.duracao_min * 60_000);
    const fmt    = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
      action:  'TEMPLATE',
      text:    `${this.servico.nome} com ${this.profissional?.nome ?? ''}`,
      dates:   `${fmt(inicio)}/${fmt(fim)}`,
      details: `Agendado via Kianna · kianna.com.br/${this.profissional?.slug ?? ''}`,
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  get linkWpp(): string {
    const num = (this.profissional?.whatsapp ?? '').replace(/\D/g, '');
    if (!num) return '';
    const data  = this.dataFormatada;
    const hora  = this.horaFormatada;
    const nome  = this.clienteNome ? `\nCliente: ${this.clienteNome}` : '';
    const svc   = this.servico?.nome ? `\nServiço: ${this.servico.nome}` : '';
    const msg   = `Olá, meu agendamento foi realizado e estou entrando em contato para confirmação.${nome}${svc}\nData: ${data} às ${hora}`;
    return `https://wa.me/55${num}?text=${encodeURIComponent(msg)}`;
  }
}
