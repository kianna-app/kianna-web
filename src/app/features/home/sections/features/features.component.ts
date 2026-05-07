import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FEATURES } from '../../data/features.data';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  readonly features = FEATURES;
}
