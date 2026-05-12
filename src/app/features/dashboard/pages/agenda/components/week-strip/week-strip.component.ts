import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'

export interface DiaStrip {
  data: Date; letra: string; numero: number
  hoje?: boolean; selecionado?: boolean; ocupacao?: number
}

@Component({
  selector: 'app-week-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strip">
      @for (d of dias; track d.numero) {
        <button class="day"
          [class.active]="d.selecionado"
          [class.hoje]="d.hoje && !d.selecionado"
          (click)="selecionar.emit(d.data)">
          <span class="letra">{{ d.letra }}</span>
          <span class="num">{{ d.numero }}</span>
          <span class="dots">
            @for (i of [0,1,2]; track i) {
              <span class="dot" [class.on]="i < (d.ocupacao || 0)"></span>
            }
          </span>
        </button>
      }
    </div>
  `,
  styles: [`
    .strip {
      display: grid; grid-template-columns: repeat(7,1fr);
      gap: 6px; padding: 6px 18px 14px;
    }
    .day {
      border: 1px solid var(--border-soft); background: var(--bg-card);
      border-radius: var(--r-xl); padding: 10px 0 8px;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      cursor: pointer; transition: all .15s ease; box-shadow: var(--shadow-1);
    }
    .letra { font: 600 11px 'Inter'; letter-spacing:.5px; color: var(--text-4); }
    .num   { font: 600 16px 'Inter'; letter-spacing:-.3px; color: var(--text-1); }
    .dots  { display:flex; gap:3px; height:4px; margin-top:1px; }
    .dot   { width:4px; height:4px; border-radius:2px; background:transparent; }
    .dot.on { background: #C5CCDA; }

    .day.hoje { border-color: var(--c-primary); }
    .day.hoje .num { color: var(--c-primary); }

    .day.active {
      background: var(--c-primary); border-color: var(--c-primary);
      box-shadow: var(--shadow-active);
    }
    .day.active .letra { color: rgba(255,255,255,0.85); }
    .day.active .num   { color: #fff; }
    .day.active .dot.on { background: rgba(255,255,255,0.9); }
  `]
})
export class WeekStripComponent {
  @Input() dias: DiaStrip[] = []
  @Output() selecionar = new EventEmitter<Date>()
}
