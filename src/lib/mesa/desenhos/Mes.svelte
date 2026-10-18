<!-- o mês em miniatura, no quadro de 300×240 das outras cartas: seis
     colunas cheias e a sétima vazia, que é o domingo de folga -->
<script>
  /* a cascata corre por semana, de cima para baixo: é a ordem em que
     se lê um mês, não a ordem do DOM */
  const DIAS = Array.from({ length: 5 }, (_, lin) =>
    Array.from({ length: 7 }, (_, col) => ({
      x: 44 + col * 32,
      y: 54 + lin * 28,
      marcado: col < 6 && (lin + col) % 3 !== 2,
      atraso: lin * 90 + col * 22,
    }))
  ).flat();
</script>

<svg viewBox="0 0 300 240" class="carta__mapa" role="img" aria-hidden="true">
  {#each DIAS as dia}
    <!-- só o dia marcado ganha a classe: a cascata do clique acende o
         que está escrito, e o vazio continua vazio -->
    <rect
      class={dia.marcado ? "carta__acender" : ""}
      x={dia.x}
      y={dia.y}
      width="22"
      height="18"
      fill={dia.marcado ? "var(--rota)" : "none"}
      fill-opacity={dia.marcado ? "0.75" : "0"}
      stroke="var(--rota)"
      stroke-opacity={dia.marcado ? "1" : "0.35"}
      stroke-width="2"
      shape-rendering="crispEdges"
      style={dia.marcado ? "animation-delay: " + dia.atraso + "ms" : ""}
    />
  {/each}

  <!-- a faixa de cabeçalho do mês, para a miniatura não virar um
       xadrez solto no meio do papel -->
  <rect
    x="44" y="30" width="214" height="10"
    fill="var(--rota)" fill-opacity="0.35"
    shape-rendering="crispEdges"
  />
</svg>
