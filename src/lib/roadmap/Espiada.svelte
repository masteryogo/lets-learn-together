<!-- ============================================================
     A espiada: outra tela do site, vista sem sair desta.

     Por que um iframe, e não os componentes da outra tela montados
     aqui: cada tela carrega a própria folha global, e duas no mesmo
     documento fazem uma vencer a outra — é a razão de toda travessia
     daqui ser `data-sveltekit-reload`. O iframe é um documento
     separado, então o isolamento vem de graça; e, sendo a mesma
     origem, a sessão do Supabase (que mora no localStorage) já está
     lá dentro.

     Dois tamanhos, porque o uso é diferente: a espiada confere algo
     sem perder o lugar no mapa; aumentada, ela vira a tela de
     trabalho até você fechar. E continua havendo a porta de saída
     para abrir de verdade, em documento próprio.
     ============================================================ -->
<script>
  let { aberto = false, titulo = "", url = "", aoFechar } = $props();

  let amplo = $state(false);
  let quadro = $state(null);

  /* o iframe só nasce quando a espiada abre: montado antes, ele
     baixaria a outra tela inteira em toda visita ao roadmap */
  const fonte = $derived(aberto ? url : null);

  $effect(() => {
    if (!aberto) return;
    const tecla = (ev) => {
      if (ev.key === "Escape") aoFechar();
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  });

  /* fechar devolve o tamanho pequeno: a próxima espiada é uma
     espiada, não a herança da anterior */
  $effect(() => {
    if (!aberto) amplo = false;
  });
</script>

<div class="espiada" hidden={!aberto} data-amplo={amplo ? "sim" : null}>
  <div class="espiada__veu" onclick={aoFechar} aria-hidden="true"></div>

  <div class="espiada__caixa" role="dialog" aria-modal="true" aria-label={titulo}>
    <div class="espiada__barra">
      <span class="espiada__titulo">{titulo}</span>

      <span class="espiada__acoes">
        <button
          class="botao botao--icone"
          type="button"
          aria-pressed={amplo}
          title={amplo ? "Diminuir" : "Aumentar"}
          aria-label={amplo ? "Diminuir" : "Aumentar"}
          onclick={() => (amplo = !amplo)}
        >
          <!-- setas para os cantos: o mesmo desenho serve aos dois
               sentidos, girado pelo CSS quando já está ampliado -->
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="1" y="1" width="6" height="2" />
            <rect x="1" y="1" width="2" height="6" />
            <rect x="9" y="13" width="6" height="2" />
            <rect x="13" y="9" width="2" height="6" />
          </svg>
        </button>

        <!-- data-sveltekit-reload: abrir de verdade é documento novo,
             pela mesma razão que trouxe o iframe para cá -->
        <a
          class="botao botao--icone"
          href={url}
          data-sveltekit-reload
          title="Abrir a tela inteira"
          aria-label="Abrir a tela inteira"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="7" y="1" width="8" height="2" />
            <rect x="13" y="1" width="2" height="8" />
            <rect x="6" y="6" width="2" height="2" />
            <rect x="8" y="4" width="2" height="2" />
            <rect x="10" y="2" width="2" height="2" />
            <rect x="1" y="5" width="2" height="10" />
            <rect x="1" y="13" width="10" height="2" />
          </svg>
        </a>

        <button
          class="botao botao--icone"
          type="button"
          title="Fechar"
          aria-label="Fechar"
          onclick={aoFechar}>×</button
        >
      </span>
    </div>

    {#if fonte}
      <iframe class="espiada__quadro" src={fonte} title={titulo} bind:this={quadro}
      ></iframe>
    {/if}
  </div>
</div>
