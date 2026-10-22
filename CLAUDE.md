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

## Branches

**`develop` é onde se trabalha. `main` é produção.**

Todo trabalho novo sai da `develop` e volta para ela. A `main` só recebe o
que já está pronto para o ar — é dela que o deploy sai, então um commit lá
é uma publicação, não um ponto de salvamento.

Antes de levar trabalho para a `main`, atualize-a contra a `develop`: as
duas divergem com facilidade, porque correção urgente às vezes entra
direto na produção e precisa voltar.

A regra de commit continua valendo acima desta: Claude prepara o commit e
mostra os comandos, mas não executa — nem `commit`, nem `push`, nem `tag`,
nem PR. A exceção é dita caso a caso, e vale só para aquela vez.

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

As telas:

| Rota | Arquivo | O que é |
|---|---|---|
| `/` | `src/routes/+page.svelte` | a mesa de cartas, onde se escolhe a trilha |
| `/roadmap?trilha=` | `src/routes/roadmap/` | o roadmap em si |
| `/calendario` | `src/routes/calendario/` | o calendário de estudos |
| `/notas?trilha=` | `src/routes/notas/` | o mural de post-its |
| `/kanban` | `src/routes/kanban/` | o quadro de trabalho |
| `/apoio` | `src/routes/apoio/` | a proposta de parceria, para empresas |
| `/conta` | `src/routes/conta/` | entrar, cadastrar, o perfil |
| `/privacidade`, `/termos` | — | os documentos obrigatórios |

**Duas peças aparecem em todas elas**, montadas no `+layout.svelte`: a fita
de parceria no alto (`src/lib/apoio/FitaApoio.svelte`) e o carimbo no pé
(`src/lib/global/Rodape.svelte`). Veja a seção do CSS — elas são a exceção
que a regra das folhas globais exigiu.

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

**O progresso é do banco, e só dele.** Supabase (projeto
`atmotqhqvhfaeoirdnzo`), com RLS por usuário. Sem conta não se marca nada:
tentar abre o convite a entrar. Isso substituiu o arranjo antigo, em que o
`localStorage` guardava o progresso — com dois donos do mesmo dado, a mesa
contava de um e o mapa do outro, e divergiam sem ninguém estar errado.

O caminho é `src/lib/roadmap/Progresso.svelte.js` (estado reativo) →
`src/lib/roadmap/sincronia.svelte.js` (as idas ao banco) →
`src/lib/supabase.js` (o cliente, que pode não existir).

| Tabela | O que guarda |
|---|---|
| `perfil` | nome e modo de calendário; nasce por gatilho no cadastro |
| `progresso_topico` | `(usuario, trilha, topico_id) → estado` |
| `progresso_subassunto` | o mesmo, por subassunto, com o texto na chave |
| `rota_grupo` | a rota condicional (ainda sem tela) |
| `nota` | o mural de post-its, uma linha por nota |
| `sessao_estudo` | um bloco de estudo num dia; `origem` diz se veio do modelo ou da mão |
| `modelo_mes` | a janela e a mistura que geram o mês, uma linha por pessoa |
| `contato_apoio` | quem escreveu pela `/apoio`; ninguém lê além de quem administra |
| `apoiador` | quem já apoia, e em que nível; leitura pública, é o que a fita mostra |

Linha só existe quando sai do padrão: ausência é `pendente`, no banco como
em memória. As migrations vivem em `supabase/migrations/` e sobem com
`npx supabase db push`.

O que **continua** no `localStorage`, em `src/lib/progresso.js`:

- `roadmap:<trilha>:etapas:v1` — etapas **fechadas** (o padrão é aberta)
- `roadmap:<trilha>:vista:v1` — como a trilha é olhada, não o que foi feito
  nela; hoje só `revelarPulados`
- `roadmap:tema:v1` — tema, comum a todas as trilhas, gravado como string
  crua porque o script inline do `app.html` o lê antes do bundle existir

Os dois primeiros são preferência de leitura **por aparelho** — faz sentido
a etapa estar fechada no celular e aberta no computador. O tema não pode
sair daqui: no banco, toda visita começaria com o tema errado, porque a
resposta chega depois do primeiro desenho.

As chaves `roadmap:<trilha>:progresso:v1` e `:sub:v1` ainda são **lidas uma
vez**, para oferecer à conta o que ficou de antes do banco (`importarHeranca`).
Ninguém mais escreve nelas, e elas somem quando não houver mais quem tenha
visitado o site antes da conta existir.

Toda leitura e escrita local é envolvida em `try/catch`: com cookies
bloqueados o site funciona, só não lembra da vista.

### Conta

`src/lib/conta/Sessao.svelte.js` é a sessão como estado reativo: `usuario`,
`nome`, `conectado`, mais os verbos (`entrar`, `cadastrar`, `sair`, …). Cada
verbo devolve `null` quando dá certo e uma **string em português** quando
não — a tela não vê erro do Supabase.

A confirmação de e-mail é por **link**, não por código: o plano gratuito não
deixa editar o modelo de e-mail, e o padrão manda `{{ .ConfirmationURL }}`.
O passo do código continua escrito em `fluxo.js`, dormente, porque ele volta
a valer no dia em que houver SMTP próprio.

O **login com Google** usa a mesma porta de volta (`?code=` na URL, trocado
por sessão pelo `detectSessionInUrl`). O app está publicado em produção no
Google Cloud, com escopos básicos — que não exigem verificação. O nome vem
de `full_name`, e o gatilho `criar_perfil_do_usuario` o copia para `perfil`
sem precisar saber de onde veio.

**Metade dessa configuração não mora no repositório**: cliente OAuth e tela
de consentimento no Google Cloud, provedor e modelos de e-mail no painel do
Supabase, e as variáveis `PUBLIC_SUPABASE_*` em *Variables* do Actions — sem
elas, o site publicado nasce sem conta. O `.env.example` conta só a parte
que cabe num arquivo.

Os estados ciclam em `pendente → estudando → feito → pulado`. As marcas
`□ ► ■ ×` existem porque a Departure Mono não tem `◔` nem `✓` — e porque o
estado não deve depender só de cor.

O gesto difere por aparelho, e a legenda anuncia o que vale em cada um:
com mouse, **clique abre o detalhe e shift + clique cicla** (o gesto mais
usado é o mais barato); no toque, onde não há Shift, o toque cicla e o
`[i]` abre.

Tópico `pulado` sai do mapa por padrão, e quem o revela é o chip
`× N pulados` na barra do conteúdo. Esconder só é defensável porque o chip
explica a ausência — sem ele, o tópico pareceria inexistente, que é
exatamente o argumento pelo qual a rota condicional vai **atenuar** em vez
de esconder.

### O mural de notas

As notas persistem na tabela `nota`, e o caminho é o mesmo do progresso:
`Mural.svelte.js` (estado) → `notas/remoto.svelte.js` (o banco). O que muda
é o **ritmo**: arrastar dispara escrita a cada `pointermove` e digitar, a
cada tecla, então toda mudança é agrupada por nota e desce ao banco depois
de 700ms de pausa — e no `pagehide`, para quem fecha a aba no meio da frase.

Não há mais notas de exemplo. Elas ensinavam o gesto a quem chegava, e
saíram quando o mural passou a guardar de verdade: nota de mentira é
indistinguível de nota real até alguém tentar arrastá-la.

### O calendário

Deixou de ser maquete. A grade é calculada do mês de verdade, as sessões
vêm de `sessao_estudo` e o formulário escreve nelas. O **assunto é texto
livre**, não uma lista de trilhas: o que se estuda numa noite raramente tem
o nome de uma trilha inteira. Por isso as abas de filtro e a legenda saem
dos assuntos escritos no mês, e a cor de cada um é derivada do próprio
texto — não há como escrever uma regra CSS por valor possível.

O modelo do mês (`src/lib/calendario/distribuir.js`) é lógica pura, sem
banco nem DOM, porque é a única parte que erra em silêncio: um mês mal
distribuído parece um mês. Três decisões vivem nela:

1. A porcentagem é de **dias**, não de horas — é o que se confere olhando a
   grade.
2. Aplicar **nunca reescreve o passado**: começa em hoje, e o que já foi
   estudado conta na cota. O `ignoreDuplicates` do upsert é o que protege a
   sessão escrita à mão, apoiado na `unique (usuario, dia, inicio)`.
3. O déficit é **proporcional ao ponto do mês**, não absoluto. Pelo
   absoluto, o assunto de 10% só é escolhido quando os grandes se saciam, e
   cai todo no fim do mês.

O que ainda não existe: o modo Google (OAuth com escopo `calendar.events`),
lembrete que chega no celular, e qualquer noção de sessão *cumprida* — a
tabela guarda o plano, não o que aconteceu.

### Erro nunca vira vazio

Três defeitos iguais apareceram no mesmo dia: `return error ? [] : data`
transforma falha em "não há nada", e a tela mostra um mês vazio que parece
verdade. Hoje cada camada guarda a última falha (`sincronia.ultimaFalha`,
`notas/remoto.svelte.js`, `calendario/remoto.svelte.js`) e o componente
`AvisoFalha` a mostra no rodapé das três telas.

Vale como regra: **escrita que muda a tela antes da resposta precisa de um
lugar para dizer que não chegou**. O pior desfecho aqui nunca foi o erro —
é a tela dizer que salvou.

### A página de apoio

`/apoio` fala com empresa, e é a única tela que não é feita para quem
estuda. Por isso a casca própria — cianótipo, a cópia azul de uma planta —
e por isso a **segunda família tipográfica**: Departure Mono é bitmap e de
um peso só, ótima em rótulo e número e cansativa em página longa de texto
corrido. Ela assina (títulos, tabela, selo) e a IBM Plex Sans carrega o
texto. As duas são auto-hospedadas em `static/fonts/`, pelo mesmo motivo
de sempre: fonte de terceiro é o site dependendo de outro servidor para
desenhar letra.

A estrutura é a de uma proposta de parceria: três **níveis** nomeados
(`src/lib/apoio/niveis.js`), uma tabela que compara os três, o selo que o
parceiro leva para o próprio site, e a conversa. Níveis, e não os lotes
que havia antes: lote era escolha múltipla, nível inclui o anterior — foi
isso que tirou o array de `contato_apoio` e deixou uma coluna.

Duas decisões de conteúdo que não se desfazem sem pensar:

1. **Não há depoimento.** Ninguém apoia o site ainda, e prova social
   inventada é a única coisa ali que seria mentira.
2. **Há um bloco dizendo o que a parceria não promete** — que não medimos
   audiência e não vendemos alcance. É ele que torna o resto crível, e
   está embaixo da tabela de propósito: é a linha que define quanto valem
   aqueles `■`.

O nível *fundador* conta vaga (`3 de 3 abertas`) e o número é verdade, não
escassez de vitrine: ele some sozinho quando alguém entrar.

### O CSS ainda é global, e isso tem consequência

Cada tela importa a própria folha, e elas são globais: a mesa
(`src/routes/mesa.css`), a casca escura das demais
(`src/lib/estilos/base.css`) e o cianótipo do apoio
(`src/routes/apoio.css`) definem `body`, `:root` e `.botao` com valores
diferentes.

Daí a regra: **a travessia entre telas é um documento novo**
(`data-sveltekit-reload` nos links, `location.href` nos atalhos com
animação). Duas folhas no mesmo documento e uma vence a outra — e folha
injetada pelo Vite não é removida ao navegar. Tirar o
`data-sveltekit-preload-data` do `app.html` é parte disso: pré-carregar uma
rota no hover já injeta o CSS dela.

#### As duas exceções, e o que elas ensinam

`FitaApoio.svelte` e `Rodape.svelte` são os **únicos componentes com
`<style>` próprio**. Não é preferência: eles vivem no `+layout.svelte` e
são desenhados dentro das três folhas, que dão valores diferentes aos
mesmos nomes. Herdar faria a mesma peça mudar de cor conforme a tela em
que caiu — e, na prática, mudou: o rodapé saía em Departure Mono em cinco
telas e em Plex Sans no apoio, até a família virar token próprio também.

Então a regra para peça que aparece em mais de uma tela: **estilo
escopado, e todo token declarado no próprio componente** — cor, fonte,
sombra. Nada de `var()` que dependa da folha.

Com uma exceção deliberada, que é o caminho inverso: **a folha informa o
componente do que só ela sabe**. `--sangria-x` e `--sangria-t` são o
padding daquele `body`, e a fita e o rodapé os descontam para alcançar a
borda da janela. Sem isso, os dois nasciam recuados, e papel que termina
antes da janela não é fita nem carimbo — é cartão.

**A fita não é fixa, e isso foi decidido depois de tentar.** Fixa, ela
acompanhava a rolagem em todas as telas e virava poluição: um anúncio
permanente por cima de quem veio estudar. O custo escondido era maior —
sete lugares (três folhas, `.rail`, `.canto`, `.conta-volta`, `.quina`)
precisaram concordar com os mesmos 66px, e cada um que discordava era um
defeito visível. **Medida que um elemento fixo impõe ao resto da página
não é número, é token**: sobrou `--fita-altura`, em `src/app.css`.

Quando cada componente levar o próprio estilo, a regra das folhas sai. Até
lá, link novo entre telas precisa de `data-sveltekit-reload`.

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

**Um lugar só:** a tela `/kanban`, com os dados em
`src/lib/kanban/dados.js`. Havia um `.kanban` na raiz, rascunho local fora
do versionamento; ele saiu em 21/10/2026, porque dois quadros espelhados à
mão divergem — e o que estava só nele já tinha sido levado para cá.

**Os cards vivem no banco** desde 21/10/2026 (tabela `kanban_card`), e a
tela os lê em runtime — por isso `/kanban` tem `ssr = false`. O
`dados.js` ficou só com a estrutura: colunas, raias e os números medidos
à mão. Qualquer pessoa com conta pode escrever no quadro; apagar é de
quem criou o card ou de quem tem `perfil.admin`.

Quatro colunas: **A fazer**, **Em análise**, **Descartado** e
**Concluído**. Havia uma quinta, *Bloqueado por BaaS*, que saiu junto com
a mudança: ela nomeava um impedimento e não um status, e esvaziou quando
o Supabase chegou. Não confundir com as **raias**, que são áreas
(Arquitetura, Interface, Conteúdo) e viram o filtro da tela — coluna é
status.

**Sugestões** (`sugestao`) são de quem tem conta e não viram card
sozinhas: têm estado (`nova → lida → virou_card | recusada`) e um
`card_id` que aponta o card nascido delas. Se escrevessem direto no
quadro, ele deixaria de ser uma lista de decisões tomadas.

A regra do arquivo: **card sem `porque` não entra**. O valor do quadro é o
motivo, não a lista — e é por isso que vale lê-lo antes de propor mudança
grande: ideia já recusada está lá com o porquê (quiz por tópico), e decisão
já tomada evita refazer a discussão (o calendário ser dono dos eventos, a
rota atenuar em vez de esconder).

Os campos que a tela desenha são `titulo`, `resumo`, `blocos`, `porque` e
`vejaTambem`. Campo novo que o componente não leia vira dado morto, sem
erro nenhum para avisar.

Supabase, conta, login social, progresso, notas e calendário saíram em
19–21/10/2026. O que resta na raia Arquitetura é a rota condicional,
excluir a própria conta e o modo Google do calendário.
