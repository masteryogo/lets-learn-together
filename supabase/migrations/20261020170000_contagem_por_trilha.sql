-- 0007 — quantos feitos em cada trilha.
--
-- A mesa mostra o progresso de todas as trilhas de uma vez, e essa é
-- a única pergunta que ela faz. Sem isto ela teria que baixar os ids
-- de todos os tópicos marcados para contá-los no navegador — o
-- cliente JavaScript não tem `group by`.
--
-- security invoker: a função enxerga o que a RLS deixa o chamador
-- enxergar, então ela não precisa filtrar por usuário nem pode
-- devolver o de outra pessoa. Definer aqui seria furo de segurança
-- em troca de nada.

create function public.contagem_por_trilha()
returns table (trilha text, feitos bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select t.trilha, count(*)
  from public.progresso_topico t
  where t.estado = 'feito'
  group by t.trilha;
$$;
