<!-- ============================================================
     Uma etapa do mapa: a faixa e os grupos sanfonados.

     O título é quem abre a introdução; a faixa inteira deixou de ser
     botão porque a seta de expandir mora dentro dela, e botão dentro
     de botão é HTML inválido.

     O estado aberto/fechado continua saindo pelo atributo data-aberta
     da seção: o CSS lê de lá para a sanfona, para o giro da seta e
     para a margem — uma fonte só.
     ============================================================ -->
<script>
  import Topico from "./Topico.svelte";

  let {
    etapa,
    aberta,
    progresso,
    rotuloEstado,
    dicaLer,
    toque,
    oculto,
    aoAlternar,
    aoAbrirEtapa,
    aoAbrirTopico,
  } = $props();

  const meta = $derived(
    etapa.duracao
      ? etapa.duracao + " · pré: " + etapa.preRequisitos
      : "pré: " + etapa.preRequisitos
  );

  /* o anel da faixa conta só os feitos: pulado não é avanço */
  const fracao = $derived.by(() => {
    let total = 0;
    let feitos = 0;
    for (const grupo of etapa.grupos) {
      for (const t of grupo.topicos) {
        total++;
        if (progresso.estadoDe(t.id) === "feito") feitos++;
      }
    }
    return total ? (feitos / total) * 100 : 0;
  });
</script>

<section class="etapa" data-etapa={etapa.id} data-aberta={aberta ? "sim" : "nao"}>
  <div class="etapa__nucleo" data-etapa-id={etapa.id}>
    <span class="etapa__numero">
      <!-- o selo mostra só o algarismo; a palavra fica para quem lê por
           leitor de tela, onde "4" sozinho não diz nada -->
      <span class="oculto-visual">Etapa </span>{etapa.numero}
    </span>

    <button
      type="button"
      class="etapa__titulo-btn"
      title="{etapa.objetivo} (clique para ler a introdução)"
      onclick={aoAbrirEtapa}
    >
      <span class="etapa__titulo">{etapa.titulo}</span>
    </button>

    <span class="etapa__meta">{meta}</span>

    <span class="etapa__anel"><span style:width="{fracao}%"></span></span>

    <button
      type="button"
      class="etapa__expandir"
      aria-expanded={aberta}
      aria-controls="grupos-{etapa.id}"
      aria-label="{aberta ? 'Esconder' : 'Mostrar'} os tópicos de {etapa.titulo}"
      onclick={aoAlternar}
    >
      <!-- triângulo em degraus, na mesma grade de 16 dos outros ícones -->
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="5" width="12" height="1" />
        <rect x="3" y="6" width="10" height="1" />
        <rect x="4" y="7" width="8" height="1" />
        <rect x="5" y="8" width="6" height="1" />
        <rect x="6" y="9" width="4" height="1" />
        <rect x="7" y="10" width="2" height="1" />
      </svg>
    </button>
  </div>

  <!-- invólucro da sanfona: é a linha de grid dele que anima de 0fr a
       1fr. Sem o invólucro não há o que interpolar. -->
  <div class="etapa__sanfona">
    <div class="etapa__grupos" id="grupos-{etapa.id}">
      <!-- as colunas ganham um invólucro próprio dentro do item do grid —
           o porquê está no comentário de .etapa__colunas, no CSS -->
      <div class="etapa__colunas">
        {#each etapa.grupos as grupo}
          <div class="grupo">
            {#if grupo.titulo}
              <!-- o espaço antes do · é dado, não formatação: sem ele o
                   título encosta no separador. Daí o {" "} explícito —
                   o compilador apara o espaço de indentação. -->
              <h3 class="grupo__titulo">
                {grupo.titulo}{#if grupo.duracao}<span class="grupo__duracao"
                  >{" · " + grupo.duracao}</span
                >{/if}
              </h3>
            {/if}
            <div class="grupo__topicos">
              {#each grupo.topicos as topico (topico.id)}
                <Topico
                  {topico}
                  estado={progresso.estadoDe(topico.id)}
                  {rotuloEstado}
                  {dicaLer}
                  {toque}
                  oculto={oculto.has(topico.id)}
                  aoCiclar={() => progresso.ciclar(topico.id)}
                  aoAbrir={() => aoAbrirTopico(topico.id)}
                />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
