<!-- ============================================================
     O convite a entrar, quando alguém tenta marcar sem conta.

     Ele não autentica: explica por que o gesto não valeu e leva para
     /conta, que é onde o fluxo inteiro mora. Um segundo formulário
     de acesso seria um segundo lugar para corrigir a mesma regra.

     O Google entra por aqui direto, sem passar por /conta: é um
     clique, não um formulário, e mandar a pessoa para outra tela
     para dar um clique seria caminho longo demais.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { sessao } from "$lib/conta/Sessao.svelte.js";

  let { aberto = false, aoFechar } = $props();

  let indo = $state(false);
  let erro = $state(null);

  async function comGoogle() {
    indo = true;
    erro = await sessao.entrarComGoogle();
    /* no caso feliz a página já foi embora; chegar aqui com erro é a
       recusa imediata — provedor desligado, por exemplo */
    indo = false;
  }
</script>

<div class="modal" hidden={!aberto}>
  <div class="modal__veu" onclick={aoFechar} aria-hidden="true"></div>
  <div
    class="modal__caixa"
    role="dialog"
    aria-modal="true"
    aria-labelledby="convite-titulo"
    aria-describedby="convite-texto"
  >
    <h2 class="modal__titulo" id="convite-titulo">Entre para marcar</h2>
    <p class="modal__texto" id="convite-texto">
      Ajude o Obi a acompanhar
      você em qualquer aparelho
    </p>

    <div class="convite">
      <!-- data-sveltekit-reload: a tela de conta tem folha própria -->
      <a
        class="botao botao--destaque convite__entrar"
        href="{base}/conta"
        data-sveltekit-reload
      >
        Entrar ou criar conta
      </a>

      <button
        class="botao convite__google"
        type="button"
        disabled={indo}
        onclick={comGoogle}
      >
        <!-- a marca do Google, nas cores dela: logo de terceiro não se
             redesenha em pixel, mesmo num site que é todo em pixel -->
        <svg viewBox="0 0 48 48" aria-hidden="true" width="16" height="16">
          <path
            fill="#4285F4"
            d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.5 6.6-16.3z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.9 0 10.9-2 14.5-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.3 15.4 46 24 46z"
          />
          <path
            fill="#FBBC05"
            d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.7H4.5C2.9 17 2 20.4 2 24s.9 7 2.5 10.1l7.3-5.7z"
          />
          <path
            fill="#EA4335"
            d="M24 10.6c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.7 4.5 13.9l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"
          />
        </svg>
        Entrar com Google
      </button>

      {#if erro}
        <p class="convite__erro" role="status">{erro}</p>
      {/if}

      <button class="botao convite__depois" type="button" onclick={aoFechar}>
        Agora não
      </button>
    </div>
  </div>
</div>
