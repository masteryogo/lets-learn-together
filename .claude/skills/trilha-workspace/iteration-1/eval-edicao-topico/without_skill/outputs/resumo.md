# Tópico novo: bancos vetoriais na etapa de LangGraph

## O que eu proponho (nada foi aplicado)

Um tópico novo na trilha `langchain`, etapa **4 — Fundamentos do LangGraph**,
grupo **"Construir o grafo"** (`lc-g-f4-2`), no fim da lista:

| campo | valor |
|---|---|
| `id` | `lc-f4-11` (novo; nenhum id existente foi renomeado) |
| `titulo` | Banco vetorial como dependência do grafo |
| `prioridade` | `importante` |
| `desc` | Retriever como nó, latência, falha e índice que muda sob o grafo. |

O `detalhe` cobre três consequências de o banco vetorial deixar de ser
biblioteca e virar serviço do qual um nó depende: (1) falha do nó de busca
precisa de campo no estado e aresta condicional, não de exceção; (2) cliente
e índice se abrem uma vez e se reusam — abrir dentro do nó reconecta a cada
volta do ciclo; (3) o índice muda enquanto o grafo roda, então o recuperado
mora no estado com id do chunk e versão do índice.

## Por que ali, e não na fase 3

A fase 3 (`f3-rag`) já tem `lc-f3-03` "Embeddings e vector stores" e
`lc-f3-04` "Retrievers, filtros e busca híbrida" — o banco visto de dentro
do RAG. O que faltava é o banco visto de dentro do grafo: dependência
externa com latência, falha e estado próprio. Repetir embeddings na fase 4
seria dado duplicado; o recorte novo é o que justifica o tópico.

`importante` e não `fundamental`: dá para montar o primeiro grafo sem isso,
mas nenhum grafo em produção escapa da conversa.

## Como a mudança é entregue

As trilhas saíram do código em 21/10 e hoje vivem na tabela `trilha`
(`src/lib/trilhas.js` só lê o banco). Então a edição é uma **migration**:

`20261021070000_langchain_vector_databases.sql`

- `UPDATE` do documento `conteudo` da linha `langchain`;
- acha etapa e grupo **pelo id** (`WITH ORDINALITY`), não pela posição, para
  não quebrar se a ordem mudar;
- é idempotente: se `lc-f4-11` já estiver lá, não faz nada;
- não mexe em `etapas` / `grupos` / `topicos` — o gatilho `trilha_contagem`
  recalcula sozinho (a trilha passa de 55 para 56 tópicos).

Nada foi escrito no banco e nada foi alterado no projeto. Para aplicar:

```bash
cp <este diretório>/20261021070000_langchain_vector_databases.sql supabase/migrations/
npx supabase db push
```
