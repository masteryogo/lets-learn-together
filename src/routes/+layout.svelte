<script>
  import "../app.css";

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

{@render children()}
