import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-block"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius">
    </div>
  `,
  styles: [`
    .skeleton-block {
      background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      display: block;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = '6px';
}
