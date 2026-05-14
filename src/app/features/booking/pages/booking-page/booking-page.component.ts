import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService, DiaSemana } from '../../services/booking.service';
import { Servico } from '@core/types/database.types';
import { ProfessionalHeaderComponent } from '../../components/professional-header/professional-header.component';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  providers: [BookingService],
  imports: [
    CommonModule, RouterLink, FormsModule,
    DatePipe, TitleCasePipe, DecimalPipe,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    ProfessionalHeaderComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent implements OnInit {
  readonly booking = inject(BookingService);
  private route    = inject(ActivatedRoute);
  private meta     = inject(Meta);
  private title    = inject(Title);

  @ViewChild('secData')    private secData?:    ElementRef;
  @ViewChild('secHorario') private secHorario?: ElementRef;
  @ViewChild('secDados')   private secDados?:   ElementRef;
  @ViewChild('secResumo')  private secResumo?:  ElementRef;
  @ViewChild('timeStrip')  private timeStrip?:  ElementRef;

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

  selecionarServico(s: Servico): void {
    this.booking.selecionarServico(s);
    this.scrollPara(this.secData);
  }

  selecionarData(dia: DiaSemana): void {
    if (!dia.temSlots) return;
    this.booking.selecionarData(dia.data);
    this.scrollPara(this.secHorario);
  }

  onSelecionouHorario(slotISO: string): void {
    this.booking.selecionarHorario(slotISO);
    this.booking.irParaResumo({
      nome: this.booking.clienteNome(),
      wpp: this.booking.clienteWpp(),
    });
    this.scrollPara(this.secDados);
  }

  onClienteNomeChange(v: string): void {
    this.booking.clienteNome.set(v);
    if (this.booking.dadosPreenchidos()) this.scrollPara(this.secResumo);
  }

  onClienteWppChange(v: string): void {
    this.booking.clienteWpp.set(v);
    if (this.booking.dadosPreenchidos()) this.scrollPara(this.secResumo);
  }

  slotsScrollEsq(): void {
    this.timeStrip?.nativeElement?.scrollBy({ left: -160, behavior: 'smooth' });
  }
  slotsScrollDir(): void {
    this.timeStrip?.nativeElement?.scrollBy({ left: 160, behavior: 'smooth' });
  }

  private scrollPara(ref: ElementRef | undefined): void {
    setTimeout(() => {
      ref?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  dataISOSelecionada(): string | null {
    const d = this.booking.dataSelecionada();
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
