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

  import { listarTrilhas, CATEGORIAS } from "$lib/trilhas.js";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { contagens } from "$lib/roadmap/sincronia.svelte.js";
  import Obi from "$lib/obi/Obi.svelte";
  import { ControleObi, semMovimento } from "$lib/obi/ControleObi.svelte.js";
  import Carta from "$lib/mesa/Carta.svelte";
  import Caminha from "$lib/mesa/Caminha.svelte";
  import Estojo from "$lib/mesa/Estojo.svelte";
  import { olhar } from "$lib/obi/olhar.js";

  import "$lib/obi/obi.css";
  import "../mesa.css";

  $effect(() => sessao.iniciar());

  /* o nome que a pessoa escolheu no cadastro. Conta antiga, feita
     antes de existir o campo, cai no e-mail — e o title guarda o
     endereço de qualquer forma, para quem tem duas contas. */
  const apelido = $derived(sessao.nome);

  /* o menu da quina. Fechado por padrão, e fechado de novo a cada
     saída — deixar aberto ao voltar faria a mesa abrir com um painel
     que ninguém pediu. */
  let menuAberto = $state(false);
  let quinaEl = $state(null);

  /* clique fora e Escape: as duas saídas que um menu precisa ter.
     `pointerdown` e não `click` porque o clique de fechar não deve
     também acionar o que estava embaixo. */
  function fecharSeFora(e) {
    if (menuAberto && quinaEl && !quinaEl.contains(e.target)) menuAberto = false;
  }

  function teclaDoMenu(e) {
    if (e.key === "Escape" && menuAberto) {
      menuAberto = false;
      quinaEl?.querySelector(".conta")?.focus();
    }
  }

  async function sair() {
    menuAberto = false;
    await sessao.sair();
  }

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

  /* As cartas vêm do banco desde 21/10/2026. Antes era o manifesto
     escrito, e a mesa desenhava no primeiro quadro; agora ela espera
     a resposta — por isso `carregando`, que distingue "ainda não
     chegou" de "não há trilha nenhuma".

     Trilha sem rota continua fora: a carta é a rota desenhada. */
  let fichas = $state({});
  let carregando = $state(true);

  const ordemCategoria = new Map(CATEGORIAS.map((c, i) => [c.chave, i]));

  /* Todas as cartas da mesa, antes do filtro, **na ordem em que a grade
     as desenha** — categoria primeiro, e dentro dela a ordem do banco.

     Essa ordem não é cosmética: `foco` e `escolhido` são índices neste
     array, e o Obi encontra a carta correspondente pela posição dela no
     DOM. Se o array e o DOM discordassem, ele andaria atrás da carta
     errada. A ordenação é estável, então `order("ordem")` continua
     valendo dentro de cada gaveta. */
  const todas = $derived(
    Object.entries(fichas)
      .filter(([, t]) => t.rota?.length)
      .sort(
        ([, a], [, b]) =>
          (ordemCategoria.get(a.categoria) ?? 99) -
          (ordemCategoria.get(b.categoria) ?? 99)
      )
  );

  /* o giro por id, e não pela posição na grade: filtrar reordena a
     grade, e indexar por posição faria a carta que sobrou herdar o giro
     de outra — as cartas girariam sozinhas durante a digitação. */
  const giros = $derived(new Map(todas.map(([id], i) => [id, GIROS[i] ?? 0])));

  let busca = $state("");

  /* sem acento e sem caixa: quem digita "analise" não deve perder
     "Análise". Comparar pelo rótulo é seguro — ele se edita à vontade,
     diferente do id, que é chave do progresso salvo. */
  const crua = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const trilhas = $derived(
    busca.trim() === ""
      ? todas
      : todas.filter(([, t]) => crua(t.rotulo).includes(crua(busca.trim())))
  );

  /* As gavetas com o que sobrou do filtro. Cada item carrega o índice
     que tem no array achatado, porque é por ele que a carta fala com o
     resto da mesa (progresso, foco, escolha).

     Gaveta vazia não vira título: etiqueta sem carta embaixo anuncia uma
     ausência que o filtro já explicou. */
  const secoes = $derived(
    CATEGORIAS.map((c) => ({
      ...c,
      itens: trilhas
        .map((par, i) => ({ par, i }))
        .filter(({ par }) => par[1].categoria === c.chave),
    })).filter((s) => s.itens.length > 0)
  );

  $effect(() => {
    listarTrilhas().then((lista) => {
      fichas = lista;
      carregando = false;
    });
  });

  const estreito = new MediaQuery("max-width: 900px");

  /* o progresso só existe no navegador: na pré-renderização toda
     carta nasce zerada e o número certo chega na hidratação */
  /* a contagem do banco: { trilha: feitos }. Null enquanto não
     chegou. Guardá-la crua, e derivar o array da ordem das cartas, é
     o que mantém os dois em dia — a lista de trilhas e a contagem
     chegam em momentos diferentes, e quem as junta é o $derived. */
  let contagem = $state(null);

  const feitos = $derived(
    trilhas.map(([id, t]) => Math.min(contagem?.[id] ?? 0, t.topicos))
  );

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

  /* a contagem vem do banco, que é o único dono do progresso. Sem
     conta as cartas mostram zero — e é verdade: sem conta não há
     progresso salvo em lugar nenhum. */
  $effect(() => {
    if (!sessao.conectado) {
      contagem = {};
      return;
    }
    let vivo = true;
    contagens().then((mapa) => {
      if (vivo) contagem = mapa ?? {};
    });
    return () => (vivo = false);
  });

  $effect(() => {
    if (!obiEl) return;
    const o = olhar(obiEl, { ativo: () => !estreito.current });
    return () => o.destroy();
  });

  /* As cartas da grade, e não os filhos dela: desde que as etiquetas de
     gaveta passaram a ocupar uma fileira da própria grade, `children`
     devolve etiqueta junto com carta — e o Obi andaria atrás do item
     errado, porque a posição no array deixaria de bater com a posição no
     DOM. Vale também para o aviso de "nenhuma trilha", que é filho daqui
     pelo mesmo motivo. */
  function cartas() {
    return cartasEl ? [...cartasEl.querySelectorAll(".carta")] : [];
  }

  /* as posições são medidas no DOM, não calculadas: a largura das
     cartas é clamp() e muda com a janela */
  function centros() {
    if (!mesa || !cartasEl) return [];
    const base = mesa.getBoundingClientRect();
    return cartas().map((el) => {
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
    return cartas().map((el) => el.getBoundingClientRect().bottom - base.top);
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

  /* reposiciona quando a escolha muda, a janela reflui ou o filtro muda
     o tamanho da grade — o Obi anda em pixels medidos no DOM, e a
     medida de antes do filtro é de uma grade que já não existe */
  $effect(() => {
    escolhido;
    estreito.current;
    busca;
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
    content="Mapas de estudo para quem aprende por conta própria: em que ordem estudar, o que dá para deixar passar e quando um assunto já pode ser dado por encerrado."
  />
</svelte:head>

<svelte:window onresize={posicionarObi} onpointerdown={fecharSeFora} onkeydown={teclaDoMenu} />

<h1 class="marca">Lets learn together</h1>

<!-- data-sveltekit-reload: a tela de conta carrega a casca escura, e
     duas folhas globais no mesmo documento uma vence a outra.

     Enquanto a sessão é desconhecida o canto fica vazio: a página é
     pré-renderizada, então "Entrar" sairia no HTML e piscaria para
     quem já está conectado. Vazio por um instante é mais honesto que
     o convite errado. -->
{#if !sessao.carregando}
  <div class="quina" bind:this={quinaEl}>
    {#if sessao.conectado}
      <!-- conectado a quina é um menu: além de ir ao perfil, daqui se
           sai da conta — e vão entrar as configurações. Botão, e não
           link, porque o que ele faz é abrir algo nesta mesma página. -->
      <button
        class="conta"
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuAberto}
        title={sessao.usuario.email}
        onclick={() => (menuAberto = !menuAberto)}
      >
        <!-- "Conta", e não o nome: a quina é a porta, e o rótulo dela
             não pode mudar de largura conforme quem entrou. O nome diz
             quem você é e mora dentro do menu, que é onde a pergunta
             "sou eu mesmo?" aparece. -->
        Conta
        <!-- a seta vira para cima quando o menu está aberto: a direção
             diz para onde o gesto leva, não só que há um gesto -->
        <span class="conta__seta" aria-hidden="true">{menuAberto ? "▲" : "▼"}</span>
      </button>

      {#if menuAberto}
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <div class="conta__menu" role="menu">
          <!-- quem está conectado: o cabeçalho do menu, não um item.
               Trunca em vez de esticar a folha. -->
          <p class="conta__quem">
            <span class="conta__nome">{apelido}</span>
          </p>
          <a
            class="conta__item"
            role="menuitem"
            href="{base}/conta"
            data-sveltekit-reload>Perfil</a
          >
          <!-- a seção de configurações nasce na tela de perfil no passo
               seguinte; a âncora já é a daquela seção -->
          <a
            class="conta__item"
            role="menuitem"
            href="{base}/conta#configuracoes"
            data-sveltekit-reload>Configurações</a
          >
          <button class="conta__item" role="menuitem" type="button" onclick={sair}>
            Sair
          </button>
        </div>
      {/if}
    {:else}
      <!-- sem conta não há menu: só a porta de entrada -->
      <a class="conta" href="{base}/conta" data-sveltekit-reload title="Entrar na conta">
        Entrar
      </a>
    {/if}
  </div>
{/if}

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
    <!-- a coluna da grade: a tira de busca parada em cima, as cartas
         rolando embaixo. A tira precisa estar aqui dentro, e não acima
         da mesa, para encostar na mesma borda esquerda da grade — que é
         posição calculada pelo centro do tampo, não um valor que se
         possa escrever de fora. -->
    <div class="grade">
      <!-- Uma tira da mesma quadriculada dos mapas: aqui se anota qual
           folha puxar. Desabilitada depois da escolha, pelo mesmo motivo
           do `podeMexer` do Obi — dali em diante a página está saindo, e
           filtrar trocaria as cartas de lugar no meio da animação da
           rota. -->
      {#if todas.length > 1}
        <form class="busca" role="search" onsubmit={(ev) => ev.preventDefault()}>
          <label class="busca__rotulo" for="busca">buscar</label>
          <input
            class="busca__campo"
            id="busca"
            type="search"
            autocomplete="off"
            bind:value={busca}
            oninput={() => (foco = null)}
            disabled={escolhido !== null}
          />
        </form>
      {/if}

      <div class="cartas" bind:this={cartasEl}>
        <!-- As etiquetas moram dentro da própria grade, numa fileira
             inteira, e não em grades separadas por gaveta: é o que mantém
             as colunas alinhadas de um grupo para o outro. A carta de
             baixo encosta na mesma vertical da carta de cima. -->
        {#each secoes as secao (secao.chave)}
          <h2 class="secao">
            <span class="secao__nome">{secao.rotulo}</span>
            <span class="secao__conta">{secao.itens.length}</span>
          </h2>

          {#each secao.itens as { par: [id, dados], i } (id)}
            <Carta
              trilha={id}
              {dados}
              feitos={feitos[i]}
              deitado={estreito.current}
              giro={giros.get(id) ?? 0}
              focada={escolhido === null && foco === i}
              aberta={escolhido === i}
              apagada={escolhido !== null && escolhido !== i}
              aoEscolher={() => escolher(i)}
              aoFocar={() => focar(i)}
            />
          {/each}
        {/each}

        <!-- a ausência precisa ser dita: grade vazia depois de digitar é
             indistinguível de grade que ainda não carregou. E tela vazia
             é convite, não lamento: diz o que houve e oferece a saída. -->
        {#if !carregando && todas.length > 0 && trilhas.length === 0}
          <div class="cartas__vazio">
            <p class="cartas__vazio-texto">Nenhuma trilha com esse nome.</p>
            <button class="botao" type="button" onclick={() => (busca = "")}>
              Ver todas as trilhas
            </button>
          </div>
        {/if}
      </div>
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
