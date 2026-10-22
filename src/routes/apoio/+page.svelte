<!-- ============================================================
     Apoio: a proposta de parceria.

     Não é a mesa. A mesa é de dia, de papel, e quem está nela veio
     estudar; aqui é de noite, em cianótipo, e quem chega veio
     decidir se entra.

     A página era uma planta de expansão com lotes à venda. Virou uma
     proposta com três níveis, pela estrutura que páginas de parceria
     usam porque ela funciona: níveis nomeados, uma tabela que compara
     os três, e um selo que o parceiro leva para o próprio site.

     O que ela não tem, e é de propósito: depoimento. Ninguém apoia o
     site ainda, e prova social inventada é a única coisa aqui que
     seria mentira. No lugar dela está a ressalva embaixo da tabela —
     o que a parceria não promete, dito antes de perguntarem.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { NIVEIS, COMPARACAO } from "$lib/apoio/niveis.js";
  import { enviar } from "$lib/apoio/remoto.svelte.js";
  import "../apoio.css";

  const ficha = $state({
    empresa: "",
    pessoa: "",
    email: "",
    nivel: "",
    mensagem: "",
  });

  let situacao = $state("escrevendo");
  let falha = $state(null);

  async function mandar(evento) {
    evento.preventDefault();
    if (situacao === "enviando") return;
    situacao = "enviando";
    falha = await enviar(ficha);
    situacao = falha ? "escrevendo" : "recebido";
  }

  /* o foco vai para o recibo quando o formulário some: sem isto quem
     navega por teclado fica num elemento que deixou de existir, e
     quem usa leitor de tela não ouve que deu certo */
  let reciboEl = $state(null);
  $effect(() => {
    if (situacao === "recebido") reciboEl?.focus();
  });
</script>

<svelte:head>
  <title>Parcerias — Let's Learn Together</title>
  <meta
    name="description"
    content="Seja parceiro do Let's Learn Together: três níveis de parceria, o que cada um inclui, e como conversar com a equipe."
  />
</svelte:head>

<div class="folha">
  <nav class="topo" aria-label="Navegação principal">
    <a class="topo__marca" href="{base}/" data-sveltekit-reload>Let's Learn Together</a>
    <div class="topo__links">
      <a class="topo__saida" href="{base}/#como-funciona" data-sveltekit-reload>como funciona</a>
      <a class="topo__saida" href="{base}/#territorios" data-sveltekit-reload>trilhas</a>
      <a class="topo__saida" href="{base}/#planos" data-sveltekit-reload>planos</a>
      <a class="topo__saida topo__saida--ativo" href="{base}/parcerias" data-sveltekit-reload>parcerias</a>
    </div>
  </nav>

  <header class="hero">
    <h1 class="hero__titulo">Seja parceiro de quem você mesmo quer em sua empresa.</h1>
    <p class="hero__texto">
      Aprendizado para quem aprende sozinho, porque é nisso que a gente acredita. 
      Apoiar o projeto coloca a sua marca na frente de quem realmente resolve correr atrás; ou leva o conteúdo para dentro de casa, para treinar o próprio time.
    </p>
    <div class="hero__acoes">
      <a class="botao" href="#falar">Falar com a equipe</a>
      <a class="elo" href="#niveis">Ver os três níveis</a>
    </div>

    <!-- a rota: o desenho que o site usa para traçar um caminho de
         estudo, aqui traçando o caminho da conversa. É o único
         movimento da página — se traça uma vez e para. -->
    <div class="hero__rota" aria-hidden="true">
      <span class="hero__marco"></span><span class="hero__fio"></span>
      <span class="hero__marco"></span><span class="hero__fio"></span>
      <span class="hero__marco"></span><span class="hero__fio"></span>
    </div>
    <ol class="hero__passos">
      <li><b>Conversa</b> Alguns minutos para entender o que você quer alcançar.</li>
      <li><b>Desenho</b> Escolhemos juntos o nível, o conteúdo e o prazo.</li>
      <li><b>No ar</b> Publicamos, e você vê exatamente onde ficou.</li>
    </ol>
  </header>
</div>

<section class="secao secao--fundo" id="niveis">
  <div class="folha">
    <h2 class="secao__titulo">Três formas de entrar</h2>
    <p class="secao__intro">
      Cada nível inclui o anterior. A diferença entre eles é quanto do site
      passa a levar o seu nome e quanto trabalho a gente faz junto.
    </p>

    <ul class="niveis">
      {#each NIVEIS as nivel (nivel.id)}
        <li class="nivel" class:nivel--fundador={nivel.id === "fundador"}>
          <h3 class="nivel__nome">{nivel.nome}</h3>
          <p class="nivel__linha">{nivel.linha}</p>

          {#if nivel.id === "parceiro"}
            <!-- quem nunca viu o site chegava ao formulário sem saber o
                 que estava comprando: a página fala de "um roadmap"
                 várias vezes e nunca mostra um. O link fica no nível
                 que o vende. -->
            <p class="nivel__ver">
              <a class="elo" href="{base}/roadmap?trilha=ml" data-sveltekit-reload
                >Ver uma trilha pronta</a
              >
            </p>
          {/if}

          <p class="nivel__entrar">
            <b>Como entrar</b>
            {#if nivel.vagas}
              Enquanto houver vaga:
              <span class="nivel__vagas">{nivel.vagas} de {nivel.vagas} abertas</span>.
            {/if}
            {nivel.entrar}
          </p>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="secao">
  <div class="folha">
    <p class="rotulo">o que cada nível inclui</p>
    <h2 class="secao__titulo">A comparação, inteira</h2>

    <table class="comparacao">
      <thead>
        <tr>
          <th scope="col">Benefício</th>
          {#each NIVEIS as nivel (nivel.id)}
            <th scope="col" class="marca">{nivel.id === "fundador" ? "Fundador" : nivel.nome}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each COMPARACAO as linha (linha.o)}
          <tr>
            <th scope="row">{linha.o}</th>
            {#each NIVEIS as nivel (nivel.id)}
              {@const valor = linha[nivel.id]}
              <td
                class="marca"
                data-nivel={nivel.id === "fundador" ? "Fundador" : nivel.nome}
              >
                {#if valor === "depois"}
                  <span class="depois">depois</span>
                {:else if valor}
                  <!-- o glifo diz o estado pela forma, para quem vê; a
                       palavra escondida diz o mesmo para quem ouve. Sem
                       ela a tabela é lida como "quadrado", 27 vezes. -->
                  <span class="tem" aria-hidden="true">■</span>
                  <span class="leitura">incluído</span>
                {:else}
                  <span class="nao" aria-hidden="true">□</span>
                  <span class="leitura">não incluído</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="secao secao--fundo">
  <div class="folha">
    <div class="selo-area">
      <div>
        <p class="rotulo">o selo</p>
        <h2 class="secao__titulo">Um carimbo que você leva com você</h2>
        <p class="secao__intro" style="margin-bottom:0">
          Todo parceiro recebe o selo para usar no próprio site, na página de
          carreiras ou no material de recrutamento. Ele diz que a sua empresa
          opta por material de estudo aberto, que é uma coisa
          concreta de se dizer para quem você quer contratar.
        </p>
      </div>

      <div>
        <div class="selo">
          <!-- o desenho é a rota subindo: os mesmos três marcos que as
               cartas do site traçam. Num selo, cada quadrado aceso
               precisa ser uma afirmação. -->
          <div class="selo__desenho" aria-hidden="true">
            <span class="selo__pixel"></span>
            <span class="selo__pixel"></span>
            <span class="selo__pixel selo__pixel--aceso"></span>
            <span class="selo__pixel"></span>
            <span class="selo__pixel selo__pixel--aceso"></span>
            <span class="selo__pixel"></span>
            <span class="selo__pixel selo__pixel--aceso"></span>
            <span class="selo__pixel"></span>
            <span class="selo__pixel"></span>
          </div>
          <span class="selo__texto">
            <b>Apoiador</b>
            <span>Let's Learn Together</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="secao" id="falar">
  <div class="folha">
    <p class="rotulo">conversar</p>
    <h2 class="secao__titulo">Falar com a equipe</h2>
    <p class="secao__intro">
      Conte o que você tem em mente. Respondemos no e-mail que você deixar,
      normalmente em até dois dias.
    </p>

    {#if situacao === "recebido"}
      <p class="recibo" role="status" tabindex="-1" bind:this={reciboEl}>
        <b>Mensagem enviada.</b>
        Respondemos no e-mail que você deixou, normalmente em até dois dias.
      </p>
    {:else}
      <form class="ficha" onsubmit={mandar}>
        <div class="campos">
          <p class="campo">
            <label for="empresa">empresa</label>
            <input id="empresa" bind:value={ficha.empresa} required
                   maxlength="120" autocomplete="organization" />
          </p>
          <p class="campo">
            <label for="pessoa">quem fala</label>
            <input id="pessoa" bind:value={ficha.pessoa} required
                   maxlength="120" autocomplete="name" />
          </p>
          <p class="campo">
            <label for="email">e-mail</label>
            <input id="email" type="email" bind:value={ficha.email} required
                   maxlength="160" autocomplete="email" />
          </p>
          <p class="campo">
            <label for="nivel">nível de interesse</label>
            <!-- "" é a primeira opção e vira nulo no banco: "ainda não
                 sei" é a resposta honesta de quem chegou hoje, e
                 obrigar a escolher faria a pessoa chutar -->
            <select id="nivel" bind:value={ficha.nivel}>
              <option value="">Ainda não sei</option>
              {#each NIVEIS as nivel (nivel.id)}
                <option value={nivel.id}>{nivel.nome}</option>
              {/each}
            </select>
          </p>
          <p class="campo campo--longo">
            <label for="mensagem">o que você tem em mente</label>
            <textarea id="mensagem" rows="4" maxlength="4000"
                      bind:value={ficha.mensagem}></textarea>
          </p>
        </div>

        {#if falha}
          <p class="ficha__falha" role="alert">{falha}</p>
        {/if}

        <div class="ficha__pe">
          <button class="botao" type="submit" disabled={situacao === "enviando"}>
            {situacao === "enviando" ? "Enviando" : "Falar com a equipe"}
          </button>
          <span class="ficha__nota">
            Guardamos isto só para responder.
            <a class="elo" href="{base}/privacidade" data-sveltekit-reload>Privacidade</a>
          </span>
        </div>
      </form>
    {/if}
  </div>
</section>
