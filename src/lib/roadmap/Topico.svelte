<!-- ============================================================
     Um tópico no mapa.

     O ⓘ não pode morar dentro do tópico: button dentro de button é
     HTML inválido. Os dois são irmãos num invólucro, que passa a ser
     o item da lista no lugar do botão.

     O gesto mais usado é o mais barato, e ler o detalhe é mais
     frequente que mudar de estado: **clique abre o detalhe, shift +
     clique cicla**. No toque não há Shift, então lá o toque continua
     ciclando e o [i] continua abrindo — é a única divergência entre
     os dois aparelhos, e a legenda anuncia a que vale em cada um.

     O clique com o botão direito abria o detalhe, como atalho para
     quem não quisesse usar o Shift. Saiu junto com a inversão: agora
     o clique simples já faz isso, e sequestrar o menu do navegador
     para repetir o gesto mais barato da tela não se paga.
     ============================================================ -->
<script>
  import { MARCAS } from "./Progresso.svelte.js";

  let {
    topico,
    estado,
    rotuloEstado,
    dicaLer,
    toque,
    oculto,
    aoCiclar,
    aoAbrir,
  } = $props();

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
    onclick={(ev) => {
      if (toque) return aoCiclar();
      return ev.shiftKey ? aoCiclar() : aoAbrir();
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
