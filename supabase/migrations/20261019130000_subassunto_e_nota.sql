-- 0002 — os subassuntos marcados e as notas do mural.
--
-- A nota é o primeiro dado do projeto que não se refaz clicando. É ela
-- que justifica o banco existir: o Safari apaga localStorage de site sem
-- visita em 7 dias, e um roadmap de estudo fica semanas fechado.

create table progresso_subassunto (
  usuario_id uuid not null references auth.users on delete cascade,
  trilha text not null,
  topico_id text not null,
  -- o texto, não o índice: se um subassunto for reescrito, a marca dele
  -- se perde de propósito, em vez de herdar a marca de outro item.
  -- Espelha chaveSub() em src/lib/roadmap/subassuntos.js.
  sub_texto text not null,
  marcado_em timestamptz not null default now(),
  primary key (usuario_id, trilha, topico_id, sub_texto)
);

create table nota (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users on delete cascade,
  trilha text not null,
  -- nulo é a nota solta; preenchido, ela aparece no mural E no drawer
  -- do tópico. Uma entidade, dois pontos de entrada.
  topico_id text,
  texto text not null,
  cor text not null default 'amarelo'
    check (cor in ('amarelo', 'roxo', 'verde', 'cinza')),
  -- posição no mural de tela larga. Nula cai em vaga automática, e no
  -- celular é ignorada: posição é adorno, não dado.
  x integer,
  y integer,
  -- cada nota pegada sobe ao topo e fica lá
  z integer not null default 10,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- o mural abre filtrado por trilha, e é a única consulta que ele faz
create index nota_do_mural on nota (usuario_id, trilha);

alter table progresso_subassunto enable row level security;
alter table nota enable row level security;

create policy "subassunto é só seu" on progresso_subassunto
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "nota é só sua" on nota
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
