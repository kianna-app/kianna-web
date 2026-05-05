import { Injectable, inject, signal, computed } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BREAKPOINTS } from '@core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private bp = inject(BreakpointObserver);

  private readonly _isMobile = signal(false);
  readonly isMobile  = this._isMobile.asReadonly();
  readonly isDesktop = computed(() => !this._isMobile());

  constructor() {
    this.bp.observe(`(max-width: ${BREAKPOINTS.TABLET - 1}px)`)
      .pipe(takeUntilDestroyed())
      .subscribe(r => this._isMobile.set(r.matches));
  }
}
