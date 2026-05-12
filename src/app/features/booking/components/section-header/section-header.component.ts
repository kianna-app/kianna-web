import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
})
export class SectionHeaderComponent {
  @Input() titulo = '';
  @Input() concluida = false;
  @Input() resumo: string | null = null;
  @Output() editar = new EventEmitter<void>();
}
