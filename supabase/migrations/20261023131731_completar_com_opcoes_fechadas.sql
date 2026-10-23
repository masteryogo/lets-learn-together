-- Troca lacunas abertas por alternativas identificadas, sem expor o gabarito.
create temporary table opcoes_fechadas (
  atividade_id text not null,
  lacuna_id text not null,
  alternativas jsonb not null,
  corretas jsonb not null,
  primary key (atividade_id, lacuna_id)
);

insert into opcoes_fechadas (atividade_id, lacuna_id, alternativas, corretas) values
  ('py-completar-apl-01', 'palavra', '[{"id":"a","texto":"import"},{"id":"b","texto":"from"},{"id":"c","texto":"return"},{"id":"d","texto":"as"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-apl-04', 'operador', '[{"id":"a","texto":"/"},{"id":"b","texto":"+"},{"id":"c","texto":"."},{"id":"d","texto":"//"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-apl-06', 'funcao', '[{"id":"a","texto":"load"},{"id":"b","texto":"loads"},{"id":"c","texto":"dump"},{"id":"d","texto":"dumps"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-apl-07', 'leitor', '[{"id":"a","texto":"DictReader"},{"id":"b","texto":"DictWriter"},{"id":"c","texto":"reader"},{"id":"d","texto":"writer"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-apl-08', 'excecao', '[{"id":"a","texto":"FileNotFoundError"},{"id":"b","texto":"PermissionError"},{"id":"c","texto":"IsADirectoryError"},{"id":"d","texto":"ValueError"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-apl-09', 'redirecionamento', '[{"id":"a","texto":">"},{"id":"b","texto":"<"},{"id":"c","texto":">>"},{"id":"d","texto":"|"}]'::jsonb, '["a","c"]'::jsonb),
  ('py-completar-apl-10', 'parametro', '[{"id":"a","texto":"timeout"},{"id":"b","texto":"retries"},{"id":"c","texto":"headers"},{"id":"d","texto":"verify"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-est-01', 'indice', '[{"id":"a","texto":"0"},{"id":"b","texto":"1"},{"id":"c","texto":"-1"},{"id":"d","texto":"len(nomes)"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-est-05', 'fatia', '[{"id":"a","texto":"0:3"},{"id":"b","texto":":3"},{"id":"c","texto":"0:2"},{"id":"d","texto":"3:0"}]'::jsonb, '["a","b"]'::jsonb),
  ('py-completar-est-07', 'palavra', '[{"id":"a","texto":"def"},{"id":"b","texto":"class"},{"id":"c","texto":"return"},{"id":"d","texto":"import"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-est-09', 'retorno', '[{"id":"a","texto":"return"},{"id":"b","texto":"print"},{"id":"c","texto":"yield"},{"id":"d","texto":"break"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-01', 'resultado', '[{"id":"a","texto":"Então"},{"id":"b","texto":"Se"},{"id":"c","texto":"Porque"},{"id":"d","texto":"Ou"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-02', 'passo', '[{"id":"a","texto":"persistir"},{"id":"b","texto":"imprimir"},{"id":"c","texto":"formatar"},{"id":"d","texto":"apagar"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-03', 'valor', '[{"id":"a","texto":"__main__"},{"id":"b","texto":"__name__"},{"id":"c","texto":"__file__"},{"id":"d","texto":"__init__"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-04', 'excecao', '[{"id":"a","texto":"ValueError"},{"id":"b","texto":"TypeError"},{"id":"c","texto":"KeyError"},{"id":"d","texto":"IndexError"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-05', 'placeholder', '[{"id":"a","texto":"?"},{"id":"b","texto":"&"},{"id":"c","texto":"#"},{"id":"d","texto":"!"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-07', 'laço', '[{"id":"a","texto":"while"},{"id":"b","texto":"for"},{"id":"c","texto":"if"},{"id":"d","texto":"return"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-08', 'excecao', '[{"id":"a","texto":"IntegrityError"},{"id":"b","texto":"OperationalError"},{"id":"c","texto":"DatabaseError"},{"id":"d","texto":"ProgrammingError"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-09', 'comparacao', '[{"id":"a","texto":"=="},{"id":"b","texto":"="},{"id":"c","texto":"!="},{"id":"d","texto":">="}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fin-10', 'secao', '[{"id":"a","texto":"testes"},{"id":"b","texto":"documentação"},{"id":"c","texto":"relatórios"},{"id":"d","texto":"instalação"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fun-03', 'operador', '[{"id":"a","texto":"//"},{"id":"b","texto":"/"},{"id":"c","texto":"%"},{"id":"d","texto":"**"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fun-04', 'conector', '[{"id":"a","texto":"and"},{"id":"b","texto":"or"},{"id":"c","texto":"not"},{"id":"d","texto":"in"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fun-06', 'variavel', '[{"id":"a","texto":"nome"},{"id":"b","texto":"idade"},{"id":"c","texto":"saudacao"},{"id":"d","texto":"entrada"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-maioridade', 'operador', '[{"id":"a","texto":">="},{"id":"b","texto":">"},{"id":"c","texto":"<="},{"id":"d","texto":"=="}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fun-10', 'comando', '[{"id":"a","texto":"break"},{"id":"b","texto":"continue"},{"id":"c","texto":"pass"},{"id":"d","texto":"return"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-fun-10-continue', 'comando', '[{"id":"a","texto":"continue"},{"id":"b","texto":"break"},{"id":"c","texto":"pass"},{"id":"d","texto":"return"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-01', 'passos', '[{"id":"a","texto":"instruções"},{"id":"b","texto":"imagens"},{"id":"c","texto":"janelas"},{"id":"d","texto":"opiniões"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-03', 'processar', '[{"id":"a","texto":"processamento"},{"id":"b","texto":"armazenamento"},{"id":"c","texto":"interface"},{"id":"d","texto":"decisão"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-04', 'passo1', '[{"id":"a","texto":"perguntar"},{"id":"b","texto":"exibir"},{"id":"c","texto":"calcular"},{"id":"d","texto":"formatar"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-04', 'passo2', '[{"id":"a","texto":"mostrar"},{"id":"b","texto":"ler"},{"id":"c","texto":"validar"},{"id":"d","texto":"armazenar"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-05', 'uso', '[{"id":"a","texto":"automação"},{"id":"b","texto":"navegação manual"},{"id":"c","texto":"montagem mecânica"},{"id":"d","texto":"edição de hardware"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-ini-06', 'comando', '[{"id":"a","texto":"python --version"},{"id":"b","texto":"python3 --version"},{"id":"c","texto":"python --install"},{"id":"d","texto":"pip --python"}]'::jsonb, '["a","b"]'::jsonb),
  ('py-completar-ini-08', 'funcao', '[{"id":"a","texto":"print"},{"id":"b","texto":"input"},{"id":"c","texto":"open"},{"id":"d","texto":"type"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-int-01', 'palavra', '[{"id":"a","texto":"class"},{"id":"b","texto":"def"},{"id":"c","texto":"import"},{"id":"d","texto":"object"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-int-04', 'atributo', '[{"id":"a","texto":"livros"},{"id":"b","texto":"autores"},{"id":"c","texto":"estoque"},{"id":"d","texto":"nome"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-int-06', 'expressao', '[{"id":"a","texto":"n ** 2"},{"id":"b","texto":"n + 2"},{"id":"c","texto":"n * 2"},{"id":"d","texto":"n / 2"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-int-08', 'decorador', '[{"id":"a","texto":"@dataclass"},{"id":"b","texto":"@classmethod"},{"id":"c","texto":"@property"},{"id":"d","texto":"@staticmethod"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-int-09', 'funcao', '[{"id":"a","texto":"fullmatch"},{"id":"b","texto":"search"},{"id":"c","texto":"match"},{"id":"d","texto":"findall"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-01', 'arquivo', '[{"id":"a","texto":"calculos.py"},{"id":"b","texto":"main.py"},{"id":"c","texto":"*.py"},{"id":"d","texto":"projeto.py"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-03', 'opcao', '[{"id":"a","texto":"-c"},{"id":"b","texto":"-d"},{"id":"c","texto":"-m"},{"id":"d","texto":"-a"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-04', 'pasta', '[{"id":"a","texto":"bin"},{"id":"b","texto":"Scripts"},{"id":"c","texto":"lib"},{"id":"d","texto":"include"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-05', 'opcao', '[{"id":"a","texto":"-r"},{"id":"b","texto":"-m"},{"id":"c","texto":"-c"},{"id":"d","texto":"-u"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-06', 'funcao', '[{"id":"a","texto":"breakpoint"},{"id":"b","texto":"print"},{"id":"c","texto":"debugger"},{"id":"d","texto":"traceback"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-08', 'assertiva', '[{"id":"a","texto":"assert"},{"id":"b","texto":"check"},{"id":"c","texto":"expect"},{"id":"d","texto":"verify"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-09', 'comando', '[{"id":"a","texto":"check"},{"id":"b","texto":"format"},{"id":"c","texto":"run"},{"id":"d","texto":"inspect"}]'::jsonb, '["a"]'::jsonb),
  ('py-completar-pro-10', 'modulo', '[{"id":"a","texto":"pytest"},{"id":"b","texto":"unittest"},{"id":"c","texto":"pip"},{"id":"d","texto":"venv"}]'::jsonb, '["a"]'::jsonb);

update opcoes_fechadas o
set alternativas = (
  select jsonb_agg(opcao.valor order by md5(o.atividade_id || o.lacuna_id || (opcao.valor ->> 'id')))
  from jsonb_array_elements(o.alternativas) as opcao(valor)
);

with por_atividade as (
  select
    atividade_id,
    jsonb_object_agg(lacuna_id, alternativas) as alternativas,
    jsonb_object_agg(lacuna_id, corretas) as corretas
  from opcoes_fechadas
  group by atividade_id
)
update public.atividade a
set configuracao = jsonb_set(
  a.configuracao,
  '{lacunas}',
  (
    select jsonb_agg(
      lacuna.valor || jsonb_build_object('alternativas', p.alternativas -> (lacuna.valor ->> 'id'))
      order by lacuna.ordem
    )
    from jsonb_array_elements(a.configuracao -> 'lacunas') with ordinality as lacuna(valor, ordem)
  ),
  false
)
from por_atividade p
where a.id = p.atividade_id
  and a.trilha = 'python'
  and a.tipo = 'completar';

with por_atividade as (
  select atividade_id, jsonb_object_agg(lacuna_id, corretas) as corretas
  from opcoes_fechadas
  group by atividade_id
)
update public.atividade_gabarito g
set configuracao = jsonb_set(g.configuracao, '{lacunas}', p.corretas, false),
    atualizado_em = now()
from por_atividade p
where g.atividade_id = p.atividade_id;

drop table opcoes_fechadas;

update public.atividade
set enunciado = 'Organizar arquivos em lote é uma tarefa que pode ser resolvida por meio de automação com Python. Escolha a área que descreve esse tipo de uso.',
    atualizado_em = now()
where id = 'py-completar-ini-05';
