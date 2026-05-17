import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-appt-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="appt-skeleton">
      <div class="appt-sk-bar"></div>
      <div class="appt-sk-body">
        <app-skeleton height="14px" width="60%" radius="4px" />
        <app-skeleton height="12px" width="40%" radius="4px" style="margin-top:6px" />
      </div>
      <app-skeleton height="22px" width="64px" radius="99px" />
    </div>
  `,
  styles: [`
    .appt-skeleton {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid #e9ecef;
      margin-bottom: 8px;
    }
    .appt-sk-bar {
      width: 4px;
      height: 48px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      flex-shrink: 0;
    }
    .appt-sk-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class ApptCardSkeletonComponent {}
