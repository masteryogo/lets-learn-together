<script>
  import { base } from "$app/paths";

  let { atual } = $props();
</script>

<nav class="navegacao-conta" aria-label="Área da conta">
  <a href="{base}/perfil" data-sveltekit-reload aria-current={atual === "perfil" ? "page" : null}>Perfil</a>
  <a href="{base}/configuracoes" data-sveltekit-reload aria-current={atual === "configuracoes" ? "page" : null}>Configurações</a>
</nav>

<style>
  .navegacao-conta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    padding: 0.45rem;
    border: 1px solid var(--borda-sutil);
    background: var(--fundo);
  }

  a {
    padding: 0.5rem 0.7rem;
    color: var(--texto-suave);
    font-size: var(--t-micro);
    letter-spacing: var(--tracking-rotulo);
    text-decoration: none;
  }

  a:hover { color: var(--texto); }
  a[aria-current="page"] { color: var(--tinta-roxo); background: var(--roxo-forte); }
  a:focus-visible { outline: 2px solid var(--roxo-forte); outline-offset: 2px; }
</style>
