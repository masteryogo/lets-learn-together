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
    /* enquanto o servidor não responde: sem isto, dois cliques viram
       dois cadastros, e o segundo volta como "já existe conta" */
    ocupado = false,
    /* só os passos de entrar e criar oferecem provedores sociais:
       confirmar e-mail ou trocar senha não são portas de entrada */
    aoGoogle = null,
    aoGitHub = null,
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

<!-- {#key} força a remontagem a cada passo: sem isso o navegador
     reaproveita os mesmos nós e a animação de entrada nunca roda -->
{#key passo.titulo}
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
        {recado.tom === "bom"
          ? MARCAS.feito
          : recado.tom === "ruim"
            ? MARCAS.pulado
            : MARCAS.estudando}
      </span>
      <span>{recado.texto}</span>
    </p>
  {:else if passo.avisa}
    <p class="recado">
      <span class="recado__marca" aria-hidden="true">{MARCAS.estudando}</span>
      <span>{passo.avisa}</span>
    </p>
  {/if}

  <button
    class="botao botao--principal"
    type="submit"
    disabled={ocupado}
    aria-busy={ocupado ? "true" : "false"}
  >
    {#if ocupado}
      <!-- três blocos acendendo em sequência: é o relógio do projeto,
           que não tem curva nem giro para fazer roda dentada -->
      <span class="espera" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="oculto-visual">Enviando…</span>
    {:else}
      {passo.acao}
    {/if}
  </button>

  {#if aoGoogle}
    <p class="ficha__ou" aria-hidden="true">ou</p>
    <button class="botao ficha__google" type="button" disabled={ocupado} onclick={aoGoogle}>
      <!-- a marca do Google nas cores dela: logo de terceiro não se
           redesenha em pixel, mesmo num site que é todo em pixel -->
      <svg viewBox="0 0 48 48" aria-hidden="true" width="16" height="16">
        <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.5 6.6-16.3z" />
        <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.3 15.4 46 24 46z" />
        <path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.7H4.5C2.9 17 2 20.4 2 24s.9 7 2.5 10.1l7.3-5.7z" />
        <path fill="#EA4335" d="M24 10.6c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.7 4.5 13.9l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
      </svg>
      Entrar com Google
    </button>
  {/if}

  {#if aoGitHub}
    <button class="botao ficha__social" type="button" disabled={ocupado} onclick={aoGitHub}>
      <!-- a marca mantém o botão reconhecível como a outra porta social,
           sem carregar uma imagem de terceiro só para um ícone vetorial. -->
      <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.8c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
      Entrar com GitHub
    </button>
  {/if}

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
{/key}
