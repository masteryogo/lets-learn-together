<!-- ============================================================
     Uma peça do estojo: calendário ou notas.

     Não é trilha — não tem rota, não tem progresso e o Obi não
     passeia até ela. No lugar da rota mostra em miniatura o que a
     pessoa vai encontrar do outro lado, desenhado em var(--rota),
     que aqui é a cor da peça e não a de uma trilha.

     O carimbo é a faixa colorida do topo. Chegou a prever um texto
     ("escopo"), que nunca foi preenchido — ficou sendo o que de
     fato é: uma tarja que separa a peça da carta de trilha.
     ============================================================ -->
<script>
  let { peca, Desenho, aoSair } = $props();

  let indo = $state(false);

  function clicar(ev) {
    /* mesma regra das trilhas: modificador ou botão do meio é pedido
       de nova aba, e aí quem anima seria a aba errada */
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
      return;
    }
    ev.preventDefault();
    indo = true;
    aoSair(peca.href);
  }
</script>

<a
  class="carta carta--peca carta--{peca.id}"
  class:carta--indo={indo}
  href={peca.href}
  data-sveltekit-reload
  aria-label={peca.rotulo}
  onclick={clicar}
>
  <span class="carta__carimbo"><span></span></span>
  <span class="carta__nome">{peca.nome}</span>
  <span class="carta__quadro"><Desenho /></span>
  <span class="carta__rodape"><span>{peca.rodape}</span></span>
</a>
