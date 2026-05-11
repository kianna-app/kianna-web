import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

export function profissionalIdOrThrow(): string {
  const user = currentUser();
  if (!user?.id) {
    throw new Error('Profissional não autenticado');
  }
  return user.id;
}

export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  const e = error as Record<string, unknown>;
  const msg  = ((e['message'] as string) ?? '').toLowerCase();
  const code = e['code'] ?? e['status'];

  return (
    code === 401 ||
    code === 'PGRST301' ||
    code === 'PGRST302' ||
    msg.includes('jwt expired') ||
    msg.includes('invalid jwt') ||
    msg.includes('unauthorized')
  );
}

export { supabase };
