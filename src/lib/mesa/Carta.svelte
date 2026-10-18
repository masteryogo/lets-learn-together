<!-- ============================================================
     Uma carta de trilha na mesa.

     A cor vem do manifesto e é aplicada como --rota na própria
     carta: uma declaração pinta a carta inteira, porque o traço
     vencido, os marcos cumpridos e a barra do rodapé todos leem
     var(--rota), e redefini-la aqui desce por herança até dentro
     do SVG.

     A inclinação é fixa por carta e vem de fora, não daqui: mapas
     largados numa mesa não ficam alinhados, mas também não dançam
     a cada repintura.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import QuadroRota from "./QuadroRota.svelte";

  let {
    trilha,
    dados,
    feitos,
    deitado = false,
    giro = 0,
    focada = false,
    aberta = false,
    apagada = false,
    aoEscolher,
    aoFocar,
  } = $props();

  const fracao = $derived(dados.topicos ? feitos / dados.topicos : 0);
  const pct = $derived(Math.round(fracao * 100));

  /* levantada pelo ponteiro, erguida e aumentada quando é a escolhida */
  const y = $derived(aberta ? -16 : focada ? -10 : 0);
  const escala = $derived(aberta ? 1.06 : 1);
  const inclinacao = $derived(aberta || focada ? 0 : giro);

  function clicar(ev) {
    /* Ctrl/Cmd, Shift ou botão do meio: é pedido de nova aba, e o
       navegador cuida. Só o clique simples vira animação. */
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
      return;
    }
    ev.preventDefault();
    aoEscolher();
  }
</script>

<a
  class="carta"
  class:carta--aberta={aberta}
  href="{base}/roadmap?trilha={trilha}"
  data-sveltekit-reload
  style:--rota={dados.cor || null}
  style:transform="translateY({y}px) rotate({inclinacao}deg) scale({escala})"
  style:opacity={apagada ? "0.3" : "1"}
  style:box-shadow={aberta
    ? "0 26px 40px rgba(21,20,26,0.35)"
    : "0 8px 18px rgba(21,20,26,0.2)"}
  aria-label="{dados.rotulo}, {dados.etapas} etapas, {dados.topicos} tópicos, {feitos} concluídos"
  onclick={clicar}
  onmouseenter={aoFocar}
  onfocus={aoFocar}
>
  <span class="carta__nome">{dados.rotulo}</span>

  <span class="carta__quadro">
    <QuadroRota rota={dados.rota} etapas={dados.etapas} {fracao} {deitado} />
  </span>

  <span class="carta__rodape">
    <span>{feitos}/{dados.topicos}</span>
    <span class="carta__barra"><span style:width="{pct}%"></span></span>
    <span>{pct}%</span>
  </span>
</a>
