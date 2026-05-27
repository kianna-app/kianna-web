-- ─────────────────────────────────────────────────────────────
--  Catálogo de planos: adiciona 'essencial' (R$ 49) entre
--  Grátis e Pro. Mantém 'gratis' como default (plano Grátis real).
--
--  Decisão de negócio: estrutura final 4 planos
--    gratis    → "Grátis"    R$ 0
--    essencial → "Essencial" R$ 49
--    pro       → "Pro"       R$ 179
--    studio    → "Studio"    R$ 299
-- ─────────────────────────────────────────────────────────────

alter table public.profissionais
  drop constraint if exists profissionais_plano_check;

alter table public.profissionais
  add constraint profissionais_plano_check
  check (plano in ('gratis','essencial','pro','studio'));
