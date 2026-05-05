import { Injectable } from '@angular/core';
import { supabase, profissionalIdOrThrow } from './base.repository';
import { Disponibilidade, DisponibilidadeInput } from '@core/types/database.types';

@Injectable({ providedIn: 'root' })
export class DisponibilidadesRepository {

  async listar(): Promise<Disponibilidade[]> {
    const profissional_id = profissionalIdOrThrow();
    const { data, error } = await supabase
      .from('disponibilidades')
      .select('*')
      .eq('profissional_id', profissional_id)
      .order('dia_semana', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Disponibilidade[];
  }

  async substituirTodas(inputs: DisponibilidadeInput[]): Promise<void> {
    const profissional_id = profissionalIdOrThrow();

    const { error: delErr } = await supabase
      .from('disponibilidades')
      .delete()
      .eq('profissional_id', profissional_id);
    if (delErr) throw delErr;

    if (inputs.length === 0) return;

    const rows = inputs.map(i => ({ ...i, profissional_id }));
    const { error: insErr } = await supabase.from('disponibilidades').insert(rows);
    if (insErr) throw insErr;
  }
}
