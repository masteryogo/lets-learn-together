<!-- ============================================================
     O quadro da carta: relevo, rota e marcos.

     Na largura cheia de um celular o quadro quadrado deixaria cada
     carta com quase mil pixels de altura. Lá a rota deita: mesmo
     traçado, comprimido na vertical, sem relevo nem bússola.

     Antes isso exigia redesenhar o SVG no listener de resize, porque
     o viewBox e as coordenadas mudam e CSS não alcança nenhum dos
     dois. Agora `deitado` é derivado da media query e o quadro se
     redesenha sozinho ao cruzar o limite — o listener sumiu junto.
     ============================================================ -->
<script>
  /* o quadro é exibido na altura em que foi desenhado: o espaço
     vertical que sobrava embaixo agora é do rodapé */
  const ALTURA = 240;

  /* dois montes em curvas de nível, iguais em toda carta: é o relevo
     do papel, não informação */
  const RELEVO = [
    "M56 96 q8.8 -15.6 32 -2.1 q-4.8 17.7 -32 2.1 z",
    "M40 96 q17.6 -31.2 64 -4.2 q-9.6 35.4 -64 4.2 z",
    "M24 96 q26.4 -46.8 96 -6.2 q-14.4 53 -96 6.2 z",
    "M202 150 q11 -19.5 40 -2.6 q-6 22.1 -40 2.6 z",
    "M182 150 q22 -39 80 -5.2 q-12 44.2 -80 5.2 z",
    "M162 150 q33 -58.5 120 -7.8 q-18 66.3 -120 7.8 z",
  ];

  let { rota, etapas, fracao, deitado = false } = $props();

  const pontos = $derived(
    deitado
      ? rota.map(([x, y]) => [x, Math.round(22 + (y - 46) * (74 / 168))])
      : rota
  );

  const d = $derived("M" + pontos.map(([x, y]) => x + " " + y).join(" L"));
  const vencidas = $derived(Math.round(fracao * etapas));

  /* onde você parou: só existe no meio do caminho — numa carta zerada
     não há onde fincar, e numa terminada não há o que marcar */
  const pino = $derived(
    fracao > 0 && fracao < 1
      ? pontos[Math.min(Math.max(vencidas - 1, 0), pontos.length - 1)]
      : null
  );
</script>

<svg
  viewBox={deitado ? "0 0 300 118" : "0 0 300 " + ALTURA}
  aria-hidden="true"
>
  {#if !deitado}
    <g fill="none" stroke="var(--relevo)" stroke-width="1">
      {#each RELEVO as curva}
        <path d={curva} />
      {/each}
    </g>
  {/if}

  <!-- o caminho inteiro, tracejado: o que ainda falta andar. É a cor
       da trilha esmaecida, não um cinza — numa carta zerada o tracejado
       é o único desenho visível, e era ele que deixava as três quase
       iguais. -->
  <path
    {d}
    fill="none"
    stroke="var(--rota)"
    stroke-opacity="0.4"
    stroke-width="2.5"
    stroke-dasharray="7 6"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- o trecho já vencido, em tinta cheia. pathLength normaliza o
       traçado em 100, então o offset é a porcentagem direta. -->
  <path
    {d}
    pathLength="100"
    fill="none"
    stroke="var(--rota)"
    stroke-width="3.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-dasharray="100"
    stroke-dashoffset={100 - fracao * 100}
  />

  <!-- a mesma rota em destaque, que se desenha ao escolher -->
  <path
    class="carta__rota-cheia"
    {d}
    pathLength="100"
    fill="none"
    stroke="var(--alfinete)"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-dasharray="100"
    stroke-dashoffset="100"
  />

  {#each pontos as [x, y], i}
    <rect
      x={x - 4}
      y={y - 4}
      width="8"
      height="8"
      stroke="var(--tinta)"
      stroke-width="1.6"
      fill={i < vencidas ? "var(--rota)" : "var(--papel)"}
    />
  {/each}

  {#if pino}
    <g transform="translate({pino[0]},{pino[1]})">
      <path d="M0 -26 L6 -14 L-6 -14 Z" fill="var(--alfinete)" />
      <circle cx="0" cy="-26" r="5" fill="var(--alfinete)" />
    </g>
  {/if}

  {#if !deitado}
    <g transform="translate(30,46)" fill="var(--tinta-fraca)">
      <path d="M0 -15 L4 0 L0 15 L-4 0 Z" fill="var(--tinta)" />
      <path d="M-15 0 L0 -4 L15 0 L0 4 Z" />
      <text x="0" y="-19" font-size="9" text-anchor="middle" fill="var(--tinta)">
        N
      </text>
    </g>
  {/if}
</svg>
