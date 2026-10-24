<!-- ============================================================
     O roadmap.

     O que mudou de forma em relação ao app.js: não há mais repintura.
     Funções como pintarTopico, pintarLinhaIndice, aplicarEstado,
     marcarBotoesEstado e atualizarProgresso existiam só para
     reescrever no DOM um estado que já estava em memória — e cada uma
     precisava ser lembrada no lugar certo. Agora o estado é a fonte e
     a tela é derivada dele.

     O que continua imperativo: rolar até um tópico (precisa esperar a
     sanfona crescer) e o arrasto do painel, que vive no Drawer.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { MediaQuery } from "svelte/reactivity";
  import { goto } from "$app/navigation";

  import { listarTrilhas } from "$lib/trilhas.js";
  import { alternarTema } from "$lib/tema.js";
  import Atalho from "$lib/conta/Atalho.svelte";
  import Obi from "$lib/obi/Obi.svelte";
  import { ControleObi } from "$lib/obi/ControleObi.svelte.js";
  import { Progresso } from "$lib/roadmap/Progresso.svelte.js";
  import Etapa from "$lib/roadmap/Etapa.svelte";
  import Indice from "$lib/roadmap/Indice.svelte";
  import Drawer from "$lib/roadmap/Drawer.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import Convite from "$lib/conta/Convite.svelte";
  import Espiada from "$lib/roadmap/Espiada.svelte";
  import AvisoFalha from "$lib/conta/AvisoFalha.svelte";
  import { sincronia } from "$lib/roadmap/sincronia.svelte.js";
  import { carregarRecomendacoes, recomendacoes } from "$lib/roadmap/recomendacoes.svelte.js";
  import Recomendacoes from "$lib/roadmap/Recomendacoes.svelte";
  import { listar as listarNotas } from "$lib/notas/remoto.svelte.js";

  import "$lib/obi/obi.css";
  import "$lib/estilos/base.css";

  let { data } = $props();

  const etapas = $derived(data.ROADMAP.etapas);

  /* índice id -> { topico, etapa, grupo }, para o painel e a busca */
  const indice = $derived.by(() => {
    const mapa = {};
    for (const etapa of etapas) {
      for (const grupo of etapa.grupos) {
        for (const topico of grupo.topicos) {
          mapa[topico.id] = { topico, etapa, grupo: grupo.origem || grupo };
        }
      }
    }
    return mapa;
  });

  /* as outras trilhas, para o seletor do cabeçalho. Vazio até o banco
     responder: um seletor com uma opção só, por um instante, é melhor
     que um seletor com opções que não existem mais. */
  let trilhas = $state({});
  $effect(() => {
    listarTrilhas().then((lista) => (trilhas = lista));
  });

  const progresso = $derived(new Progresso(data.trilha));
  $effect(() => progresso.carregar());

  /* Só recomenda reforço para assunto marcado como feito cuja última
     prática avaliável falhou. A escolha de continuar segue sempre da pessoa. */
  let assinaturaDasRecomendacoes = $state(null);
  $effect(() => {
    const estados = progresso.estados;
    const assinatura = `${data.trilha}|${Object.entries(estados).sort(([a], [b]) => a.localeCompare(b)).map(([id, estado]) => `${id}:${estado}`).join("|")}`;
    if (!sessao.conectado || assinatura === assinaturaDasRecomendacoes) return;
    assinaturaDasRecomendacoes = assinatura;
    carregarRecomendacoes(data.trilha, estados);
  });

  /* a conta pode chegar depois do mapa — o getSession é assíncrono, e
     quem entra em outra aba chega sem recarregar esta. Por isso o
     efeito observa `conectado` em vez de rodar uma vez só. */
  let migrar = $state(false);
  let migrando = $state(false);

  $effect(() => {
    sessao.conectado;
    let vivo = true;
    progresso.sincronizar().then((r) => {
      if (vivo) migrar = r === "importar";
    });
    return () => (vivo = false);
  });

  /* a recusa abre o convite. O número só cresce, então cada gesto
     novo dispara o efeito uma vez — e o aviso continua existindo
     porque o leitor de tela não vê diálogo que abre sozinho. */
  let convite = $state(false);

  /* "notas" | "calendario" | null — qual tela está sendo espiada */
  let espiando = $state(null);

  const ESPIADAS = {
    notas: { rota: "/notas?trilha=" },
    calendario: { rota: "/calendario?trilha=" },
  };

  $effect(() => {
    if (progresso.recusas > 0) {
      convite = true;
      aviso = "Entre na conta para marcar o que já estudou.";
    }
  });

  /* as notas presas a um tópico aparecem no drawer dele. A nota é uma
     entidade com dois pontos de entrada — mural e tópico —, e este é
     o segundo. Carrega-se uma vez por visita: o mural é que edita. */
  let notas = $state([]);

  $effect(() => {
    if (!sessao.conectado) {
      notas = [];
      return;
    }
    let vivo = true;
    listarNotas().then((linhas) => {
      if (vivo && linhas) notas = linhas.filter((n) => n.trilha === data.trilha);
    });
    return () => (vivo = false);
  });

  async function levarParaAConta() {
    migrando = true;
    await progresso.importarHeranca();
    migrando = false;
    migrar = false;
    aviso = "Progresso deste navegador enviado para a conta.";
  }

  function deixarNoNavegador() {
    progresso.descartarHeranca();
    migrar = false;
    aviso = "A conta começa do zero. O que estava no navegador foi descartado.";
  }

  /* o gesto de ler o detalhe tem que ser o gesto que o aparelho tem.
     `pointer: coarse` descreve o ponteiro primário, que é o dedo em
     celular e tablet. */
  const toque = new MediaQuery("pointer: coarse");
  const estreito = new MediaQuery("max-width: 900px");
  const dicaLer = $derived(
    toque.current ? "toque no [i] para ler" : "clique para ler"
  );

  let termo = $state("");
  let aberto = $state(null); /* { tipo: "topico" | "etapa", id } */
  let atualNoIndice = $state(null);
  let abertasNoIndice = $state(new Set());
  let lateralFechada = $state(false);
  let gaveta = $state(false);
  let confirmandoReset = $state(false);
  let aviso = $state("");

  /* --------------------------------- busca --------------------------- */

  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  const alvo = $derived(normalizar(termo.trim()));
  const filtrando = $derived(alvo.length > 0);

  /* quem o mapa não mostra, por duas razões que se somam: não casou com
     a busca, ou está pulado com o chip fechado. Um conjunto só porque o
     efeito é o mesmo — sair do fluxo — e porque é assim que o grupo e a
     etapa sabem quando colapsar. */
  const pulados = $derived(
    Object.keys(indice).filter((id) => progresso.estadoDe(id) === "pulado")
  );

  const ocultos = $derived.by(() => {
    const fora = new Set();
    if (!progresso.revelarPulados) for (const id of pulados) fora.add(id);
    if (!filtrando) return fora;
    for (const id of Object.keys(indice)) {
      const t = indice[id].topico;
      const corpus = normalizar(t.titulo + " " + t.desc + " " + (t.detalhe || ""));
      if (!corpus.includes(alvo)) fora.add(id);
    }
    return fora;
  });

  /* conta o que a busca achou E o mapa mostra: dizer "6 encontrados" com
     dois deles escondidos por estarem pulados seria mentir sobre a tela */
  const achados = $derived(Object.keys(indice).length - ocultos.size);

  /* buscar desdobra o que casou: esconder o resultado atrás de uma seta
     seria pedir a mesma busca duas vezes. Sem busca, cada etapa volta ao
     que a pessoa deixou — e não ao fechado, senão a busca viraria um
     jeito de fechar o mapa todo. */
  function etapaAberta(etapa) {
    if (!filtrando) return progresso.etapaAberta(etapa.id);
    return etapa.grupos.some((g) => g.topicos.some((t) => !ocultos.has(t.id)));
  }

  function alternarNoIndice(id) {
    const copia = new Set(abertasNoIndice);
    if (copia.has(id)) copia.delete(id);
    else copia.add(id);
    abertasNoIndice = copia;
  }

  /* A sanfona do índice é estado, não derivação — e é por isso que ela
     passa por aqui em vez de sair de um $derived.

     Ela nasce fechada (a lateral é para achar, não para ler), abre no
     clique, e toda busca a SOBRESCREVE: com termo, abre o que casou;
     sem termo, devolve o que o mapa está mostrando. É o comportamento
     de antes, onde buscar("") chamava abrirNoIndice para cada etapa —
     o efeito colateral de limpar a busca é o índice inteiro abrir.

     Ler `ocultos` logo depois de escrever `termo` dá o valor novo:
     $derived é preguiçoso, avaliado na leitura. */
  function definirTermo(valor) {
    termo = valor;
    abertasNoIndice = new Set(
      etapas
        .filter((etapa) =>
          filtrando
            ? etapa.grupos.some((g) => g.topicos.some((t) => !ocultos.has(t.id)))
            : progresso.etapaAberta(etapa.id)
        )
        .map((e) => e.id)
    );
  }

  /* ------------------------------- progresso ------------------------- */

  const contagem = $derived.by(() => {
    let total = 0, feitos = 0, pulados = 0, estudando = 0;
    for (const id of Object.keys(indice)) {
      const estado = progresso.estadoDe(id);
      total++;
      if (estado === "feito") feitos++;
      else if (estado === "pulado") pulados++;
      else if (estado === "estudando") estudando++;
    }
    return { total, feitos, pulados, estudando };
  });

  const pct = $derived(
    contagem.total ? Math.round((contagem.feitos / contagem.total) * 100) : 0
  );

  /* nada de contador visível: a barra mostra a proporção, e um placar de
     9/156 cansa antes de a pessoa começar. A frase exata continua indo
     para o leitor de tela, que precisa de um valor. */
  const frase = $derived.by(() => {
    let f = `${contagem.feitos} de ${contagem.total} tópicos concluídos (${pct}%)`;
    if (contagem.estudando) f += `, ${contagem.estudando} em estudo`;
    if (contagem.pulados) f += `, ${contagem.pulados} pulados`;
    return f;
  });

  /* 100% é literal: "pulado" não conta como feito, então chegar aqui
     exige ter marcado todos. É o que torna o momento raro o bastante
     para merecer a faixa. A busca a esconde: ela fala do mapa inteiro,
     não do filtro. */
  const completa = $derived(
    !filtrando && contagem.total > 0 && contagem.feitos === contagem.total
  );

  function rotuloEstado(chave) {
    return data.ESTADOS.find((e) => e.chave === chave)?.rotulo ?? chave;
  }

  /* ------------------------------ navegação -------------------------- */

  /* o tópico pode estar numa etapa fechada: abrir primeiro, senão a
     rolagem para numa faixa e o tópico não está em lugar nenhum da
     tela. E só rolar depois da sanfona — mirar numa posição que ainda
     está crescendo deixa o alvo fora de quadro no fim. */
  function irParaTopico(id) {
    const ref = indice[id];
    if (!ref) return;

    const precisavaAbrir = !progresso.etapaAberta(ref.etapa.id);
    if (precisavaAbrir) progresso.alternarEtapa(ref.etapa.id, true);
    atualNoIndice = id;

    setTimeout(() => {
      document
        .getElementById("topico-" + id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, precisavaAbrir ? 260 : 0);

    /* no celular a gaveta cobre a tela: mantê-la aberta esconderia
       justamente o tópico que a pessoa pediu para ver */
    if (estreito.current) gaveta = false;
  }

  function trocarTrilha(ev) {
    goto(`${base}/roadmap?trilha=${ev.currentTarget.value}`);
  }

  function zerar() {
    progresso.zerar();
    confirmandoReset = false;
    aberto = null; /* o painel aberto ficaria desatualizado */
  }

  /* Esc fecha a camada mais de cima primeiro: confirmação, painel,
     gaveta, e só então limpa a busca */
  function aoTeclar(ev) {
    if (ev.key !== "Escape") return;
    if (confirmandoReset) { confirmandoReset = false; return; }
    if (aberto) { aberto = null; return; }
    if (gaveta) { gaveta = false; return; }
    if (document.activeElement?.id === "busca" && termo) definirTermo("");
  }

  /* --------------------------------- Obi ----------------------------- */

  let ninho = $state(null);
  let cutucadas = 0;
  let vezCutucadas = null;

  const controle = new ControleObi({
    /* aqui ele não tem chão: volta flutuando ao ninho em vez de pousar */
    chao: false,

    /* arrastar só vale em tela larga: no celular o gesto disputa com a
       rolagem do mapa, e não produz nada que valha o conflito */
    podeMexer: () => !estreito.current,

    /* a página inteira é o limite: fora do ninho ele não pertence mais
       ao painel, e prendê-lo ali deixaria o gesto apertado demais */
    limite: () => {
      const r = ninho.getBoundingClientRect();
      return {
        x: Math.max(innerWidth - r.right, r.left) + r.width,
        y: Math.max(innerHeight - r.bottom, r.top) + r.height,
      };
    },

    aoCutucar: () => {
      cutucadas += 1;
      clearTimeout(vezCutucadas);
      vezCutucadas = setTimeout(() => { cutucadas = 0; }, 1800);

      if (cutucadas >= 5) {
        cutucadas = 0;
        controle.reagir("tonto", 1500);
      } else {
        controle.reagir("susto", 480);
      }
    },
  });
</script>

<svelte:head>
  <title>Roadmap de {data.ROADMAP.titulo}</title>
</svelte:head>

<svelte:window onkeydown={aoTeclar} />

<div class="aplicacao" data-lateral={lateralFechada ? "fechada" : null}>
  <!-- ============================= rail =============================
       voltar, tema e zerar não falam nem da trilha nem do mapa: ficam
       numa coluna própria, antes das duas. A ordem é de consequência
       crescente: abrir o índice (só no celular), sair da página, mudar
       uma preferência, apagar o progresso. A lixeira fica na ponta,
       longe do que se clica por engano. -->
  <nav class="rail" aria-label="Ações da página">
    <!-- no celular a lateral vira gaveta; este botão é a maçaneta dela -->
    <button
      class="botao botao--icone rail__gaveta"
      type="button"
      aria-expanded={gaveta}
      title="Abrir o índice da trilha"
      aria-label="Abrir o índice da trilha"
      onclick={() => (gaveta = !gaveta)}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="3" width="12" height="2" />
        <rect x="2" y="7" width="12" height="2" />
        <rect x="2" y="11" width="12" height="2" />
      </svg>
    </button>

    <!-- o Obi era a rota de volta e deixou de ser: era um clique
         escondido no mascote, e a saída precisa de um lugar próprio. -->
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

    <!-- as outras duas telas da trilha: o mural e a grade do mês. A
         trilha vai junto na URL, senão elas abrem na trilha padrão e
         a pessoa perde o lugar. -->
    <!-- espiada em vez de travessia: conferir uma nota não deveria
         custar sair do mapa e voltar ao topo dele. A tela inteira
         continua a um clique, dentro da espiada. -->
    <button
      class="botao botao--icone"
      type="button"
      title="Notas desta trilha"
      aria-label="Notas desta trilha"
      onclick={() => (espiando = "notas")}
    >
      <!-- post-it: folha com o canto dobrado -->
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="2" width="12" height="2" />
        <rect x="2" y="4" width="2" height="10" />
        <rect x="12" y="4" width="2" height="6" />
        <rect x="2" y="12" width="8" height="2" />
        <rect x="10" y="10" width="4" height="2" />
        <rect x="10" y="12" width="2" height="2" />
      </svg>
    </button>

    <button
      class="botao botao--icone"
      type="button"
      title="Calendário de estudos"
      aria-label="Calendário de estudos"
      onclick={() => (espiando = "calendario")}
    >
      <!-- calendário: dois pregos, a moldura e a grade dos dias -->
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="4" y="1" width="2" height="2" />
        <rect x="10" y="1" width="2" height="2" />
        <rect x="1" y="3" width="14" height="2" />
        <rect x="1" y="5" width="2" height="9" />
        <rect x="13" y="5" width="2" height="9" />
        <rect x="1" y="13" width="14" height="2" />
        <rect x="5" y="7" width="2" height="2" />
        <rect x="9" y="7" width="2" height="2" />
        <rect x="5" y="10" width="2" height="2" />
        <rect x="9" y="10" width="2" height="2" />
      </svg>
    </button>

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

    <!-- a conta fica na ponta, onde estava a lixeira: é o botão que
         abre menu, e menu precisa de espaço embaixo. Zerar foi para
         dentro dele — é ação sobre o que a conta guarda, não sobre o
         mapa que está na frente. -->
    <Atalho aoZerar={() => (confirmandoReset = true)} marcados={progresso.marcados} />
  </nav>

  <!-- aba de reabrir: existe só com a lateral fechada -->
  <button
    class="abrir-lateral"
    type="button"
    title="Abrir o painel da trilha"
    aria-label="Abrir o painel da trilha"
    onclick={() => (lateralFechada = false)}
  >»</button>

  <!-- =========================== lateral ===========================
       cola na quina e vai de ponta a ponta. Moldura fixa: identidade e
       progresso. Só o índice rola. -->
  <aside class="lateral" data-aberta={gaveta ? "sim" : null} aria-label="Painel da trilha">
    <div class="lateral__identidade">
      <!-- o título É o trocador de trilha: um select transparente cobre
           a área inteira, então o clique abre a lista nativa e o h1
           continua sendo o h1 para o leitor de tela. -->
      <div class="lateral__nome">
        <div class="lateral__trilha">
          <select
            id="trilha"
            class="lateral__select"
            aria-label="Trocar de trilha"
            value={data.trilha}
            onchange={trocarTrilha}
          >
            {#each Object.entries(trilhas) as [id, t]}
              <option value={id}>{t.rotulo}</option>
            {/each}
          </select>
          <h1>{data.ROADMAP.titulo}</h1>
        </div>
      </div>

      <button
        class="lateral__fechar"
        type="button"
        title="Fechar o painel da trilha"
        aria-label="Fechar o painel da trilha"
        onclick={() => (estreito.current ? (gaveta = false) : (lateralFechada = true))}
      >«</button>
    </div>

    <!-- só a barra: a razão exata vira um placar, e placar de 9/156 cansa
         antes de a pessoa começar. O número continua em aria-valuetext. -->
    <div class="progresso">
      <div
        class="progresso__barra"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={pct}
        aria-valuetext={frase}
        aria-label="Progresso total do roadmap"
      >
        <span class="progresso__preenchido" style:width="{pct}%"></span>
      </div>
    </div>

    <!-- a busca mora com o índice porque é a mesma tarefa: achar. Fica na
         moldura fixa da lateral, acima da parte que rola — campo de busca
         que sobe junto com o resultado é campo que se perde. -->
    <div class="busca-caixa">
      <input
        id="busca"
        class="busca"
        type="search"
        placeholder="Buscar tópico…"
        aria-label="Buscar tópico"
        autocomplete="off"
        value={termo}
        oninput={(ev) => definirTermo(ev.currentTarget.value)}
      />
      <p class="busca__contagem" role="status" aria-live="polite">
        {#if filtrando}
          {achados === 0
            ? "Nenhum tópico encontrado"
            : achados + (achados === 1 ? " tópico encontrado" : " tópicos encontrados")}
        {/if}
      </p>
    </div>

    <Indice
      {etapas}
      {progresso}
      atual={atualNoIndice}
      abertas={abertasNoIndice}
      aoAlternar={alternarNoIndice}
      aoIr={irParaTopico}
    />
  </aside>

  {#if gaveta}
    <div
      class="veu"
      onclick={() => (gaveta = false)}
      aria-hidden="true"
    ></div>
  {/if}

  <!-- ========================== conteúdo ========================== -->
  <div class="conteudo">
    <!-- o Obi dorme no canto que os botões desocuparam: parado ali ele
         não sobrevoa nada, e o truque de empilhamento contra as faixas
         sticky só volta a ser preciso quando alguém o arrasta. -->
    <Obi variante="ninho" {controle} bind:elemento={ninho} />

    <!-- a legenda fala de como o mapa se lê, então mora com o mapa. A
         busca saiu daqui: procurar é trabalho do índice, e ela foi
         para a lateral, logo acima dele. -->
    <div class="conteudo__barra">
      <!-- a janelinha dos pulados: é ela que explica a ausência. Esconder
           sem explicar faz o tópico parecer inexistente — o argumento é
           da ficha da rota condicional, e vale igual aqui. Só aparece
           havendo o que esconder. -->
      {#if pulados.length}
        <button
          class="pulados"
          type="button"
          aria-pressed={progresso.revelarPulados}
          title={progresso.revelarPulados
            ? "Esconder os tópicos pulados"
            : "Mostrar os tópicos pulados"}
          onclick={() => progresso.alternarPulados()}
        >
          <span class="pulados__marca" aria-hidden="true">×</span>
          {pulados.length}
          {pulados.length === 1 ? "pulado" : "pulados"}
        </button>
      {/if}

      <div class="legenda">
        <div class="legenda__grupo">
          {#each data.LEGENDA as item}
            <span class="legenda__item" title={item.desc}>
              <span class="legenda__amostra" data-prioridade={item.chave}></span
              >{item.rotulo}
            </span>
          {/each}
        </div>
        <!-- o gesto anunciado é o gesto que o aparelho tem. No toque o
             [i] continua sendo quem abre o detalhe: lá não há Shift. -->
        <p class="legenda__dica">
          {#if toque.current}
            <strong>Toque</strong> cicla o estado · <strong>[i]</strong> abre o detalhe
          {:else}
            <strong>Clique</strong> abre o detalhe ·
            <strong>Shift + clique</strong> cicla o estado
          {/if}
        </p>
      </div>
    </div>

    <main
      class="mapa"
      data-filtrando={filtrando ? "sim" : null}
      data-sem-pulados={!progresso.revelarPulados && pulados.length ? "sim" : null}
      aria-label="Roadmap de estudos"
    >
      {#if sessao.conectado && recomendacoes.itens.length}
        <Recomendacoes itens={recomendacoes.itens} {indice} trilha={data.trilha} />
      {/if}
      {#if sessao.conectado && recomendacoes.ultimaFalha}
        <p class="recomendacoes__falha" role="status">Não consegui atualizar as sugestões de reforço. {recomendacoes.ultimaFalha}</p>
      {/if}
      {#each etapas as etapa (etapa.id)}
        <Etapa
          {etapa}
          aberta={etapaAberta(etapa)}
          {progresso}
          {rotuloEstado}
          {dicaLer}
          toque={toque.current}
          oculto={ocultos}
          aoAlternar={() =>
            progresso.alternarEtapa(etapa.id, !progresso.etapaAberta(etapa.id))}
          aoAbrirEtapa={() => (aberto = { tipo: "etapa", id: etapa.id })}
          aoAbrirTopico={(id) => (aberto = { tipo: "topico", id })}
        />
      {/each}

      <!-- busca sem resultado: o mapa inteiro some, e sem isto sobrava uma
           página em branco. O termo é repetido de volta porque metade das
           buscas vazias é erro de digitação. -->
      <div class="vazio" hidden={!(filtrando && achados === 0)}>
        <span class="vazio__mascote" aria-hidden="true"></span>
        <p class="vazio__titulo">Nada encontrado para “{termo.trim()}”</p>
        <p class="vazio__dica">
          A busca olha título, descrição e explicação de todos os tópicos desta
          trilha. Tente outra palavra, ou confira a digitação.
        </p>
        <button
          class="botao botao--destaque"
          type="button"
          onclick={() => {
            definirTermo("");
            document.getElementById("busca")?.focus();
          }}>Limpar a busca</button
        >
      </div>
    </main>

    <!-- 100% da trilha: entra depois da última etapa -->
    <section class="completa" aria-labelledby="completa-titulo" hidden={!completa}>
      <div class="completa__faixa">
        <span class="completa__selo" aria-hidden="true"></span>
        <h2 class="completa__titulo" id="completa-titulo">Fim do mapa</h2>
        <p class="completa__meta">
          {data.ROADMAP.titulo} · {contagem.feitos} de {contagem.total} tópicos
        </p>
        <span class="completa__barra"></span>
      </div>

      <div class="completa__saida">
        <p class="completa__nota">
          Você marcou todos os tópicos desta trilha. O mapa acabou — o que vem
          depois dele não cabe em checklist nenhum, vem de projeto.
        </p>
        <div class="completa__acoes">
          <!-- o seletor é o controle de verdade; o botão só leva até ele —
               e ele mora na lateral, que pode estar fechada ou em gaveta -->
          <button
            class="botao botao--destaque"
            type="button"
            onclick={() => {
              lateralFechada = false;
              if (estreito.current) gaveta = true;
              document.getElementById("trilha")?.focus();
            }}>Escolher outra trilha</button
          >
          <a
            class="botao"
            href="https://github.com/masteryogo/lets-learn-together/fork"
            target="_blank"
            rel="noopener noreferrer">Contribuir com um tópico</a
          >
        </div>
      </div>
    </section>
  </div>
</div>

<!-- ====================== confirmar o zerar ======================
     zerar é o único gesto irreversível da página, e a caixa diz quantos
     tópicos somem — "tem certeza?" todo mundo responde no automático;
     um número faz pesar o clique. -->
<div class="modal" hidden={!confirmandoReset}>
  <div class="modal__veu" onclick={() => (confirmandoReset = false)} aria-hidden="true"></div>
  <div
    class="modal__caixa"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-titulo"
    aria-describedby="modal-texto"
  >
    <h2 class="modal__titulo" id="modal-titulo">Zerar progresso?</h2>
    <p class="modal__texto" id="modal-texto">
      {progresso.marcados === 1
        ? "1 tópico volta para pendente. Não dá para desfazer."
        : progresso.marcados + " tópicos voltam para pendente. Não dá para desfazer."}
    </p>
    <div class="modal__acoes">
      <button class="botao" type="button" onclick={() => (confirmandoReset = false)}
        >Cancelar</button
      >
      <button class="botao botao--destaque" type="button" onclick={zerar}
        >Zerar tudo</button
      >
    </div>
  </div>
</div>

<Convite aberto={convite} aoFechar={() => (convite = false)} />

<Espiada
  aberto={!!espiando}
  titulo={espiando ? ESPIADAS[espiando].titulo : ""}
  url={espiando ? `${base}${ESPIADAS[espiando].rota}${data.trilha}` : ""}
  aoFechar={() => (espiando = null)}
/>
<AvisoFalha falha={sincronia.ultimaFalha} />

<!-- região viva: o leitor de tela não percebe a troca do ícone de
     copiar, então o resultado é narrado por aqui -->
<p class="oculto-visual" role="status" aria-live="polite">{aviso}</p>

<!-- sem conta o mapa é só leitura: marcar sem ter onde salvar
     prometeria memória que não existe -->
{#if !sessao.carregando && !sessao.conectado}
  <div class="migrar">
    <p class="migrar__texto">
      Entre na sua conta para marcar o que já estudou. O progresso fica salvo na
      conta, não neste navegador (o Obi agradece rsrs).
    </p>
    <div class="migrar__acoes">
      <!-- vai direto: abrir o convite aqui seria um diálogo para
           oferecer o mesmo link que este botão já é -->
      <a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>
        Entrar
      </a>
    </div>
  </div>
{/if}

<!-- a pergunta do primeiro login. Fica no rodapé e não bloqueia o
     mapa: é uma decisão sobre o que já existe, não um pedágio para
     usar a tela. -->
{#if migrar}
  <div class="migrar" role="dialog" aria-labelledby="migrar-titulo">
    <p class="migrar__texto" id="migrar-titulo">
      Este navegador guarda marcas de antes da conta existir. Levar para a
      conta? Elas não são mostradas até você decidir.
    </p>
    <div class="migrar__acoes">
      <button
        class="botao botao--destaque"
        type="button"
        disabled={migrando}
        onclick={levarParaAConta}>Levar</button
      >
      <button
        class="botao"
        type="button"
        disabled={migrando}
        onclick={deixarNoNavegador}>Descartar</button
      >
    </div>
  </div>
{/if}

<Drawer
  {aberto}
  {indice}
  {etapas}
  dados={data}
  trilha={data.trilha}
  {progresso}
  {notas}
  aoFechar={() => (aberto = null)}
  aoAnunciar={(t) => (aviso = t)}
/>
