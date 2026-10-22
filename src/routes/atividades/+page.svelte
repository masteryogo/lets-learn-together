<script>
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import Canto from "$lib/Canto.svelte";
  import Atalho from "$lib/conta/Atalho.svelte";
  import AvisoFalha from "$lib/conta/AvisoFalha.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { carregarTrilha } from "$lib/trilhas.js";
  import { atividadesRemotas, enviarTentativa, listarAtividades } from "$lib/atividades/remoto.svelte.js";
  import "./atividades.css";
  import "$lib/estilos/base.css";

  const trilhaId = $derived(page.url.searchParams.get("trilha") ?? "");
  const topicoId = $derived(page.url.searchParams.get("topico") ?? "");
  let topico = $state(null);
  let atividades = $state([]);
  let carregando = $state(true);
  let falha = $state(null);
  let respostas = $state({});
  let resultados = $state({});

  $effect(() => {
    if (!trilhaId || !topicoId) {
      carregando = false;
      falha = "Escolha uma atividade a partir de um tópico do roadmap.";
      return;
    }
    let vivo = true;
    carregando = true;
    falha = null;
    Promise.all([carregarTrilha(trilhaId), listarAtividades(trilhaId, topicoId)])
      .then(([trilha, lista]) => {
        if (!vivo) return;
        for (const etapa of trilha.ROADMAP.etapas) {
          for (const grupo of etapa.grupos) {
            const achado = grupo.topicos.find((item) => item.id === topicoId);
            if (achado) topico = achado;
          }
        }
        if (!topico) throw new Error("Não encontrei este tópico na trilha.");
        atividades = lista;
      })
      .catch((erro) => { if (vivo) falha = erro.message; })
      .finally(() => { if (vivo) carregando = false; });
    return () => (vivo = false);
  });

  function definir(atividadeId, valor) {
    respostas = { ...respostas, [atividadeId]: valor };
  }

  function respostaDa(atividade) {
    const atual = respostas[atividade.id] ?? {};
    if (atividade.tipo === "saida") return { texto: atual.texto ?? "" };
    if (atividade.tipo === "completar") return { lacunas: atual.lacunas ?? {} };
    return { alternativas: atual.alternativas ?? [] };
  }

  function alternarAlternativa(atividade, id) {
    const atual = respostaDa(atividade).alternativas;
    const multipla = atividade.configuracao.multipla;
    definir(atividade.id, {
      alternativas: multipla
        ? (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id])
        : [id],
    });
  }

  async function enviar(atividade) {
    const tentativa = await enviarTentativa(atividade.id, respostaDa(atividade));
    if (tentativa) resultados = { ...resultados, [atividade.id]: tentativa };
  }
</script>

<svelte:head><title>Praticar · Let's Learn Together</title></svelte:head>

<main class="atividades">
  <Canto />
  <Atalho />
  <a class="atividades__voltar" href="{base}/roadmap?trilha={trilhaId}" data-sveltekit-reload>← Voltar ao roadmap</a>

  {#if carregando}
    <p class="atividades__estado">Carregando atividades…</p>
  {:else if falha}
    <section class="atividades__vazio"><h1>Não consegui abrir a prática</h1><p>{falha}</p></section>
  {:else}
    <header class="atividades__cabecalho">
      <p class="etiqueta">Prática guiada</p>
      <h1>{topico.titulo}</h1>
      <p>Responder é diferente de só ler: cada tentativa mostra o porquê do resultado.</p>
    </header>

    {#if !sessao.carregando && !sessao.conectado}
      <section class="atividades__convite"><p>Entre na conta para enviar respostas e guardar suas tentativas.</p><a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>Entrar</a></section>
    {/if}

    {#if atividades.length === 0}
      <section class="atividades__vazio"><h2>A prática deste tópico está chegando</h2><p>O conteúdo já pode ser estudado no roadmap. Este tópico ainda não recebeu uma atividade.</p></section>
    {/if}

    {#each atividades as atividade (atividade.id)}
      {@const resposta = respostaDa(atividade)}
      {@const resultado = resultados[atividade.id]}
      <article class="atividade" data-tipo={atividade.tipo}>
        <p class="etiqueta">{atividade.tipo} · {atividade.dificuldade}</p>
        <h2>{atividade.titulo}</h2>
        <p class="atividade__enunciado">{atividade.enunciado}</p>
        {#if atividade.configuracao.codigo}<pre class="atividade__codigo"><code>{atividade.configuracao.codigo}</code></pre>{/if}

        {#if atividade.tipo === "quiz" || atividade.tipo === "erro"}
          <div class="atividade__alternativas">
            {#each atividade.configuracao.alternativas as alternativa}
              <label><input type={atividade.configuracao.multipla ? "checkbox" : "radio"} name={atividade.id} checked={resposta.alternativas.includes(alternativa.id)} onchange={() => alternarAlternativa(atividade, alternativa.id)} /> {alternativa.texto}</label>
            {/each}
          </div>
        {:else if atividade.tipo === "saida"}
          <label class="atividade__campo">{atividade.configuracao.rotuloResposta}<input value={resposta.texto} oninput={(evento) => definir(atividade.id, { texto: evento.currentTarget.value })} /></label>
        {:else if atividade.tipo === "completar"}
          {#each atividade.configuracao.lacunas as lacuna}
            <label class="atividade__campo">{lacuna.rotulo}<input value={resposta.lacunas[lacuna.id] ?? ""} oninput={(evento) => definir(atividade.id, { lacunas: { ...resposta.lacunas, [lacuna.id]: evento.currentTarget.value } })} /></label>
          {/each}
        {/if}

        <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Corrigindo…" : "Verificar resposta"}</button>
        {#if resultado}<p class="atividade__resultado" data-correta={resultado.correta ? "sim" : "nao"}><strong>{resultado.correta ? "Correto." : "Tente de novo."}</strong> {resultado.feedback}</p>{/if}
      </article>
    {/each}
  {/if}
</main>

<AvisoFalha falha={atividadesRemotas.ultimaFalha} />
