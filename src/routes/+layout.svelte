<script>
  import "../app.css";
  import { base } from "$app/paths";
  import { page } from "$app/state";
  // import FitaApoio from "$lib/apoio/FitaApoio.svelte";
  import Rodape from "$lib/global/Rodape.svelte";

  let { children } = $props();
  const naLanding = $derived(page.url.pathname === `${base}/`);

  /* O esqueleto do app.html sai quando existe app para substituí-lo.
     Aqui, e não na página do roadmap, porque se o load falhar quem
     monta é o +error — e esqueleto por cima do erro é a tela branca
     de novo, só que mentindo sobre o que está acontecendo. */
  $effect(() => {
    document.getElementById("espera")?.remove();
    document.documentElement.removeAttribute("data-espera");
  });
</script>

<!-- A fita de apoio fica preservada para voltar quando houver apoiadores.
     Enquanto ela não acrescenta informação, não compete com o conteúdo. -->
<!--
{#if !naLanding}
  <FitaApoio />
{/if}
-->

{@render children()}

{#if !naLanding}
  <Rodape />
{/if}
