# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Site estático de roadmaps de estudo em português (`lets-learn-together`).
Sem build, sem dependências, sem `npm install` — HTML, CSS e JavaScript ES5
servidos como arquivos. Publicado em GitHub Pages e também ligado a um
projeto Vercel (`.vercel/`, fora do versionamento).

## Rodar

```bash
python -m http.server 8000
```

Abrir `index.html` direto por `file://` também funciona — o código tolera
`localStorage` bloqueado nesse contexto. Não há testes, lint nem build:
a verificação é abrir as duas páginas no navegador.

## Arquitetura

Duas páginas, um carregador no meio.

- `index.html` + `inicio.css` + `inicio.js` — a **mesa de cartas**, onde se
  escolhe a trilha. Cada carta desenha a `rota` da trilha em SVG; o mascote
  reage ao ponteiro. Marca `window.SO_MANIFESTO = true` antes de carregar
  `trilhas.js`, para que só os metadados sejam lidos.
- `roadmap.html` + `styles.css` + `app.js` — o roadmap em si, montado no
  cliente a partir dos dados da trilha.
- `trilhas.js` — **manifesto + carregador**, o único script que as páginas
  conhecem. Lê `?trilha=` da querystring, injeta os `trilhas/<id>/*.js` e,
  por último, o `app.js`.

### A ordem de carregamento é um contrato

`trilhas.js` cria os `<script>` com `s.async = false`, porque script criado
por JS nasce `async` e executaria fora de ordem. A ordem importa:

1. `trilhas/<id>/data.js` declara `ROADMAP_ETAPAS = []` e os globais
   `ROADMAP`, `PROJETOS`, `RECURSOS`, `LEGENDA`, `ESTADOS`, `CRITERIOS`.
2. Cada `conteudo-*.js` faz `ROADMAP_ETAPAS.push({...})` — um `push` por
   etapa, na ordem listada no manifesto (`conteudo-4b` depende do `4a`).
3. `app.js` roda por último e assume tudo já definido.

Daí as consequências: nada de módulos ES, nada de bundler, e novos arquivos
de conteúdo precisam entrar na posição certa do array `arquivos`.

Isso descreve o estado atual, não uma decisão definitiva: migrar para uma
aplicação de componentes é item do quadro (ver *Quadro de trabalho*), e é
justamente esse contrato que ela desfaz.

Falha de rede em qualquer script levanta `window.TRILHA_FALHOU` e pinta um
bloco de erro no `#mapa`; o `app.js` consulta essa bandeira para não montar
meio mapa por cima.

### Estado e persistência

Tudo em `localStorage`, por trilha, sem servidor nem conta:

- `roadmap:<trilha>:progresso:v1` — `{ idDoTopico: estado }`
- `roadmap:<trilha>:sub:v1` — subassuntos marcados
- `roadmap:tema:v1` — tema, comum a todas as trilhas
- `roadmap-ml:progresso:v1` — chave legada, de antes das trilhas; ainda lida
  como fallback do `ml` (tanto em `app.js` quanto em `inicio.js`)

Toda leitura/escrita é envolvida em `try/catch`: em `file://` ou com cookies
bloqueados o site funciona, só não lembra.

Os estados ciclam em `pendente → estudando → feito → pulado`. As marcas
`□ ► ■ ×` existem porque a Departure Mono não tem `◔` nem `✓` — e porque o
estado não deve depender só de cor.

## Mexer nos dados

Um tópico tem cinco campos (`id`, `titulo`, `prioridade`, `desc`, `detalhe`,
e `subtopicos` opcional). Regra que não se quebra: **o `id` é estável** — é a
chave do progresso salvo de quem já marcou aquele item. Editar o texto é
livre; renomear o `id` apaga o progresso alheio.

Quando `desc` é uma lista separada por vírgulas, o painel a transforma em
subassuntos marcáveis sozinho; `subtopicos` só existe para controlar a
separação na mão.

### Trilha nova

Criar `trilhas/<id>/` com `data.js` + `conteudo-*.js` e registrar o id em
`trilhas.js`, com `rotulo`, `pasta`, `arquivos` (na ordem de carga), `rota`
(um marco por etapa, num quadro de 300×240, desenhado na carta de entrada) e
`etapas`/`topicos`. Esses dois números são derivados dos dados mas vivem no
manifesto para a página de entrada não precisar baixar as trilhas inteiras —
**ao mexer no conteúdo, conferir a contagem real no rodapé do roadmap e
acertar o manifesto.**

## Convenções

- **JavaScript ES5 dentro de IIFE com `"use strict"`**: `var`, `function`,
  nada de arrow, template literal, `const`/`let` (exceto os `const` globais
  dos `data.js`) nem optional chaining.
- **Identificadores, comentários e nomes de classe em português**
  (`carregarProgresso`, `definirEstado`, `rodape__chip`). Comentários
  explicam *por que*, não *o quê* — e o repositório é consistente nisso.
- **CSS por tokens em `:root`**, com nomes em português (`--roxo-forte`,
  `--t-base`, `--sombra-dura`). Tipografia numa grade de 11px: tamanhos são
  múltiplos de 5,5px, porque a Departure Mono só cai nítida nessa grade.
  Hierarquia por tamanho, cor e inversão — nunca por peso, já que a fonte
  tem um peso só. `--raio: 0`: pixel não tem curva.
- **BEM em português** nas classes (`drawer__secao`, `ficha__titulo`).
- **Acessibilidade não é opcional aqui**: estado com forma além de cor,
  `role="status"` com `aria-live` para avisar o leitor de tela das ações que
  não mudam o DOM visível, e o gesto anunciado na legenda muda conforme
  `pointer: coarse`.

## Links antigos

`index.html?trilha=cv` ainda circula. O `index.html` tem um script inline,
antes de qualquer desenho, que redireciona para `roadmap.html?trilha=cv` —
mexer nisso quebra links já publicados.


## Quadro de trabalho

O `.kanban` na raiz é o quadro local — fora do versionamento, não é
documentação. Quatro colunas: **A fazer**, **Bloqueado por BaaS**,
**Em análise** e **Descartado**, cada item com o motivo da decisão.

Vale ler antes de propor mudança grande: ideias já recusadas estão lá com
o porquê (quiz por tópico), e as duas mudanças que reviram a arquitetura —
componentes e Supabase para persistência — estão na fila com a ordem entre
elas já decidida.
