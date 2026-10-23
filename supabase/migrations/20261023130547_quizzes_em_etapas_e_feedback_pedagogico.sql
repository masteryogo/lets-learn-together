-- Separa o feedback de acerto e erro sem trocar o formato JSONB do gabarito.
update public.atividade_gabarito g
set configuracao = g.configuracao || jsonb_build_object(
  'explicacaoCorreta', coalesce(
    nullif(g.configuracao ->> 'explicacaoCorreta', ''),
    nullif(g.configuracao ->> 'explicacao', ''),
    'A resposta demonstra o conceito avaliado.'
  ),
  'explicacaoIncorreta', coalesce(
    nullif(g.configuracao ->> 'explicacaoIncorreta', ''),
    'A alternativa correta é: ' || coalesce((
      select string_agg(opcao.valor ->> 'texto', '; ' order by opcao.ordem)
      from jsonb_array_elements(a.configuracao -> 'alternativas') with ordinality as opcao(valor, ordem)
      where g.configuracao -> 'corretas' @> jsonb_build_array(opcao.valor ->> 'id')
    ), 'revise as alternativas') || '. ' || coalesce(
      nullif(g.configuracao ->> 'explicacao', ''),
      'Revise o conceito apresentado e tente novamente.'
    )
  )
)
from public.atividade a
where a.id = g.atividade_id
  and a.trilha = 'python'
  and a.tipo in ('quiz', 'erro');

insert into public.atividade
  (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada)
values
  (
    'py-quiz-vf-ini-02', 'python', 'py-ini-02', 'quiz',
    'As instruções seguem a ordem do arquivo',
    'Em um programa simples, as instruções são executadas na ordem em que aparecem, de cima para baixo. Verdadeiro ou falso?',
    '{"formato":"verdadeiro-falso","multipla":false,"alternativas":[{"id":"verdadeiro","texto":"Verdadeiro"},{"id":"falso","texto":"Falso"}]}'::jsonb,
    'iniciante', 30, true
  ),
  (
    'py-quiz-vf-ini-09', 'python', 'py-ini-09', 'quiz',
    'input() converte algarismos para número',
    'Se a pessoa digitar 18 em input(), Python recebe automaticamente o número inteiro 18. Verdadeiro ou falso?',
    '{"formato":"verdadeiro-falso","multipla":false,"alternativas":[{"id":"verdadeiro","texto":"Verdadeiro"},{"id":"falso","texto":"Falso"}]}'::jsonb,
    'iniciante', 30, true
  )
on conflict (id) do update set
  trilha = excluded.trilha,
  topico_id = excluded.topico_id,
  tipo = excluded.tipo,
  titulo = excluded.titulo,
  enunciado = excluded.enunciado,
  configuracao = excluded.configuracao,
  dificuldade = excluded.dificuldade,
  ordem = excluded.ordem,
  publicada = excluded.publicada,
  atualizado_em = now();

insert into public.atividade_gabarito (atividade_id, configuracao) values
  (
    'py-quiz-vf-ini-02',
    '{"corretas":["verdadeiro"],"explicacaoCorreta":"Isso. Em um script sequencial, Python executa as instruções na ordem em que aparecem, salvo quando uma condição ou repetição muda o fluxo.","explicacaoIncorreta":"A afirmação é verdadeira: em um script sequencial, Python lê e executa as instruções de cima para baixo. Condições e laços são os recursos que desviam desse fluxo."}'::jsonb
  ),
  (
    'py-quiz-vf-ini-09',
    '{"corretas":["falso"],"explicacaoCorreta":"Isso. input() sempre devolve texto. Para calcular com o valor digitado, converta-o explicitamente, por exemplo com int(input()).","explicacaoIncorreta":"A afirmação é falsa: input() devolve str mesmo quando recebe algarismos. Use int(...) ou float(...) antes de fazer cálculos."}'::jsonb
  )
on conflict (atividade_id) do update set
  configuracao = excluded.configuracao,
  atualizado_em = now();

insert into public.atividade_competencia (atividade_id, competencia_id) values
  ('py-quiz-vf-ini-02', 'py-comp-ini-02'),
  ('py-quiz-vf-ini-09', 'py-comp-entrada')
on conflict do nothing;
