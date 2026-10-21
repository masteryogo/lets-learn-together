-- 0001 — a conta e o progresso de tópico.
--
-- O catálogo das trilhas NÃO está aqui: ele continua no repositório, e
-- um dia vira documento (jsonb). Por isso `trilha` e `topico_id` são
-- text sem foreign key — a integridade mora no código, que é quem sabe
-- que o id de um tópico é estável.

create table perfil (
  id uuid primary key references auth.users on delete cascade,
  nome text,
  -- ou o calendário daqui, ou o do Google: nunca os dois
  modo_calendario text not null default 'proprio'
    check (modo_calendario in ('proprio', 'google')),
  criado_em timestamptz not null default now()
);

create table progresso_topico (
  usuario_id uuid not null references auth.users on delete cascade,
  trilha text not null,
  topico_id text not null,
  estado text not null
    check (estado in ('pendente', 'estudando', 'feito', 'pulado')),
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, trilha, topico_id)
);

-- a barra de progresso pergunta "quantos feitos nesta trilha" a cada
-- visita, e é a única consulta quente do roadmap
create index progresso_topico_feitos
  on progresso_topico (usuario_id, trilha)
  where estado = 'feito';

alter table perfil enable row level security;
alter table progresso_topico enable row level security;

create policy "perfil é só seu" on perfil
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "progresso é só seu" on progresso_topico
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
