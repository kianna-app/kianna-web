import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, isLoading, authInitialized, AppUser } from '@core/signals/app.signals';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router  = inject(Router);
  private session = inject(SessionService);

  async initialize(): Promise<void> {
    isLoading.set(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } finally {
      isLoading.set(false);
      authInitialized.set(true);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      }

      if (event === 'SIGNED_OUT') {
        currentUser.set(null);
      }

      // Token refresh falhou → sessão morta
      if (event === 'TOKEN_REFRESHED' && !session) {
        await this.session.invalidarSessao('expirou');
      }
    });
  }

  async signUp(email: string, senha: string, nome: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw error;
  }

  async signIn(email: string, senha: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await this.session.invalidarSessao('logout');
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    });
    if (error) throw error;
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      currentUser.set(data as AppUser);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUser.set({
          id: '',
          user_id: user.id,
          email: user.email,
          nome: (user.user_metadata?.['nome'] as string) ?? '',
          slug: '',
          foto_url: null,
          whatsapp: '',
          plano: 'gratis',
          onboarding_concluido: false,
        });
      }
    }
  }
}
