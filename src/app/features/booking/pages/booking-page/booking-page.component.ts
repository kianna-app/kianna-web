import { Component, OnInit, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../services/booking.service';
import { Servico } from '@core/types/database.types';
import { ProfessionalHeaderComponent } from '../../components/professional-header/professional-header.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
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
    DatePipe,
    MatIconModule,
    ProfessionalHeaderComponent,
    SectionHeaderComponent,
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

  readonly mostrarFab = signal(false);

  @ViewChild('secData')    private secData?:    ElementRef;
  @ViewChild('secHorario') private secHorario?: ElementRef;
  @ViewChild('secDados')   private secDados?:   ElementRef;
  @ViewChild('secResumo')  private secResumo?:  ElementRef;

  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarFab.set(window.scrollY > 300);
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    await this.booking.inicializar(slug);

    const reagendarId = this.route.snapshot.queryParamMap.get('reagendar');
    if (reagendarId) {
      await this.booking.iniciarReagendamento(reagendarId);
    }

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

  onSelecionouServico(s: Servico): void {
    this.booking.selecionarServico(s);
    this.scrollParaRef(this.secData);
  }

  onSelecionouData(d: Date): void {
    this.booking.selecionarData(d);
    this.scrollParaRef(this.secHorario);
  }

  onSelecionouHorario(iso: string): void {
    this.booking.selecionarHorario(iso);
    this.scrollParaRef(this.secDados);
  }

  onConfirmouDados(dados: { nome: string; wpp: string }): void {
    this.booking.irParaResumo(dados);
    this.scrollParaRef(this.secResumo);
  }

  private scrollParaRef(ref: ElementRef | undefined): void {
    setTimeout(() => {
      ref?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
