<!-- ============================================================
     O painel de detalhe — de um tópico ou de uma etapa.

     Eram duas funções de 45 linhas (abrirTopico e abrirEtapa) que
     escreviam nos mesmos vinte elementos por id, cada uma lembrando
     de esconder o que a outra mostrava. Agora as duas formas são o
     mesmo markup com `{#if}`: o que não vale para etapa simplesmente
     não é renderizado, e não há como esquecer de esconder nada.

     Arrastar para a direita fecha — em telas de toque o painel cobre
     a sobreposição inteira, então o ✕ era a única saída. Só toque e
     caneta: com mouse já existem o ✕, o clique fora e o Esc.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import Texto from "./Texto.svelte";
  import Copiar from "./Copiar.svelte";
  import { MARCAS } from "./Progresso.svelte.js";
  import { subassuntosDe } from "./subassuntos.js";

  /* arraste para fechar o painel */
  const INICIO_ARRASTO = 8; /* px antes de decidir o eixo do gesto */
  const FRACAO_FECHAR = 0.3; /* fração da largura que confirma o fechamento */
  const DURACAO_AJUSTE = 200; /* ms do ajuste final — igual ao CSS */

  let {
    aberto, /* { tipo: "topico" | "etapa", id } */
    indice,
    etapas,
    dados, /* { PROJETOS, RECURSOS, ESTADOS, CRITERIOS } */
    trilha,
    progresso,
    notas = [],
    aoFechar,
    aoAnunciar,
  } = $props();

  /* só as deste tópico: o mural mostra todas, e repetir a lista
     inteira aqui faria do drawer um segundo mural */
  const notasDaqui = $derived(
    aberto?.tipo === "topico" ? notas.filter((n) => n.topico === aberto.id) : []
  );

  let painel = $state(null);
  let fechar = $state(null);
  let arrasto = null;
  let desloque = $state(0);
  let ajustando = $state(false);

  const ref = $derived(aberto?.tipo === "topico" ? indice[aberto.id] : null);
  const etapa = $derived(
    aberto?.tipo === "etapa"
      ? etapas.find((e) => e.id === aberto.id)
      : ref?.etapa
  );

  const subs = $derived(ref ? subassuntosDe(ref.topico) : null);
  const estado = $derived(ref ? progresso.estadoDe(ref.topico.id) : null);

  /* o número da etapa está no selo, então aqui sobra só o caminho — e
     "›" diz que o grupo está dentro da etapa, que o "·" não dizia */
  const legenda = $derived.by(() => {
    if (!etapa) return "";
    if (ref) {
      return ref.grupo.titulo
        ? etapa.titulo + " › " + ref.grupo.titulo
        : etapa.titulo;
    }
    const n = etapa.grupos.reduce((a, g) => a + g.topicos.length, 0);
    let meta = "Pré-requisitos: " + etapa.preRequisitos;
    if (etapa.duracao) meta += " · " + etapa.duracao;
    return meta + " · " + n + " tópicos";
  });

  /* o CV tem critério próprio por iteração; o ML tem 4 globais */
  const criterios = $derived(etapa?.criterios || dados.CRITERIOS || []);
  const recursos = $derived(
    etapa ? dados.RECURSOS.filter((r) => r.etapa === etapa.id) : []
  );
  const projetos = $derived((etapa && dados.PROJETOS[etapa.id]) || []);

  function rotuloEstado(chave) {
    return dados.ESTADOS.find((e) => e.chave === chave)?.rotulo ?? chave;
  }

  /* o painel abre no topo e com o foco no ✕: era o que mostrarDrawer
     fazia à mão depois de preencher tudo */
  $effect(() => {
    if (!aberto || !painel) return;
    painel.scrollTop = 0;
    fechar?.focus();
  });

  /* ---------------------- arrastar para fechar ---------------------- */

  function aoDescer(ev) {
    if (ev.pointerType === "mouse") return;
    arrasto = { x0: ev.clientX, y0: ev.clientY, eixo: null };
  }

  function aoMover(ev) {
    if (!arrasto) return;

    const dx = ev.clientX - arrasto.x0;
    const dy = ev.clientY - arrasto.y0;

    /* o eixo se decide no primeiro movimento que passa do tremor do
       dedo, e não muda mais: sem travar, um arraste meio torto ficaria
       alternando entre rolar o texto e empurrar o painel */
    if (arrasto.eixo === null) {
      if (Math.abs(dx) < INICIO_ARRASTO && Math.abs(dy) < INICIO_ARRASTO) return;
      arrasto.eixo = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (arrasto.eixo === "y") return; /* é rolagem: o navegador cuida */

    /* só para a direita: para a esquerda não há para onde o painel ir */
    desloque = Math.max(0, dx);
  }

  function aoSubir() {
    if (!arrasto) return;
    const horizontal = arrasto.eixo === "x";
    const dx = desloque;
    arrasto = null;

    /* toque parado ou rolagem: nada a desfazer, e o click segue
       normalmente para o botão ou link que estava sob o dedo */
    if (!horizontal) {
      desloque = 0;
      return;
    }

    ajustando = true;

    if (dx > painel.offsetWidth * FRACAO_FECHAR) {
      /* sai deslizando e só então some, para não piscar no meio da tela */
      desloque = painel.offsetWidth;
      setTimeout(() => {
        aoFechar();
        desloque = 0;
        ajustando = false;
      }, DURACAO_AJUSTE);
      return;
    }

    /* não foi longe o bastante: volta ao lugar */
    desloque = 0;
    setTimeout(() => { ajustando = false; }, DURACAO_AJUSTE);
  }

  function aoCancelar() {
    arrasto = null;
    desloque = 0;
    ajustando = false;
  }

  const veu = $derived(
    painel && desloque ? 1 - desloque / painel.offsetWidth : null
  );
</script>

<div
  class="sobreposicao"
  hidden={!aberto}
  style:opacity={veu}
  onclick={aoFechar}
  aria-hidden="true"
></div>

<!-- O compilador prefere <div role="dialog"> a <aside role="dialog">, e
     tem razão em geral. Aqui o elemento é o mesmo do HTML antigo de
     propósito: `aside.drawer` é o seletor de onde sai a folha inteira
     do painel, e trocar a tag por causa do aviso exigiria reescrever
     o CSS para ganhar nada — role="dialog" já sobrepõe o papel nativo
     de complementar, que é o que o aviso teme. -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<aside
  class="drawer"
  class:drawer--ajustando={ajustando}
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-titulo"
  hidden={!aberto}
  bind:this={painel}
  style:transform={desloque ? "translateX(" + desloque + "px)" : null}
  onpointerdown={aoDescer}
  onpointermove={aoMover}
  onpointerup={aoSubir}
  onpointercancel={aoCancelar}
>
  <!-- barra fixa. O selo é o mesmo bloco numerado que marca a etapa no
       mapa, então o painel lê como o zoom daquele lugar do mapa em vez
       de uma tela à parte. Fica no topo enquanto o texto rola. -->
  <div class="drawer__barra">
    <span class="drawer__selo" aria-hidden="true">{etapa?.numero ?? ""}</span>
    <p class="drawer__trilha">{legenda}</p>
    <button
      class="botao botao--icone"
      type="button"
      aria-label="Fechar painel"
      bind:this={fechar}
      onclick={aoFechar}
    >×</button>
  </div>

  {#if aberto && etapa}
    <div class="drawer__corpo">
      <div class="drawer__identidade">
        <!-- na etapa o selo já carrega "Etapa N": a etiqueta repetiria -->
        {#if ref}
          <span class="etiqueta" data-prioridade={ref.topico.prioridade}>
            {ref.topico.prioridade}
          </span>
          <span class="drawer__estado" data-estado={estado}>
            {MARCAS[estado]} {rotuloEstado(estado).toLowerCase()}
          </span>
        {/if}
      </div>

      <h2 id="drawer-titulo">{ref ? ref.topico.titulo : etapa.titulo}</h2>

      <!-- quando o desc é uma lista de subassuntos, ele vira os botões
           abaixo e este parágrafo some: é a mesma frase -->
      {#if !subs}
        <p class="drawer__desc">
          <Texto texto={ref ? ref.topico.desc : etapa.objetivo} />
        </p>
      {/if}

      {#if ref && subs}
        <section class="drawer__secao drawer__secao--sub">
          <h3>
            Subassuntos
            <span class="drawer__contagem">
              {progresso.contarSub(ref.topico.id, subs)}/{subs.length}
            </span>
          </h3>
          <div class="subassuntos">
            {#each subs as texto (texto)}
              {@const marcado = progresso.subMarcado(ref.topico.id, texto)}
              <!-- botão dentro de botão é HTML inválido, então alternar e
                   copiar são irmãos num invólucro — é o invólucro que
                   desenha a caixa, e os dois viram segmentos dela -->
              <div class="subassunto-par">
                <button
                  type="button"
                  class="subassunto"
                  aria-pressed={marcado}
                  onclick={() => progresso.alternarSub(ref.topico.id, texto, subs)}
                >
                  <span class="subassunto__marca"
                    >{marcado ? MARCAS.feito : MARCAS.pendente}</span
                  >{texto}
                </button>
                <Copiar rotulo="{ref.topico.titulo} - {texto}" {aoAnunciar} />
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <div class="drawer__detalhe">
        <Texto
          texto={ref ? ref.topico.detalhe : etapa.descricao}
          paragrafos
        />
      </div>

      <!-- contexto do grupo, para o tópico não ficar solto -->
      {#if notasDaqui.length}
        <section class="drawer__secao">
          <h3>Suas notas</h3>
          <!-- leitura, não edição: quem escreve é o mural, e dois
               lugares editando o mesmo texto é o problema que o
               localStorage já nos deu hoje -->
          {#each notasDaqui as nota (nota.id)}
            <p class="drawer__post-it" data-cor={nota.cor}>{nota.texto}</p>
          {/each}
          <a
            class="drawer__elo"
            href="{base}/notas?trilha={dados.trilha}"
            data-sveltekit-reload>Abrir o mural</a
          >
        </section>
      {/if}

      {#if ref?.grupo.descricao}
        <section class="drawer__secao">
          <h3>{ref.grupo.titulo || "Sobre este bloco"}</h3>
          <p class="drawer__nota"><Texto texto={ref.grupo.descricao} /></p>
        </section>
      {/if}

      {#if ref}
        <section class="drawer__secao">
          <h3>Praticar</h3>
          <p class="drawer__nota">Resolva atividades ligadas a este assunto e receba uma explicação da resposta.</p>
          <a
            class="drawer__elo"
            href="{base}/atividades?trilha={trilha}&topico={ref.topico.id}"
            data-sveltekit-reload>Ir para a prática</a
          >
        </section>

        <section class="drawer__secao">
          <h3>Marcar como</h3>
          <div class="drawer__estados">
            {#each dados.ESTADOS as e}
              <button
                type="button"
                class="estado-btn"
                data-estado={e.chave}
                aria-pressed={estado === e.chave}
                onclick={() => progresso.definir(ref.topico.id, e.chave)}
              >{e.rotulo}</button>
            {/each}
          </div>
        </section>
      {/if}

      {#if criterios.length}
        <section class="drawer__secao drawer__secao--regua">
          <h3>Marque como feito quando</h3>
          <ul class="lista">
            {#each criterios as texto}
              <li><Texto {texto} /></li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if recursos.length}
        <section class="drawer__secao">
          <h3>Recursos da etapa</h3>
          <ul class="lista">
            {#each recursos as r}
              <li>
                {#if r.url}
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    >{r.titulo}</a
                  >
                {:else}{r.titulo}{/if}
                {#if r.nota}
                  <span class="lista__nota"><Texto texto=" — {r.nota}" /></span>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if projetos.length}
        <section class="drawer__secao">
          <h3>Projetos sugeridos</h3>
          <ul class="lista">
            {#each projetos as texto}
              <li><Texto {texto} /></li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>
  {/if}
</aside>
