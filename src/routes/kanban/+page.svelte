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
    KANBAN_NUMEROS,
    KANBAN_CARDS,
  } from "$lib/kanban/dados.js";
  import "./kanban.css";

  let raiaAtiva = $state("todas");
  let aberto = $state(null); /* o card no painel */
  let origem = null; /* o botão que abriu, para devolver o foco */
  let fecharEl = $state(null);

  const opcoes = [{ id: "todas", rotulo: "Todas" }, ...KANBAN_RAIAS];

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
     ("50 marcações contra 353") se apoia neles */
  const numeros = $derived.by(() => {
    const partes = KANBAN_NUMEROS.trilhas.map(
      (t) => `${t.rotulo} ${t.grupos}/${t.topicos}`
    );
    const grupos = KANBAN_NUMEROS.trilhas.reduce((a, t) => a + t.grupos, 0);
    const topicos = KANBAN_NUMEROS.trilhas.reduce((a, t) => a + t.topicos, 0);
    return (
      "Grupos/tópicos por trilha: " + partes.join(" · ") +
      " — total " + grupos + "/" + topicos +
      ". Contados em " + KANBAN_NUMEROS.medidoEm + "."
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
  <title>Lets learn together — quadro de trabalho</title>
  <meta
    name="description"
    content="O que está em andamento, o que está bloqueado, o que está em análise e o que foi descartado — sempre com o motivo."
  />
</svelte:head>

<svelte:window
  onkeydown={(ev) => {
    if (ev.key === "Escape" && aberto) fechar();
  }}
/>

<header class="topo">
  <div class="topo__linha">
    <a class="botao" href="{base}/" data-sveltekit-reload>← Trilhas</a>
    <h1 class="marca">Quadro de trabalho</h1>
  </div>
  <p class="topo__nota">
    O que vem por aí, e o porquê de cada coisa estar onde está. Clique num
    card para ler o motivo inteiro.
  </p>
  <p class="topo__numeros">{numeros}</p>
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
