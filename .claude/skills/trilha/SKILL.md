---
name: trilha
description: >
  Gera ou edita uma trilha de estudos (roadmap / learning path) deste site,
  produzindo uma migration SQL para a tabela `trilha` do Supabase. Use sempre
  que a pessoa falar em criar, gerar, escrever, revisar, ampliar ou corrigir
  uma trilha, um roadmap, um learning path, um plano de estudos, uma etapa,
  um grupo ou um tópico — mesmo que não cite a tabela, a migration ou o nome
  "trilha", e mesmo que o pedido venha como "monta um caminho pra aprender X"
  ou "acrescenta Rust na trilha de ML".
---

# Trilha de estudos

O catálogo de trilhas vive na tabela `trilha` (migration `20261021050000`),
uma linha por trilha, com a árvore inteira em `conteudo jsonb`. Escrever uma
trilha aqui é escrever **um documento JSON** e versioná-lo numa migration.

## Antes de escrever

1. Leia `supabase/migrations/20261021060000_trilhas_iniciais.sql` e abra **um**
   tópico inteiro. Ele define o padrão de voz melhor do que qualquer regra:
   `desc` é a lista do que se estuda, `detalhe` é por que aquilo importa e onde
   se erra na prática.
2. Confira o que já existe no banco antes de inventar id:
   `select id, rotulo, etapas, grupos, topicos from trilha order by ordem;`

## A forma do conteúdo

```
conteudo = { ROADMAP, PROJETOS, RECURSOS, LEGENDA, ESTADOS, CRITERIOS }

ROADMAP  { titulo, subtitulo, fonte: {rotulo, url, consultadoEm}|null, etapas[] }
etapa    { id, numero, titulo, objetivo, descricao, preRequisitos, duracao, grupos[] }
grupo    { id, titulo|null, descricao?, duracao?, origem?, topicos[] }
topico   { id, titulo, prioridade, desc, detalhe, subtopicos? }

PROJETOS  { <id da etapa>: ["exercício que prova a etapa", ...] }
RECURSOS  [ { etapa, titulo, url, nota } ]
LEGENDA   [ { chave, rotulo, desc } ]      prioridade: fundamental|importante|opcional
ESTADOS   [ { chave, rotulo } ]            pendente|estudando|feito|pulado
CRITERIOS [ "como saber que aprendeu" ]
```

`LEGENDA` e `ESTADOS` são iguais em toda trilha — copie-os de uma existente em
vez de reescrevê-los; estado e prioridade são contrato da interface, não texto
livre.

**Não escreva `etapas`, `grupos` nem `topicos` como coluna.** O gatilho
`trilha_contagem` os recalcula a cada escrita, e foi exatamente para isso que
ele existe: número à mão diverge do conteúdo no dia em que alguém esquece de
recontar.

Campo que a tela não lê é dado morto, sem erro nenhum para avisar. Os campos
acima são tudo o que `src/routes/roadmap/+page.svelte` desenha — `origem` é a
exceção honesta: existe para a rota condicional, que ainda não tem tela.

## A regra que não se quebra: id estável

Duas chaves de progresso estão escondidas no conteúdo, e as duas se apagam em
silêncio — o banco não reclama, a pessoa só volta e encontra tudo pendente.

- **`id` do tópico** é a chave de `progresso_topico`. Renomeá-lo apaga o
  progresso de quem já marcou aquele item.
- **O texto de `desc`** é a chave de `progresso_subassunto`: como os
  subassuntos são derivados da vírgula e não têm id próprio, o texto *é* a
  chave. Reescrever um `desc` — até mudar uma vírgula de lugar — desfaz a
  marcação dos subassuntos daquele tópico.

Só `titulo`, `prioridade` e `detalhe` se editam livremente. Ao melhorar uma
trilha existente, mexa no `detalhe` e deixe `id` e `desc` intactos; tópico
que não faz mais sentido sai da árvore, e quem já o marcou perde só aquela
linha.

Padrão de id: prefixo curto da etapa + número sequencial (`py-01`, `torch-07`).
Etapa e grupo usam nome falado (`python`, `g-python`).

## Escrever o conteúdo

O valor de uma trilha é o `detalhe`, não a lista. Lista de tópicos qualquer um
monta; o que não se acha pronto é *por que esse tópico existe nessa ordem e
onde quem estuda sozinho costuma tropeçar*. Um `detalhe` que só reformula o
título não vale a linha que ocupa.

- **`desc`**: os subassuntos separados por vírgula. O painel os transforma em
  itens marcáveis sozinho — por isso a vírgula aqui é estrutura, não pontuação.
  Use `subtopicos` só quando precisar controlar a separação na mão.
- **`detalhe`**: um ou dois parágrafos, segunda pessoa, concreto. Nomeie o erro
  típico e o sinal de que se está fazendo certo.
- **`prioridade`**: `fundamental` é ordem estrita. Se tudo é fundamental, nada
  é — uma trilha saudável tem os três níveis.
- **`objetivo`** da etapa: uma frase no infinitivo, verificável.
- **`fonte`**: quando a trilha deriva de uma referência pública, registre-a com
  a data de consulta; quando não deriva, `null` é melhor que fonte inventada.
- **Idioma**: português do Brasil, com acentuação correta. Nomes técnicos ficam
  como são (`dropout`, `weight decay`).
- **Como o texto é desenhado** (`src/lib/roadmap/Texto.svelte`): linha em
  branco separa parágrafo, crase vira `<code>`. Não há negrito nem lista —
  a hierarquia do site é por tamanho e cor, não por peso.

Tamanho razoável para uma trilha nova: 3 a 6 etapas, 10 a 25 tópicos por etapa.

## A migration

Um arquivo em `supabase/migrations/`, nomeado `AAAAMMDDHHMMSS_<assunto>.sql`,
com um comentário no topo dizendo **por que** a mudança existe — é a convenção
do repositório e é o que sobrevive ao diff.

Para trilha nova, escreva o `conteudo` num `.json` e gere o SQL com
`scripts/gerar-migration.py` (na pasta desta skill) em vez de montar o
arquivo à mão. Ele cuida do dollar-quoting e recusa o que a tela aceitaria
em silêncio: id de tópico repetido, campo fora do esquema, prioridade
inválida, `rota` fora do quadro. Leia a mensagem de erro dele — ela nomeia
o tópico com problema.

Trilha nova:

```sql
insert into public.trilha (id, rotulo, cor, rota, categoria, ordem, publicada,
                           conteudo)
values ('rust', 'Rust', '#8a4a2d',
  '[[32,198],[96,168],[152,118],[216,94],[272,46]]'::jsonb, 'ferramenta', 30,
  true, '{"ROADMAP": ...}'::jsonb);
```

`categoria` é a gaveta da mesa e não tem default: `papel` para um cargo que
se quer ter (Machine Learning, Engenharia de Dados), `ferramenta` para uma
tecnologia específica (LangChain, Rust). Esquecer faz o insert falhar, o que
é melhor que a carta aparecer na gaveta errada em silêncio. Categoria nova
não basta no banco — o rótulo e a ordem das seções vivem em `CATEGORIAS`, em
`src/lib/trilhas.js`.

`ordem` anda de dez em dez (0, 10, 20, 30), para caber trilha entre duas sem
reescrever as outras.

Edição de trilha existente — mexa no ramo, não no documento inteiro, para o
diff dizer o que mudou. **Localize etapa e grupo pelo id, nunca por índice
escrito**: `jsonb_set` com caminho posicional é silencioso se alguém inserir
uma etapa antes — ele escreve no tópico errado sem erro nenhum, que é a mesma
falha calada que o id estável combate.

```sql
do $$
declare
  i_etapa int; i_grupo int;
begin
  select e.ord - 1, g.ord - 1 into strict i_etapa, i_grupo
    from trilha t,
         jsonb_array_elements(t.conteudo #> '{ROADMAP,etapas}')
           with ordinality as e(v, ord),
         jsonb_array_elements(e.v -> 'grupos') with ordinality as g(v, ord)
   where t.id = 'ml' and e.v ->> 'id' = 'python' and g.v ->> 'id' = 'g-python';

  update trilha
     set conteudo = jsonb_set(
           conteudo,
           array['ROADMAP','etapas',i_etapa::text,'grupos',i_grupo::text,'topicos'],
           (conteudo #> array['ROADMAP','etapas',i_etapa::text,'grupos',
                              i_grupo::text,'topicos'])
             || $json$[{"id":"py-99", "...": "..."}]$json$::jsonb)
   where id = 'ml';
end $$;
```

O `strict` é o guarda-corpo: se o id não existir, a migration falha em vez de
escrever em lugar nenhum.

Cuidados ao escrever o SQL:

- **Use dollar-quoting (`$json$ ... $json$`) para todo literal JSON.** Em
  português, apóstrofo é questão de tempo (`d'água`, aspas tipográficas), e
  dobrar aspas é um passo manual que falha num único esquecimento. O
  dollar-quoting não interpreta nada dentro: o JSON entra cru.
- **Um `update` não aceita duas atribuições à mesma coluna.** Ao mexer em
  vários tópicos, escreva um `update` por tópico ou aninhe os `jsonb_set` —
  doze atribuições a `conteudo` num `update` só o Postgres recusa.
- `rota` são 5 pares `[x, y]` num quadro de 300×240: é o desenho da carta na
  mesa, lido da esquerda (início) para a direita (fim), subindo.
- `cor` é a cor da carta; escolha uma que se distinga das já usadas.
- `publicada: false` para rascunho — ele fica fora da mesa até você publicar.

## Fechar

Depois de escrever a migration, pare e mostre:

1. O resumo: trilha, quantas etapas, grupos e tópicos.
2. O comando `npx supabase db push`, para a pessoa aplicar.

Não aplique a migration por conta própria. E depois de aplicada, a conferência
é abrir `/` e `/roadmap?trilha=<id>` no navegador: as contagens no rodapé vêm
do gatilho, então elas são a prova de que a árvore subiu inteira.
