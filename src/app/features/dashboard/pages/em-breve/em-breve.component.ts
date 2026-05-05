import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-em-breve',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="em-breve">
      <mat-icon>construction</mat-icon>
      <h2>{{ titulo }}</h2>
      <p>Esta seção será implementada em breve.</p>
    </div>
  `,
  styles: [`
    .em-breve {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px 16px; gap: 12px;
      color: var(--mat-sys-on-surface-variant, #64748B);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }
      h2 { margin: 0; }
    }
  `],
})
export class EmBreveComponent {
  private route = inject(ActivatedRoute);
  titulo = (this.route.snapshot.data['titulo'] as string) ?? 'Em breve';
}
