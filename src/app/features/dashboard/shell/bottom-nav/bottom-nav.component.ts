import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface BottomNavItem {
  rota: string;
  label: string;
  icone: string;
  exact?: boolean;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { rota: '/dashboard',          label: 'Início',   icone: 'dashboard',    exact: true },
  { rota: '/dashboard/agenda',   label: 'Agenda',   icone: 'event' },
  { rota: '/dashboard/servicos', label: 'Serviços', icone: 'content_cut' },
  { rota: '/dashboard/horarios', label: 'Horários', icone: 'schedule' },
];

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  readonly menu = BOTTOM_NAV_ITEMS;
}
