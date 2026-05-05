-- ── Extensão para UUID ────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabela: profissionais ─────────────────────────────────────
create table if not exists public.profissionais (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete cascade not null unique,
  nome                   text not null,
  slug                   text unique not null,
  foto_url               text,
  whatsapp               text not null,
  especialidade          text,
  bio                    text,
  plano                  text default 'gratis' check (plano in ('gratis','pro','studio')),
  wpp_instance_id        text,
  stripe_subscription_id text,
  onboarding_concluido   boolean default false,
  ativo                  boolean default true,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create index if not exists idx_profissionais_slug    on public.profissionais(slug) where ativo = true;
create index if not exists idx_profissionais_user_id on public.profissionais(user_id);

-- ── Tabela: servicos ──────────────────────────────────────────
create table if not exists public.servicos (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid references public.profissionais(id) on delete cascade not null,
  nome            text not null,
  duracao_min     integer not null check (duracao_min >= 15),
  preco           numeric(10,2) not null default 0 check (preco >= 0),
  ativo           boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_servicos_profissional on public.servicos(profissional_id) where ativo = true;

-- ── Tabela: disponibilidades ──────────────────────────────────
create table if not exists public.disponibilidades (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid references public.profissionais(id) on delete cascade not null,
  dia_semana      integer not null check (dia_semana between 0 and 6),
  hora_inicio     time not null,
  hora_fim        time not null,
  intervalo_min   integer default 60 check (intervalo_min >= 15),
  check (hora_fim > hora_inicio)
);

create index if not exists idx_disponibilidades_profissional on public.disponibilidades(profissional_id);

-- ── Tabela: agendamentos ──────────────────────────────────────
create table if not exists public.agendamentos (
  id               uuid primary key default gen_random_uuid(),
  profissional_id  uuid references public.profissionais(id) on delete cascade not null,
  servico_id       uuid references public.servicos(id),
  cliente_nome     text not null,
  cliente_wpp      text not null,
  data_hora        timestamptz not null,
  status           text default 'confirmado'
                   check (status in ('pendente','confirmado','cancelado','concluido')),
  lembrete_enviado boolean default false,
  observacoes      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_agendamentos_profissional_data on public.agendamentos(profissional_id, data_hora);
create index if not exists idx_agendamentos_status            on public.agendamentos(status) where status in ('pendente','confirmado');

-- ── Trigger: atualizar updated_at automaticamente ─────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profissionais_updated on public.profissionais;
create trigger trg_profissionais_updated
  before update on public.profissionais
  for each row execute function public.set_updated_at();

drop trigger if exists trg_servicos_updated on public.servicos;
create trigger trg_servicos_updated
  before update on public.servicos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_agendamentos_updated on public.agendamentos;
create trigger trg_agendamentos_updated
  before update on public.agendamentos
  for each row execute function public.set_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────────
alter table public.profissionais    enable row level security;
alter table public.servicos         enable row level security;
alter table public.disponibilidades enable row level security;
alter table public.agendamentos     enable row level security;

-- Profissional acessa apenas seus dados
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'profissionais' and policyname = 'Profissional acessa próprios dados'
  ) then
    create policy "Profissional acessa próprios dados"
      on public.profissionais for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'servicos' and policyname = 'Profissional acessa próprios serviços'
  ) then
    create policy "Profissional acessa próprios serviços"
      on public.servicos for all
      using (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ))
      with check (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'disponibilidades' and policyname = 'Profissional acessa próprias disponibilidades'
  ) then
    create policy "Profissional acessa próprias disponibilidades"
      on public.disponibilidades for all
      using (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ))
      with check (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'agendamentos' and policyname = 'Profissional acessa próprios agendamentos'
  ) then
    create policy "Profissional acessa próprios agendamentos"
      on public.agendamentos for all
      using (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ))
      with check (profissional_id in (
        select id from public.profissionais where user_id = auth.uid()
      ));
  end if;
end $$;

-- Leitura pública (anon)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'profissionais' and policyname = 'Leitura pública de perfis ativos'
  ) then
    create policy "Leitura pública de perfis ativos"
      on public.profissionais for select
      to anon
      using (ativo = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'servicos' and policyname = 'Leitura pública de serviços ativos'
  ) then
    create policy "Leitura pública de serviços ativos"
      on public.servicos for select
      to anon
      using (ativo = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'disponibilidades' and policyname = 'Leitura pública de disponibilidades'
  ) then
    create policy "Leitura pública de disponibilidades"
      on public.disponibilidades for select
      to anon
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'agendamentos' and policyname = 'Clientes podem agendar'
  ) then
    create policy "Clientes podem agendar"
      on public.agendamentos for insert
      to anon
      with check (status = 'confirmado');
  end if;
end $$;

-- ── Storage: bucket para fotos de perfil ─────────────────────
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Upload de foto autenticado'
  ) then
    create policy "Upload de foto autenticado"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'profiles');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Atualizar própria foto'
  ) then
    create policy "Atualizar própria foto"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'profiles' and owner = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'Fotos públicas'
  ) then
    create policy "Fotos públicas"
      on storage.objects for select
      to public
      using (bucket_id = 'profiles');
  end if;
end $$;
