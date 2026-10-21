<!-- ============================================================
     Um post-it do mural.

     O post-it aqui é pixel, não papel: cor sólida da paleta, borda
     de 2px, canto reto e sombra dura. O único gesto emprestado do
     post-it de verdade é a leve torção — e ela se desfaz assim que
     a nota é lida de perto ou pegada, porque enfeite não atrapalha
     leitura.

     Arrastar usa `left` e `top`, nunca transform: o transform da
     nota já está ocupado com a torção, e juntar os dois faria o
     gesto brigar com o enfeite.
     ============================================================ -->
<script>
  import { CORES, vagaLivre, torcaoDe } from "./Mural.svelte.js";

  let {
    nota,
    indice,
    mural,
    muralEl,
    arrastavel,
    focar,
    aoFocar,
    topicos = [],
    tituloDoTopico = {},
  } = $props();

  /* prender é gesto raro e o mural é apertado: o seletor só existe
     enquanto se escolhe, e some depois */
  let escolhendo = $state(false);
  let escolhaEl = $state(null);

  $effect(() => {
    if (escolhendo) escolhaEl?.focus();
  });

  /* o datalist oferece títulos, que é o que a pessoa reconhece; o que
     se guarda é o id, que é estável — renomear o texto de um tópico
     não solta as notas presas nele */
  function prender(texto) {
    const alvo = topicos.find((t) => t.titulo === texto);
    escolhendo = false;
    if (alvo) mural.definir(nota.id, "topico", alvo.id);
  }

  const rotuloDaAncora = $derived(
    nota.topico ? tituloDoTopico[nota.topico] ?? nota.topico : null
  );

  let campo = $state(null);
  let pegada = $state(false);
  /* a ordem de empilhamento mora na nota, não aqui: antes era estado
     do componente, e recarregar devolvia todas ao mesmo plano —
     quem tinha arrumado o mural perdia o arranjo */

  /* nota nova nasce sem posição: a vaga é calculada na largura que o
     mural tem agora, para não nascer em cima de outra */
  const pos = $derived.by(() => {
    if (nota.x != null && nota.y != null) return { x: nota.x, y: nota.y };
    return vagaLivre(indice, muralEl?.clientWidth ?? 0);
  });

  /* escrever é o passo seguinte de criar: o cursor já vai para lá */
  $effect(() => {
    if (focar && campo) {
      campo.focus();
      aoFocar();
    }
  });

  function pegar(ev) {
    /* a alça carrega botões e, ao prender, um campo. Sem esta guarda
       o pointerdown deles começa um arrasto, a alça captura o
       ponteiro e o clique nunca chega — foi o que impedia apagar. */
    if (ev.target.closest("button, input, textarea, select")) return;

    if (!arrastavel || ev.button !== 0) return;
    ev.preventDefault();

    const caixa = muralEl.getBoundingClientRect();
    const el = ev.currentTarget.parentElement;
    const r = el.getBoundingClientRect();
    const pegoX = ev.clientX - r.left;
    const pegoY = ev.clientY - r.top;
    const alca = ev.currentTarget;

    pegada = true;
    mural.levantar(nota.id);
    alca.setPointerCapture(ev.pointerId);

    const mover = (e) => {
      /* o mural é o limite: nota largada fora dele é nota perdida */
      const x = Math.max(0, Math.min(e.clientX - caixa.left - pegoX, caixa.width - r.width));
      const y = Math.max(0, Math.min(e.clientY - caixa.top - pegoY, caixa.height - r.height));
      mural.definir(nota.id, "x", Math.round(x));
      mural.definir(nota.id, "y", Math.round(y));
    };

    const largar = (e) => {
      pegada = false;
      try { alca.releasePointerCapture(e.pointerId); } catch { /* já solto */ }
      alca.removeEventListener("pointermove", mover);
      alca.removeEventListener("pointerup", largar);
      alca.removeEventListener("pointercancel", largar);
      /* aqui entra a gravação quando houver banco: uma escrita por
         arrasto, no soltar — nunca a cada pixel do pointermove */
    };

    alca.addEventListener("pointermove", mover);
    alca.addEventListener("pointerup", largar);
    alca.addEventListener("pointercancel", largar);
  }
</script>

<article
  class="nota"
  data-cor={nota.cor}
  data-pegada={pegada ? "sim" : null}
  aria-label={nota.topico ? "Nota presa em " + nota.topico : "Nota solta"}
  style:left="{pos.x}px"
  style:top="{pos.y}px"
  style:z-index={nota.z ?? 10}
  style:--torcao={torcaoDe(nota.id)}
>
  <!-- A alça é um alvo de arrasto, não um controle: não navega, não
       salva, não muda estado — só move o papel na tela. Pela mesma
       razão do Obi, não há equivalente de teclado a oferecer, e no
       celular ela nem arrasta (o mural lá é grade). Um role="button"
       aqui prometeria ao leitor de tela uma ação que não existe. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="nota__alca" onpointerdown={pegar}>
    {#if escolhendo}
      <!-- pointerdown parado aqui: a alça é área de arrasto, e
           escrever dentro dela arrastaria o papel junto -->
      <input
        class="nota__escolha"
        list="topicos-da-trilha"
        placeholder="prender em…"
        aria-label="Prender esta nota a um tópico"
        bind:this={escolhaEl}
        onchange={(ev) => prender(ev.currentTarget.value)}
        onblur={() => (escolhendo = false)}
        onkeydown={(ev) => ev.key === "Escape" && (escolhendo = false)}
      />
      <datalist id="topicos-da-trilha">
        {#each topicos as t}
          <option value={t.titulo}></option>
        {/each}
      </datalist>
    {:else}
      <span class="nota__ancora" class:nota__ancora--solta={!nota.topico}>
        {nota.topico ? "◆ " + rotuloDaAncora : "◇ solta"}
      </span>
    {/if}

    <span class="nota__acoes">
      <!-- o mesmo botão nos dois sentidos: preso, solta; solto, abre a
           escolha. A nota é uma entidade com dois pontos de entrada, e
           prender é o gesto que faltava para o segundo existir. -->
      <button
        class="nota__acao"
        type="button"
        disabled={!topicos.length && !nota.topico}
        title={nota.topico
          ? "Soltar do tópico " + rotuloDaAncora
          : "Prender a um tópico"}
        aria-label={nota.topico
          ? "Soltar do tópico " + rotuloDaAncora
          : "Prender a um tópico"}
        onclick={() =>
          nota.topico
            ? mural.definir(nota.id, "topico", null)
            : (escolhendo = true)}
      >{nota.topico ? "◆" : "◇"}</button>

      <button
        class="nota__acao"
        type="button"
        title="Apagar nota"
        aria-label="Apagar nota"
        onclick={() => mural.apagar(nota.id)}
      >×</button>
    </span>
  </div>

  <textarea
    class="nota__texto"
    rows="5"
    aria-label="Texto da nota"
    bind:this={campo}
    value={nota.texto}
    oninput={(ev) => mural.definir(nota.id, "texto", ev.currentTarget.value)}
  ></textarea>

  <div class="nota__pe">
    <span class="cores" role="group" aria-label="Cor da nota">
      {#each CORES as cor}
        <button
          class="cor"
          type="button"
          data-cor={cor}
          aria-pressed={nota.cor === cor}
          aria-label="Pintar de {cor}"
          onclick={() => mural.definir(nota.id, "cor", cor)}
        ></button>
      {/each}
    </span>
  </div>
</article>
