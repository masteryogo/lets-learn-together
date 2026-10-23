<script>
  import { base } from "$app/paths";
  import NavegacaoConta from "$lib/conta/NavegacaoConta.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { carregarConexaoGitHub, githubRemoto } from "$lib/github/remoto.svelte.js";

  import "$lib/estilos/base.css";
  import "./perfil.css";

  $effect(() => sessao.iniciar());
  $effect(() => {
    if (sessao.conectado) carregarConexaoGitHub();
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
