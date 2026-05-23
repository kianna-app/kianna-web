import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP } from '@core/constants/app.constants';
import { FooterPublicoComponent } from '../../../home/sections/footer-publico/footer-publico.component';
import { LEGAL_PLACEHOLDERS } from '../../legal.placeholders';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [RouterLink, FooterPublicoComponent],
  templateUrl: './legal-layout.component.html',
  styleUrl: './legal-layout.component.scss',
})
export class LegalLayoutComponent {
  @Input({ required: true }) titulo!: string;
  @Input() dataAtualizacao = LEGAL_PLACEHOLDERS.DATA_ATUALIZACAO;

  readonly APP = APP;
}
