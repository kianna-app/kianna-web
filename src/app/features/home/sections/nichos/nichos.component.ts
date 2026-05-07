import { Component } from '@angular/core';
import { NICHOS } from '../../data/nichos.data';

@Component({
  selector: 'app-nichos',
  standalone: true,
  templateUrl: './nichos.component.html',
  styleUrl: './nichos.component.scss',
})
export class NichosComponent {
  readonly nichos = NICHOS;
}
