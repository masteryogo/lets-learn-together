<!-- ============================================================
     O mural de notas.

     Um mural por trilha, sem aba "Todas": a nota é da trilha em que
     foi escrita, e um mural misturado não é de ninguém. As abas vêm
     do manifesto, então trilha nova aparece aqui sem ninguém lembrar
     de editar esta página.

     Trocar de mural não recarrega: a querystring muda no histórico e
     o mural se redesenha. Antes isso era pushState + popstate na mão;
     agora é o roteador, e o botão de voltar funciona de graça.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  import { TRILHAS, carregarTrilha, resolverId } from "$lib/trilhas.js";
  import Canto from "$lib/Canto.svelte";
  import Nota from "$lib/notas/Nota.svelte";
  import { Mural } from "$lib/notas/Mural.svelte.js";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import Convite from "$lib/conta/Convite.svelte";
  import AvisoFalha from "$lib/conta/AvisoFalha.svelte";
  import { estado as estadoDasNotas } from "$lib/notas/remoto.svelte.js";

  import "$lib/estilos/base.css";
  import "./notas.css";

  const mural = new Mural();

  const atual = $derived(resolverId(page.url.searchParams.get("trilha")));

  /* os tópicos da trilha aberta, para prender uma nota a um deles. É
     o mesmo import dinâmico do roadmap: o conteúdo é um chunk à
     parte, e o mural só o baixa quando alguém vai usá-lo. */
  let topicos = $state([]);

  $effect(() => {
    let vivo = true;
    carregarTrilha(atual).then((dados) => {
      if (!vivo) return;
      const lista = [];
      for (const etapa of dados.ROADMAP.etapas ?? []) {
        for (const grupo of etapa.grupos ?? []) {
          for (const t of grupo.topicos ?? []) lista.push({ id: t.id, titulo: t.titulo });
        }
      }
      topicos = lista;
    });
    return () => (vivo = false);
  });

  /* o id é o que se guarda (ele é estável); o título é o que se lê */
  const tituloDoTopico = $derived(
    Object.fromEntries(topicos.map((t) => [t.id, t.titulo]))
  );
  const lista = $derived(mural.daTrilha(atual));
  const rotulo = $derived(TRILHAS[atual].rotulo);

  /* o arrasto é de ponteiro fino: no toque a mesma área precisa rolar
     a página, e no celular o mural é grade, onde mover não quer dizer
     nada. A media query do CSS e esta checagem contam a mesma história
     e precisam continuar contando. */
  const largo = new MediaQuery("min-width: 56.0625rem");

  let muralEl = $state(null);
  let foco = $state(null); /* id da nota recém-criada, para o cursor ir nela */

  const conta = $derived(
    lista.length === 0
      ? "nenhuma nota"
      : lista.length === 1
        ? "1 nota"
        : lista.length + " notas"
  );

  /* a página inteira ganha a classe no <body> porque é ele que recebe
     o fundo de pontos do mural — e ela sai quando a rota sai */
  $effect(() => {
    document.body.classList.add("notas-pagina");
    return () => document.body.classList.remove("notas-pagina");
  });

  /* as notas vêm da conta; sem ela, os exemplos. O efeito observa
     `conectado` porque a sessão pode chegar depois da tela, e porque
     entrar pelo convite tem que encher o mural sem recarregar. */
  $effect(() => {
    sessao.conectado;
    mural.carregar();
  });

  /* o que estava sendo digitado quando a aba fecha. O navegador não
     espera promessa aqui, mas deixa a requisição sair. */
  $effect(() => {
    const salvar = () => mural.descarregar();
    addEventListener("pagehide", salvar);
    return () => {
      removeEventListener("pagehide", salvar);
      mural.descarregar();
    };
  });

  /* recusa vira convite, como no mapa do roadmap */
  let convite = $state(false);
  $effect(() => {
    if (mural.recusas > 0) convite = true;
  });

  async function nova() {
    const id = await mural.criar(atual);
    if (id) foco = id;
  }
</script>

<svelte:head>
  <title>Notas de estudo</title>
</svelte:head>

<Canto />

<Convite aberto={convite} aoFechar={() => (convite = false)} />
<AvisoFalha falha={estadoDasNotas.falha} />

<header class="cabecalho-notas">
  <h1 class="cabecalho-notas__titulo">Notas</h1>

  <nav class="filtro" aria-label="Escolher a trilha">
    {#each Object.entries(TRILHAS) as [id, t]}
      <!-- a cor vem do manifesto, não do CSS: trilha nova entra sem
           ninguém escrever uma regra para ela -->
      <a
        class="filtro__aba"
        href="{base}/notas?trilha={id}"
        data-trilha={id}
        style:--trilha-cor={t.cor || null}
        aria-current={id === atual ? "page" : undefined}
        onclick={(ev) => {
          /* clique com modificador continua sendo do navegador — é
             pedido de nova aba */
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
            return;
          }
          ev.preventDefault();
          goto(`${base}/notas?trilha=${id}`);
        }}
      >
        {t.rotulo}
        <span class="filtro__n">{mural.contarDe(id)}</span>
      </a>
    {/each}
  </nav>
</header>

<div class="acoes-notas">
  <button class="botao botao--destaque" type="button" onclick={nova}>+ Nota</button>
  <span class="acoes-notas__conta">{conta}</span>
</div>

<!-- A superfície é de pontos, não de cortiça: mesma ideia da malha
     milimetrada da carta na mesa — dá referência ao arrastar sem
     fingir uma textura que o resto do site não tem.

     Em tela larga cada nota é posicionada (left/top em linha); no
     celular o mural vira grade e `position: static` faz esses dois
     valores virarem letra morta, sem limpar nada aqui. -->
<section
  class="mural"
  bind:this={muralEl}
  aria-label="Mural de {rotulo}"
>
  {#if lista.length === 0}
    <p class="mural__vazio">
      {#if mural.carregando}
        Buscando suas notas…
      {:else if !sessao.conectado}
        Entre na conta para escrever notas — elas ficam salvas nela.
      {:else}
        O mural de {rotulo} está limpo. Escreva a primeira.
      {/if}
    </p>
  {:else}
    {#each lista as nota, i (nota.id)}
      <Nota
        {nota}
        indice={i}
        {mural}
        {muralEl}
        {topicos}
        {tituloDoTopico}
        arrastavel={largo.current}
        focar={foco === nota.id}
        aoFocar={() => (foco = null)}
      />
    {/each}
  {/if}
</section>

<!-- o gesto anunciado muda com o apontador, como a legenda do mapa -->
<p class="dica-notas">
  {largo.current ? "Arraste pela faixa de cima" : "Toque para escrever"} · ◆ marca
  a nota presa a um tópico
</p>
