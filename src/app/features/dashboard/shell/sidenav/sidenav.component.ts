import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
import { MENU_ITEMS } from '../menu.config';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  private auth = inject(AuthService);
  readonly menu = MENU_ITEMS;
  readonly user = currentUser;

  logout() { this.auth.signOut(); }
}
