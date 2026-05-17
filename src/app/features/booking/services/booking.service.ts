import { Injectable, inject, signal, computed } from '@angular/core';
import { BookingRepository } from '@core/repositories/booking.repository';
import { SlotCalculatorService } from './slot-calculator.service';
import { Profissional, Servico, Disponibilidade, Bloqueio } from '@core/types/database.types';
import { PLAN_LIMITS } from '@core/constants/plan.limits';
import { exceededLimit } from '@core/constants/plan.limits';

export type BookingStep = 'servico' | 'data' | 'horario' | 'dados' | 'resumo' | 'confirmado' | 'lotado' | 'not-found';

export interface DiaSemana {
  data: Date;
  dataISO: string;
  letra: string;
  numero: number;
  mes: string;
  temSlots: boolean;
  isPassado: boolean;
}

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
  readonly loadingSlots        = signal(false);
  readonly enviando            = signal(false);
  readonly agendamentoId       = signal<string | null>(null);
  readonly erro                = signal<string | null>(null);
  readonly agendamentoOrigemId = signal<string | null>(null);
  readonly semanaOffset        = signal(0);

  private agendamentosConfirmados = signal<Array<{ data_hora: string }>>([]);
  private bloqueios               = signal<Bloqueio[]>([]);

  readonly slotsParaDia = computed(() => {
    const data    = this.dataSelecionada();
    const servico = this.servicoSelecionado();
    const prof    = this.profissional();
    if (!data || !servico || !prof) return [];
    return this.slotCalc.calcularSlotsParaDia(
      data, servico, this.disponibilidades(), this.agendamentosConfirmados(),
      this.bloqueios(), prof.timezone, prof.antecedencia_minima_horas, prof.antecedencia_maxima_dias,
    );
  });

  readonly diasComSlots = computed(() => {
    const servico = this.servicoSelecionado();
    const prof    = this.profissional();
    if (!servico || !prof) return [];
    return this.slotCalc.diasComSlots(
      this.disponibilidades(), this.agendamentosConfirmados(), servico,
      this.bloqueios(), prof.timezone, prof.antecedencia_minima_horas, prof.antecedencia_maxima_dias,
    );
  });

  readonly semana = computed<DiaSemana[]>(() => {
    const offset = this.semanaOffset();
    const servico = this.servicoSelecionado();
    const prof    = this.profissional();
    if (!servico || !prof) return [];

    const diasLetras = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const base = new Date(hoje);
    base.setDate(hoje.getDate() - hoje.getDay() + offset * 7);

    const diasDisponiveis = this.diasComSlots();
    const setDisponivel = new Set(diasDisponiveis.map(d => d.toDateString()));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dataISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        data: d,
        dataISO,
        letra: diasLetras[d.getDay()],
        numero: d.getDate(),
        mes: meses[d.getMonth()],
        temSlots: setDisponivel.has(d.toDateString()),
        isPassado: d.getTime() < hoje.getTime(),
      };
    });
  });

  readonly podeSemanaAnterior = computed(() => this.semanaOffset() > 0);

  readonly dadosPreenchidos = computed(() =>
    !!this.horarioSelecionado() &&
    this.clienteNome().trim().length >= 2 &&
    this.clienteWpp().replace(/\D/g, '').length >= 10,
  );

  async inicializar(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      const prof = await this.repo.getProfissionalBySlug(slug);

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
      await this.carregarDadosPublicos(prof.id);
    } finally {
      this.loading.set(false);
    }
  }

  async iniciarReagendamento(agendamentoId: string): Promise<void> {
    const ag = await this.repo.getAgendamentoById(agendamentoId);
    if (!ag) return;

    const servico = this.servicos().find(s => s.id === ag.servico_id);
    if (servico) this.selecionarServico(servico);

    this.agendamentoOrigemId.set(agendamentoId);
    this.step.set('data');
  }

  private async carregarDadosPublicos(profId: string): Promise<void> {
    const hoje = new Date();
    const em30 = new Date(hoje);
    em30.setDate(hoje.getDate() + 30);

    const de  = hoje.toISOString().split('T')[0];
    const ate = em30.toISOString().split('T')[0];

    const [confirmados, bloqueios] = await Promise.all([
      this.repo.getAgendamentosConfirmados(profId, de, ate),
      this.repo.getBloqueios(profId, de, ate),
    ]);

    this.agendamentosConfirmados.set(confirmados);
    this.bloqueios.set(bloqueios);
  }

  selecionarServico(servico: Servico): void {
    this.servicoSelecionado.set(servico);
    this.dataSelecionada.set(null);
    this.horarioSelecionado.set(null);
    this.step.set('data');
  }

  selecionarData(data: Date): void {
    this.loadingSlots.set(true);
    this.dataSelecionada.set(data);
    this.horarioSelecionado.set(null);
    this.step.set('horario');
    setTimeout(() => this.loadingSlots.set(false), 0);
  }

  selecionarHorario(iso: string): void {
    this.horarioSelecionado.set(iso);
    this.step.set('dados');
  }

  semanaAnterior(): void {
    if (this.podeSemanaAnterior()) {
      this.semanaOffset.update(v => v - 1);
    }
  }

  proximaSemana(): void {
    this.semanaOffset.update(v => v + 1);
  }

  irParaResumo(dados: { nome: string; wpp: string }): void {
    this.clienteNome.set(dados.nome);
    this.clienteWpp.set(dados.wpp);
    this.step.set('resumo');
  }

  async confirmarAgendamento(): Promise<void> {
    if (!this.dadosPreenchidos()) return;
    this.enviando.set(true);
    this.loading.set(true);
    this.erro.set(null);
    try {
      const payload = {
        profissional_id: this.profissional()!.id,
        servico_id:      this.servicoSelecionado()!.id,
        cliente_nome:    this.clienteNome(),
        cliente_wpp:     this.clienteWpp(),
        data_hora:       this.horarioSelecionado()!,
        ...(this.agendamentoOrigemId() ? { agendamento_origem_id: this.agendamentoOrigemId()! } : {}),
      };

      const result = await this.repo.criarAgendamento(payload);

      if (result) {
        this.agendamentoId.set(result.id);
        this.step.set('confirmado');
      } else {
        this.erro.set('Não foi possível confirmar o agendamento. Tente novamente.');
      }
    } catch (e: unknown) {
      const err = e as Record<string, unknown> | null;
      console.error('[BookingService] erro ao criar agendamento:', e);
      const msg =
        err?.['code'] === '42501'
          ? 'Erro de permissão. Contate o suporte.'
          : err?.['message']?.toString().includes('conflict') || err?.['code'] === '23505'
          ? 'Este horário acabou de ser reservado. Escolha outro.'
          : 'Erro ao conectar. Verifique sua conexão e tente novamente.';
      this.erro.set(msg);
    } finally {
      this.loading.set(false);
      this.enviando.set(false);
    }
  }

  stepDesbloqueado(step: BookingStep): boolean {
    const ordem: BookingStep[] = ['servico', 'data', 'horario', 'dados', 'resumo', 'confirmado'];
    const idxAtual = ordem.indexOf(this.step());
    const idxAlvo  = ordem.indexOf(step);
    if (idxAtual === -1 || idxAlvo === -1) return false;
    return idxAtual >= idxAlvo;
  }

  reabrirStep(step: BookingStep): void {
    if (step === 'servico') {
      this.servicoSelecionado.set(null);
      this.dataSelecionada.set(null);
      this.horarioSelecionado.set(null);
    } else if (step === 'data') {
      this.dataSelecionada.set(null);
      this.horarioSelecionado.set(null);
    } else if (step === 'horario') {
      this.horarioSelecionado.set(null);
    }
    this.step.set(step);
  }

  voltar(): void {
    const ordem: BookingStep[] = ['servico', 'data', 'horario', 'dados', 'resumo'];
    const atual = this.step();
    const idx = ordem.indexOf(atual);
    if (idx > 0) this.step.set(ordem[idx - 1]);
  }
}
