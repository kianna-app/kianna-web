import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '@core/services/breakpoint.service';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './shell/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidenavComponent, BottomNavComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private bp = inject(BreakpointService);
  readonly isMobile = this.bp.isMobile;
}
