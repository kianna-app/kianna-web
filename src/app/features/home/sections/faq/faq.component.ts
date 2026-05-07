import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FAQ } from '../../data/faq.data';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly faq = FAQ;
}
