import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DEPOIMENTOS } from '../../data/depoimentos.data';

@Component({
  selector: 'app-depoimentos',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './depoimentos.component.html',
  styleUrl: './depoimentos.component.scss',
})
export class DepoimentosComponent {
  readonly depoimentos = DEPOIMENTOS;

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('');
  }
}
