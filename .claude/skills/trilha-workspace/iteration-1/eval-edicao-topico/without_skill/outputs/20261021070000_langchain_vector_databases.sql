-- 0013 — um tópico sobre bancos vetoriais na etapa de LangGraph (trilha langchain).
--
-- A fase 3 já ensina embeddings e vector stores do ponto de vista do
-- RAG ("gerar e guardar"). O que faltava é o ponto de vista do grafo:
-- quando o retriever vira um NÓ, o banco vetorial passa a ser uma
-- dependência externa com latência, falha e estado próprio — e é isso
-- que o tópico novo cobre. Por isso ele mora em f4-grafos, no grupo
-- "Construir o grafo", e não em f3-rag.
--
-- Prioridade "importante": dá para montar o primeiro grafo sem ele,
-- mas nenhum grafo de produção sobrevive sem essa conversa.
--
-- Escrito como UPDATE do documento `conteudo`: a trilha é um jsonb só,
-- e as contagens (etapas/grupos/topicos) não são tocadas aqui — o
-- gatilho trilha_contagem as recalcula nesta mesma escrita.
--
-- O id `lc-f4-11` é novo e nunca foi usado: id é a chave do progresso
-- salvo, então acrescentar é seguro e renomear não seria.

do $$
declare
  doc        jsonb;
  etapas     jsonb;
  i_etapa    int := null;
  i_grupo    int := null;
  topico     jsonb := '{
    "id": "lc-f4-11",
    "titulo": "Banco vetorial como dependência do grafo",
    "prioridade": "importante",
    "desc": "Retriever como nó, latência, falha e índice que muda sob o grafo.",
    "detalhe": "Na fase 3 o banco vetorial era uma biblioteca que você chamava; dentro de um grafo ele é um SERVIÇO do qual um nó depende. Três consequências práticas. Primeira: o nó de busca falha — timeout, índice indisponível, coleção vazia — e a falha precisa de um campo no estado e de uma aresta condicional, não de uma exceção que derruba o grafo inteiro. Segunda: a conexão e o índice se abrem uma vez e se reusam entre execuções; abrir cliente dentro do nó transforma cada passo do ciclo numa reconexão, e é a causa mais comum de grafo lento sem motivo aparente. Terceira: o índice muda enquanto o grafo roda — reindexação concorrente faz a mesma pergunta devolver trechos diferentes em duas voltas do ciclo, então guarde no estado o que foi recuperado, com o id do chunk e a versão do índice, em vez de buscar de novo e supor que veio igual. E vale a regra da fase 3 ainda aqui: o mesmo modelo de embedding na indexação e na consulta, anotado junto do índice."
  }'::jsonb;
begin
  select conteudo into doc from public.trilha where id = 'langchain' for update;
  if doc is null then
    raise exception 'trilha langchain não encontrada';
  end if;

  etapas := doc -> 'ROADMAP' -> 'etapas';

  -- achar a etapa e o grupo pelo id, não pela posição: a ordem pode mudar.
  -- O índice do jsonb começa em 0 e o WITH ORDINALITY em 1, daí o -1.
  select ord - 1 into i_etapa
    from jsonb_array_elements(etapas) with ordinality as e(v, ord)
   where v ->> 'id' = 'f4-grafos';
  if i_etapa is null then
    raise exception 'etapa f4-grafos não encontrada';
  end if;

  select ord - 1 into i_grupo
    from jsonb_array_elements(etapas -> i_etapa -> 'grupos')
         with ordinality as g(v, ord)
   where v ->> 'id' = 'lc-g-f4-2';
  if i_grupo is null then
    raise exception 'grupo lc-g-f4-2 não encontrado';
  end if;

  -- não duplicar se a migration rodar duas vezes
  if exists (
    select 1
    from jsonb_array_elements(
           etapas -> i_etapa -> 'grupos' -> i_grupo -> 'topicos') t
    where t ->> 'id' = 'lc-f4-11'
  ) then
    return;
  end if;

  doc := jsonb_set(
    doc,
    array['ROADMAP','etapas', i_etapa::text, 'grupos', i_grupo::text, 'topicos'],
    (etapas -> i_etapa -> 'grupos' -> i_grupo -> 'topicos') || jsonb_build_array(topico)
  );

  update public.trilha set conteudo = doc where id = 'langchain';
end $$;
