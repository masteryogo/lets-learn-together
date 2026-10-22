-- 0014 — quem quer apoiar, e por onde fala.
--
-- O rodapé de todas as telas tem uma célula vaga dizendo que está à
-- venda, e até aqui o link dela levava a um perfil do GitHub. Perfil
-- não é canal: quem chega de uma empresa não abre issue, e e-mail
-- publicado em página pública vira alvo de robô.
--
-- Por isso a tabela: o formulário de /apoio escreve aqui, e a
-- conversa começa com o que já basta para respondê-la.
--
-- Escrever é de QUALQUER PESSOA, inclusive deslogada — exigir conta
-- para dizer "quero apoiar" é pedir cadastro a quem veio oferecer
-- dinheiro. O preço disso é spam, e ele está contido em três lugares:
-- os `check` de tamanho abaixo, a ausência de qualquer leitura pública
-- (nada do que for escrito aqui aparece em tela nenhuma) e o fato de
-- não existir update para quem escreveu. Se o robô achar o endpoint,
-- o estrago é linha suja na tabela, não conteúdo no site.
--
-- Ler é só de quem administra: é contato de pessoa identificada numa
-- empresa, e nada aqui tem motivo para ser público.

create table contato_apoio (
  id uuid primary key default gen_random_uuid(),
  empresa text not null check (length(trim(empresa)) between 2 and 120),
  -- o nome de quem está escrevendo: responder "prezada empresa" é
  -- começar a conversa dizendo que ninguém leu
  pessoa text not null check (length(trim(pessoa)) between 2 and 120),
  email text not null check (
    length(trim(email)) between 5 and 160 and position('@' in email) > 1
  ),
  /* o que interessa à empresa, nos formatos que a página oferece.
     Array e não coluna por formato: a lista muda — "vitrine" ainda
     nem existe —, e formato novo não pode pedir migration de tabela. */
  formatos text[] not null default '{}'
    check (formatos <@ array['carimbo', 'trilha', 'vitrine']),
  mensagem text check (length(trim(mensagem)) <= 4000),
  -- o ciclo do contato, igual ao da sugestão: a caixa só é útil
  -- enquanto dá para ver o que ainda não foi respondido
  estado text not null default 'novo'
    check (estado in ('novo', 'lido', 'respondido', 'recusado')),
  criado_em timestamptz not null default now()
);

create index contato_apoio_novos on contato_apoio (criado_em desc)
  where estado = 'novo';

alter table contato_apoio enable row level security;

/* qualquer pessoa escreve, inclusive sem conta: a página é para quem
   vem de fora, e o cadastro seria um pedágio no caminho errado */
create policy "qualquer pessoa fala sobre apoio" on contato_apoio
  for insert to anon, authenticated with check (true);

/* e ninguém mais lê: contato de empresa não é conteúdo do site */
create policy "só quem administra lê os contatos" on contato_apoio
  for select using (public.eh_admin());

create policy "só quem administra responde" on contato_apoio
  for update using (public.eh_admin()) with check (public.eh_admin());

create policy "só quem administra apaga" on contato_apoio
  for delete using (public.eh_admin());
