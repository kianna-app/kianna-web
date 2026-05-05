import { signal, computed } from '@angular/core';

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
  plano: 'gratis' | 'pro' | 'studio';
  onboarding_concluido: boolean;
}

export const currentUser     = signal<AppUser | null>(null);
export const isLoading       = signal<boolean>(true);
export const authInitialized = signal<boolean>(false);

export const isAuthenticated  = computed(() => currentUser() !== null);
export const isOnboardingDone = computed(() => currentUser()?.onboarding_concluido ?? false);
export const userPlano        = computed(() => currentUser()?.plano ?? 'gratis');
export const isPro            = computed(() => userPlano() !== 'gratis');
