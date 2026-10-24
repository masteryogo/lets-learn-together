-- 24/10/2026 — preferências de entrada evoluem junto com o catálogo. Um
-- documento permite acrescentar novas perguntas sem transformar cada uma em
-- uma migration; os ids das trilhas continuam estáveis no array de interesses.
alter table public.perfil
  add column onboarding jsonb not null default '{}'::jsonb
    check (jsonb_typeof(onboarding) = 'object'),
  add column onboarding_concluido_em timestamptz;
