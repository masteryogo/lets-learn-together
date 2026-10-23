-- 23/10/2026 — vínculo opcional entre uma conta do LLT e uma instalação
-- da GitHub App. Token não entra aqui: é temporário e nasce na Edge Function.

create table public.conexao_github (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  instalacao_id bigint not null unique,
  conta_id bigint not null,
  conta_login text not null,
  repositorio_id bigint,
  repositorio_completo text,
  branch text,
  conectada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

alter table public.conexao_github enable row level security;

-- A pessoa só vê o vínculo dela. Criar, validar, trocar repositório e
-- desconectar passam pela Edge Function, que confirma a instalação no GitHub.
create policy "conexão GitHub é só da pessoa" on public.conexao_github
  for select using (auth.uid() = usuario_id);
