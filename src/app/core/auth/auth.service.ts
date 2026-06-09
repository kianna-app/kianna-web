import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser, isLoading, authInitialized, AppUser } from '@core/signals/app.signals';
import { SessionService } from './session.service';
import { ProfissionaisRepository } from '@core/repositories/profissionais.repository';
import { AuditoriaService } from '@core/services/auditoria.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router  = inject(Router);
  private session = inject(SessionService);
  private profissionaisRepo = inject(ProfissionaisRepository);
  private auditoria = inject(AuditoriaService);

  async initialize(): Promise<void> {
    isLoading.set(true);
    console.log('[App] iniciando auth...');

    const loadSession = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[App] sessão obtida:', session ? 'sim' : 'nenhuma', '| user:', session?.user?.id);
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    };

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('auth timeout')), 8000)
    );

    try {
      await Promise.race([loadSession(), timeout]);
    } catch (e) {
      console.error('[Auth] timeout ou erro na inicialização:', e);
      await this.session.invalidarSessao('erro');
    } finally {
      isLoading.set(false);
      authInitialized.set(true);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthState]', event, '| user:', session?.user?.id ?? 'null');
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      }

      if (event === 'SIGNED_OUT') {
        currentUser.set(null);
      }

      if (event === 'TOKEN_REFRESHED' && !session) {
        await this.session.invalidarSessao('expirou');
      }
    });
  }

  async signUp(
    email: string,
    senha: string,
    nome: string,
    termosAceitos?: { aceitos_em: string; versao: string },
    whatsapp?: string,
  ): Promise<void> {
    // TODO: persistir o aceite também na tabela `profissionais` (campo termos_aceitos_em + termos_versao)
    //       para dar valor probatório conforme LGPD. Por ora fica em user_metadata do Supabase.
    // TODO: verificar se a verificação de e-mail (double opt-in) do Supabase está habilitada no dashboard
    //       (Authentication → Settings → Enable email confirmations). Se ativada, remover o signIn
    //       automático abaixo e exibir tela "Verifique seu e-mail antes de continuar".
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          ...(whatsapp && { whatsapp }),
          ...(termosAceitos && {
            termos_aceitos_em: termosAceitos.aceitos_em,
            termos_versao: termosAceitos.versao,
          }),
        },
      },
    });
    if (error) throw error;
  }

  async signIn(email: string, senha: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      this.auditoria.registrarAuth('login_falha', error.message);
      throw error;
    }
    this.auditoria.registrarAuth('login');
  }

  async signOut(): Promise<void> {
    this.auditoria.registrarAuth('logout');
    await this.session.invalidarSessao('logout');
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nova-senha`,
    });
    if (error) throw error;
  }

  async updatePassword(senha: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) throw error;
    this.auditoria.registrarAuth('alteracao_senha');
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const data = await this.profissionaisRepo.me();
      currentUser.set(data as unknown as AppUser);
    } catch (err) {
      console.warn('[Auth] profissional não encontrado, montando placeholder:', err);
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
