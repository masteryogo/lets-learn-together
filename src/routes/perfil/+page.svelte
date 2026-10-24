<script>
  import { base } from "$app/paths";
  import NavegacaoConta from "$lib/conta/NavegacaoConta.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { carregarConexaoGitHub, githubRemoto } from "$lib/github/remoto.svelte.js";
  import { carregarResumoPerfil, perfilRemoto } from "$lib/perfil/remoto.svelte.js";

  import "$lib/estilos/base.css";
  import "./perfil.css";

  $effect(() => sessao.iniciar());
  $effect(() => {
    if (sessao.conectado) {
      carregarConexaoGitHub();
      carregarResumoPerfil();
    }
  });
</script>

<svelte:head>
  <title>Perfil — Let's Learn Together</title>
  <meta name="description" content="Seu perfil de aprendizado e portfólio no Let's Learn Together." />
</svelte:head>

<main class="area-conta">
  {#if sessao.carregando}
    <p class="area-conta__carregando" role="status">Abrindo seu perfil…</p>
  {:else if !sessao.conectado}
    <section class="area-conta__vazio">
      <p class="area-conta__sobretitulo">SUA ÁREA</p>
      <h1>Seu perfil começa quando você entra.</h1>
      <p>Entre para guardar atividades, progresso e seu portfólio opcional.</p>
      <a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>Entrar na conta</a>
    </section>
  {:else}
    <header class="perfil-cabecalho">
      <p class="area-conta__sobretitulo">SEU ESPAÇO DE APRENDIZADO</p>
      <h1>{sessao.nome}</h1>
      <p>{sessao.usuario.email}</p>
      <NavegacaoConta atual="perfil" />
    </header>

    <section class="perfil-grade" aria-label="Resumo do perfil">
      {#if perfilRemoto.ultimaFalha}
        <p class="perfil-aviso" role="status">{perfilRemoto.ultimaFalha}</p>
      {:else if perfilRemoto.carregando}
        <p class="perfil-aviso" role="status">Atualizando sua evolução…</p>
      {:else if perfilRemoto.resumo}
        <article class="perfil-cartao perfil-cartao--metricas">
          <p class="perfil-cartao__rotulo">EVOLUÇÃO REAL</p>
          <h2>Seu avanço até aqui</h2>
          <div class="perfil-metricas">
            <p><strong>{perfilRemoto.resumo.topicosFeitos}</strong><span>tópicos concluídos</span></p>
            <p><strong>{perfilRemoto.resumo.atividadesAprovadas}</strong><span>atividades aprovadas</span></p>
            <p><strong>{perfilRemoto.resumo.competenciasDemonstradas}</strong><span>competências demonstradas</span></p>
          </div>
          {#if perfilRemoto.resumo.topicosEstudando}<p class="perfil-cartao__nota">Você tem {perfilRemoto.resumo.topicosEstudando} tópico{perfilRemoto.resumo.topicosEstudando === 1 ? "" : "s"} em estudo.</p>{/if}
        </article>

        <article class="perfil-cartao perfil-cartao--avancos">
          <p class="perfil-cartao__rotulo">ÚLTIMOS AVANÇOS</p>
          <h2>Atividades aprovadas</h2>
          {#if perfilRemoto.resumo.ultimosAvancos.length}
            <ul class="perfil-lista">
              {#each perfilRemoto.resumo.ultimosAvancos as atividade}
                <li><span>■</span><div><strong>{atividade.titulo}</strong><small>{atividade.trilha ? `${atividade.trilha} · ` : ""}{atividade.data}</small></div></li>
              {/each}
            </ul>
          {:else}
            <p>A primeira atividade aprovada aparece aqui.</p>
          {/if}
          <a href="{base}/atividades" data-sveltekit-reload>Ir para atividades →</a>
        </article>

        <article class="perfil-cartao perfil-cartao--publicacoes">
          <p class="perfil-cartao__rotulo">GITHUB · HISTÓRICO</p>
          <h2>Publicações suas</h2>
          {#if perfilRemoto.resumo.publicacoes.length}
            <ul class="perfil-lista">
              {#each perfilRemoto.resumo.publicacoes as publicacao}
                <li><span>↗</span><div><a href={publicacao.url} target="_blank" rel="noreferrer">{publicacao.atividade_titulo}</a><small>{publicacao.repositorio_completo} · {publicacao.data}</small></div></li>
              {/each}
            </ul>
          {:else}
            <p>Quando você publicar uma atividade, o histórico aparecerá aqui.</p>
          {/if}
        </article>
      {/if}

      <article class="perfil-cartao perfil-cartao--identidade">
        <p class="perfil-cartao__rotulo">IDENTIDADE</p>
        <h2>Esta é sua conta.</h2>
        <p>Suas atividades e marcas de estudo ficam associadas a este e-mail, para seguirem com você entre aparelhos.</p>
        <a href="{base}/roadmap" data-sveltekit-reload>Continuar aprendendo →</a>
      </article>

      <article class="perfil-cartao perfil-cartao--portfolio">
        <p class="perfil-cartao__rotulo">PORTFÓLIO</p>
        <h2>GitHub</h2>
        {#if githubRemoto.carregando}
          <p>Conferindo seu portfólio…</p>
        {:else if githubRemoto.ultimaFalha}
          <p class="perfil-cartao__falha">{githubRemoto.ultimaFalha}</p>
        {:else if githubRemoto.conexao?.repositorio_completo}
          <p>Publicações manuais vão para <strong>{githubRemoto.conexao.repositorio_completo}</strong>.</p>
          <a href="{base}/configuracoes" data-sveltekit-reload>Gerenciar integração →</a>
        {:else if githubRemoto.conexao}
          <p>Seu GitHub está conectado. Falta decidir qual repositório recebe suas publicações.</p>
          <a href="{base}/configuracoes" data-sveltekit-reload>Escolher repositório →</a>
        {:else}
          <p>Você decide atividade por atividade o que quer publicar. Nada entra no GitHub automaticamente.</p>
          <a href="{base}/configuracoes" data-sveltekit-reload>Conectar GitHub →</a>
        {/if}
      </article>
    </section>
  {/if}
</main>
