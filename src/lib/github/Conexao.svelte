<script>
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import {
    abrirInstalacaoGitHub,
    carregarConexaoGitHub,
    confirmarConexaoGitHub,
    githubRemoto,
  } from "./remoto.svelte.js";

  let usuarioAnterior = $state(null);
  let recado = $state(null);
  let retornoProcessado = $state(false);

  $effect(() => {
    const usuarioId = sessao.usuario?.id ?? null;
    if (usuarioId === usuarioAnterior) return;
    usuarioAnterior = usuarioId;
    recado = null;
    carregarConexaoGitHub();
  });

  $effect(() => {
    if (retornoProcessado || !sessao.conectado) return;
    const url = new URL(location.href);
    const instalacaoId = url.searchParams.get("installation_id");
    if (!instalacaoId) return;
    retornoProcessado = true;
    url.searchParams.delete("installation_id");
    url.searchParams.delete("setup_action");
    history.replaceState(null, "", url);
    confirmarConexaoGitHub(instalacaoId).then((falha) => {
      recado = falha ?? "GitHub conectado. Agora escolha o repositório do seu portfólio.";
    });
  });

  async function conectar() {
    if (!githubRemoto.identidadeVinculada) {
      recado = await sessao.vincularGitHub();
      return;
    }
    recado = abrirInstalacaoGitHub();
  }
</script>

<section class="github" aria-labelledby="github-titulo">
  <p class="github__sobretitulo">PORTFÓLIO OPCIONAL</p>
  <h2 id="github-titulo">GitHub</h2>

  {#if githubRemoto.carregando}
    <p class="github__estado" role="status">Conferindo sua conexão…</p>
  {:else if githubRemoto.ultimaFalha}
    <p class="github__estado" data-tom="ruim" role="status">{githubRemoto.ultimaFalha}</p>
  {:else if githubRemoto.conexao}
    <p class="github__estado" data-tom="bom" role="status">
      Conectado como <strong>@{githubRemoto.conexao.conta_login}</strong>.
      {#if githubRemoto.conexao.repositorio_completo}
        Repositório: <strong>{githubRemoto.conexao.repositorio_completo}</strong>{githubRemoto.conexao.branch ? ` · ${githubRemoto.conexao.branch}` : ""}.
      {:else}
        Escolha um repositório antes de publicar uma atividade.
      {/if}
    </p>
  {:else}
    <p class="github__estado">
      Conecte um repositório seu para decidir, atividade por atividade, o que entra no seu portfólio.
      Nada é publicado automaticamente.
    </p>
    <button class="botao botao--secundario" type="button" onclick={conectar}>
      {githubRemoto.identidadeVinculada ? "Instalar integração GitHub" : "Vincular minha conta GitHub"}
    </button>
    {#if recado}<p class="github__estado" role="status">{recado}</p>{/if}
  {/if}
</section>
