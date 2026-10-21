-- 0011 — o catálogo das trilhas sai do código.
--
-- Era ~300 KB de JavaScript em src/lib/trilhas/<id>/, com o manifesto
-- escrito à mão em trilhas.js. Sai de lá para que trilha nova e
-- correção de tópico deixem de exigir deploy — e porque o "Painel
-- criativo de roadmaps" só existe com o conteúdo em algum lugar que
-- a interface possa escrever.
--
-- Documento, não relação: a estrutura é etapa > grupo > tópico, e a
-- única consulta que a aplicação faz é "me dá a trilha inteira".
-- Normalizar isso em quatro tabelas criaria quatro JOINs e uma coluna
-- de ordem em cada uma, para remontar exatamente a árvore que o
-- index.js já montava. Foi a decisão de 19/10, e ela se mantém.
--
-- O id continua sendo o id escrito: ele é a chave do progresso salvo
-- de quem já marcou um tópico, e nenhuma tabela aponta para cá
-- justamente para o catálogo poder se mexer sem arrastar o resto.

create table trilha (
  id text primary key,
  rotulo text not null,
  -- a cor da rota desenhada na carta da mesa
  cor text not null,
  -- a rota da carta: pares [x, y] num quadro de 300x240
  rota jsonb not null default '[]'::jsonb,
  ordem integer not null default 0,
  -- trilha em rascunho não aparece na mesa. É o que o mapa de
  -- carregadores escrito à mão garantia antes: pasta que existe mas
  -- não está registrada não é empacotada.
  publicada boolean not null default true,
  -- { ROADMAP, PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS }
  conteudo jsonb not null,
  -- derivados do conteúdo, mantidos pelo gatilho abaixo. Eles existem
  -- como coluna porque a mesa os mostra sem baixar trilha nenhuma.
  etapas integer not null default 0,
  grupos integer not null default 0,
  topicos integer not null default 0,
  atualizado_em timestamptz not null default now()
);

/* o manifesto antigo dizia 5 etapas e 156 tópicos para o ml, enquanto
   o quadro contava 15 grupos e 157 — número escrito à mão diverge do
   conteúdo no dia em que alguém esquece de recontar. Aqui ele é
   recontado a cada escrita. */
create function public.contar_trilha()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  etapa jsonb;
  grupo jsonb;
begin
  new.etapas := 0;
  new.grupos := 0;
  new.topicos := 0;

  for etapa in
    select * from jsonb_array_elements(
      coalesce(new.conteudo -> 'ROADMAP' -> 'etapas', '[]'::jsonb))
  loop
    new.etapas := new.etapas + 1;
    for grupo in
      select * from jsonb_array_elements(coalesce(etapa -> 'grupos', '[]'::jsonb))
    loop
      new.grupos := new.grupos + 1;
      new.topicos := new.topicos
        + jsonb_array_length(coalesce(grupo -> 'topicos', '[]'::jsonb));
    end loop;
  end loop;

  new.atualizado_em := now();
  return new;
end;
$$;

create trigger trilha_contagem
  before insert or update of conteudo on trilha
  for each row execute function public.contar_trilha();

alter table trilha enable row level security;

/* o conteúdo é público: é o site. Rascunho fica fora até ser publicado */
create policy "trilha publicada é de todos" on trilha
  for select using (publicada or public.eh_admin());

/* e escrever é de quem administra. Diferente do quadro, que é aberto
   a qualquer conta: lá o valor é a conversa; aqui, o conteúdo é o
   produto, e um tópico reescrito por engano apaga o sentido do
   progresso de quem já o marcou. */
create policy "só admin escreve trilha" on trilha
  for all using (public.eh_admin()) with check (public.eh_admin());
