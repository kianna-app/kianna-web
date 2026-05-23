import { Component } from '@angular/core';
import { LegalLayoutComponent } from '../../components/legal-layout/legal-layout.component';
import { LEGAL_PLACEHOLDERS as P } from '../../legal.placeholders';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [LegalLayoutComponent],
  templateUrl: './privacidade.component.html',
})
export class PrivacidadeComponent {
  readonly P = P;
}
