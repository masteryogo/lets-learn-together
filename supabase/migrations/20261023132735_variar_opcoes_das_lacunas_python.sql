-- As opções extras são distratores plausíveis, sem alterar os gabaritos existentes.
begin;

create temporary table ajustes_lacunas (
  atividade_id text not null,
  lacuna_id text not null,
  remover_textos text[] not null default '{}',
  novas_opcoes jsonb not null default '[]'::jsonb,
  primary key (atividade_id, lacuna_id)
) on commit drop;

insert into ajustes_lacunas (atividade_id, lacuna_id, remover_textos, novas_opcoes) values
  ('py-completar-apl-01', 'palavra', array['return'], '[]'::jsonb),
  ('py-completar-apl-04', 'operador', array['//'], '[]'::jsonb),
  ('py-completar-apl-06', 'funcao', '{}', '[{"id":"e","texto":"parse"}]'::jsonb),
  ('py-completar-apl-07', 'leitor', '{}', '[{"id":"e","texto":"CSVReader"},{"id":"f","texto":"HeaderReader"}]'::jsonb),
  ('py-completar-apl-08', 'excecao', '{}', '[{"id":"e","texto":"MissingFileError"}]'::jsonb),
  ('py-completar-apl-09', 'redirecionamento', array['|'], '[]'::jsonb),
  ('py-completar-apl-10', 'parametro', '{}', '[{"id":"e","texto":"deadline"},{"id":"f","texto":"max_time"}]'::jsonb),
  ('py-completar-est-01', 'indice', '{}', '[{"id":"e","texto":"first"}]'::jsonb),
  ('py-completar-est-05', 'fatia', '{}', '[{"id":"e","texto":"1:4"},{"id":"f","texto":"0:4"}]'::jsonb),
  ('py-completar-est-07', 'palavra', array['return'], '[]'::jsonb),
  ('py-completar-est-09', 'retorno', array['break'], '[]'::jsonb),
  ('py-completar-fin-01', 'resultado', array['Ou'], '[]'::jsonb),
  ('py-completar-fin-02', 'passo', array['formatar'], '[]'::jsonb),
  ('py-completar-fin-03', 'valor', array['__file__'], '[{"id":"e","texto":"__run__"}]'::jsonb),
  ('py-completar-fin-04', 'excecao', array['IndexError'], '[]'::jsonb),
  ('py-completar-fin-05', 'placeholder', array['!'], '[]'::jsonb),
  ('py-completar-fin-07', 'laço', array['return'], '[{"id":"e","texto":"repeat"}]'::jsonb),
  ('py-completar-fin-08', 'excecao', array['ProgrammingError'], '[]'::jsonb),
  ('py-completar-fin-09', 'comparacao', array['!='], '[]'::jsonb),
  ('py-completar-fin-10', 'secao', array['relatórios'], '[]'::jsonb),
  ('py-completar-fun-03', 'operador', '{}', '[{"id":"e","texto":"%%"}]'::jsonb),
  ('py-completar-fun-04', 'conector', array['not'], '[]'::jsonb),
  ('py-completar-fun-06', 'variavel', array['idade'], '[]'::jsonb),
  ('py-completar-fun-10', 'comando', array['pass'], '[]'::jsonb),
  ('py-completar-fun-10-continue', 'comando', array['break'], '[]'::jsonb),
  ('py-completar-ini-01', 'passos', array['opiniões'], '[]'::jsonb),
  ('py-completar-ini-03', 'processar', array['interface'], '[]'::jsonb),
  ('py-completar-ini-04', 'passo1', array['formatar'], '[]'::jsonb),
  ('py-completar-ini-04', 'passo2', array['ler'], '[]'::jsonb),
  ('py-completar-ini-05', 'uso', array['montagem mecânica'], '[]'::jsonb),
  ('py-completar-ini-06', 'comando', array['pip --python'], '[]'::jsonb),
  ('py-completar-ini-08', 'funcao', '{}', '[{"id":"e","texto":"display"}]'::jsonb),
  ('py-completar-int-01', 'palavra', array['import'], '[]'::jsonb),
  ('py-completar-int-04', 'atributo', array['autores'], '[]'::jsonb),
  ('py-completar-int-06', 'expressao', array['n + 2'], '[]'::jsonb),
  ('py-completar-int-08', 'decorador', '{}', '[{"id":"e","texto":"@data"},{"id":"f","texto":"@model"}]'::jsonb),
  ('py-completar-int-09', 'funcao', '{}', '[{"id":"e","texto":"wholematch"}]'::jsonb),
  ('py-completar-maioridade', 'operador', array['=='], '[]'::jsonb),
  ('py-completar-pro-01', 'arquivo', array['projeto.py'], '[]'::jsonb),
  ('py-completar-pro-03', 'opcao', array['-d'], '[]'::jsonb),
  ('py-completar-pro-04', 'pasta', array['include'], '[]'::jsonb),
  ('py-completar-pro-05', 'opcao', array['-u'], '[]'::jsonb),
  ('py-completar-pro-06', 'funcao', array['traceback'], '[]'::jsonb),
  ('py-completar-pro-08', 'assertiva', '{}', '[{"id":"e","texto":"require"},{"id":"f","texto":"verify_that"}]'::jsonb),
  ('py-completar-pro-09', 'comando', array['inspect'], '[]'::jsonb),
  ('py-completar-pro-10', 'modulo', array['pip'], '[]'::jsonb);

do $$
begin
  if exists (
    select 1
    from ajustes_lacunas ajuste
    join public.atividade atividade on atividade.id = ajuste.atividade_id
    join public.atividade_gabarito gabarito on gabarito.atividade_id = atividade.id
    cross join lateral jsonb_array_elements(atividade.configuracao->'lacunas') as item(lacuna)
    cross join lateral jsonb_array_elements(item.lacuna->'alternativas') as opcao(alternativa)
    where item.lacuna->>'id' = ajuste.lacuna_id
      and opcao.alternativa->>'texto' = any(ajuste.remover_textos)
      and (gabarito.configuracao->'lacunas'->ajuste.lacuna_id) ? (opcao.alternativa->>'id')
  ) then
    raise exception 'A migration tentou remover uma resposta correta.';
  end if;

  if exists (
    select 1
    from ajustes_lacunas ajuste
    cross join lateral unnest(ajuste.remover_textos) as removido(texto)
    left join public.atividade atividade on atividade.id = ajuste.atividade_id
    left join lateral jsonb_array_elements(atividade.configuracao->'lacunas') as item(lacuna) on item.lacuna->>'id' = ajuste.lacuna_id
    where atividade.id is null
      or item.lacuna is null
      or not exists (
        select 1 from jsonb_array_elements(item.lacuna->'alternativas') as opcao(alternativa)
        where opcao.alternativa->>'texto' = removido.texto
      )
  ) then
    raise exception 'Uma opção prevista para remoção não foi encontrada.';
  end if;
end;
$$;

update public.atividade atividade
set configuracao = jsonb_set(
  atividade.configuracao,
  '{lacunas}',
  (
    select jsonb_agg(
      case when ajuste.atividade_id is null then item.lacuna
      else (item.lacuna - 'alternativas') || jsonb_build_object(
        'alternativas', (
          select jsonb_agg(opcao order by ordem)
          from (
            select alternativa as opcao, posicao::integer as ordem
            from jsonb_array_elements(item.lacuna->'alternativas') with ordinality existente(alternativa, posicao)
            where not ((alternativa->>'texto') = any(ajuste.remover_textos))
            union all
            select nova_opcao as opcao, 1000 + posicao::integer as ordem
            from jsonb_array_elements(ajuste.novas_opcoes) with ordinality adicionada(nova_opcao, posicao)
          ) opcoes
        )
      ) end
      order by item.posicao
    )
    from jsonb_array_elements(atividade.configuracao->'lacunas') with ordinality item(lacuna, posicao)
    left join ajustes_lacunas ajuste
      on ajuste.atividade_id = atividade.id
      and ajuste.lacuna_id = item.lacuna->>'id'
  ),
  false
)
where atividade.trilha = 'python'
  and atividade.tipo = 'completar';

do $$
declare
  exercicios integer;
  lacunas integer;
  opcoes_3 integer;
  opcoes_4 integer;
  opcoes_5 integer;
  opcoes_6 integer;
begin
  select count(distinct atividade.id), count(*)
  into exercicios, lacunas
  from public.atividade atividade
  cross join lateral jsonb_array_elements(atividade.configuracao->'lacunas') as item(lacuna)
  where atividade.trilha = 'python'
    and atividade.tipo = 'completar'
    and jsonb_array_length(item.lacuna->'alternativas') between 3 and 6;

  if exercicios <> 45 or lacunas <> 46 then
    raise exception 'Esperava 45 exercícios e 46 lacunas com 3–6 opções; encontrei % exercícios e % lacunas.', exercicios, lacunas;
  end if;

  select
    count(*) filter (where jsonb_array_length(item.lacuna->'alternativas') = 3),
    count(*) filter (where jsonb_array_length(item.lacuna->'alternativas') = 4),
    count(*) filter (where jsonb_array_length(item.lacuna->'alternativas') = 5),
    count(*) filter (where jsonb_array_length(item.lacuna->'alternativas') = 6)
  into opcoes_3, opcoes_4, opcoes_5, opcoes_6
  from public.atividade atividade
  cross join lateral jsonb_array_elements(atividade.configuracao->'lacunas') as item(lacuna)
  where atividade.trilha = 'python'
    and atividade.tipo = 'completar';

  if opcoes_3 <> 33 or opcoes_4 <> 2 or opcoes_5 <> 6 or opcoes_6 <> 5 then
    raise exception 'Distribuição de opções inesperada: 3=%; 4=%; 5=%; 6=%.', opcoes_3, opcoes_4, opcoes_5, opcoes_6;
  end if;

  if exists (
    select 1
    from public.atividade atividade
    cross join lateral jsonb_array_elements(atividade.configuracao->'lacunas') as item(lacuna)
    where atividade.trilha = 'python'
      and atividade.tipo = 'completar'
      and not exists (
        select 1
        from public.atividade_gabarito gabarito
        cross join lateral jsonb_each(gabarito.configuracao->'lacunas') resposta(lacuna_id, ids)
        cross join lateral jsonb_array_elements_text(resposta.ids) as correta(id)
        where gabarito.atividade_id = atividade.id
          and resposta.lacuna_id = item.lacuna->>'id'
          and exists (
            select 1
            from jsonb_array_elements(item.lacuna->'alternativas') as opcao(alternativa)
            where opcao.alternativa->>'id' = correta.id
          )
      )
  ) then
    raise exception 'Uma lacuna ficou sem ao menos uma resposta correta disponível.';
  end if;
end;
$$;

commit;
