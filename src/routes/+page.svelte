<!-- ============================================================
     A mesa de cartas — onde se escolhe a trilha.

     Monta as cartas a partir do manifesto e lê o progresso do
     localStorage, a mesma chave que o roadmap grava.

     O que mudou de forma, e não só de sintaxe, em relação ao
     inicio.js: a repintura. Antes uma função `pintar()` percorria
     todas as cartas escrevendo transform, opacity e box-shadow em
     cada uma, e era chamada à mão em sete lugares. Agora cada carta
     deriva a própria aparência de `foco` e `escolhido`, e quem muda
     esses dois não precisa saber que existem cartas.

     O que continua imperativo, de propósito: a posição do Obi (ele
     anda em pixels medidos no DOM, porque a largura das cartas é
     clamp() e muda com a janela) e as animações reiniciadas por
     reflow.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { MediaQuery } from "svelte/reactivity";

  import { TRILHAS } from "$lib/trilhas.js";
  import { feitosDe } from "$lib/progresso.js";
  import Obi from "$lib/obi/Obi.svelte";
  import { ControleObi, semMovimento } from "$lib/obi/ControleObi.svelte.js";
  import Carta from "$lib/mesa/Carta.svelte";
  import Caminha from "$lib/mesa/Caminha.svelte";
  import Estojo from "$lib/mesa/Estojo.svelte";
  import { olhar } from "$lib/obi/olhar.js";

  import "$lib/obi/obi.css";
  import "./mesa.css";

  /* inclinação leve e fixa por carta: mapas largados numa mesa não
     ficam alinhados. Fixa, e não aleatória, para não dançar a cada
     repintura. */
  const GIROS = [-1.4, 0.9, -0.7, 1.1];

  /* metade da largura do Obi, para a conta de posição ficar no centro
     dele e não na borda esquerda */
  const MEIO_OBI = 61;
  /* a altura dele e o quanto a sombra passa dos pés — ver .ator e
     .ator__sombra no mesa.css */
  const ALTURA_OBI = 94;
  const FOLGA_SOMBRA = 10;

  /* trilha sem rota ainda não vai à mesa */
  const trilhas = Object.entries(TRILHAS).filter(([, t]) => t.rota);

  const estreito = new MediaQuery("max-width: 900px");

  /* o progresso só existe no navegador: na pré-renderização toda
     carta nasce zerada e o número certo chega na hidratação */
  let feitos = $state(trilhas.map(() => 0));

  let foco = $state(null);      /* índice sob o ponteiro */
  let escolhido = $state(null); /* índice clicado */

  let mesa = $state(null);
  let obiEl = $state(null);
  let cartasEl = $state(null);
  let esquerda = $state(0);
  /* null = o CSS manda (a posição de descanso, na caminha) */
  let topo = $state(null);

  /* insistir rende outra reação: a primeira graça é a surpresa, a
     quinta seguida só seria repetição */
  let cutucadas = 0;
  let vezCutucadas = null;

  const controle = new ControleObi({
    chao: true,

    podeMexer: () => !estreito.current && escolhido === null,

    /* o limite é a própria mesa: aqui ele tem onde morar, e sair dela
       o deixaria pairando sobre o rodapé */
    limite: () => ({ x: mesa.getBoundingClientRect().width / 2, y: 9999 }),

    aoCutucar: () => {
      cutucadas += 1;
      clearTimeout(vezCutucadas);
      vezCutucadas = setTimeout(() => { cutucadas = 0; }, 1800);

      /* sem a ficha, o aviso da quinta cutucada não tem onde ser
         escrito: a tontura é a resposta inteira, como já é no
         roadmap */
      if (cutucadas >= 5) {
        cutucadas = 0;
        controle.reagir("tonto", 1500);
      } else {
        controle.reagir("susto", 480);
      }
    },

    aoChegar: () => posicionarObi(),
  });

  $effect(() => {
    feitos = trilhas.map(([id, t]) => Math.min(feitosDe(id), t.topicos));
  });

  $effect(() => {
    if (!obiEl) return;
    const o = olhar(obiEl, { ativo: () => !estreito.current });
    return () => o.destroy();
  });

  /* as posições são medidas no DOM, não calculadas: a largura das
     cartas é clamp() e muda com a janela */
  function centros() {
    if (!mesa || !cartasEl) return [];
    const base = mesa.getBoundingClientRect();
    return [...cartasEl.children].map((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - base.left;
    });
  }

  /* o pé de cada carta, para ele parar DEBAIXO dela e não por cima:
     a carta escolhida sobe de escala e vira a coisa a ser lida, e um
     mascote plantado em cima dela esconde justamente a rota que acabou
     de se desenhar */
  function pes() {
    if (!mesa || !cartasEl) return [];
    const base = mesa.getBoundingClientRect();
    return [...cartasEl.children].map(
      (el) => el.getBoundingClientRect().bottom - base.top
    );
  }

  /* a posição de descanso: o canto direito da mesa, debaixo do
     estojo. No meio ele dividia a atenção com a grade — e, com a
     grade rolando, ficava plantado no caminho da leitura.
     Os 80 são a folga que a caminha precisa à direita para ficar
     centrada nele sem sair da mesa. */
  function descanso() {
    return mesa.getBoundingClientRect().width - MEIO_OBI - 80;
  }

  /* no colo ou pousando, a posição do Obi é do arrasto, não da
     escolha: mexer aqui o arrancaria da mão de quem o segura */
  function posicionarObi() {
    if (!mesa || controle.ocupado) return;

    /* sem escolha ele volta para a caminha, e o eixo vertical volta a
       ser do CSS (top: 46%) — por isso null, e não um número */
    if (escolhido === null) {
      esquerda = Math.round(descanso() - MEIO_OBI);
      topo = null;
      return;
    }

    /* o Obi anda atrás da carta escolhida, não da que está sob o
       ponteiro. Com a grade em duas linhas, seguir o ponteiro só no
       eixo X o deixaria apontando para a coluna certa e a linha
       errada — e um mascote que corre a cada passada de mouse disputa
       a atenção com a leitura das cartas. */
    const x = centros()[escolhido];
    const pe = pes()[escolhido];
    if (x === undefined) return;

    esquerda = Math.round(x - MEIO_OBI);

    /* embaixo da carta, com a folga da sombra. O teto da conta é o
       fundo da mesa: numa janela baixa ele pararia pendurado sobre o
       rodapé em vez de pisar no tampo. */
    const limite = mesa.getBoundingClientRect().height - ALTURA_OBI - FOLGA_SOMBRA;
    topo = Math.round(Math.min(pe + FOLGA_SOMBRA, limite));
  }

  /* reposiciona quando a escolha muda ou a janela reflui */
  $effect(() => {
    escolhido;
    estreito.current;
    posicionarObi();
  });

  /* o ponteiro ainda levanta a carta e vira o rosto do Obi — só não o
     faz andar */
  function focar(i) {
    if (escolhido !== null || foco === i) return;
    foco = i;
  }

  /* a rota se desenha e a página entra sozinha quando ela termina:
     ver a animação não pode custar um clique a mais */
  function escolher(i) {
    escolhido = i;
    foco = i;

    obiEl.setAttribute("data-andando", "sim");
    obiEl.removeAttribute("data-pulando");
    void obiEl.offsetWidth;        /* reinicia a animação do pulo */
    obiEl.setAttribute("data-pulando", "sim");

    /* a caminhada dura o tempo da transição do `left` (0.44s); depois
       ele chega e fica parado olhando a carta até a página trocar */
    setTimeout(() => obiEl.removeAttribute("data-andando"), 460);
    /* documento novo, e não goto: a folha de estilo do roadmap é global
       e colidiria com a da mesa se as duas vivessem na mesma página */
    setTimeout(
      () => (location.href = `${base}/roadmap?trilha=${trilhas[i][0]}`),
      semMovimento() ? 120 : 1250
    );
  }

  function seguirPonteiro(ev) {
    if (escolhido !== null || controle.pegado) return;
    const base = mesa.getBoundingClientRect();
    const x = ev.clientX - base.left;

    let melhor = null;
    let menor = Infinity;
    centros().forEach((c, i) => {
      const d = Math.abs(c - x);
      if (d < menor) { menor = d; melhor = i; }
    });
    /* longe de qualquer carta, nenhuma está em foco: sem este limite o
       Obi olharia sempre para alguma, mesmo com o ponteiro no rodapé */
    foco = menor > 190 ? null : melhor;
  }

  /* undefined e não null: null tiraria o Obi da árvore de
     acessibilidade, e aqui ele é anunciado sempre — sem foco, pelo
     rótulo padrão da variante */
  const olhando = $derived(
    foco === null
      ? undefined
      : "Obi olhando a carta de " + trilhas[foco][1].rotulo
  );
</script>

<svelte:head>
  <title>Lets learn together — escolha um território</title>
  <meta
    name="description"
    content="Roadmaps de estudo em português, com prioridade, critério de conclusão e progresso salvo no navegador."
  />
</svelte:head>

<svelte:window onresize={posicionarObi} />

<h1 class="marca">Lets learn together</h1>

<!-- data-sveltekit-reload: a tela de conta carrega a casca escura, e
     duas folhas globais no mesmo documento uma vence a outra -->
<a class="conta" href="{base}/conta" data-sveltekit-reload>Entrar</a>

<!-- a mesa: as cartas em cima, o Obi de pé na frente delas -->
<main
  class="mesa"
  bind:this={mesa}
  onmousemove={seguirPonteiro}
  onmouseleave={() => { if (escolhido === null) foco = null; }}
>
  <!-- o tampo: a grade de trilhas à esquerda, o estojo à direita. Lado
       a lado, e não em fila: a grade cresce para baixo, então a coluna
       da direita fica onde está por mais trilhas que haja. -->
  <div class="tampo">
    <div class="cartas" bind:this={cartasEl}>
      {#each trilhas as [id, dados], i}
        <Carta
          trilha={id}
          {dados}
          feitos={feitos[i]}
          deitado={estreito.current}
          giro={GIROS[i] ?? 0}
          focada={escolhido === null && foco === i}
          aberta={escolhido === i}
          apagada={escolhido !== null && escolhido !== i}
          aoEscolher={() => escolher(i)}
          aoFocar={() => focar(i)}
        />
      {/each}
    </div>

    <Estojo />
  </div>

  <Caminha parte="fundo" />

  <Obi
    variante="ator"
    {controle}
    {esquerda}
    {topo}
    saindo={escolhido !== null}
    bind:elemento={obiEl}
    rotulo={olhando}
  />

  <Caminha parte="frente" />
</main>

<!-- mesmo conteúdo do rodapé do roadmap, na linguagem da mesa: o
     cartucho de uma folha de levantamento, que é onde vão o autor e as
     observações da carta -->
<footer class="rodape">
  <div class="rodape__linha">
    <p class="rodape__credito">
      <span class="rodape__label">Feito por</span>
      <a
        class="rodape__chip"
        href="https://github.com/masteryogo"
        target="_blank"
        rel="noopener noreferrer">@masteryogo</a
      >
    </p>
    <!-- o quadro é leitura, não ação: fica no botão simples, e o
         destaque continua só no Contribuir -->
    <a
      class="botao botao--destaque"
      href="{base}/kanban"
      data-sveltekit-reload
      target="_blank"
      rel="noopener noreferrer">Contribuir</a
    >
  </div>
</footer>
