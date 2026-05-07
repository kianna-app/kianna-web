import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-header-publico',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './header-publico.component.html',
  styleUrl: './header-publico.component.scss',
})
export class HeaderPublicoComponent {
  readonly APP = APP;
  readonly menuAberto = signal(false);

  readonly secoes = [
    { id: 'features', label: 'Funcionalidades' },
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'planos', label: 'Preços' },
    { id: 'faq', label: 'Dúvidas' },
  ];

  scrollPara(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuAberto.set(false);
  }
}
