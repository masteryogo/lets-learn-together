<script>
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import {
    abrirInstalacaoGitHub,
    carregarConexaoGitHub,
    carregarRepositoriosGitHub,
    escolherRepositorioGitHub,
    confirmarConexaoGitHub,
    desconectarGitHub,
    githubRemoto,
  } from "./remoto.svelte.js";

  let usuarioAnterior = $state(null);
  let recado = $state(null);
  let retornoProcessado = $state(false);
  let escolhendoRepositorio = $state(false);
  let repositorioEscolhido = $state("");

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

  async function confirmarInstalacaoExistente() {
    recado = await confirmarConexaoGitHub();
    if (!recado) recado = "GitHub conectado. Agora escolha o repositório do seu portfólio.";
  }

  async function abrirEscolha() {
    recado = await carregarRepositoriosGitHub();
    escolhendoRepositorio = !recado;
  }

  async function guardarRepositorio() {
    if (!repositorioEscolhido) {
      recado = "Escolha um repositório para continuar.";
      return;
    }
    recado = await escolherRepositorioGitHub(repositorioEscolhido);
    if (!recado) {
      escolhendoRepositorio = false;
      recado = "Repositório escolhido. Cada publicação continuará pedindo sua confirmação.";
    }
  }

  async function desconectar() {
    if (!confirm("Desconectar o GitHub desta conta? Seus arquivos já publicados não serão apagados.")) return;
    recado = await desconectarGitHub();
    if (!recado) recado = "GitHub desconectado desta conta. Seus arquivos publicados continuam no repositório.";
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
    <div class="github__estado" data-tom="bom" role="status">
      Conectado como <strong>@{githubRemoto.conexao.conta_login}</strong>.
      {#if githubRemoto.conexao.repositorio_completo}
        Repositório: <strong>{githubRemoto.conexao.repositorio_completo}</strong>{githubRemoto.conexao.branch ? ` · ${githubRemoto.conexao.branch}` : ""}.
        <div class="github__acoes">
          <button class="botao botao--secundario" type="button" onclick={abrirEscolha}>Trocar repositório</button>
          <button class="elo" type="button" onclick={desconectar}>Desconectar GitHub</button>
        </div>
      {:else}
        Escolha um repositório antes de publicar uma atividade.
        <button class="botao botao--secundario" type="button" onclick={abrirEscolha}>Escolher repositório</button>
      {/if}
      {#if escolhendoRepositorio}
        <label class="github__seletor">Repositório autorizado
          <select bind:value={repositorioEscolhido}>
            <option value="">Escolha um repositório…</option>
            {#each githubRemoto.repositorios as repositorio}
              <option value={repositorio.id}>{repositorio.nome}{repositorio.privado ? " · privado" : ""}</option>
            {/each}
          </select>
        </label>
        {#if githubRemoto.repositorios.length === 0}<p class="github__estado">Nenhum repositório pessoal disponível. Adicione um repositório à instalação da integração no GitHub.</p>{/if}
        <button class="botao botao--secundario" type="button" disabled={!githubRemoto.repositorios.length} onclick={guardarRepositorio}>Usar este repositório</button>
      {/if}
      {#if recado}<p class="github__estado" role="status">{recado}</p>{/if}
    </div>
  {:else}
    <p class="github__estado">
      Conecte um repositório seu para decidir, atividade por atividade, o que entra no seu portfólio.
      Nada é publicado automaticamente.
    </p>
    <button class="botao botao--secundario" type="button" onclick={conectar}>
      {githubRemoto.identidadeVinculada ? "Instalar integração GitHub" : "Vincular minha conta GitHub"}
    </button>
    {#if githubRemoto.identidadeVinculada}
      <button class="elo github__confirmar" type="button" onclick={confirmarInstalacaoExistente}>Já instalei a integração</button>
    {/if}
    {#if recado}<p class="github__estado" role="status">{recado}</p>{/if}
  {/if}
</section>
