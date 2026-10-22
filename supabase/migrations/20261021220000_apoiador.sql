-- 0015 — quem já apoia, e em que lote.
--
-- A contraparte de `contato_apoio`: lá entra quem quer conversar, aqui
-- fica quem fechou. São tabelas separadas de propósito — o contato é
-- privado e tem ciclo ('novo' → 'respondido'); o apoiador é público e
-- não tem estado nenhum, só presença.
--
-- Não há coluna de logo, e isso é decisão, não falta. A mesa é
-- Departure Mono numa grade de 11px com `--raio: 0`; uma imagem de
-- marca alheia seria o único elemento da página fora dessa grade, e
-- ainda exigiria storage, proporção e duas versões por causa do tema.
-- O apoiador aparece escrito, no mesmo papel do resto do carimbo.

create table apoiador (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 2 and 80),
  -- para onde o nome aponta. Opcional: pode haver quem apoie e não
  -- queira link, e exigi-lo faria inventar um
  site text check (site ~ '^https://'),
  /* o lote ocupado, na mesma lista de `contato_apoio.formatos`: é o
     que liga a planta de expansão ao carimbo. Sem o `check`, um lote
     escrito errado some da tela sem erro nenhum para avisar. */
  lote text not null check (lote in ('carimbo', 'trilha', 'vitrine')),
  -- a ordem é escrita à mão porque não há critério melhor: nem
  -- alfabética nem por data dizem o que deve vir primeiro no carimbo
  ordem int not null default 0,
  desde date not null default current_date,
  criado_em timestamptz not null default now()
);

alter table apoiador enable row level security;

/* todo mundo lê, inclusive sem conta: o ponto da tabela é aparecer na
   mesa, que é a primeira tela de quem nunca entrou */
create policy "qualquer pessoa vê quem apoia" on apoiador
  for select to anon, authenticated using (true);

/* e só quem administra escreve: apoiador não se cadastra sozinho, ele
   é o fim de uma conversa que começou em `contato_apoio` */
create policy "só quem administra inscreve apoiador" on apoiador
  for insert to authenticated with check (public.eh_admin());

create policy "só quem administra corrige apoiador" on apoiador
  for update using (public.eh_admin()) with check (public.eh_admin());

create policy "só quem administra remove apoiador" on apoiador
  for delete using (public.eh_admin());
