-- ─────────────────────────────────────────────────────────────
--  Avisos (notificações internas Admin → Profissionais)
--  Sem cron: publicar_em é apenas um filtro de leitura.
-- ─────────────────────────────────────────────────────────────

-- Tabela principal
create table if not exists public.avisos (
  id              uuid primary key default gen_random_uuid(),
  titulo          text not null check (char_length(titulo) between 1 and 200),
  corpo           text not null check (char_length(corpo) between 1 and 5000),
  publicar_em     timestamptz not null default now(),
  destino         text not null default 'todos'
                  check (destino in ('todos', 'selecionados')),
  criado_por      uuid references public.profissionais(id) on delete set null,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  excluida_em     timestamptz
);

create index if not exists idx_avisos_publicar_em
  on public.avisos(publicar_em)
  where excluida_em is null;

create index if not exists idx_avisos_destino
  on public.avisos(destino)
  where excluida_em is null;

-- Destinatários específicos (vazio quando destino = 'todos')
create table if not exists public.avisos_destinatarios (
  aviso_id        uuid not null references public.avisos(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete cascade,
  primary key (aviso_id, profissional_id)
);

create index if not exists idx_avisos_destinatarios_profissional
  on public.avisos_destinatarios(profissional_id);

-- Marcações de leitura
create table if not exists public.avisos_leituras (
  aviso_id        uuid not null references public.avisos(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(id) on delete cascade,
  lida_em         timestamptz not null default now(),
  primary key (aviso_id, profissional_id)
);

create index if not exists idx_avisos_leituras_profissional
  on public.avisos_leituras(profissional_id);

-- Trigger: atualizar atualizado_em em updates
create or replace function public.set_avisos_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_avisos_atualizado on public.avisos;
create trigger trg_avisos_atualizado
  before update on public.avisos
  for each row execute function public.set_avisos_atualizado_em();

-- RLS — service role bypassa; bloqueamos acesso direto pelo client autenticado.
-- Todo acesso passa pelo backend NestJS, que valida AdminGuard / SupabaseAuthGuard.
alter table public.avisos                 enable row level security;
alter table public.avisos_destinatarios   enable row level security;
alter table public.avisos_leituras        enable row level security;
