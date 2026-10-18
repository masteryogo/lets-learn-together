<!-- ============================================================
     Um tópico no mapa.

     O ⓘ não pode morar dentro do tópico: button dentro de button é
     HTML inválido. Os dois são irmãos num invólucro, que passa a ser
     o item da lista no lugar do botão.

     Clique cicla o estado; shift + clique e o botão direito abrem o
     detalhe. O botão direito é atalho para quem prefere não usar o
     Shift.
     ============================================================ -->
<script>
  import { MARCAS } from "./Progresso.svelte.js";

  let { topico, estado, rotuloEstado, dicaLer, oculto, aoCiclar, aoAbrir } =
    $props();

  const descricao = $derived(topico.titulo + " — " + rotuloEstado(estado));
</script>

<div class="topico-par">
  <button
    type="button"
    class="topico"
    id="topico-{topico.id}"
    data-id={topico.id}
    data-prioridade={topico.prioridade}
    data-estado={estado}
    data-oculto={oculto ? "sim" : null}
    aria-label={descricao}
    title="{descricao} ({dicaLer})"
    onclick={(ev) => (ev.shiftKey ? aoAbrir() : aoCiclar())}
    oncontextmenu={(ev) => {
      ev.preventDefault();
      aoAbrir();
    }}
  >
    <span class="topico__marca">{MARCAS[estado]}</span>{topico.titulo}
  </button>

  <button
    type="button"
    class="topico__info"
    title="Ler o detalhe de {topico.titulo}"
    aria-label="Detalhe de {topico.titulo}"
    onclick={aoAbrir}
  >[i]</button>
</div>
