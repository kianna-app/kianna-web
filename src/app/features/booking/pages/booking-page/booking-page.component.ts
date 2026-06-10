import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { BookingService, BookingStep, DiaSemana } from '../../services/booking.service';
import { Disponibilidade, MODALIDADE_LABELS, Servico } from '@core/types/database.types';
import { ProfessionalHeaderComponent } from '../../components/professional-header/professional-header.component';
import { BookingConfirmationComponent } from '../../components/booking-confirmation/booking-confirmation.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog.component';

type BookingUiStep = 'servico' | 'dataHora' | 'resumo';
type ProfileTab = 'agendar' | 'horarios' | 'endereco' | 'redes';

interface StepDefinition {
  key: BookingUiStep;
  label: string;
  icon: string;
}

interface ProfileTabDefinition {
  key: ProfileTab;
  label: string;
  icon: string;
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

interface HorarioAtendimento {
  dia: string;
  horario: string;
  fechado: boolean;
}

@Component({
  selector: 'app-booking-page',
  standalone: true,
  providers: [BookingService],
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    ProfessionalHeaderComponent, BookingConfirmationComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent implements OnInit {
  readonly booking = inject(BookingService);
  private route    = inject(ActivatedRoute);
  private meta     = inject(Meta);
  private title    = inject(Title);
  private dialog   = inject(MatDialog);

  readonly etapas: StepDefinition[] = [
    { key: 'servico', label: 'Serviço', icon: 'content_cut' },
    { key: 'dataHora', label: 'Data e hora', icon: 'event' },
    { key: 'resumo', label: 'Confirmar', icon: 'checklist' },
  ];

  readonly profileTabs: ProfileTabDefinition[] = [
    { key: 'agendar', label: 'Agendar', icon: 'event' },
    { key: 'horarios', label: 'Horários', icon: 'schedule' },
    { key: 'endereco', label: 'Endereço', icon: 'location_on' },
    { key: 'redes', label: 'Redes', icon: 'share' },
  ];

  activeProfileTab: ProfileTab = 'agendar';

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
    this.activeProfileTab = 'agendar';
    this.booking.selecionarServico(s);
  }

  selecionarData(dia: DiaSemana): void {
    if (!dia.temSlots) return;
    this.booking.selecionarData(dia.data);
  }

  onSelecionouHorario(slotISO: string): void {
    this.booking.selecionarHorario(slotISO);
  }

  onClienteNomeChange(v: string): void {
    this.booking.clienteNome.set(v);
  }

  onClienteWppChange(v: string): void {
    this.booking.clienteWpp.set(this.mascaraWpp(v));
  }

  private mascaraWpp(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  formatarDataResumo(d: Date | null): string {
    if (!d) return '—';
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  formatarHoraResumo(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  etapaAtualIndex(): number {
    const step = this.booking.step();
    if (step === 'data' || step === 'horario') return 1;
    if (step === 'dados' || step === 'resumo') return 2;
    return 0;
  }

  etapaAtual(): StepDefinition {
    return this.etapas[this.etapaAtualIndex()];
  }

  etapaConcluida(index: number): boolean {
    if (index === 0) return !!this.booking.servicoSelecionado();
    if (index === 1) return !!this.booking.dataSelecionada() && !!this.booking.horarioSelecionado();
    return false;
  }

  irParaEtapa(index: number): void {
    if (index >= this.etapaAtualIndex()) return;
    const step = this.etapas[index]?.key;
    if (!step) return;
    const destino: Record<BookingUiStep, BookingStep> = {
      servico: 'servico',
      dataHora: this.booking.dataSelecionada() ? 'horario' : 'data',
      resumo: 'resumo',
    };
    this.booking.reabrirStep(destino[step]);
  }

  podeAvancar(): boolean {
    const step = this.booking.step();
    if (step === 'servico') return !!this.booking.servicoSelecionado();
    if (step === 'data' || step === 'horario') {
      return !!this.booking.dataSelecionada() && !!this.booking.horarioSelecionado();
    }
    if (step === 'dados' || step === 'resumo') return this.booking.dadosPreenchidos() && !this.booking.enviando();
    return false;
  }

  textoAcaoPrimaria(): string {
    const step = this.booking.step();
    if (step === 'dados' || step === 'resumo') {
      return this.booking.enviando() ? 'Confirmando...' : 'Confirmar agendamento';
    }
    return 'Continuar';
  }

  async avancar(): Promise<void> {
    const step = this.booking.step();
    if (!this.podeAvancar()) return;
    if (step === 'servico') {
      this.booking.step.set(this.booking.dataSelecionada() ? 'horario' : 'data');
      return;
    }
    if (step === 'data' || step === 'horario') {
      this.booking.step.set('resumo');
      return;
    }
    if (step === 'dados' || step === 'resumo') {
      const confirmado = await this.confirmarEnvioAgendamento();
      if (!confirmado) return;
      await this.booking.confirmarAgendamento();
    }
  }

  private async confirmarEnvioAgendamento(): Promise<boolean> {
    const servico = this.booking.servicoSelecionado();
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '420px',
        data: {
          titulo: 'Confirmar agendamento',
          mensagem: `Deseja confirmar ${servico?.nome ?? 'este serviço'} para ${this.formatarDataResumo(this.booking.dataSelecionada())}, às ${this.formatarHoraResumo(this.booking.horarioSelecionado())}? Valor: ${this.precoServico(servico)}.`,
          confirmLabel: 'Confirmar',
          cancelLabel: 'Voltar',
          confirmIcon: 'event_available',
          tipo: 'primary',
        },
      },
    );
    return !!(await firstValueFrom(ref.afterClosed()));
  }

  voltar(): void {
    const step = this.booking.step();
    if (step === 'dados' || step === 'resumo') {
      this.booking.step.set(this.booking.dataSelecionada() ? 'horario' : 'data');
    } else if (step === 'data' || step === 'horario') {
      this.booking.step.set('servico');
    }
  }

  dataISOSelecionada(): string | null {
    const d = this.booking.dataSelecionada();
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  descricaoServico(servico: Servico): string {
    return servico.descricao?.trim()
      || MODALIDADE_LABELS[servico.modalidade]?.descricao
      || 'Atendimento personalizado com duração definida pelo profissional.';
  }

  precoServico(servico: Servico | null): string {
    if (!servico?.preco) return 'A combinar';
    return `R$ ${Number(servico.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  modalidadeServico(servico: Servico | null): string {
    if (!servico) return '—';
    return MODALIDADE_LABELS[servico.modalidade]?.label ?? servico.modalidade;
  }

  horariosAtendimento(): HorarioAtendimento[] {
    const nomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const disponibilidades = this.booking.disponibilidades();
    return nomes.map((dia, index) => {
      const horarios = disponibilidades
        .filter(d => d.dia_semana === index)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
        .map(d => this.formatarDisponibilidade(d));

      return {
        dia,
        horario: horarios.length ? horarios.join(', ') : 'Fechado',
        fechado: horarios.length === 0,
      };
    });
  }

  possuiHorariosAtendimento(): boolean {
    return this.booking.disponibilidades().length > 0;
  }

  selecionarAba(tab: ProfileTab): void {
    this.activeProfileTab = tab;
  }

  enderecoTexto(): string {
    const p = this.booking.profissional();
    if (!p) return '';
    return [
      [p.endereco_rua, p.endereco_numero].filter(Boolean).join(', '),
      p.endereco_bairro,
      [p.endereco_cidade, p.endereco_estado].filter(Boolean).join(' - '),
      p.endereco_cep ? `CEP ${p.endereco_cep}` : '',
    ].filter(Boolean).join(' · ');
  }

  mapsUrl(): string {
    const endereco = this.enderecoTexto();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
  }

  redesSociais(): SocialLink[] {
    const p = this.booking.profissional();
    if (!p) return [];
    return [
      p.instagram_url ? { label: 'Instagram', url: p.instagram_url, icon: 'photo_camera' } : null,
      p.facebook_url ? { label: 'Facebook', url: p.facebook_url, icon: 'facebook' } : null,
      p.twitter_url ? { label: 'X', url: p.twitter_url, icon: 'alternate_email' } : null,
      p.youtube_url ? { label: 'YouTube', url: p.youtube_url, icon: 'smart_display' } : null,
      p.whatsapp ? { label: 'WhatsApp', url: `https://wa.me/55${p.whatsapp.replace(/\D/g, '')}`, icon: 'chat' } : null,
    ].filter((rede): rede is SocialLink => !!rede);
  }

  linksPersonalizados() {
    return (this.booking.profissional()?.links_personalizados ?? [])
      .filter(link => !!link.label?.trim() && !!link.url?.trim());
  }

  semanaSemDatasDisponiveis(): boolean {
    const semana = this.booking.semana();
    return !semana.length || semana.every(d => !d.temSlots);
  }

  semHorariosDisponiveisNoDia(): boolean {
    const slots = this.booking.slotsParaDia();
    return !slots.length || !slots.some(s => s.disponivel);
  }

  politicaCancelamento(): string {
    return this.booking.profissional()?.politica_cancelamento?.trim() ?? '';
  }

  antecedenciaMinimaTexto(): string {
    const horas = this.booking.profissional()?.antecedencia_minima_horas ?? 0;
    if (!horas) return '';
    return horas === 1 ? '1 hora' : `${horas} horas`;
  }

  private formatarDisponibilidade(d: Disponibilidade): string {
    return `${this.formatarHoraCurta(d.hora_inicio)} às ${this.formatarHoraCurta(d.hora_fim)}`;
  }

  private formatarHoraCurta(hora: string): string {
    return hora.slice(0, 5);
  }
}
