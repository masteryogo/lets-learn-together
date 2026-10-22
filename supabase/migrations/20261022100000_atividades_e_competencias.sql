-- 22/10/2026 — atividades, competências e tentativas.
--
-- O mapa continua documento porque é lido inteiro; atividades precisam
-- de consulta, autoria e histórico por pessoa. Gabarito fica separado:
-- RLS escolhe linhas, não colunas, portanto escondê-lo na mesma tabela
-- pública o entregaria ao navegador junto com o enunciado.

create type public.tipo_atividade as enum ('quiz', 'saida', 'completar', 'erro');

create table public.competencia (
  id text primary key,
  trilha text not null references public.trilha(id) on delete cascade,
  topico_id text not null,
  titulo text not null,
  descricao text not null,
  criterio text not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  unique (trilha, topico_id, titulo)
);

create table public.atividade (
  id text primary key,
  trilha text not null references public.trilha(id) on delete cascade,
  topico_id text not null,
  tipo public.tipo_atividade not null,
  titulo text not null,
  enunciado text not null,
  configuracao jsonb not null default '{}'::jsonb,
  dificuldade text not null check (dificuldade in ('iniciante', 'intermediario', 'avancado')),
  ordem integer not null default 0,
  publicada boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.atividade_gabarito (
  atividade_id text primary key references public.atividade(id) on delete cascade,
  configuracao jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table public.atividade_competencia (
  atividade_id text not null references public.atividade(id) on delete cascade,
  competencia_id text not null references public.competencia(id) on delete cascade,
  primary key (atividade_id, competencia_id)
);

create table public.tentativa_atividade (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  atividade_id text not null references public.atividade(id) on delete cascade,
  resposta jsonb not null,
  correta boolean not null,
  pontuacao numeric(5,2) not null check (pontuacao between 0 and 100),
  feedback text not null,
  detalhes jsonb not null default '{}'::jsonb,
  criada_em timestamptz not null default now()
);

create index tentativa_atividade_do_usuario
  on public.tentativa_atividade (usuario_id, atividade_id, criada_em desc);

alter table public.competencia enable row level security;
alter table public.atividade enable row level security;
alter table public.atividade_gabarito enable row level security;
alter table public.atividade_competencia enable row level security;
alter table public.tentativa_atividade enable row level security;

create policy "competência publicada é pública" on public.competencia
  for select using (exists (
    select 1 from public.trilha t where t.id = competencia.trilha and (t.publicada or public.eh_admin())
  ));

create policy "atividade publicada é pública" on public.atividade
  for select using (publicada or public.eh_admin());

create policy "vínculo de atividade é público" on public.atividade_competencia
  for select using (exists (
    select 1 from public.atividade a where a.id = atividade_competencia.atividade_id and (a.publicada or public.eh_admin())
  ));

create policy "tentativa é só da pessoa" on public.tentativa_atividade
  for select using (auth.uid() = usuario_id);

-- Gabaritos e tentativas só são escritos pela Edge Function com service role.
-- Administração continua sendo a única escrita manual permitida.
create policy "admin administra competências" on public.competencia
  for all using (public.eh_admin()) with check (public.eh_admin());
create policy "admin administra atividades" on public.atividade
  for all using (public.eh_admin()) with check (public.eh_admin());
create policy "admin administra gabaritos" on public.atividade_gabarito
  for all using (public.eh_admin()) with check (public.eh_admin());
create policy "admin administra vínculos" on public.atividade_competencia
  for all using (public.eh_admin()) with check (public.eh_admin());
create policy "admin lê tentativas" on public.tentativa_atividade
  for select using (public.eh_admin());

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem) values
  ('py-comp-executar', 'python', 'py-ini-08', 'Executar um programa simples', 'Executa um script e explica sua saída.', 'Roda um arquivo próprio pelo terminal e altera uma mensagem sem ajuda.', 10),
  ('py-comp-entrada', 'python', 'py-ini-09', 'Receber entrada textual', 'Lê uma resposta de quem usa o programa.', 'Usa input e inclui o valor recebido numa saída compreensível.', 20),
  ('py-comp-tipos', 'python', 'py-fun-02', 'Distinguir tipos básicos', 'Reconhece texto, inteiro, decimal, booleano e ausência.', 'Prevê o tipo e a operação válida para valores simples.', 30),
  ('py-comp-operadores', 'python', 'py-fun-03', 'Calcular expressões', 'Aplica operadores e precedência.', 'Prevê a saída de uma expressão e justifica a ordem do cálculo.', 40),
  ('py-comp-condicao', 'python', 'py-fun-07', 'Tomar decisões com condições', 'Escolhe um caminho a partir de uma comparação.', 'Escreve uma condição válida e cobre o caso alternativo.', 50),
  ('py-comp-repeticao', 'python', 'py-fun-08', 'Repetir um processo', 'Percorre valores sem copiar comandos.', 'Usa for ou while com uma condição de parada clara.', 60)
on conflict (id) do nothing;

insert into public.atividade (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada) values
  ('py-quiz-print', 'python', 'py-ini-08', 'quiz', 'Primeira saída', 'Qual chamada mostra o texto Olá na tela?',
   '{"multipla":false,"alternativas":[{"id":"a","texto":"print(Olá)"},{"id":"b","texto":"print(\"Olá\")"},{"id":"c","texto":"input(\"Olá\")"}]}'::jsonb, 'iniciante', 10, true),
  ('py-saida-precedencia', 'python', 'py-fun-03', 'saida', 'Preveja a saída', 'Qual valor este código mostra?\n\nx = 10\ny = 5\nprint(x + y * 2)',
   '{"codigo":"x = 10\\ny = 5\\nprint(x + y * 2)","rotuloResposta":"Saída exibida"}'::jsonb, 'iniciante', 10, true),
  ('py-completar-maioridade', 'python', 'py-fun-07', 'completar', 'Complete a condição', 'Preencha a lacuna para que o programa reconheça quem tem 18 anos ou mais.',
   '{"codigo":"idade = 18\\n\\nif idade ___ 18:\\n    print(\"Maior de idade\")","lacunas":[{"id":"operador","rotulo":"Operador de comparação"}]}'::jsonb, 'iniciante', 10, true),
  ('py-erro-igualdade', 'python', 'py-fun-07', 'erro', 'Encontre o erro', 'O que está errado nesta condição?\n\nif idade = 18:\n    print(\"Tem 18 anos\")',
   '{"codigo":"if idade = 18:\\n    print(\"Tem 18 anos\")","alternativas":[{"id":"a","texto":"A condição precisa usar == para comparar."},{"id":"b","texto":"print não pode ficar dentro de if."},{"id":"c","texto":"idade só pode guardar texto."}]}'::jsonb, 'iniciante', 20, true)
on conflict (id) do nothing;

insert into public.atividade_gabarito (atividade_id, configuracao) values
  ('py-quiz-print', '{"corretas":["b"],"explicacao":"print recebe um texto entre aspas e o exibe. input espera uma resposta; sem aspas, Olá seria interpretado como um nome de variável."}'::jsonb),
  ('py-saida-precedencia', '{"aceitas":["20"],"explicacao":"A multiplicação acontece antes da soma: 5 vezes 2 é 10, e 10 mais 10 é 20."}'::jsonb),
  ('py-completar-maioridade', '{"lacunas":{"operador":[">="]},"explicacao":">= significa maior ou igual. Assim, 18 também entra no primeiro caminho."}'::jsonb),
  ('py-erro-igualdade', '{"corretas":["a"],"explicacao":"Em Python, = atribui um valor; == compara dois valores. Uma condição precisa de uma comparação que resulte em verdadeiro ou falso."}'::jsonb)
on conflict (atividade_id) do nothing;

insert into public.atividade_competencia (atividade_id, competencia_id) values
  ('py-quiz-print', 'py-comp-executar'),
  ('py-saida-precedencia', 'py-comp-operadores'),
  ('py-completar-maioridade', 'py-comp-condicao'),
  ('py-erro-igualdade', 'py-comp-condicao')
on conflict do nothing;
