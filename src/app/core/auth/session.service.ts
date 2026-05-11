import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  private invalidando = false;

  async invalidarSessao(motivo: 'expirou' | 'logout' | 'erro' = 'logout'): Promise<void> {
    if (this.invalidando) return;
    this.invalidando = true;

    try {
      // Timeout de 3s pro signOut — se token já morreu, não trava
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);

      currentUser.set(null);
      this.limparStorageManual();

      const mensagens = {
        expirou: 'Sua sessão expirou. Entre novamente.',
        logout:  'Você saiu da sua conta.',
        erro:    'Ocorreu um erro. Entre novamente.',
      };

      await this.router.navigate(['/auth/login']);
      this.snack.open(mensagens[motivo], 'OK', { duration: 3000 });
    } finally {
      setTimeout(() => { this.invalidando = false; }, 500);
    }
  }

  private limparStorageManual(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // localStorage pode falhar em modo privado
    }
  }
}
