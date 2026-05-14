import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointService } from '@core/services/breakpoint.service';
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
  @ViewChild('drawerMobile') drawerMobile?: MatSidenav;

  private bp              = inject(BreakpointService);
  private agendamentosRepo = inject(AgendamentosRepository);
  readonly isMobile = this.bp.isMobile;

  async ngOnInit(): Promise<void> {
    const profId = currentUser()?.id;
    if (profId) {
      this.agendamentosRepo.finalizarVencidos(profId).catch(() => null);
    }
  }

  abrirDrawer(): void {
    this.drawerMobile?.toggle();
  }

  fecharDrawer(): void {
    this.drawerMobile?.close();
  }
}
