<!-- o mural em miniatura: post-its espalhados e tortos, cada um com
     duas linhas de escrita. A torção é fixa por nota, como na tela —
     papel pregado não fica reto, mas também não dança sozinho. -->
<script>
  const POSTITS = [
    { x: 44, y: 36, g: -5 },
    { x: 168, y: 28, g: 4 },
    { x: 60, y: 132, g: 3 },
    { x: 178, y: 140, g: -4 },
  ];
</script>

<svg viewBox="0 0 300 240" class="carta__mapa" role="img" aria-hidden="true">
  {#each POSTITS as p, i}
    <g
      class="carta__acender"
      transform="rotate({p.g} {p.x + 39} {p.y + 34})"
      style="animation-delay: {i * 130}ms"
    >
      <rect
        x={p.x} y={p.y} width="78" height="68"
        fill="var(--rota)" fill-opacity="0.75"
        stroke="var(--rota)" stroke-width="2"
        shape-rendering="crispEdges"
      />
      <!-- as duas linhas de escrita: é o que diferencia um post-it de
           um retângulo qualquer -->
      <rect
        x={p.x + 12} y={p.y + 22} width="54" height="5"
        fill="var(--papel)" fill-opacity="0.85"
        shape-rendering="crispEdges"
      />
      <rect
        x={p.x + 12} y={p.y + 38} width="36" height="5"
        fill="var(--papel)" fill-opacity="0.85"
        shape-rendering="crispEdges"
      />
    </g>
  {/each}
</svg>
