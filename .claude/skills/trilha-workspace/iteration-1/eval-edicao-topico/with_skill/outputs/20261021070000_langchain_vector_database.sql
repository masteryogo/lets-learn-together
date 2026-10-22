-- Vector databases na etapa de LangGraph da trilha `langchain`.
--
-- A fase 4 monta nós que consultam o índice muitas vezes: em paralelo via
-- `Send` e dentro do ciclo de "buscar de novo se a evidência for insuficiente".
-- O que a fase 3 tratou como detalhe do retriever (`lc-f3-03`) passa a ser
-- infraestrutura com latência, conexões e parâmetros de índice próprios — e
-- esse recorte não estava escrito em lugar nenhum da trilha.
--
-- Acrescenta um tópico ao grupo `lc-g-f4-2` (Construir o grafo). Nenhum id
-- existente é tocado: progresso salvo continua válido.

update public.trilha
   set conteudo = jsonb_set(
         conteudo,
         '{ROADMAP,etapas,4,grupos,1,topicos}',
         (conteudo #> '{ROADMAP,etapas,4,grupos,1,topicos}') || $json$[
  {
    "id": "lc-f4-11",
    "titulo": "Banco vetorial a serviço do grafo",
    "prioridade": "importante",
    "desc": "Escolha do banco vetorial, índice aproximado e seus parâmetros, filtro por metadado, persistência e reindexação",
    "detalhe": "Na fase 3 o vector store era um detalhe de implementação do retriever; aqui ele vira infraestrutura de um nó que roda muitas vezes, em paralelo (`Send`) e dentro de um ciclo de \"buscar de novo\". Isso muda o que importa: latência por consulta, limite de conexões e custo de cada repetição. Abra o banco que você escolheu (pgvector, Qdrant, Chroma, FAISS) e aprenda os dois parâmetros do índice aproximado — em HNSW, `m` e `ef_search`; em IVF, `nlist` e `nprobe`. Eles trocam recall por tempo, e o erro típico é culpar o prompt por uma resposta ruim quando o índice simplesmente não devolveu o trecho certo.\n\nTrate o cliente do banco como recurso do processo, não do nó: abrir conexão a cada chamada é o que derruba o fan-out paralelo. Filtre por metadado no próprio banco, antes da similaridade, e não depois em Python — filtrar depois devolve menos resultados do que o `k` pedido e o grafo lê isso como \"não há evidência\". E guarde junto do índice o modelo de embedding e a versão que o geraram: reindexar é uma operação planejada, não uma descoberta de produção. Você está fazendo certo quando consegue trocar o banco por um stub determinístico e o grafo continua passando nos testes de roteamento."
  }
]$json$::jsonb
       )
 where id = 'langchain'
   and conteudo #> '{ROADMAP,etapas,4,grupos,1,id}' = '"lc-g-f4-2"'::jsonb
   and not exists (
         select 1
           from jsonb_array_elements(conteudo #> '{ROADMAP,etapas,4,grupos,1,topicos}') t
          where t ->> 'id' = 'lc-f4-11'
       );
