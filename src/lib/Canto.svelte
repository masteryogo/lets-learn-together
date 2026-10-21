<!-- ============================================================
     A quina: voltar para a mesa e trocar o tema.

     Mesma do roadmap, menos a lixeira — no calendário e no mural não
     há progresso para zerar. Era o mesmo markup copiado em duas
     páginas; aqui é um componente, e os dois ícones existem uma vez
     só no projeto.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { alternarTema } from "$lib/tema.js";
  import Atalho from "$lib/conta/Atalho.svelte";

  /* dentro da espiada do roadmap esta tela vive num iframe, e a quina
     ali não serve: a conta e o tema já estão na tela de trás, e a
     casa levaria para a mesa dentro do quadrinho. Quem fecha e quem
     amplia é a barra da espiada.

     window.top só é diferente de window.self em iframe — e, como é a
     mesma origem, a comparação não lança. */
  let embutido = $state(false);
  $effect(() => {
    embutido = window.self !== window.top;
  });
</script>

{#if !embutido}
<div class="canto">
  <Atalho />

  <!-- data-sveltekit-reload: a mesa tem folha de estilo própria e
       global, que não pode dividir documento com esta -->
  <a
    class="botao botao--icone"
    href="{base}/"
    data-sveltekit-reload
    title="Voltar para a escolha de trilha"
    aria-label="Voltar para a escolha de trilha"
  >
    <!-- casa: telhado em degraus, duas paredes e o vão da porta -->
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="7" y="1" width="2" height="1" />
      <rect x="6" y="2" width="4" height="1" />
      <rect x="5" y="3" width="6" height="1" />
      <rect x="4" y="4" width="8" height="1" />
      <rect x="3" y="5" width="10" height="1" />
      <rect x="2" y="6" width="12" height="1" />
      <rect x="3" y="7" width="3" height="8" />
      <rect x="10" y="7" width="3" height="8" />
      <rect x="6" y="7" width="4" height="2" />
    </svg>
  </a>

  <button
    class="botao botao--icone"
    type="button"
    title="Alternar entre tema claro e escuro"
    aria-label="Alternar entre tema claro e escuro"
    onclick={alternarTema}
  >
    <!-- lua: disco em degraus com a mordida de um segundo disco -->
    <svg class="icone-lua" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="6" y="2" width="4" height="1" />
      <rect x="5" y="3" width="4" height="1" />
      <rect x="4" y="4" width="4" height="1" />
      <rect x="3" y="5" width="4" height="1" />
      <rect x="2" y="6" width="4" height="4" />
      <rect x="3" y="10" width="4" height="1" />
      <rect x="4" y="11" width="4" height="1" />
      <rect x="5" y="12" width="4" height="1" />
      <rect x="6" y="13" width="4" height="1" />
    </svg>
    <!-- sol: núcleo quadrado e oito raios soltos -->
    <svg class="icone-sol" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5" y="5" width="6" height="6" />
      <rect x="7" y="0" width="2" height="2" />
      <rect x="7" y="14" width="2" height="2" />
      <rect x="0" y="7" width="2" height="2" />
      <rect x="14" y="7" width="2" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </svg>
  </button>
</div>
{/if}
