import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UpgradeNavigationService {
  private readonly router = inject(Router);

  irParaUpgrade(event?: Event): void {
    event?.preventDefault();
    void this.router.navigate(['/dashboard/upgrade']);
  }
}
