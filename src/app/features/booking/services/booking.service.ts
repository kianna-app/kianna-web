import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingRepository } from '@core/repositories/booking.repository';
import { SlotCalculatorService } from './slot-calculator.service';
import { Profissional, Servico, Disponibilidade } from '@core/types/database.types';
import { PLAN_LIMITS } from '@core/constants/plan.limits';
import { exceededLimit } from '@core/constants/plan.limits';

export type BookingStep = 'servico' | 'data' | 'horario' | 'dados' | 'resumo' | 'confirmado' | 'lotado' | 'not-found';

@Injectable()
export class BookingService {
  private repo     = inject(BookingRepository);
  private slotCalc = inject(SlotCalculatorService);

  readonly step                = signal<BookingStep>('servico');
  readonly profissional        = signal<Profissional | null>(null);
  readonly servicos            = signal<Servico[]>([]);
  readonly disponibilidades    = signal<Disponibilidade[]>([]);
  readonly servicoSelecionado  = signal<Servico | null>(null);
  readonly dataSelecionada     = signal<Date | null>(null);
  readonly horarioSelecionado  = signal<string | null>(null);
  readonly clienteNome         = signal('');
  readonly clienteWpp          = signal('');
  readonly loading             = signal(false);
  readonly agendamentoId       = signal<string | null>(null);
  readonly erro                = signal<string | null>(null);

  private agendados = signal<Array<{ data_hora: string; duracao_min: number }>>([]);

  readonly slotsParaDia = computed(() => {
    const data    = this.dataSelecionada();
    const servico = this.servicoSelecionado();
    if (!data || !servico) return [];
    return this.slotCalc.calcularSlotsParaDia(data, servico, this.disponibilidades(), this.agendados());
  });

  readonly diasComSlots = computed(() => {
    const servico = this.servicoSelecionado();
    if (!servico) return [];
    return this.slotCalc.diasComSlots(this.disponibilidades(), this.agendados(), servico);
  });

  async inicializar(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      let prof = await this.repo.getProfissionalBySlug(slug);

      if (!prof) {
        const novoSlug = await this.repo.getRedirectBySlug(slug);
        if (novoSlug) {
          window.location.replace(`/${novoSlug}`);
          return;
        }
        this.step.set('not-found');
        return;
      }

      this.profissional.set(prof);

      if (prof.plano === 'gratis') {
        const count = await this.repo.contarAgendamentosNoMes(prof.id);
        if (exceededLimit(count, PLAN_LIMITS['gratis'].agendamentosMes)) {
          this.step.set('lotado');
          return;
        }
      }

      const [servicos, disps] = await Promise.all([
        this.repo.getServicos(prof.id),
        this.repo.getDisponibilidades(prof.id),
      ]);

      this.servicos.set(servicos);
      this.disponibilidades.set(disps);
      await this.carregarAgendados(prof.id);
    } finally {
      this.loading.set(false);
    }
  }

  private async carregarAgendados(profId: string): Promise<void> {
    const hoje = new Date();
    const em30 = new Date(hoje);
    em30.setDate(hoje.getDate() + 30);

    const de  = hoje.toISOString().split('T')[0];
    const ate = em30.toISOString().split('T')[0];

    const raw = await this.repo.getAgendamentosNoIntervalo(profId, de, ate);
    const servicosMap = new Map(this.servicos().map(s => [s.id, s.duracao_min]));
    const enriched = raw.map(ag => ({
      data_hora:   ag.data_hora,
      duracao_min: servicosMap.get(ag.servico_id ?? '') ?? 60,
    }));

    this.agendados.set(enriched);
  }

  selecionarServico(servico: Servico): void {
    this.servicoSelecionado.set(servico);
    this.dataSelecionada.set(null);
    this.horarioSelecionado.set(null);
    this.step.set('data');
  }

  selecionarData(data: Date): void {
    this.dataSelecionada.set(data);
    this.horarioSelecionado.set(null);
    this.step.set('horario');
  }

  selecionarHorario(iso: string): void {
    this.horarioSelecionado.set(iso);
    this.step.set('dados');
  }

  irParaResumo(dados: { nome: string; wpp: string }): void {
    this.clienteNome.set(dados.nome);
    this.clienteWpp.set(dados.wpp);
    this.step.set('resumo');
  }

  async confirmarAgendamento(): Promise<void> {
    this.loading.set(true);
    this.erro.set(null);
    try {
      const result = await this.repo.criarAgendamento({
        profissional_id: this.profissional()!.id,
        servico_id:      this.servicoSelecionado()!.id,
        cliente_nome:    this.clienteNome(),
        cliente_wpp:     this.clienteWpp(),
        data_hora:       this.horarioSelecionado()!,
      });

      if (result) {
        this.agendamentoId.set(result.id);
        this.step.set('confirmado');
      } else {
        this.erro.set('Não foi possível confirmar o agendamento. Tente novamente.');
      }
    } catch {
      this.erro.set('Erro ao conectar. Verifique sua conexão e tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  voltar(): void {
    const ordem: BookingStep[] = ['servico', 'data', 'horario', 'dados', 'resumo'];
    const atual = this.step();
    const idx = ordem.indexOf(atual);
    if (idx > 0) this.step.set(ordem[idx - 1]);
  }
}
