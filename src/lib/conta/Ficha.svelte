<!-- ============================================================
     A ficha de acesso: o formulário de um passo do fluxo.

     Um componente para os seis passos, e não seis formulários quase
     iguais: o que muda entre eles é dado (fluxo.js), não markup. Os
     campos são desenhados pelo nome — a ficha sabe o que é um
     `email` e o que é um `codigo`; o fluxo não.

     Nada aqui autentica. O botão principal chama `aoConfirmar`, e
     quem responde é a página — hoje, só avançando o passo. Quando o
     Supabase entrar, é lá que ele entra, não aqui.
     ============================================================ -->
<script>
  import {
    CAMPOS,
    DIGITOS_DO_CODIGO,
    ROTULOS_DA_FORCA,
    VALIDADE_DO_CODIGO,
    forcaDaSenha,
  } from "./fluxo.js";
  import { MARCAS } from "$lib/roadmap/Progresso.svelte.js";

  let {
    passo,
    dados = $bindable(),
    erro = null,
    recado = null,
    aoConfirmar,
    aoIr,
    aoGesto,
    aoFechar,
  } = $props();

  const forca = $derived(forcaDaSenha(dados.senhaNova));

  /* os dígitos vivem como um array e não como string: cada caixa é um
     input, e um índice vazio no meio precisa continuar vazio em vez de
     a string se fechar sozinha */
  let digitos = $state(Array(DIGITOS_DO_CODIGO).fill(""));

  $effect(() => {
    dados.codigo = digitos.join("");
  });

  function aoDigitar(ev, i) {
    const so = ev.target.value.replace(/\D/g, "").slice(-1);
    digitos[i] = so;
    ev.target.value = so;
    if (so) foco(i + 1);
  }

  /* apagar numa caixa vazia volta para a anterior: sem isso é preciso
     mirar o cursor em cada caixa para corrigir um dígito */
  function aoApagar(ev, i) {
    if (ev.key === "Backspace" && !digitos[i]) foco(i - 1);
  }

  /* colar o código inteiro é o gesto mais comum de quem veio do
     e-mail, e ele chega numa caixa só */
  function aoColar(ev) {
    const texto = (ev.clipboardData?.getData("text") ?? "").replace(/\D/g, "");
    if (!texto) return;
    ev.preventDefault();
    digitos = Array.from(
      { length: DIGITOS_DO_CODIGO },
      (_, i) => texto[i] ?? ""
    );
    foco(Math.min(texto.length, DIGITOS_DO_CODIGO - 1));
  }

  function foco(i) {
    document.getElementById(`codigo-${i}`)?.focus();
  }
</script>

<form
  class="ficha"
  onsubmit={(ev) => {
    ev.preventDefault();
    aoConfirmar();
  }}
>
  <h1 class="ficha__titulo">{passo.titulo}</h1>
  <p class="ficha__linha">{passo.linha}</p>

  {#if passo.campos.length}
    <div class="campos">
      {#each passo.campos as nome}
        {@const campo = CAMPOS[nome]}

        {#if campo.caixas}
          <div class="campo">
            <span class="campo__rotulo" id="rotulo-codigo">{campo.rotulo}</span>
            <div class="codigo" role="group" aria-labelledby="rotulo-codigo">
              {#each digitos as digito, i}
                <input
                  class="codigo__caixa"
                  id="codigo-{i}"
                  inputmode="numeric"
                  autocomplete={i === 0 ? "one-time-code" : "off"}
                  maxlength="1"
                  aria-label="Dígito {i + 1} de {DIGITOS_DO_CODIGO}"
                  data-cheia={digito ? "sim" : null}
                  value={digito}
                  oninput={(ev) => aoDigitar(ev, i)}
                  onkeydown={(ev) => aoApagar(ev, i)}
                  onpaste={aoColar}
                />
              {/each}
            </div>
            <span class="campo__ajuda">
              O código vale por {VALIDADE_DO_CODIGO}.
            </span>
          </div>
        {:else}
          <label class="campo" data-erro={erro?.campo === nome ? "sim" : null}>
            <span class="campo__rotulo">{campo.rotulo}</span>
            <input
              class="campo__entrada"
              type={campo.tipo}
              inputmode={campo.modo}
              autocomplete={campo.completar}
              bind:value={dados[nome]}
              onfocus={() => campo.fecha && aoFechar(true)}
              onblur={() => campo.fecha && aoFechar(false)}
            />

            {#if campo.medidor}
              <!-- as mesmas células da barra de progresso do mapa: a
                   força é quantas estão acesas, e o rótulo diz o que
                   isso quer dizer para quem não vê cor -->
              <span class="medidor">
                <span class="medidor__barra" aria-hidden="true">
                  {#each { length: 4 } as _, i}
                    <span class="medidor__celula" data-cheia={i < forca ? "sim" : null}></span>
                  {/each}
                </span>
                <span>{dados.senhaNova ? ROTULOS_DA_FORCA[forca] : ""}</span>
              </span>
            {/if}

            {#if erro?.campo === nome}
              <span class="campo__ajuda">{erro.texto}</span>
            {:else if campo.ajuda}
              <span class="campo__ajuda">{campo.ajuda}</span>
            {/if}
          </label>
        {/if}
      {/each}
    </div>
  {/if}

  {#if recado}
    <p class="recado" data-tom={recado.tom} role="status">
      <span class="recado__marca" aria-hidden="true">
        {recado.tom === "bom" ? MARCAS.feito : MARCAS.estudando}
      </span>
      <span>{recado.texto}</span>
    </p>
  {:else if passo.avisa}
    <p class="recado">
      <span class="recado__marca" aria-hidden="true">{MARCAS.estudando}</span>
      <span>{passo.avisa}</span>
    </p>
  {/if}

  <button class="botao botao--principal" type="submit">{passo.acao}</button>

  {#if passo.elos.length}
    <div class="ficha__pe">
      {#each passo.elos as elo}
        <span class="ficha__elo-par">
          {#if elo.antes}<span>{elo.antes}</span>{/if}
          <button
            class="elo"
            type="button"
            onclick={() => (elo.gesto ? aoGesto(elo.gesto) : aoIr(elo.passo))}
          >
            {elo.rotulo}
          </button>
        </span>
      {/each}
    </div>
  {/if}
</form>
