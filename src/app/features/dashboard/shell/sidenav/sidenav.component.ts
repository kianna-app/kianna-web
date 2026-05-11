import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/auth/auth.service';
import { currentUser } from '@core/signals/app.signals';
import { MENU_ITEMS } from '../menu.config';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  readonly APP = APP;
  private auth = inject(AuthService);
  readonly menu = MENU_ITEMS;
  readonly user = currentUser;

  @Output() itemClicked = new EventEmitter<void>();

  async logout(): Promise<void> {
    this.itemClicked.emit();
    await this.auth.signOut();
  }

  navegarItem(): void {
    this.itemClicked.emit();
  }
}
