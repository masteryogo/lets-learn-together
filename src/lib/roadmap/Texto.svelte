<!-- ============================================================
     Texto com `trecho` virando <code>, e linha em branco virando
     parágrafo.

     Era escreverComCodigo() + escreverParagrafos(): split e
     createTextNode à mão, de propósito, porque o conteúdo tem < e &
     que o innerHTML interpretaria como marcação. Em Svelte a
     interpolação já escapa, então o cuidado some e sobra a regra.

       paragrafos  true quebra em <p> a cada linha em branco; false
                   escreve tudo direto no elemento de fora
     ============================================================ -->
<script>
  let { texto = "", paragrafos = false } = $props();

  /* índice par = texto comum, ímpar = o que estava entre crases */
  const partir = (t) =>
    t.split("`").map((parte, i) => ({ parte, codigo: i % 2 === 1 }));

  const blocos = $derived(
    !texto
      ? []
      : paragrafos
        ? texto.split(/\n{2,}/).map((b) => partir(b.trim()))
        : [partir(texto)]
  );
</script>

{#each blocos as bloco}
  {#if paragrafos}
    <p>
      {#each bloco as { parte, codigo }}{#if parte === ""}{:else if codigo}<code
          >{parte}</code
        >{:else}{parte}{/if}{/each}
    </p>
  {:else}
    {#each bloco as { parte, codigo }}{#if parte === ""}{:else if codigo}<code
        >{parte}</code
      >{:else}{parte}{/if}{/each}
  {/if}
{/each}
