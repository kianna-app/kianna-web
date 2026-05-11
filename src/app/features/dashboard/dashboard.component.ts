import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointService } from '@core/services/breakpoint.service';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './shell/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, MatSidenavModule,
    SidenavComponent, BottomNavComponent, HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  @ViewChild('drawerMobile') drawerMobile?: MatSidenav;

  private bp = inject(BreakpointService);
  readonly isMobile = this.bp.isMobile;

  abrirDrawer(): void {
    this.drawerMobile?.toggle();
  }

  fecharDrawer(): void {
    this.drawerMobile?.close();
  }
}
