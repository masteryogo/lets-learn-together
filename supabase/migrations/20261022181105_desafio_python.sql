-- O primeiro desafio exercita decomposição e validação sem antecipar
-- conteúdos avançados: a entrada é uma sequência de inteiros no terminal.
alter table public.tentativa_atividade
  add column acao text not null default 'enviar'
  check (acao in ('executar', 'enviar'));

create index tentativa_atividade_por_pessoa_e_tempo
  on public.tentativa_atividade (usuario_id, criada_em desc);

insert into public.competencia (id, trilha, topico_id, titulo, descricao, criterio, ordem)
values (
  'py-comp-maior-valor', 'python', 'py-est-10', 'Percorrer uma sequência para encontrar um valor',
  'Lê uma coleção e mantém o maior valor encontrado sem usar max().',
  'Entrega uma solução que funciona com números positivos, negativos e repetidos.', 70
)
on conflict (id) do nothing;

insert into public.atividade (id, trilha, topico_id, tipo, titulo, enunciado, configuracao, dificuldade, ordem, publicada)
values (
  'py-desafio-maior-valor', 'python', 'py-est-10', 'desafio', 'Encontre o maior número',
  'Escreva um programa que leia uma linha com números inteiros separados por espaços e mostre o maior deles. Não use a função max(). A entrada terá pelo menos um número.',
  '{"codigoInicial":"numeros = [int(valor) for valor in input().split()]\n\n# Comece pelo primeiro valor e percorra os demais.\nmaior = numeros[0]\n\n# Escreva sua solução aqui.\n\nprint(maior)","entradaExemplo":"4 9 -2 7\n","saidaExemplo":"9\n","linguagem":"python","limiteCaracteres":12000}'::jsonb,
  'iniciante', 10, true
)
on conflict (id) do nothing;

insert into public.atividade_gabarito (atividade_id, configuracao)
values (
  'py-desafio-maior-valor',
  '{"testes":[{"entrada":"4 9 -2 7\n","saida":"9\n"},{"entrada":"-8 -3 -11\n","saida":"-3\n"},{"entrada":"5 5 2 5\n","saida":"5\n"},{"entrada":"0 -4 12 3\n","saida":"12\n"}],"explicacao":"Inicie com o primeiro número como maior provisório. Depois percorra os demais e atualize esse valor apenas quando encontrar um número maior. Assim a solução também funciona quando todos são negativos."}'::jsonb
)
on conflict (atividade_id) do nothing;

insert into public.atividade_competencia (atividade_id, competencia_id)
values ('py-desafio-maior-valor', 'py-comp-maior-valor')
on conflict do nothing;
