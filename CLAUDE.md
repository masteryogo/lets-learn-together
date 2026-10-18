# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Site de roadmaps de estudo em português (`lets-learn-together`), feito com
SvelteKit e publicado como arquivo estático — GitHub Pages e um projeto
Vercel (`.vercel/`, fora do versionamento).

Até outubro de 2026 era HTML, CSS e JavaScript ES5 servidos direto, sem
build. A migração para Svelte está no histórico da branch
`refatoracao-svelte`, e o porquê dela está no quadro: componente com estado
reativo é a peça que falta para ler dado que chega depois (Supabase).

## Rodar

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # gera build/
npm run preview   # serve o build/ como em produção
```

Não há testes nem lint: a verificação é abrir as telas no navegador. O
`npm run build` faz uma checagem que vale ouro — com todas as rotas
pré-renderizadas, ele **percorre os links e falha em qualquer um apontando
para o nada**.

Abrir por `file://` deixou de funcionar na migração: o SvelteKit serve de
`/_app/` com caminho absoluto. O tratamento de `localStorage` bloqueado
continua, por causa de cookies desabilitados e janela anônima.

## Arquitetura

Cinco rotas, cada uma uma tela:

| Rota | Arquivo | O que é |
|---|---|---|
| `/` | `src/routes/+page.svelte` | a mesa de cartas, onde se escolhe a trilha |
| `/roadmap?trilha=` | `src/routes/roadmap/` | o roadmap em si |
| `/calendario` | `src/routes/calendario/` | o calendário de estudos |
| `/notas?trilha=` | `src/routes/notas/` | o mural de post-its |
| `/kanban` | `src/routes/kanban/` | o quadro de trabalho |

### Os dados de uma trilha

`src/lib/trilhas.js` é o **manifesto**: a ficha de cada trilha (rótulo, cor,
`etapas`, `topicos` e a `rota` desenhada na carta) mais um mapa de
carregadores com um `import()` dinâmico por trilha. A mesa lê só o
manifesto; o conteúdo vem num chunk à parte, baixado quando alguém escolhe
a trilha.

O mapa de carregadores é escrito à mão de propósito. `import("./trilhas/" +
id + "/index.js")` funcionaria, mas faria o Vite empacotar toda pasta que
casasse com o padrão — inclusive uma trilha em rascunho.

Cada `src/lib/trilhas/<id>/` tem:

1. `data.js` — exporta `ROADMAP` (sem as etapas), `PROJETOS`, `RECURSOS`,
   `LEGENDA`, `ESTADOS`, `CRITERIOS`.
2. `conteudo-*.js` — cada um exporta um **array de etapas**.
3. `index.js` — importa os anteriores e monta `ROADMAP.etapas` na ordem.

A ordem vive no `index.js`, escrita. O `conteudo-4b` do ml é a prova de que
isso importa: ele acrescenta grupos à etapa criada pelo `4a`, e antes fazia
isso procurando a etapa por id num array global, lançando erro se o `4a`
não tivesse sido carregado antes. Hoje exporta só os grupos, e quem os junta
é o `index.js`.

### Estado e persistência

Tudo em `localStorage`, por trilha, sem servidor nem conta. As chaves e os
acessos ficam em `src/lib/progresso.js`; o estado reativo em
`src/lib/roadmap/Progresso.svelte.js`.

- `roadmap:<trilha>:progresso:v1` — `{ idDoTopico: estado }`
- `roadmap:<trilha>:sub:v1` — subassuntos marcados
- `roadmap:<trilha>:etapas:v1` — etapas **fechadas** (o padrão é aberta)
- `roadmap:tema:v1` — tema, comum a todas as trilhas, gravado como string
  crua porque o script inline do `app.html` o lê antes do bundle existir
- `roadmap-ml:progresso:v1` — chave legada, de antes das trilhas; ainda lida
  como alternativa do `ml`

Toda leitura e escrita é envolvida em `try/catch`: com cookies bloqueados o
site funciona, só não lembra.

Os estados ciclam em `pendente → estudando → feito → pulado`. As marcas
`□ ► ■ ×` existem porque a Departure Mono não tem `◔` nem `✓` — e porque o
estado não deve depender só de cor.

As **notas não persistem**, de propósito: texto escrito não se refaz, e o
Safari apaga o `localStorage` de site sem visita em 7 dias. É o primeiro
lugar que o Supabase assume — ver o cabeçalho de `src/lib/notas/Mural.svelte.js`.

### O CSS ainda é global, e isso tem consequência

Cada tela importa a própria folha, e elas são globais: a mesa
(`src/routes/mesa.css`) e a casca escura das outras três
(`src/lib/estilos/base.css`) definem `body`, `:root`, `.botao` e `.rodape`
com valores diferentes.

Daí a regra: **a travessia entre telas é um documento novo**
(`data-sveltekit-reload` nos links, `location.href` nos atalhos com
animação). Duas folhas no mesmo documento e uma vence a outra — e folha
injetada pelo Vite não é removida ao navegar. Tirar o
`data-sveltekit-preload-data` do `app.html` é parte disso: pré-carregar uma
rota no hover já injeta o CSS dela.

Isso sai quando cada componente levar o próprio estilo. Até lá, link novo
entre telas precisa de `data-sveltekit-reload`.

### O Obi

O mascote se chama Obi e aparece na mesa e no roadmap. Um componente,
`src/lib/obi/Obi.svelte`, com duas variantes numa tabela — o que muda entre
as telas (invólucro, paleta, tamanho, nomes de classe) muda junto, então é
variante, não prop solta:

| | `ator` (mesa) | `ninho` (roadmap) |
|---|---|---|
| chão | tem: sombra e quique no pouso | não: volta flutuando |
| paleta | `--roxo` / `--amarelo` | `--logo-*`, mais saturados para o tema escuro |
| rótulo | anunciado ao leitor de tela | `aria-hidden` — não leva a lugar nenhum |

O comportamento é `ControleObi` (`src/lib/obi/ControleObi.svelte.js`), uma
classe com uma ação Svelte. Continua imperativo de propósito: o gesto é
captura de ponteiro, `transform` inline a cada `pointermove` e reinício de
animação por reflow forçado. Só `pegado`/`voltando` saem como `$state`.

**Os dois eixos do arrasto vivem em elementos diferentes**: o horizontal no
`.obi`, o vertical no `.obi__corpo`. É isso que deixa a sombra no chão
enquanto ele sobe — junte os dois num transform só e o gesto passa a ler
como a página deslizando.

A posição de descanso nunca é escrita pelo controle: o arrasto é um
transform por cima de onde a página colocou o Obi. Quem o faz passear (a
mesa) consulta `controle.ocupado` antes de mexer na posição.

Fora do lugar de descanso ele passa por cima de tudo — `z-index: 60` em
`[data-pendurado]`, `[data-voltando]` e `[data-saindo]`. São as três
maneiras de sair: na mão de quem arrasta, voltando dela, e andando até onde
a página mandou.

Arrastar só vale em tela larga, e não tem equivalente de teclado: como o
gesto não produz nada — não navega, não salva, não muda estado — não há o
que oferecer a quem não o faz, e o Obi fica fora da ordem de tabulação.

Uma armadilha que já custou caro: `.obi__olho` tem `animation: piscar`, e no
CSS **animação ganha de `transform` declarado**. Todo estado novo que queira
mandar nos olhos precisa de `animation: none` junto.

## Mexer nos dados

Um tópico tem cinco campos (`id`, `titulo`, `prioridade`, `desc`, `detalhe`,
e `subtopicos` opcional). Regra que não se quebra: **o `id` é estável** — é a
chave do progresso salvo de quem já marcou aquele item. Editar o texto é
livre; renomear o `id` apaga o progresso alheio.

Quando `desc` é uma lista separada por vírgulas, o painel a transforma em
subassuntos marcáveis sozinho; `subtopicos` só existe para controlar a
separação na mão.

### Trilha nova

Criar `src/lib/trilhas/<id>/` com `data.js`, os `conteudo-*.js` e o
`index.js`, e registrar o id em `src/lib/trilhas.js` **nos dois lugares**:
em `TRILHAS` (com `rotulo`, `cor`, `etapas`, `topicos` e `rota`) e em
`CARREGADORES`. Esquecer o segundo passa no build e quebra só na escolha.

`etapas` e `topicos` são derivados dos dados mas vivem no manifesto para a
mesa não baixar as trilhas inteiras — **ao mexer no conteúdo, conferir a
contagem real no rodapé do roadmap e acertar o manifesto.**

## Convenções

- **Svelte 5 com runes** (`$state`, `$derived`, `$props`, `$effect`), não a
  API de store do Svelte 4.
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

`index.html?trilha=cv` ainda circula. O script inline do `src/app.html`
redireciona para `/roadmap?trilha=cv` antes de qualquer desenho — mexer
nisso quebra links já publicados.

## Quadro de trabalho

Dois lugares, e eles não são o mesmo:

- `.kanban` na raiz — quadro local, fora do versionamento, não é
  documentação. Quatro colunas: **A fazer**, **Bloqueado por BaaS**, **Em
  análise** e **Descartado**, cada item com o motivo da decisão.
- `/kanban` — a tela pública, com dados em `src/lib/kanban/dados.js`.

Vale ler o `.kanban` antes de propor mudança grande: ideias já recusadas
estão lá com o porquê (quiz por tópico). Com os componentes feitos, o
próximo da raia Arquitetura é o Supabase.
