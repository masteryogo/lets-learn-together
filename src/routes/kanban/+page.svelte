<!-- ============================================================
     O quadro de trabalho.

     O kanban.js tinha um cuidado que vale registrar porque aqui ele
     some: nada de innerHTML, porque o texto dos cards contém aspas e
     coisas como `trilhas/<id>/*.js`, que viram tag se forem coladas
     como HTML. Era createElement + textContent, verboso e sem esse
     buraco. A interpolação do Svelte escapa por padrão, então o
     cuidado deixa de precisar de disciplina.

     O painel troca de card sem fechar (o "Veja também"), e por isso
     `origem` — quem abriu — é separado de qual card está aberto: o
     foco volta para o card que começou tudo, não para o último lido.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import {
    KANBAN_COLUNAS,
    KANBAN_RAIAS,
  } from "$lib/kanban/dados.js";
  import { listarTrilhas } from "$lib/trilhas.js";
  import {
    estado as estadoDoQuadro,
    estadoSugestoes,
    listarCards,
    minhasSugestoes,
    sugerir,
  } from "$lib/kanban/remoto.svelte.js";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import "./kanban.css";

  /* os cards vêm do banco desde 21/10/2026. A leitura é pública, então
     a tela funciona deslogada — é ela que explica o projeto a quem
     chega. */
  let KANBAN_CARDS = $state([]);
  let carregando = $state(true);

  $effect(() => sessao.iniciar());

  $effect(() => {
    listarCards().then((cards) => {
      KANBAN_CARDS = cards ?? [];
      carregando = false;
    });
  });

  /* a ficha de cada trilha, sem o conteúdo: é só dela que vêm as
     contagens, e é a mesma consulta leve que a mesa faz */
  let fichas = $state({});
  let contando = $state(true);

  $effect(() => {
    listarTrilhas().then((f) => {
      fichas = f;
      contando = false;
    });
  });

  let raiaAtiva = $state("todas");
  let aberto = $state(null); /* o card no painel */
  let origem = null; /* o botão que abriu, para devolver o foco */
  let fecharEl = $state(null);

  const opcoes = [{ id: "todas", rotulo: "Todas" }, ...KANBAN_RAIAS];

  /* ------------------------- sugerir ------------------------- */

  let sugestao = $state({ titulo: "", corpo: "", raia: "" });
  let enviando = $state(false);
  let eco = $state(null);
  let minhas = $state([]);
  let sugerindo = $state(false);

  $effect(() => {
    if (sessao.conectado) {
      minhasSugestoes().then((l) => {
        /* erro não apaga a lista que a pessoa já tinha conseguido ler */
        if (l !== null) minhas = l;
      });
    }
    else minhas = [];
  });

  async function enviarSugestao(ev) {
    ev.preventDefault();
    if (enviando) return;
    enviando = true;
    const falha = await sugerir(sugestao);
    enviando = false;
    if (falha) {
      eco = { tom: "ruim", texto: falha };
      return;
    }
    sugestao = { titulo: "", corpo: "", raia: "" };
    eco = { tom: "bom", texto: "Enviada. Ela entra na fila para virar card." };
    minhas = await minhasSugestoes();
  }

  const ESTADOS_SUGESTAO = {
    nova: "na fila",
    lida: "lida",
    virou_card: "virou card",
    recusada: "recusada",
  };

  function rotuloRaia(id) {
    return KANBAN_RAIAS.find((r) => r.id === id)?.rotulo ?? id;
  }

  function cardPorId(id) {
    return KANBAN_CARDS.find((c) => c.id === id) ?? null;
  }

  function visivel(card) {
    return raiaAtiva === "todas" || card.raia === raiaAtiva;
  }

  /* os números não são enfeite: quase todo argumento do quadro
     ("50 marcações contra 353") se apoia neles — por isso eles vêm
     do banco, que os reconta a cada escrita, e não de uma contagem
     à mão que envelhece em silêncio */
  const numeros = $derived.by(() => {
    const lista = Object.values(fichas);
    /* sem banco não há trilha, e meia frase é pior que nenhuma */
    if (!lista.length) return "";

    const partes = lista.map(
      (t) => `${t.rotulo} ${t.grupos}/${t.topicos}`
    );
    const grupos = lista.reduce((a, t) => a + t.grupos, 0);
    const topicos = lista.reduce((a, t) => a + t.topicos, 0);
    return (
      "Grupos/tópicos por trilha: " + partes.join(" · ") +
      " — total " + grupos + "/" + topicos + "."
    );
  });

  /* a contagem conta o que está visível, não o que existe: número que
     não acompanha o filtro mente sobre a tela */
  const porColuna = $derived(
    Object.fromEntries(
      KANBAN_COLUNAS.map((c) => [
        c.id,
        KANBAN_CARDS.filter((k) => k.coluna === c.id && visivel(k)),
      ])
    )
  );

  const total = $derived(
    Object.values(porColuna).reduce((a, l) => a + l.length, 0)
  );

  const aviso = $derived(
    raiaAtiva === "todas"
      ? total + " cards, todas as áreas."
      : total + " cards em " + rotuloRaia(raiaAtiva) + "."
  );

  const colunaDo = $derived(
    aberto ? KANBAN_COLUNAS.find((c) => c.id === aberto.coluna) : null
  );

  function abrir(card, botao) {
    origem = botao;
    aberto = card;
  }

  function fechar() {
    aberto = null;
    origem?.focus();
    origem = null;
  }

  $effect(() => {
    if (aberto) fecharEl?.focus();
  });
</script>

<svelte:head>
  <title>Let's Learn Together — quadro de trabalho</title>
  <meta
    name="description"
    content="O que está em andamento, o que está em análise, o que foi descartado e o que já saiu — sempre com o motivo."
  />
</svelte:head>

<svelte:window
  onkeydown={(ev) => {
    if (ev.key === "Escape" && aberto) fechar();
    else if (ev.key === "Escape" && sugerindo) sugerindo = false;
  }}
/>

<header class="topo">
  <div class="topo__linha">
    <a class="botao" href="{base}/" data-sveltekit-reload>← Trilhas</a>
    <h1 class="marca">Quadro de trabalho</h1>
    <!-- a porta da sugestão: embaixo da última coluna ela ficava a dois
         mil pixels de rolagem, que é o mesmo que não existir -->
    <button class="botao topo__sugerir" type="button" onclick={() => (sugerindo = true)}>
      + Sugerir
    </button>
  </div>
  <p class="topo__nota">
    O que vem por aí, e o porquê de cada coisa estar onde está. Clique num
    card para ler o motivo inteiro.
  </p>
  {#if numeros}
    <p class="topo__numeros">{numeros}</p>
  {:else if contando}
    <!-- o skeleton reserva a linha: sem ele o topo pula e empurra o
         quadro para baixo no meio da leitura. aria-hidden porque
         "ainda não sei" não é informação para quem ouve a página —
         a frase será lida quando existir. -->
    <div class="topo__espera" aria-hidden="true"></div>
  {/if}
</header>

<!-- filtro por raia: o quadro inteiro cabe na tela, mas ler só
     "Interface" é a pergunta que mais se faz dele -->
<nav class="raias" aria-label="Filtrar por área">
  {#each opcoes as opcao}
    <button
      class="botao"
      type="button"
      aria-pressed={raiaAtiva === opcao.id}
      onclick={() => (raiaAtiva = opcao.id)}>{opcao.rotulo}</button
    >
  {/each}
</nav>

{#if carregando}
  <p class="quadro__espera" role="status">Buscando o quadro…</p>
{:else if estadoDoQuadro.falha}
  <!-- quadro vazio por erro é indistinguível de quadro vazio: o
       primeiro precisa se denunciar -->
  <p class="quadro__espera" data-falha="sim" role="status">
    Não consegui ler o quadro: {estadoDoQuadro.falha}
  </p>
{/if}

<main class="quadro">
  {#each KANBAN_COLUNAS as coluna}
    <section
      class="coluna"
      data-coluna={coluna.id}
      style:--cor-coluna="var(--col-{coluna.id})"
      aria-labelledby="coluna-{coluna.id}"
    >
      <div class="coluna__topo">
        <h2 class="coluna__rotulo" id="coluna-{coluna.id}">{coluna.rotulo}</h2>
        <span class="coluna__contagem">{porColuna[coluna.id].length}</span>
      </div>

      {#if coluna.nota}
        <p class="coluna__nota">{coluna.nota}</p>
      {/if}

      <div class="coluna__cards">
        {#each KANBAN_CARDS.filter((c) => c.coluna === coluna.id) as card (card.id)}
          <button
            class="card"
            type="button"
            data-card={card.id}
            data-raia={card.raia}
            data-oculto={visivel(card) ? "nao" : "sim"}
            onclick={(ev) => abrir(card, ev.currentTarget)}
          >
            <span class="etiqueta">{rotuloRaia(card.raia)}</span>
            <span class="card__titulo">{card.titulo}</span>
            {#if card.resumo}
              <p class="card__resumo">{card.resumo}</p>
            {/if}
          </button>
        {/each}
      </div>

      {#if !KANBAN_CARDS.some((c) => c.coluna === coluna.id)}
        <p class="coluna__vazio">Nada aqui.</p>
      {/if}
    </section>
  {/each}
</main>

<div class="veu" hidden={!aberto} onclick={fechar} aria-hidden="true"></div>

<!-- mesmo caso do drawer do roadmap: o <aside> vem do HTML antigo, e é
     dele que sai a folha inteira do painel -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<aside
  class="painel"
  role="dialog"
  aria-modal="true"
  aria-labelledby="painel-titulo"
  hidden={!aberto}
  style:--cor-coluna={aberto ? "var(--col-" + aberto.coluna + ")" : null}
>
  <div class="painel__barra">
    <span class="painel__coluna">{colunaDo?.rotulo ?? ""}</span>
    <button
      class="botao botao--icone"
      type="button"
      aria-label="Fechar"
      bind:this={fecharEl}
      onclick={fechar}>×</button
    >
  </div>

  {#if aberto}
    <div class="painel__corpo">
      <span class="etiqueta">{rotuloRaia(aberto.raia)}</span>
      <h2 id="painel-titulo">{aberto.titulo}</h2>
      <p class="painel__resumo">{aberto.resumo || ""}</p>

      <!-- "por que" vem antes do detalhe, e com régua própria: é a
           única parte que todo card tem -->
      <section class="painel__secao painel__secao--regua">
        <h3>Por quê</h3>
        <p class="painel__nota">{aberto.porque}</p>
      </section>

      <div class="painel__blocos">
        {#each aberto.blocos ?? [] as bloco}
          {#if bloco.tipo === "lista"}
            <ul>
              {#each bloco.itens as item}<li>{item}</li>{/each}
            </ul>
          {:else}
            <p>{bloco.texto}</p>
          {/if}
        {/each}
      </div>

      {#if aberto.vejaTambem?.length}
        <section class="painel__secao">
          <h3>Veja também</h3>
          <div class="painel__veja">
            {#each aberto.vejaTambem as id}
              {@const outro = cardPorId(id)}
              {#if outro}
                <!-- troca o conteúdo do painel sem fechar: origem continua
                     sendo o card que abriu tudo, e o foco volta para lá -->
                <button class="botao" type="button" onclick={() => (aberto = outro)}
                  >{outro.titulo}</button
                >
              {/if}
            {/each}
          </div>
        </section>
      {/if}
    </div>
  {/if}
</aside>

<p class="aviso" role="status" aria-live="polite">{aviso}</p>

<!-- ========================== sugerir ==========================
     O quadro deixou de ser só leitura: quem usa o site pode propor
     algo. A sugestão não vira card sozinha — ela entra numa fila e
     a decisão continua sendo de quem mantém o projeto. Fosse
     direto, qualquer pessoa escreveria no quadro, e o valor dele é
     justamente ser uma lista de decisões tomadas. -->
<div class="veu" hidden={!sugerindo} onclick={() => (sugerindo = false)} aria-hidden="true"></div>

<div
  class="painel sugerir"
  role="dialog"
  aria-modal="true"
  aria-labelledby="sugerir-titulo"
  hidden={!sugerindo}
  style:--cor-coluna="var(--col-fazer)"
>
  <div class="painel__barra">
    <span class="painel__coluna">Sugestão</span>
    <button class="botao botao--icone" type="button" aria-label="Fechar"
      onclick={() => (sugerindo = false)}>×</button>
  </div>

  <div class="painel__corpo">
    <h2 class="sugerir__titulo" id="sugerir-titulo">Sugerir alguma coisa</h2>
  <p class="sugerir__linha">
    Faltou uma trilha, um recurso, um conserto? Escreva aqui — e diga o
    <em>porquê</em>, que é o que o quadro guarda de cada card.
  </p>

  <form class="sugerir__forma" onsubmit={enviarSugestao}>
    <label class="campo" for="sugestao-titulo">
      <span class="campo__rotulo">Em uma linha</span>
      <input
        class="campo__controle"
        id="sugestao-titulo"
        type="text"
        maxlength="120"
        placeholder="ex.: trilha de bancos de dados"
        bind:value={sugestao.titulo}
      />
    </label>

    <label class="campo" for="sugestao-raia">
      <span class="campo__rotulo">Onde você acha que entra</span>
      <select class="campo__controle" id="sugestao-raia" bind:value={sugestao.raia}>
        <option value="">não sei dizer</option>
        {#each KANBAN_RAIAS as r}
          <option value={r.id}>{r.rotulo}</option>
        {/each}
      </select>
    </label>

    <label class="campo" for="sugestao-corpo">
      <span class="campo__rotulo">O que e por quê</span>
      <textarea
        class="campo__controle"
        id="sugestao-corpo"
        rows="5"
        maxlength="4000"
        placeholder="O que você faria, e o problema que isso resolve."
        bind:value={sugestao.corpo}
      ></textarea>
    </label>

    {#if sessao.conectado}
      <button class="botao botao--destaque" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar sugestão"}
      </button>
    {:else}
      <!-- data-sveltekit-reload: a tela de conta tem folha própria, e
           esta aqui também — duas globais no mesmo documento e uma
           vence a outra -->
      <a class="botao botao--destaque sugerir__entrar" href="{base}/conta" data-sveltekit-reload>
        Entrar para sugerir
      </a>
    {/if}

    {#if eco}
      <p class="sugerir__eco" data-tom={eco.tom} role="status">{eco.texto}</p>
    {/if}

    {#if estadoSugestoes.falha}
      <p class="sugerir__eco" data-tom="ruim" role="status">
        Não consegui ler suas sugestões: {estadoSugestoes.falha}
      </p>
    {/if}
  </form>

  {#if minhas.length}
    <div class="sugerir__minhas">
      <h3 class="sugerir__sub">Suas sugestões</h3>
      {#each minhas as s (s.id)}
        <article class="sugestao-item">
          <div class="sugestao-item__topo">
            <span class="sugestao-item__titulo">{s.titulo}</span>
            <span class="sugestao-item__estado" data-estado={s.estado}>
              {ESTADOS_SUGESTAO[s.estado] ?? s.estado}
            </span>
          </div>
          {#if s.resposta}
            <p class="sugestao-item__resposta">{s.resposta}</p>
          {/if}
        </article>
        {/each}
      </div>
    {/if}
  </div>
</div>
