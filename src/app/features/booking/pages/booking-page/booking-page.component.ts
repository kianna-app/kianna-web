import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { ProfessionalHeaderComponent } from '../../components/professional-header/professional-header.component';
import { ServiceSelectorComponent } from '../../components/service-selector/service-selector.component';
import { DateSelectorComponent } from '../../components/date-selector/date-selector.component';
import { TimeSelectorComponent } from '../../components/time-selector/time-selector.component';
import { ClientFormComponent } from '../../components/client-form/client-form.component';
import { BookingSummaryComponent } from '../../components/booking-summary/booking-summary.component';
import { BookingConfirmationComponent } from '../../components/booking-confirmation/booking-confirmation.component';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  providers: [BookingService],
  imports: [
    RouterLink,
    ProfessionalHeaderComponent,
    ServiceSelectorComponent,
    DateSelectorComponent,
    TimeSelectorComponent,
    ClientFormComponent,
    BookingSummaryComponent,
    BookingConfirmationComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent implements OnInit {
  readonly booking = inject(BookingService);
  private route    = inject(ActivatedRoute);
  private meta     = inject(Meta);
  private title    = inject(Title);

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    await this.booking.inicializar(slug);

    const prof = this.booking.profissional();
    if (prof) {
      this.title.setTitle(`Agendar com ${prof.nome} · Kianna`);
      this.meta.updateTag({ name: 'description', content: prof.bio ?? `Agende com ${prof.nome} pelo Kianna` });
      this.meta.updateTag({ property: 'og:title', content: `Agende com ${prof.nome}` });
      this.meta.updateTag({ property: 'og:image', content: prof.foto_url ?? '' });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      this.meta.updateTag({ name: 'twitter:title', content: `Agende com ${prof.nome}` });
    }
  }
}
