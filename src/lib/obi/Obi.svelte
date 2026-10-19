<!-- ============================================================
     O Obi — o desenho.

     Um componente para as duas telas, e não dois desenhos iguais em
     arquivos diferentes como era antes. O que varia entre elas não é
     um punhado de props soltas, é um conjunto coerente — invólucro,
     paleta, tamanho e nomes de classe andam juntos — então varia por
     variante, com a tabela logo abaixo.

       ator   a mesa: ele está de pé no tampo, tem chão e por isso
              sombra, e é anunciado ao leitor de tela
       ninho  o roadmap: flutua, não leva a lugar nenhum, e fica fora
              da árvore de acessibilidade — o que ele faz, reagir a
              quem mexe nele, não tem como ser alcançado sem ponteiro

     A paleta do ninho é --logo-* e não --roxo/--amarelo: no tema
     escuro o Obi é mais saturado que a interface à volta dele.

     Armadilha que já custou caro: .obi__olho tem animation: piscar, e
     no CSS animação ganha de transform declarado. Todo estado novo que
     queira mandar nos olhos precisa de animation: none junto.
     ============================================================ -->
<script>
  const VARIANTES = {
    ator: {
      sombra: true,
      corpo: "ator__corpo obi__corpo",
      largura: 122,
      altura: 94,
      tinta: "--roxo",
      realce: "--amarelo",
      classeCorpo: null,
      classeCara: "ator__cara",
      olho: "ator__olho obi__olho",
      rotulo: "Obi, esperando",
    },
    ninho: {
      sombra: false,
      corpo: "obi__corpo",
      largura: 112,
      altura: 86,
      tinta: "--logo-roxo",
      realce: "--logo-amarelo",
      classeCorpo: "logo__corpo",
      classeCara: null,
      olho: "logo__olho obi__olho",
      rotulo: null,
    },
  };

  let {
    variante = "ator",
    controle,
    rotulo = undefined,
    /* a mesa precisa do nó: é ela que o posiciona (style.left) e que
       liga o olhar nos olhos lá dentro. A posição de descanso nunca
       é escrita pelo controle — ver ControleObi. */
    elemento = $bindable(null),
    /* a posição vai no próprio .obi, e não num invólucro: é ele que
       carrega a transição de `left` que faz o Obi caminhar, e o
       arrasto escreve transform por cima — dois donos, um elemento */
    esquerda = null,
    /* quando a página o manda para outro lugar, o eixo vertical também
       é dela: na mesa ele desce para o vazio embaixo da carta escolhida,
       em vez de parar por cima dela */
    topo = null,
    /* ele saiu do lugar de descanso por vontade da página, e não de
       quem o arrasta: enquanto estiver fora, passa por cima do que
       encontrar pelo caminho — mesma razão do data-pendurado */
    saindo = false,
  } = $props();

  const v = $derived(VARIANTES[variante]);
  /* rotulo explícito vence o da variante; null em ambos tira o Obi da
     árvore de acessibilidade */
  const nome = $derived(rotulo === undefined ? v.rotulo : rotulo);
</script>

<div
  class="obi {variante}"
  draggable="false"
  aria-hidden={nome ? undefined : "true"}
  data-saindo={saindo ? "sim" : null}
  style:left={esquerda === null ? null : esquerda + "px"}
  style:top={topo === null ? null : topo + "px"}
  bind:this={elemento}
  use:controle.arrastavel
>
  {#if v.sombra}
    <span class="{variante}__sombra obi__sombra"></span>
  {/if}

  <span class={v.corpo}>
    <!-- os propulsores do Obi: invisíveis até ele precisar voltar
         depois de ser carregado no colo. Vêm antes do corpo no DOM
         e ficam atrás dele por z-index, para a chama sair debaixo. -->
    <span class="obi__fogo" aria-hidden="true">
      <svg viewBox="0 0 72 60" width="72" height="60">
        <g class="obi__chama">
          <path d="M4 0h28L18 58z" fill="var(--obi-chama)" />
          <path d="M11 0h14l-7 36z" fill="var(--obi-chama-nucleo)" />
        </g>
        <g class="obi__chama obi__chama--dir">
          <path d="M40 0h28L54 58z" fill="var(--obi-chama)" />
          <path d="M47 0h14l-7 36z" fill="var(--obi-chama-nucleo)" />
        </g>
      </svg>
    </span>

    <svg
      viewBox="103 23 406 310"
      width={v.largura}
      height={v.altura}
      role={nome ? "img" : undefined}
      aria-label={nome || undefined}
    >
      <g class={v.classeCorpo} fill="var({v.tinta})">
        <rect x="113" y="152" width="69" height="88" rx="34" />
        <rect x="430" y="152" width="69" height="88" rx="34" />
        <ellipse cx="306" cy="178" rx="165" ry="145" />
      </g>
      <rect
        x="173" y="136" width="267" height="109" rx="54"
        fill="var({v.realce})"
      />
      <g class={v.classeCara} fill="var({v.tinta})">
        <ellipse class={v.olho} cx="247" cy="186" rx="13" ry="16" />
        <ellipse class={v.olho} cx="364" cy="186" rx="13" ry="16" />
        <path d="M292 201a14 14 0 0 0 28 0z" />
      </g>

      <!-- as pálpebras de olho fechado: arcos, e não os olhos achatados
           por scaleY — elipse espremida vira um traço reto, que lê como
           olho riscado. Arco é outra forma, então é outro desenho; eles
           ficam invisíveis até ele fechar os olhos. -->
      <g
        class="obi__palpebras"
        fill="none"
        stroke="var({v.tinta})"
        stroke-width="8"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M233 190q14-15 28 0" />
        <path d="M350 190q14-15 28 0" />
      </g>
    </svg>
  </span>
</div>
