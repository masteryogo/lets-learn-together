<script>
  import { base } from "$app/paths";
  import NavegacaoConta from "$lib/conta/NavegacaoConta.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import ConexaoGitHub from "$lib/github/Conexao.svelte";

  import "$lib/estilos/base.css";
  import "./configuracoes.css";

  let senha = $state("");
  let repetirSenha = $state("");
  let recado = $state(null);
  let salvando = $state(false);

  $effect(() => sessao.iniciar());

  async function trocarSenha() {
    if (senha.length < 8) {
      recado = { tom: "ruim", texto: "A nova senha precisa ter ao menos 8 caracteres." };
      return;
    }
    if (senha !== repetirSenha) {
      recado = { tom: "ruim", texto: "As duas senhas estão diferentes." };
      return;
    }
    salvando = true;
    const falha = await sessao.trocarSenha(senha);
    salvando = false;
    recado = falha ? { tom: "ruim", texto: falha } : { tom: "bom", texto: "Senha atualizada. As outras sessões foram encerradas." };
    if (!falha) {
      senha = "";
      repetirSenha = "";
    }
  }

  async function sair() {
    await sessao.sair();
    location.href = `${base}/conta`;
  }
</script>

<svelte:head>
  <title>Configurações — Let's Learn Together</title>
  <meta name="description" content="Segurança e integrações da sua conta no Let's Learn Together." />
</svelte:head>

<main class="configuracoes">
  {#if sessao.carregando}
    <p class="configuracoes__carregando" role="status">Abrindo suas configurações…</p>
  {:else if !sessao.conectado}
    <section class="configuracoes__vazio">
      <p class="configuracoes__sobretitulo">SUA ÁREA</p>
      <h1>Entre para acessar suas configurações.</h1>
      <a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>Entrar na conta</a>
    </section>
  {:else}
    <header class="configuracoes__cabecalho">
      <p class="configuracoes__sobretitulo">CONTA · {sessao.nome}</p>
      <h1>Configurações</h1>
      <p>Segurança e conexões que você controla.</p>
      <NavegacaoConta atual="configuracoes" />
    </header>

    <div class="configuracoes__grade">
      <section class="configuracoes__secao" aria-labelledby="seguranca">
        <p class="configuracoes__sobretitulo">SEGURANÇA</p>
        <h2 id="seguranca">Trocar senha</h2>
        <p class="configuracoes__descricao">Use uma senha nova de pelo menos 8 caracteres. Por segurança, as outras sessões serão encerradas.</p>
        <label>Nova senha<input type="password" autocomplete="new-password" bind:value={senha} /></label>
        <label>Repita a nova senha<input type="password" autocomplete="new-password" bind:value={repetirSenha} /></label>
        <button class="botao botao--destaque" type="button" disabled={salvando} onclick={trocarSenha}>{salvando ? "Atualizando…" : "Atualizar senha"}</button>
        {#if recado}<p class="configuracoes__recado" data-tom={recado.tom} role="status">{recado.texto}</p>{/if}
      </section>

      <section class="configuracoes__secao configuracoes__secao--github" aria-label="Integração GitHub">
        <ConexaoGitHub />
      </section>

      <section class="configuracoes__secao configuracoes__secao--perigo" aria-labelledby="sessao">
        <p class="configuracoes__sobretitulo">SESSÃO</p>
        <h2 id="sessao">Sair desta conta</h2>
        <p class="configuracoes__descricao">Seu progresso continua salvo. Você poderá entrar novamente quando quiser.</p>
        <button class="botao" type="button" onclick={sair}>Sair</button>
      </section>
    </div>
  {/if}
</main>
