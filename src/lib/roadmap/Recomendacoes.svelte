<script>
  import { base } from "$app/paths";

  let { itens = [], indice = {}, trilha } = $props();

  function tituloDoTopico(item) {
    return indice[item.topicoId]?.topico?.titulo ?? item.atividadeTitulo;
  }
</script>

{#if itens.length}
  <aside class="recomendacoes" aria-labelledby="recomendacoes-titulo">
    <header>
      <p>ANTES DE AVANÇAR</p>
      <h2 id="recomendacoes-titulo">Vale reforçar alguns pontos.</h2>
      <span>Isso não bloqueia sua trilha — é uma sugestão baseada na sua prática mais recente.</span>
    </header>
    <ul>
      {#each itens.slice(0, 3) as item (item.topicoId)}
        <li>
          <div>
            <strong>{tituloDoTopico(item)}</strong>
            <p>A última tentativa em “{item.atividadeTitulo}” ainda precisa de revisão.</p>
          </div>
          <a href="{base}/atividades?trilha={trilha}&topico={item.topicoId}" data-sveltekit-reload>Revisar prática →</a>
        </li>
      {/each}
    </ul>
  </aside>
{/if}
