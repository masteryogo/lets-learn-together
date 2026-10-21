-- 0003 — a rota condicional.
--
-- Marcação no GRUPO, não no tópico: 50 marcações contra 353. E a
-- decisão de produto que vem junto: o que fica fora da rota é
-- atenuado, nunca escondido — por isso o banco guarda a escolha, e
-- não uma lista de exibição.

create table rota_grupo (
  usuario_id uuid not null references auth.users on delete cascade,
  trilha text not null,
  grupo_id text not null,
  -- false é "fora da rota". Linha ausente significa dentro: quem nunca
  -- escolheu rota vê a trilha inteira, que é o padrão de hoje.
  incluido boolean not null default true,
  primary key (usuario_id, trilha, grupo_id)
);

create index rota_grupo_excluidos
  on rota_grupo (usuario_id, trilha)
  where incluido = false;

alter table rota_grupo enable row level security;

create policy "rota é só sua" on rota_grupo
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
