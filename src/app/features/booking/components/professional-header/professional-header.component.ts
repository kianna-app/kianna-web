import { Component, Input } from '@angular/core';
import { Profissional } from '@core/types/database.types';

@Component({
  selector: 'app-professional-header',
  standalone: true,
  template: `
    @if (profissional) {
      <div class="prof-header">
        <div class="prof-avatar">
          @if (profissional.foto_url) {
            <img [src]="profissional.foto_url" [alt]="profissional.nome" />
          } @else {
            <span class="avatar-initials">{{ iniciais }}</span>
          }
        </div>
        <div class="prof-info">
          <h1 class="prof-nome">{{ profissional.nome }}</h1>
          @if (profissional.especialidade) {
            <p class="prof-especialidade">{{ profissional.especialidade }}</p>
          }
          @if (profissional.bio) {
            <p class="prof-bio">{{ profissional.bio }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .prof-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 0 20px 22px;
      background: #fff;
      text-align: center;
    }

    .prof-avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--booking-primary-light, #e8f5f0);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 6px solid #fff;
      box-shadow: 0 10px 24px rgba(31, 44, 55, 0.12);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .avatar-initials {
      font-size: 28px;
      font-weight: 700;
      color: var(--booking-primary, #1D9E75);
    }

    .prof-info {
      flex: 1;
      min-width: 0;
      max-width: 720px;
    }

    .prof-nome {
      font-size: 24px;
      line-height: 1.12;
      font-weight: 700;
      margin: 0 0 4px;
      color: var(--booking-primary, #1D9E75);
    }

    .prof-especialidade {
      font-size: 14px;
      color: var(--booking-text, #212529);
      font-weight: 500;
      margin: 0 0 6px;
    }

    .prof-bio {
      font-size: 14px;
      line-height: 1.45;
      color: var(--booking-muted, #6c757d);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 639px) {
      .prof-header {
        padding: 0 18px 18px;
      }

      .prof-avatar {
        width: 104px;
        height: 104px;
        margin-top: -6px;
      }
    }
  `],
})
export class ProfessionalHeaderComponent {
  @Input() profissional: Profissional | null = null;

  get iniciais(): string {
    return (this.profissional?.nome ?? '')
      .split(' ')
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase();
  }
}
