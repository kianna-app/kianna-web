import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP } from '@core/constants/app.constants';

@Component({
  selector: 'app-footer-publico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer-publico.component.html',
  styleUrl: './footer-publico.component.scss',
})
export class FooterPublicoComponent {
  readonly APP = APP;
  readonly ano = new Date().getFullYear();
}
