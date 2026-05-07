import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PLANOS, Plano } from '../../data/planos.data';

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './planos.component.html',
  styleUrl: './planos.component.scss',
})
export class PlanosComponent {
  readonly planos = PLANOS;
  readonly mensal = signal(true);

  preco(plano: Plano): number {
    return this.mensal() ? plano.precoMensal : plano.precoAnual;
  }
}
