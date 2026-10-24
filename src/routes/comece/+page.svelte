<script>
  import { base } from "$app/paths";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { carregarOnboarding, onboardingRemoto, salvarOnboarding } from "$lib/onboarding/remoto.svelte.js";

  import "$lib/estilos/base.css";
  import "./comece.css";

  const OBJETIVOS = [
    ["primeiro-emprego", "Conquistar meu primeiro emprego"],
    ["transicao", "Mudar ou encontrar minha área"],
    ["trabalho", "Evoluir no trabalho atual"],
    ["projetos", "Criar projetos próprios"],
    ["curso", "Acompanhar faculdade ou curso"],
    ["explorar", "Explorar tecnologia sem pressa"],
  ];
  const EXPERIENCIAS = [
    ["comecando", "Estou começando do zero"],
    ["basico", "Já estudei alguns fundamentos"],
    ["projetos", "Já construí alguns projetos"],
    ["profissional", "Já trabalho com tecnologia"],
  ];
  const CAMINHOS = [
    ["papel", "Carreira e papel", "Quero entender áreas como Frontend, Backend, DevOps, Dados ou Segurança."],
    ["tecnologia", "Tecnologia e ferramenta", "Quero ir direto para uma linguagem, framework, banco ou ferramenta."],
    ["fundamentos", "Fundamentos", "Quero fortalecer bases como lógica, Git, algoritmos ou arquitetura."],
    ["explorar", "Ainda estou explorando", "Quero ver possibilidades antes de escolher um caminho."],
  ];
  const RITMOS = [
    ["ate-2", "Até 2 horas", "Uma sessão curta por semana."],
    ["2-a-5", "2 a 5 horas", "Um ritmo leve e consistente."],
    ["5-a-8", "5 a 8 horas", "Espaço para teoria e prática."],
    ["mais-8", "Mais de 8 horas", "Quero acelerar a jornada."],
  ];

  let etapa = $state(0);
  let busca = $state("");
  let categoria = $state("todas");
  let finalizado = $state(false);
  let respostas = $state({ objetivo: null, experiencia: null, tipoCaminho: null, interesses: [], ritmo: null });

  const categorias = $derived(["todas", ...new Set(onboardingRemoto.trilhas.map((trilha) => trilha.categoria || "outras"))]);
  const trilhasVisiveis = $derived(onboardingRemoto.trilhas.filter((trilha) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (categoria === "todas" || (trilha.categoria || "outras") === categoria)
      && (!termo || trilha.rotulo.toLocaleLowerCase("pt-BR").includes(termo));
  }));
  const trilhaInicial = $derived(onboardingRemoto.trilhas.find((trilha) => trilha.id === respostas.interesses[0]) ?? null);

  $effect(() => sessao.iniciar());
  $effect(() => {
    if (!sessao.conectado) return;
    carregarOnboarding().then((falha) => {
      if (falha || !onboardingRemoto.perfil?.onboarding_concluido_em) return;
      const dados = onboardingRemoto.perfil.onboarding ?? {};
      respostas = {
        objetivo: dados.objetivo ?? null,
        experiencia: dados.experiencia ?? null,
        tipoCaminho: dados.tipoCaminho ?? null,
        interesses: Array.isArray(dados.interesses) ? dados.interesses : [],
        ritmo: dados.ritmo ?? null,
      };
      finalizado = true;
    });
  });

  function proxima() { etapa = Math.min(4, etapa + 1); }
  function anterior() { etapa = Math.max(0, etapa - 1); }
  function alternarInteresse(id) {
    if (respostas.interesses.includes(id)) {
      respostas = { ...respostas, interesses: respostas.interesses.filter((interesse) => interesse !== id) };
    } else if (respostas.interesses.length < 3) {
      const interesses = [...respostas.interesses, id];
      respostas = { ...respostas, interesses };
      if (interesses.length === 3) etapa = 4;
    }
  }
  async function concluir() {
    const falha = await salvarOnboarding(respostas);
    if (!falha) finalizado = true;
  }
</script>

<svelte:head>
  <title>Comece por você — Let's Learn Together</title>
  <meta name="description" content="Escolha seu ponto de partida no Let's Learn Together." />
</svelte:head>

<main class="comece">
  {#if sessao.carregando || onboardingRemoto.carregando}
    <p class="comece__carregando" role="status">Preparando seus caminhos…</p>
  {:else if !sessao.conectado}
    <section class="comece__painel">
      <p class="comece__sobretitulo">SEU PONTO DE PARTIDA</p>
      <h1>Entre para escolher seu caminho.</h1>
      <a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>Entrar na conta</a>
    </section>
  {:else if finalizado}
    <section class="comece__painel comece__painel--final">
      <p class="comece__sobretitulo">SEU CAMINHO ESTÁ PRONTO</p>
      <h1>{trilhaInicial ? `Comece por ${trilhaInicial.rotulo}.` : "Explore no seu ritmo."}</h1>
      <p>Suas escolhas podem mudar. Você poderá atualizá-las em Configurações quando quiser.</p>
      {#if trilhaInicial}
        <a class="botao botao--destaque" href="{base}/roadmap?trilha={trilhaInicial.id}" data-sveltekit-reload>Abrir trilha sugerida</a>
      {:else}
        <a class="botao botao--destaque" href="{base}/" data-sveltekit-reload>Explorar trilhas</a>
      {/if}
      <a class="comece__elo" href="{base}/configuracoes" data-sveltekit-reload>GitHub é opcional · configurar depois</a>
    </section>
  {:else}
    <section class="comece__painel">
      <header class="comece__cabecalho">
        <p class="comece__sobretitulo">COMECE POR VOCÊ</p>
        <p>{etapa + 1} de 5 · leva menos de um minuto</p>
      </header>

      {#if etapa === 0}
        <h1>O que você quer conquistar agora?</h1>
        <div class="comece__opcoes">
          {#each OBJETIVOS as [id, rotulo]}
            <button class:selecionada={respostas.objetivo === id} type="button" onclick={() => { respostas = { ...respostas, objetivo: id }; proxima(); }}>{rotulo}</button>
          {/each}
        </div>
      {:else if etapa === 1}
        <h1>Em que ponto você está?</h1>
        <div class="comece__opcoes">
          {#each EXPERIENCIAS as [id, rotulo]}
            <button class:selecionada={respostas.experiencia === id} type="button" onclick={() => { respostas = { ...respostas, experiencia: id }; proxima(); }}>{rotulo}</button>
          {/each}
        </div>
      {:else if etapa === 2}
        <h1>Como prefere encontrar seu caminho?</h1>
        <div class="comece__opcoes">
          {#each CAMINHOS as [id, rotulo, descricao]}
            <button class:selecionada={respostas.tipoCaminho === id} type="button" onclick={() => { respostas = { ...respostas, tipoCaminho: id }; proxima(); }}><strong>{rotulo}</strong><span>{descricao}</span></button>
          {/each}
        </div>
      {:else if etapa === 3}
        <h1>O que você quer explorar primeiro?</h1>
        <p class="comece__linha">Escolha até 3 interesses. Esta lista acompanha as trilhas publicadas no LLT.</p>
        <input class="comece__busca" type="search" placeholder="Buscar tecnologia, papel ou área…" bind:value={busca} />
        <div class="comece__filtros" aria-label="Filtrar interesses">
          {#each categorias as item}
            <button class:selecionada={categoria === item} type="button" onclick={() => categoria = item}>{item === "todas" ? "Todas" : item}</button>
          {/each}
        </div>
        <div class="comece__trilhas">
          {#each trilhasVisiveis as trilha}
            <button class:selecionada={respostas.interesses.includes(trilha.id)} type="button" disabled={!respostas.interesses.includes(trilha.id) && respostas.interesses.length >= 3} onclick={() => alternarInteresse(trilha.id)}>{trilha.rotulo}</button>
          {:else}
            <p>Nenhuma trilha encontrada. Você pode seguir sem escolher agora.</p>
          {/each}
        </div>
      {:else}
        <h1>Quanto tempo cabe na sua semana?</h1>
        <div class="comece__opcoes">
          {#each RITMOS as [id, rotulo, descricao]}
            <button class:selecionada={respostas.ritmo === id} type="button" onclick={() => respostas = { ...respostas, ritmo: id }}><strong>{rotulo}</strong><span>{descricao}</span></button>
          {/each}
        </div>
      {/if}

      {#if onboardingRemoto.ultimaFalha}<p class="comece__falha" role="status">{onboardingRemoto.ultimaFalha}</p>{/if}
      <footer class="comece__acoes">
        {#if etapa > 0}<button class="comece__elo" type="button" onclick={anterior}>Voltar</button>{/if}
        {#if etapa < 4}
          {#if etapa === 3 && respostas.interesses.length > 0}
            <button class="botao botao--destaque" type="button" onclick={proxima}>Continuar</button>
          {:else}
            <button class="comece__elo" type="button" onclick={proxima}>Pular por enquanto</button>
          {/if}
        {:else}
          <button class="botao botao--destaque" type="button" disabled={onboardingRemoto.salvando} onclick={concluir}>{onboardingRemoto.salvando ? "Guardando…" : "Ver minha sugestão"}</button>
        {/if}
      </footer>
    </section>
  {/if}
</main>
