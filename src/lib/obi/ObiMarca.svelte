<!-- ============================================================
     O Obi como assinatura — o desenho parado, para cabeçalho.

     Não é o Obi.svelte: aquele é o mascote vivo, com propulsores,
     piscar e arrasto, e depende do obi.css, que é folha global. Aqui
     ele é logotipo: não reage, não se arrasta, e leva o próprio
     estilo porque vai cair em telas que dão valores diferentes aos
     mesmos nomes de cor.

     O preço é o desenho existir em dois lugares. Quando uma terceira
     tela precisar da assinatura, vale extrair o <svg> para um
     componente só, usado também pelo Obi.svelte.
     ============================================================ -->
<script>
  /* o rótulo é opcional de propósito: quando o Obi mora dentro de um
     link que já se nomeia, dar nome ao desenho faz o leitor de tela
     anunciar a marca duas vezes */
  let { altura = "40px", rotulo = null } = $props();
</script>

<span class="obi-marca" style:--obi-marca-altura={altura}>
  <svg
    viewBox="103 23 406 310"
    role={rotulo ? "img" : undefined}
    aria-hidden={rotulo ? undefined : "true"}
    aria-label={rotulo || undefined}
  >
    <g fill="var(--obi-marca-tinta)">
      <rect x="113" y="152" width="69" height="88" rx="34" />
      <rect x="430" y="152" width="69" height="88" rx="34" />
      <ellipse cx="306" cy="178" rx="165" ry="145" />
    </g>
    <rect x="173" y="136" width="267" height="109" rx="54" fill="var(--obi-marca-realce)" />
    <g fill="var(--obi-marca-tinta)">
      <ellipse cx="247" cy="186" rx="13" ry="16" />
      <ellipse cx="364" cy="186" rx="13" ry="16" />
      <path d="M292 201a14 14 0 0 0 28 0z" />
    </g>
  </svg>
</span>

<style>
  /* tokens próprios: a mesma peça em telas com paletas diferentes
     não pode herdar --roxo de quem a hospeda */
  .obi-marca {
    --obi-marca-tinta: #7c5cf0;
    --obi-marca-realce: #f5c518;
    display: inline-flex;
  }

  .obi-marca svg {
    display: block;
    height: var(--obi-marca-altura);
    width: auto;
  }
</style>
