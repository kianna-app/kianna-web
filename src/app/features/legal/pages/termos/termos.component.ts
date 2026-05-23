import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalLayoutComponent } from '../../components/legal-layout/legal-layout.component';
import { LEGAL_PLACEHOLDERS as P } from '../../legal.placeholders';

@Component({
  selector: 'app-termos',
  standalone: true,
  imports: [LegalLayoutComponent, RouterLink],
  templateUrl: './termos.component.html',
})
export class TermosComponent {
  readonly P = P;
}
