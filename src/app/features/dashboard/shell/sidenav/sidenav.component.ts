import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/auth/auth.service';
import { SidenavService } from '@core/services/sidenav.service';
import { currentUser } from '@core/signals/app.signals';
import { MENU_ITEMS } from '../menu.config';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  readonly APP = APP;
  private auth = inject(AuthService);
  private sidenavService = inject(SidenavService);
  readonly menu = MENU_ITEMS;
  readonly user = currentUser;

  @Output() itemClicked = new EventEmitter<void>();

  fecharMenu(): void {
    this.sidenavService.close();
  }

  async logout(): Promise<void> {
    this.itemClicked.emit();
    await this.auth.signOut();
  }

  navegarItem(): void {
    this.itemClicked.emit();
  }
}
