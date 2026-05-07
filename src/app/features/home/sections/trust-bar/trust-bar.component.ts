import { Component } from '@angular/core';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  template: `
    <section class="trust-bar">
      <div class="trust-inner">
        <p class="trust-label">Em breve, profissionais de beleza de todo o Brasil usando a Kianna pra parar de perder tempo no WhatsApp.</p>
      </div>
    </section>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .trust-bar {
      background: v.$kianna-slate-50;
      padding: 24px;
      border-top: 1px solid v.$kianna-slate-100;
      border-bottom: 1px solid v.$kianna-slate-100;
    }
    .trust-inner {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    .trust-label {
      font-size: 13px;
      color: v.$kianna-slate-500;
      margin: 0;
      font-style: italic;
    }
  `],
})
export class TrustBarComponent {}
