# AGENTS.md

Guia para agentes de código (Claude Code, Codex, Cursor e afins) que forem
trabalhar neste repositório.

**A documentação do projeto é o [CLAUDE.md](CLAUDE.md), e ele é a fonte
única.** O que está aqui são as regras de trabalho; o que o projeto é, como
roda e por que cada decisão foi tomada está lá. Leia-o antes de mexer em
qualquer coisa — ele explica o que nenhum diff explica: por que o CSS ainda
é global, por que o id de um tópico não se renomeia, por que o tema mora no
`localStorage` quando o resto foi para o banco.

## O que verificar antes de dizer que terminou

```bash
npm run build
```

Não há testes nem lint. O build é a verificação que existe, e ela vale mais
do que parece: com todas as rotas pré-renderizadas, ele **percorre os links
e falha em qualquer um apontando para o nada**. Link quebrado é erro de
build aqui, não um 404 descoberto semanas depois.

O que o build **não** pega, e já custou tempo nesta base:

- variável usada sem `import` num componente (`base`, por exemplo) — só
  aparece ao abrir a tela;
- classe de CSS usada numa tela cuja folha não a declara, porque cada tela
  tem a própria folha global;
- campo novo num dado que o componente não lê — vira dado morto, calado.

Então: **abra a tela no navegador**. É o que o CLAUDE.md chama de
verificação, e não é formalidade.

## Como trabalhar

- **Um passo por vez.** Proponha a mudança, mostre o diff, espere o aval,
  aplique. Vale mesmo quando o pedido já autoriza a correção: o pedido
  autoriza propor, não editar.
- **Nunca commite por conta própria**, nem faça push, tag ou PR. Prepare os
  comandos com a mensagem pronta e pare aí.
- **Português em tudo**: identificadores, comentários, classes CSS, nomes
  de arquivo. O repositório é consistente nisso.
- **Comentário explica o porquê, não o quê.** Se o comentário descreve a
  linha de baixo, apague-o; se ele guarda a razão de uma escolha que parece
  estranha, ele é o trecho mais valioso do arquivo.
- **Erro nunca vira vazio.** Devolver lista vazia quando a consulta falha
  faz a tela mostrar "não há nada" com cara de verdade. Guarde a falha e
  mostre-a — isso apareceu três vezes num único dia aqui.

## O que não está no repositório

Autenticação, banco e deploy dependem de configuração externa: projeto no
Supabase (tabelas, RLS, provedores, modelos de e-mail), cliente OAuth no
Google Cloud, e as variáveis `PUBLIC_SUPABASE_URL` e
`PUBLIC_SUPABASE_ANON_KEY` em *Settings → Variables* do GitHub Actions.
Sem elas o site constrói e publica — **sem conta nenhuma**, silenciosamente.

As migrations ficam em `supabase/migrations/` e sobem com
`npx supabase db push`. Mudança de esquema vira migration versionada, nunca
um comando rodado à mão no painel: o painel não se repete sozinho num banco
reconstruído.

## Onde ficam as decisões

Na tela `/kanban` (`src/lib/kanban/dados.js`), com o motivo de cada uma —
inclusive das recusadas. Vale ler antes de propor algo grande: a ideia pode
já ter sido discutida, e o quadro guarda o porquê.
