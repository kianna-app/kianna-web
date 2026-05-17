import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidenavService } from '@core/services/sidenav.service';

interface BottomNavItem {
  rota?: string;
  label: string;
  icone: string;
  exact?: boolean;
  isMenu?: boolean;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { rota: '/dashboard',          label: 'Início',   icone: 'dashboard',    exact: true },
  { rota: '/dashboard/agenda',   label: 'Agenda',   icone: 'event' },
  { rota: '/dashboard/servicos', label: 'Serviços', icone: 'content_cut' },
  { label: 'Menu',               icone: 'menu',     isMenu: true },
];

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  private sidenavService = inject(SidenavService);
  readonly menu = BOTTOM_NAV_ITEMS;

  abrirMenu(): void {
    this.sidenavService.toggle();
  }
}
