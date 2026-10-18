<!-- ============================================================
     Índice da trilha — a mesma árvore do mapa, reduzida à lateral.

     Cada tópico tem dois alvos: a marca cicla o estado, o rótulo rola
     até ele no mapa. A marca usa os mesmos glifos do mapa em vez de um
     checkbox: o tópico tem quatro estados, não dois.

     A sanfona daqui é independente da do mapa — abrir uma etapa no
     índice não abre no mapa. Era assim antes e continua: a lateral é
     para achar, o mapa é para ler.
     ============================================================ -->
<script>
  import { MARCAS } from "./Progresso.svelte.js";

  let { etapas, progresso, atual, abertas, aoAlternar, aoIr } = $props();
</script>

<nav class="indice" aria-label="Índice da trilha">
  {#each etapas as etapa (etapa.id)}
    {@const aberta = abertas.has(etapa.id)}
    <div class="indice__etapa" data-aberta={aberta ? "sim" : "nao"}>
      <button
        type="button"
        class="indice__cabeca"
        aria-expanded={aberta}
        onclick={() => aoAlternar(etapa.id)}
      >
        <span class="indice__selo" aria-hidden="true">{etapa.numero}</span>
        <span class="indice__nome">{etapa.titulo}</span>
      </button>

      <ul class="indice__lista" hidden={!aberta}>
        {#each etapa.grupos as grupo}
          {#if grupo.titulo}
            <li class="indice__grupo">{grupo.titulo}</li>
          {/if}
          {#each grupo.topicos as topico (topico.id)}
            {@const estado = progresso.estadoDe(topico.id)}
            <li
              class="indice__item"
              id="indice-{topico.id}"
              data-estado={estado}
              data-atual={atual === topico.id ? "sim" : null}
            >
              <button
                type="button"
                class="indice__marca"
                data-prioridade={topico.prioridade}
                aria-label="Alternar o estado de {topico.titulo}"
                onclick={() => progresso.ciclar(topico.id)}
              >{MARCAS[estado]}</button>
              <button
                type="button"
                class="indice__rotulo"
                title="Ir para {topico.titulo} no mapa"
                onclick={() => aoIr(topico.id)}
              >{topico.titulo}</button>
            </li>
          {/each}
        {/each}
      </ul>
    </div>
  {/each}
</nav>
