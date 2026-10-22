# Tópico de vector databases na trilha `langchain`

**Migration gerada:** `20261021070000_langchain_vector_database.sql`
(não aplicada, e escrita fora de `supabase/migrations/`)

## O que entra

Um tópico novo na **etapa 4 — Fundamentos do LangGraph**, grupo
`lc-g-f4-2` (Construir o grafo), no fim da lista:

| campo | valor |
|---|---|
| `id` | `lc-f4-11` |
| `titulo` | Banco vetorial a serviço do grafo |
| `prioridade` | `importante` |
| `desc` | Escolha do banco vetorial, índice aproximado e seus parâmetros, filtro por metadado, persistência e reindexação |

O `detalhe` cobre dois parágrafos: os parâmetros do índice aproximado
(`m`/`ef_search` em HNSW, `nlist`/`nprobe` em IVF) como troca entre recall e
latência, e o que quebra quando o nó roda em paralelo (`Send`) dentro do ciclo
de rebusca — conexão aberta por chamada, filtro por metadado feito em Python
depois do `k`, e índice sem registro do modelo de embedding.

## Por que nessa etapa, e o aviso

Você pediu a etapa de LangGraph, e é lá que o tópico está. Vale saber que a
**fase 3 (RAG) já tem `lc-f3-03` "Embeddings e vector stores"** — o tópico novo
foi escrito para não repeti-lo: lá o store é detalhe do retriever, aqui é
infraestrutura de um nó que executa muitas vezes. Se a intenção era aprofundar
a escolha do banco em si, o lugar natural seria a fase 3; diga e eu movo.

## Cuidados do SQL

- `jsonb_set` no ramo `{ROADMAP,etapas,4,grupos,1,topicos}` — o documento
  inteiro não é reescrito, então o diff mostra só o que mudou.
- Guardas no `where`: o grupo no índice 1 precisa ser mesmo `lc-g-f4-2`, e o
  `update` não faz nada se `lc-f4-11` já existir (reaplicar é seguro).
- JSON em `$json$...$json$`, para não depender de escapar aspas simples.
- `etapas`, `grupos` e `topicos` não são escritos: o gatilho `trilha_contagem`
  recalcula. A fase 4 passa de 10 para 11 tópicos.
- Nenhum id existente foi renomeado — progresso salvo fica intacto.

## Aplicar

```bash
npx supabase db push
```

Depois, conferir em `/roadmap?trilha=langchain`: a contagem no rodapé vem do
gatilho, então ela é a prova de que a árvore subiu inteira.
