import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export type LoadingButtonVariant = 'flat' | 'stroked' | 'raised';
export type LoadingButtonColor = 'primary' | 'accent' | 'warn' | undefined;

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
})
export class LoadingButtonComponent {
  @Input() variant: LoadingButtonVariant = 'flat';
  @Input() color: LoadingButtonColor = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() loadingText = '';
  @Input() icon: string | null = null;
  @Input() iconPosition: 'start' | 'end' = 'end';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() ariaLabel = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  onClick(event: MouseEvent): void {
    if (this.isDisabled) return;
    this.clicked.emit(event);
  }
}
