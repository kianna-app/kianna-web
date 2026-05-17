import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointService } from '@core/services/breakpoint.service';
import { SidenavService } from '@core/services/sidenav.service';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { BottomNavComponent } from './shell/bottom-nav/bottom-nav.component';
import { HeaderComponent } from './shell/header/header.component';
import { AgendamentosRepository } from '@core/repositories/agendamentos.repository';
import { currentUser } from '@core/signals/app.signals';

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
export class DashboardComponent implements OnInit {
  private bp               = inject(BreakpointService);
  private agendamentosRepo = inject(AgendamentosRepository);
  readonly sidenavService  = inject(SidenavService);
  readonly isMobile        = this.bp.isMobile;

  async ngOnInit(): Promise<void> {
    const profId = currentUser()?.id;
    if (profId) {
      this.agendamentosRepo.finalizarVencidos(profId).catch(() => null);
    }
  }

  fecharDrawer(): void {
    this.sidenavService.close();
  }

  onDrawerToggle(isOpen: boolean): void {
    if (isOpen) this.sidenavService.open();
    else this.sidenavService.close();
  }
}
