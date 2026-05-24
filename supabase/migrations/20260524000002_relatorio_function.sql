-- ─────────────────────────────────────────────────────────────
--  Função de relatório de agendamentos
--  Agregação no banco (group by) — escopada por profissional.
-- ─────────────────────────────────────────────────────────────

create or replace function public.relatorio_agendamentos(
  p_profissional_id uuid,
  p_inicio          timestamptz,
  p_fim             timestamptz
) returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'periodo', json_build_object('inicio', p_inicio, 'fim', p_fim),
    'total', (
      select count(*)::int
      from agendamentos
      where profissional_id = p_profissional_id
        and data_hora >= p_inicio
        and data_hora <  p_fim
    ),
    'por_status', (
      select coalesce(json_agg(row_to_json(t) order by t.status), '[]'::json)
      from (
        select status, count(*)::int as total
        from agendamentos
        where profissional_id = p_profissional_id
          and data_hora >= p_inicio
          and data_hora <  p_fim
        group by status
      ) t
    ),
    'por_servico', (
      select coalesce(json_agg(row_to_json(t) order by t.total desc, t.nome asc), '[]'::json)
      from (
        select
          a.servico_id,
          coalesce(s.nome, 'Sem serviço')   as nome,
          count(*)::int                     as total
        from agendamentos a
        left join servicos s on s.id = a.servico_id
        where a.profissional_id = p_profissional_id
          and a.data_hora >= p_inicio
          and a.data_hora <  p_fim
        group by a.servico_id, s.nome
      ) t
    )
  );
$$;

-- Permissão: chamada apenas via service role (backend NestJS).
revoke all on function public.relatorio_agendamentos(uuid, timestamptz, timestamptz)
  from public, anon, authenticated;
