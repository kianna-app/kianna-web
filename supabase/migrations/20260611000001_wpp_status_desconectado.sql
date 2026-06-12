-- ─────────────────────────────────────────────────────────────
--  WhatsApp desconectado: timestamp, dedupe de aviso e registro
--  mínimo de estados de notificações.
-- ─────────────────────────────────────────────────────────────

alter table public.profissionais
  add column if not exists wpp_instance_id text,
  add column if not exists wpp_token text,
  add column if not exists wpp_status text not null default 'desconectado',
  add column if not exists wpp_desconectado_em timestamptz,
  add column if not exists wpp_aviso_desconexao_em timestamptz,
  add column if not exists lembrete_horas integer,
  add column if not exists cancelamento_auto_cliente boolean not null default false;

alter table public.profissionais
  drop constraint if exists profissionais_wpp_status_check;

alter table public.profissionais
  add constraint profissionais_wpp_status_check
  check (wpp_status in ('desconectado', 'conectando', 'conectado', 'erro'));

create index if not exists idx_profissionais_wpp_instance_id
  on public.profissionais(wpp_instance_id)
  where wpp_instance_id is not null;

create index if not exists idx_profissionais_wpp_desconectado
  on public.profissionais(wpp_desconectado_em)
  where wpp_status = 'desconectado';

create table if not exists public.whatsapp_notificacoes (
  id              uuid primary key default gen_random_uuid(),
  profissional_id uuid references public.profissionais(id) on delete cascade not null,
  tipo            text not null,
  destinatario    text,
  status          text not null
                  check (status in ('enviada', 'falha', 'nao_enviada')),
  motivo          text,
  detalhes        jsonb,
  criada_em       timestamptz not null default now()
);

create index if not exists idx_whatsapp_notificacoes_profissional_criada
  on public.whatsapp_notificacoes(profissional_id, criada_em desc);

create index if not exists idx_whatsapp_notificacoes_status
  on public.whatsapp_notificacoes(status, criada_em desc)
  where status in ('falha', 'nao_enviada');

alter table public.whatsapp_notificacoes enable row level security;
