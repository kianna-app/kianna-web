import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-resumo-band',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="band">
      <div class="cell">
        <span class="n" style="color:var(--text-1)">{{ resumo.total }}</span>
        <span class="lbl">Total</span>
      </div>
      <div class="sep"></div>
      <div class="cell">
        <span class="n" style="color:var(--c-primary)">{{ resumo.confirmados }}</span>
        <span class="lbl">Confirmados</span>
      </div>
      <div class="sep"></div>
      <div class="cell">
        <span class="n" style="color:var(--c-amber)">{{ resumo.pendentes }}</span>
        <span class="lbl">Pendentes</span>
      </div>
      <div class="sep"></div>
      <div class="cell">
        <span class="n" style="color:var(--c-green)">{{ resumo.concluidos }}</span>
        <span class="lbl">Concluídos</span>
      </div>
    </div>
  `,
  styles: [`
    .band {
      margin: 2px 18px 14px; padding: 12px 14px;
      background: var(--bg-card); border: 1px solid var(--border-soft);
      border-radius: var(--r-md); box-shadow: var(--shadow-1);
      display: flex; align-items: center; justify-content: space-between;
    }
    .cell { flex:1; display:flex; flex-direction:column; align-items:center; gap:1px; }
    .n    { font: 700 18px 'Inter'; letter-spacing:-.4px; }
    .lbl  { font: 500 10px 'Inter'; color: var(--text-3);
            letter-spacing:.3px; text-transform:uppercase; }
    .sep  { width:1px; height:26px; background:var(--border-soft); }
  `]
})
export class ResumoBandComponent {
  @Input() resumo = { total: 0, confirmados: 0, pendentes: 0, concluidos: 0 }
}
