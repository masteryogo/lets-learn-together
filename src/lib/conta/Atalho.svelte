<!-- ============================================================
     O botão de conta das telas de casca escura.

     Deslogado é um link para /conta. Logado vira menu: perfil, sair
     e — onde a tela oferecer — zerar o progresso. Zerar mora aqui
     porque é ação sobre o que a conta guarda, e não sobre o mapa
     que está na frente; quem não passa `aoZerar` não mostra o item.

     Enquanto a sessão é desconhecida ele não aparece: as telas são
     pré-renderizadas, e um "Entrar" no HTML estático piscaria para
     quem já tem conta.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { sessao } from "$lib/conta/Sessao.svelte.js";

  /* a tela passa o que fazer ao zerar, e quantas marcas existem —
     item que apaga nada é item que mente sobre ter o que apagar */
  let { aoZerar = null, marcados = 0 } = $props();

  $effect(() => sessao.iniciar());

  let aberto = $state(false);
  let caixa = $state(null);

  const rotulo = $derived(
    sessao.conectado ? `Conta de ${sessao.nome}` : "Entrar na conta"
  );

  /* fechar no clique fora e no Escape: menu que só fecha no próprio
     botão prende quem abriu por engano */
  $effect(() => {
    if (!aberto) return;
    const fora = (ev) => {
      if (!caixa?.contains(ev.target)) aberto = false;
    };
    const tecla = (ev) => {
      if (ev.key === "Escape") aberto = false;
    };
    addEventListener("pointerdown", fora);
    addEventListener("keydown", tecla);
    return () => {
      removeEventListener("pointerdown", fora);
      removeEventListener("keydown", tecla);
    };
  });

  async function sair() {
    aberto = false;
    await sessao.sair();
  }
</script>

{#if !sessao.carregando}
  <div class="conta-menu" bind:this={caixa}>
    {#if sessao.conectado}
      <button
        class="botao botao--icone conta-atalho"
        type="button"
        data-conectado="sim"
        aria-expanded={aberto}
        aria-haspopup="menu"
        title={rotulo}
        aria-label={rotulo}
        onclick={() => (aberto = !aberto)}
      >
        <!-- busto: cabeça quadrada e ombros em degrau -->
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="6" y="2" width="4" height="4" />
          <rect x="5" y="8" width="6" height="1" />
          <rect x="4" y="9" width="8" height="1" />
          <rect x="3" y="10" width="10" height="4" />
        </svg>
      </button>

      {#if aberto}
        <div class="conta-menu__lista" role="menu">
          <p class="conta-menu__quem">{sessao.nome}</p>

          <!-- data-sveltekit-reload: a tela de conta tem folha própria -->
          <a
            class="conta-menu__item"
            role="menuitem"
            href="{base}/perfil"
            data-sveltekit-reload
          >
            Perfil
          </a>

          <a
            class="conta-menu__item"
            role="menuitem"
            href="{base}/configuracoes"
            data-sveltekit-reload
          >
            Configurações
          </a>

          {#if aoZerar}
            <button
              class="conta-menu__item conta-menu__item--perigo"
              role="menuitem"
              type="button"
              disabled={marcados === 0}
              onclick={() => {
                aberto = false;
                aoZerar();
              }}
            >
              {marcados ? "Zerar progresso" : "Nada marcado para zerar"}
            </button>
          {/if}

          <button
            class="conta-menu__item"
            role="menuitem"
            type="button"
            onclick={sair}
          >
            Sair
          </button>
        </div>
      {/if}
    {:else}
      <a
        class="botao botao--icone conta-atalho"
        href="{base}/conta"
        data-sveltekit-reload
        title={rotulo}
        aria-label={rotulo}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="6" y="2" width="4" height="4" />
          <rect x="5" y="8" width="6" height="1" />
          <rect x="4" y="9" width="8" height="1" />
          <rect x="3" y="10" width="10" height="4" />
        </svg>
      </a>
    {/if}
  </div>
{/if}
