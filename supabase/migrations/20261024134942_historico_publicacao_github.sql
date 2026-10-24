-- 24/10/2026 — publicação no GitHub é uma ação externa que precisa ficar
-- visível no perfil. O registro só nasce depois de o GitHub aceitar o arquivo.
create table public.publicacao_github (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  atividade_id text not null references public.atividade(id) on delete cascade,
  atividade_titulo text not null,
  repositorio_completo text not null,
  url text not null,
  publicada_em timestamptz not null default now()
);

create index publicacao_github_por_pessoa_e_data
  on public.publicacao_github (usuario_id, publicada_em desc);

alter table public.publicacao_github enable row level security;

create policy "pessoa lê suas publicações GitHub" on public.publicacao_github
  for select to authenticated
  using ((select auth.uid()) = usuario_id);
