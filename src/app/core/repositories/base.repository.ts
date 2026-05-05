import { supabase } from '@core/supabase/supabase.client';
import { currentUser } from '@core/signals/app.signals';

export function profissionalIdOrThrow(): string {
  const user = currentUser();
  if (!user?.id) {
    throw new Error('Profissional não autenticado');
  }
  return user.id;
}

export { supabase };
