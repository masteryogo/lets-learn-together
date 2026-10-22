<script>
  import "../app.css";
  import FitaApoio from "$lib/apoio/FitaApoio.svelte";
  import Rodape from "$lib/global/Rodape.svelte";

  let { children } = $props();

  /* O esqueleto do app.html sai quando existe app para substituí-lo.
     Aqui, e não na página do roadmap, porque se o load falhar quem
     monta é o +error — e esqueleto por cima do erro é a tela branca
     de novo, só que mentindo sobre o que está acontecendo. */
  $effect(() => {
    document.getElementById("espera")?.remove();
    document.documentElement.removeAttribute("data-espera");
  });
</script>

<!-- A fita abre e o carimbo fecha toda folha do site. Estavam na mesa,
     e subiram para cá quando passaram a valer em qualquer tela: os
     dois identificam o site, não aquela página.

     Os dois levam estilo próprio e paleta própria — é o que permite
     que vivam aqui. Cada rota importa a sua folha global, e as três
     dão valores diferentes aos mesmos nomes de token; herdar faria a
     mesma peça mudar de cor conforme a tela em que caiu. -->
<FitaApoio />

{@render children()}

<Rodape />
