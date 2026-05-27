import { signal, computed } from '@angular/core';
import { LinkPersonalizado, Plano, WppStatus } from '@core/types/database.types';
import { PLAN_LIMITS } from '@core/constants/plan.limits';

export interface AppUser {
  id: string;
  user_id: string;
  email?: string;
  nome: string;
  slug: string;
  foto_url: string | null;
  whatsapp: string;
  especialidade?: string;
  bio?: string;
  plano: Plano;
  onboarding_concluido: boolean;

  // ── Módulo 4 (WhatsApp Z-API) ──
  wpp_instance_id?: string | null;
  wpp_token?: string | null;
  wpp_status?: WppStatus;
  lembrete_horas?: number | null;
  cancelamento_auto_cliente?: boolean;

  // ── Módulo 2 ──
  politica_cancelamento?: string | null;
  endereco_cep?: string | null;
  endereco_rua?: string | null;
  endereco_numero?: string | null;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_cidade?: string | null;
  endereco_estado?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  links_personalizados?: LinkPersonalizado[];
  slug_alterado_em?: string | null;

  // ── Módulo 3 (fluxo v2) ──
  antecedencia_minima_horas?: number;
  antecedencia_maxima_dias?: number | null;
  timezone?: string;

  role?: string | null;
}

export const currentUser     = signal<AppUser | null>(null);
export const isLoading       = signal<boolean>(true);
export const authInitialized = signal<boolean>(false);

export const isAuthenticated  = computed(() => currentUser() !== null);
export const isOnboardingDone = computed(() => currentUser()?.onboarding_concluido ?? false);
export const userPlano        = computed((): Plano => currentUser()?.plano ?? 'gratis');
export const isPro            = computed(() => userPlano() !== 'gratis' && userPlano() !== 'essencial');
export const isStudio         = computed(() => userPlano() === 'studio');
export const hasWhatsapp      = computed(() => PLAN_LIMITS[userPlano()].whatsapp);
export const hasRelatorio     = computed(() => PLAN_LIMITS[userPlano()].relatorio);
export const isAdmin          = computed(() => currentUser()?.role === 'admin');
