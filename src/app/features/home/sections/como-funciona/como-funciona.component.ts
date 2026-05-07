import { Component } from '@angular/core';
import { PASSOS } from '../../data/passos.data';

@Component({
  selector: 'app-como-funciona',
  standalone: true,
  templateUrl: './como-funciona.component.html',
  styleUrl: './como-funciona.component.scss',
})
export class ComoFuncionaComponent {
  readonly passos = PASSOS;
}
