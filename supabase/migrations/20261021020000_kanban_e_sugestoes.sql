-- 0008 — o quadro no banco, e as sugestões de quem usa o site.
--
-- O quadro era dado escrito à mão em src/lib/kanban/dados.js. Sai de lá
-- por dois motivos: para deixar de exigir deploy a cada card movido, e
-- porque agora há quem queira sugerir algo — e sugestão que chega por
-- e-mail morre na caixa de entrada.
--
-- Ler é público: o quadro é a parte do projeto que explica o projeto.
-- Escrever é de qualquer pessoa com conta, por decisão de produto: o
-- quadro é aberto como um wiki. O preço é conhecido — quem tiver conta
-- pode apagar card alheio —, e o conserto, se incomodar, é uma policy
-- nova sem mexer em tabela: restringir update/delete a quem criou ou a
-- quem tem perfil.admin.

alter table public.perfil
  add column if not exists admin boolean not null default false;

/* quem administra. Separada porque três policies perguntam o mesmo, e
   repetir subconsulta em policy é onde o erro se esconde.
   security definer para poder ler perfil sem depender da RLS de perfil,
   com search_path vazio pelo motivo de sempre. */
create function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.admin from public.perfil p where p.id = auth.uid()),
    false
  );
$$;

create table kanban_card (
  -- o id é escrito, não gerado: ele é a âncora da URL (#supabase-db--auth)
  -- e o alvo de veja_tambem. Gerado, qualquer reimportação quebraria os elos.
  id text primary key,
  titulo text not null,
  raia text not null check (raia in ('arquitetura', 'interface', 'conteudo')),
  coluna text not null
    check (coluna in ('fazer', 'bloqueado', 'analise', 'descartado', 'concluido')),
  resumo text not null,
  -- a regra do quadro desde sempre: card sem motivo não entra
  porque text not null,
  -- os parágrafos e listas da ficha, no mesmo formato que a tela já lê
  blocos jsonb not null default '[]'::jsonb,
  veja_tambem text[] not null default '{}',
  -- dentro de uma coluna a ordem é intenção, não alfabeto: na raia
  -- Arquitetura ela chegou a ser sequência de dependência
  ordem integer not null default 0,
  -- quem criou, para o quadro aberto ter de quem cobrar e para uma
  -- policy futura poder distinguir "meu card" de "card alheio"
  autor_id uuid references auth.users on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index kanban_card_por_coluna on kanban_card (coluna, ordem);

create table sugestao (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users on delete cascade,
  titulo text not null check (length(trim(titulo)) between 3 and 120),
  corpo text not null check (length(trim(corpo)) between 10 and 4000),
  -- onde quem sugere acha que aquilo mora; palpite, não classificação
  raia text check (raia in ('arquitetura', 'interface', 'conteudo')),
  -- o ciclo de uma sugestão. "virou_card" aponta o card que nasceu dela,
  -- para a pessoa ver que a ideia dela está no quadro.
  estado text not null default 'nova'
    check (estado in ('nova', 'lida', 'virou_card', 'recusada')),
  card_id text references kanban_card on delete set null,
  resposta text,
  criado_em timestamptz not null default now()
);

create index sugestao_do_usuario on sugestao (usuario_id, criado_em desc);
create index sugestao_novas on sugestao (criado_em desc) where estado = 'nova';

alter table kanban_card enable row level security;
alter table sugestao enable row level security;

/* ------------------------------ o quadro ------------------------------ */

/* público para ler, inclusive deslogado: é a tela que explica as
   decisões do projeto a quem chega */
create policy "quadro é de todos para ler" on kanban_card
  for select using (true);

/* e de qualquer pessoa com conta para escrever */
create policy "quem tem conta escreve no quadro" on kanban_card
  for insert to authenticated with check (auth.uid() = autor_id);

create policy "quem tem conta edita o quadro" on kanban_card
  for update to authenticated using (true) with check (true);

/* apagar é o único gesto sem volta, e o quadro é coletivo: fica com
   quem criou o card e com quem administra */
create policy "apagar é de quem criou ou de quem administra" on kanban_card
  for delete to authenticated
  using (auth.uid() = autor_id or public.eh_admin());

/* ---------------------------- as sugestões ---------------------------- */

/* quem sugere vê a própria sugestão e a resposta que ela recebeu */
create policy "sugestão é de quem a escreveu" on sugestao
  for select using (auth.uid() = usuario_id or public.eh_admin());

create policy "qualquer pessoa com conta sugere" on sugestao
  for insert to authenticated with check (auth.uid() = usuario_id);

/* responder e arquivar é de quem administra; quem sugeriu não reescreve
   o estado da própria sugestão */
create policy "admin responde" on sugestao
  for update using (public.eh_admin()) with check (public.eh_admin());

create policy "admin arquiva" on sugestao
  for delete using (public.eh_admin());
