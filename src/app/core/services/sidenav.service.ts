import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  private _opened = signal(false);

  readonly opened = this._opened.asReadonly();

  toggle(): void {
    this._opened.update(v => !v);
  }

  open(): void {
    this._opened.set(true);
  }

  close(): void {
    this._opened.set(false);
  }
}
