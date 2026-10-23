<script>
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import Canto from "$lib/Canto.svelte";
  import AvisoFalha from "$lib/conta/AvisoFalha.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { carregarTrilha } from "$lib/trilhas.js";
  import EditorCodigo from "$lib/atividades/EditorCodigo.svelte";
  import { atividadesRemotas, acionarDesafio, avaliarProjeto, enviarTentativa, listarAcompanhamento, listarAtividades, listarRascunhos, obterArquivoProjeto } from "$lib/atividades/remoto.svelte.js";
  import "./atividades.css";
  import "$lib/estilos/base.css";

  const trilhaId = $derived(page.url.searchParams.get("trilha") ?? "");
  const topicoId = $derived(page.url.searchParams.get("topico") ?? "");
  let topico = $state(null);
  let atividades = $state([]);
  let carregando = $state(true);
  let falha = $state(null);
  let respostas = $state({});
  let arquivosProjetos = $state({});
  let resultados = $state({});
  let execucoes = $state({});
  let indiceEtapa = $state(0);
  let sequenciaConcluida = $state(false);
  let acompanhamento = $state({ competencias: [], vinculos: [], tentativas: [], submissoes: [] });
  let revisoes = $state({});
  let acompanhamentoCarregando = $state(false);
  let requisicaoAcompanhamento = 0;
  let atividadesSequenciais = $derived(atividades.filter((atividade) => atividade.tipo !== "projeto"));
  let atividadesComplementares = $derived(atividades.filter((atividade) => !["quiz", "erro"].includes(atividade.tipo)));
  let atividadeAtual = $derived(atividadesSequenciais[indiceEtapa] ?? null);
  let perguntaAtual = $derived(atividadeAtual && ["quiz", "erro"].includes(atividadeAtual.tipo) ? atividadeAtual : null);

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

  $effect(() => {
    if (carregando || sessao.carregando || !trilhaId || !topicoId) return;
    const usuarioId = sessao.usuario?.id ?? "anon";
    atividades.map((atividade) => atividade.id);
    if (!usuarioId) return;
    recarregarAcompanhamento();
  });

  $effect(() => {
    if (sessao.carregando || !sessao.conectado) return;
    const ids = atividades.filter((atividade) => atividade.tipo === "desafio").map((atividade) => atividade.id);
    if (!ids.length) return;
    let vivo = true;
    listarRascunhos(ids)
      .then((rascunhos) => {
        if (!vivo) return;
        const atuais = { ...respostas };
        for (const [id, codigo] of Object.entries(rascunhos)) {
          if (!atuais[id]) atuais[id] = { codigo };
        }
        respostas = atuais;
      })
      .catch((erro) => { if (vivo) atividadesRemotas.ultimaFalha = erro.message; });
    return () => (vivo = false);
  });

  function definir(atividadeId, valor) {
    respostas = { ...respostas, [atividadeId]: valor };
  }

  function selecionarArquivoProjeto(atividade, evento) {
    const arquivo = evento.currentTarget.files?.[0] ?? null;
    if (arquivo && (arquivo.size > 20 * 1024 * 1024 || !/\.zip$/i.test(arquivo.name))) {
      atividadesRemotas.ultimaFalha = "Envie um arquivo .zip de até 20 MB.";
      evento.currentTarget.value = "";
      arquivosProjetos = { ...arquivosProjetos, [atividade.id]: null };
      return;
    }
    atividadesRemotas.ultimaFalha = null;
    arquivosProjetos = { ...arquivosProjetos, [atividade.id]: arquivo };
  }

  function respostaDa(atividade) {
    const atual = respostas[atividade.id] ?? {};
    if (atividade.tipo === "saida") return { texto: atual.texto ?? "" };
    if (atividade.tipo === "completar") return { lacunas: atual.lacunas ?? {} };
    if (atividade.tipo === "desafio") return { codigo: atual.codigo ?? atividade.configuracao.codigoInicial ?? "" };
    if (atividade.tipo === "projeto") return {
      repositorio: atual.repositorio ?? "",
      resumo: atual.resumo ?? "",
      requisitos: atual.requisitos ?? [],
    };
    return { alternativas: atual.alternativas ?? [] };
  }

  function atualizarCodigo(atividade, codigo) {
    definir(atividade.id, { codigo });
    delete resultados[atividade.id];
    delete execucoes[atividade.id];
  }

  function alternarAlternativa(atividade, id) {
    const atual = respostaDa(atividade).alternativas;
    const multipla = atividade.configuracao.multipla;
    definir(atividade.id, {
      alternativas: multipla
        ? (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id])
        : [id],
    });
    delete resultados[atividade.id];
  }

  function definirLacuna(atividade, lacunaId, valor) {
    const atuais = respostaDa(atividade).lacunas;
    definir(atividade.id, { lacunas: { ...atuais, [lacunaId]: valor } });
    delete resultados[atividade.id];
  }

  function lacunasPreenchidas(atividade, resposta) {
    return atividade.configuracao.lacunas.every((lacuna) =>
      String(resposta.lacunas[lacuna.id] ?? "").trim().length > 0
    );
  }

  function partesDaPrevia(atividade, resposta) {
    const lacunas = atividade.configuracao.lacunas;
    const textoDaEscolha = (lacuna) =>
      lacuna.alternativas?.find((alternativa) => alternativa.id === resposta.lacunas[lacuna.id])?.texto;

    if (atividade.configuracao.codigo) {
      const partes = [];
      let restante = atividade.configuracao.codigo;
      for (const lacuna of lacunas) {
        const indice = restante.indexOf("___");
        if (indice < 0) break;
        const escolha = textoDaEscolha(lacuna);
        partes.push({ texto: restante.slice(0, indice), escolhida: false });
        partes.push({ texto: escolha ?? "_____", escolhida: Boolean(escolha) });
        restante = restante.slice(indice + 3);
      }
      partes.push({ texto: restante, escolhida: false });
      return partes;
    }

    return lacunas.flatMap((lacuna, indice) => {
      const frase = lacuna.rotulo ?? "Complete a frase";
      const escolha = textoDaEscolha(lacuna);
      const partes = frase.includes("___")
        ? [
            { texto: frase.slice(0, frase.indexOf("___")), escolhida: false },
            { texto: escolha ?? "_____", escolhida: Boolean(escolha) },
            { texto: frase.slice(frase.indexOf("___") + 3), escolhida: false },
          ]
        : [
            { texto: `${frase}: `, escolhida: false },
            { texto: escolha ?? "_____", escolhida: Boolean(escolha) },
          ];
      return indice < lacunas.length - 1 ? [...partes, { texto: "\n", escolhida: false }] : partes;
    });
  }

  async function confirmarPergunta(atividade) {
    await enviar(atividade);
  }

  function avancarEtapa() {
    if (indiceEtapa < atividadesSequenciais.length - 1) indiceEtapa += 1;
    else sequenciaConcluida = true;
  }

  function reiniciarSequencia() {
    for (const atividade of atividadesSequenciais) {
      delete resultados[atividade.id];
    }
    indiceEtapa = 0;
    sequenciaConcluida = false;
  }

  function alternarRequisito(atividade, id) {
    const requisitos = respostaDa(atividade).requisitos;
    definir(atividade.id, {
      ...respostaDa(atividade),
      requisitos: requisitos.includes(id) ? requisitos.filter((item) => item !== id) : [...requisitos, id],
    });
  }

  async function recarregarAcompanhamento() {
    const requisicao = ++requisicaoAcompanhamento;
    acompanhamentoCarregando = true;
    try {
      const dados = await listarAcompanhamento(
        trilhaId,
        topicoId,
        atividades.map((atividade) => atividade.id),
      );
      if (requisicao === requisicaoAcompanhamento) {
        acompanhamento = dados;
        atividadesRemotas.ultimaFalha = null;
      }
    } catch (erro) {
      if (requisicao === requisicaoAcompanhamento) atividadesRemotas.ultimaFalha = erro.message;
    } finally {
      if (requisicao === requisicaoAcompanhamento) acompanhamentoCarregando = false;
    }
  }

  function tentativasDa(atividadeId) {
    return acompanhamento.tentativas.filter((tentativa) => tentativa.atividade_id === atividadeId);
  }

  function tentativasAvaliadasDe(atividadeId) {
    return tentativasDa(atividadeId).filter((tentativa) =>
      tentativa.acao !== "executar" && !tentativa.detalhes?.falha
    );
  }

  function estadoDaSubmissao(tentativa) {
    if (tentativa.detalhes?.status === "aguardando_avaliacao") return "aguardando avaliação";
    if (tentativa.detalhes?.status === "revisar_e_reenviar") return "revisar e reenviar";
    if (tentativa.detalhes?.status === "aprovado") return "aprovado";
    return tentativa.correta ? "aprovado" : "em andamento";
  }

  function estadoDaAtividade(atividadeId) {
    const tentativas = tentativasAvaliadasDe(atividadeId);
    const pendente = tentativasDa(atividadeId).some((tentativa) => tentativa.detalhes?.status === "aguardando_avaliacao");
    if (pendente) return "aguardando avaliação";
    if (tentativas.some((tentativa) => tentativa.correta)) return "concluída";
    if (tentativas.length) return "em andamento";
    return "não iniciada";
  }

  let competenciasComProgresso = $derived.by(() => acompanhamento.competencias.map((competencia) => {
    const atividadesVinculadas = acompanhamento.vinculos
      .filter((vinculo) => vinculo.competencia_id === competencia.id)
      .map((vinculo) => vinculo.atividade_id)
      .filter((id) => atividades.some((atividade) => atividade.id === id));
    const aprovadas = atividadesVinculadas.filter((id) =>
      tentativasAvaliadasDe(id).some((tentativa) => tentativa.correta)
    ).length;
    const tentou = atividadesVinculadas.some((id) => tentativasAvaliadasDe(id).length > 0);
    const estado = atividadesVinculadas.length === 0
      ? "sem avaliação"
      : aprovadas === atividadesVinculadas.length
        ? "demonstrada"
        : tentou
          ? "em desenvolvimento"
          : "não iniciada";
    return { ...competencia, atividadesVinculadas, aprovadas, estado };
  }));

  function dataDaTentativa(valor) {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));
  }

  async function enviar(atividade) {
    if (atividade.tipo === "desafio") {
      const resposta = await acionarDesafio(atividade.id, respostaDa(atividade).codigo, "enviar");
      if (resposta?.tentativa) resultados = { ...resultados, [atividade.id]: resposta.tentativa };
      if (resposta?.tentativa) await recarregarAcompanhamento();
      return;
    }
    const tentativa = await enviarTentativa(atividade.id, respostaDa(atividade), arquivosProjetos[atividade.id] ?? null);
    if (tentativa) resultados = { ...resultados, [atividade.id]: tentativa };
    if (tentativa) await recarregarAcompanhamento();
  }

  async function revisarProjeto(tentativa, aprovada) {
    const revisao = revisoes[tentativa.id] ?? {};
    const nota = Number(revisao.pontuacao ?? 0);
    const avaliada = await avaliarProjeto(tentativa.id, aprovada, nota, revisao.feedback ?? "");
    if (avaliada) await recarregarAcompanhamento();
  }

  async function baixarProjeto(tentativa) {
    const aba = window.open("about:blank", "_blank");
    const url = await obterArquivoProjeto(tentativa.id);
    if (url && aba) aba.location.href = url;
    else aba?.close();
  }

  async function executar(atividade) {
    const resposta = await acionarDesafio(atividade.id, respostaDa(atividade).codigo, "executar");
    if (resposta?.execucao) execucoes = { ...execucoes, [atividade.id]: resposta.execucao };
    if (resposta?.execucao) await recarregarAcompanhamento();
  }
</script>

<svelte:head><title>Praticar · Let's Learn Together</title></svelte:head>

<main class="atividades">
  <nav class="atividades__barra" aria-label="Navegação da prática">
    <a class="atividades__voltar" href="{base}/roadmap?trilha={trilhaId}" data-sveltekit-reload>← Roadmap</a>
    <span class="atividades__marca">LET'S LEARN TOGETHER <span>/ PRÁTICA</span></span>
    <Canto />
  </nav>

  {#if carregando}
    <p class="atividades__estado">Carregando atividades…</p>
  {:else if falha}
    <section class="atividades__vazio"><h1>Não consegui abrir a prática</h1><p>{falha}</p></section>
  {:else}
    <header class="atividades__cabecalho">
      <p class="etiqueta">Trilha Python <span>·</span> prática guiada</p>
      <h1>{topico.titulo}</h1>
      <p>Resolva os exercícios e entenda o raciocínio por trás de cada resposta.</p>
    </header>

    {#if atividades.length === 0}
      <section class="atividades__vazio"><h2>A prática deste tópico está chegando</h2><p>O conteúdo já pode ser estudado no roadmap. Este tópico ainda não recebeu uma atividade.</p></section>
    {/if}

    {#if atividadesSequenciais.length > 0}
      <section class="quiz" aria-label="Quiz do tópico">
        {#if sequenciaConcluida}
          {@const aprovadas = atividadesSequenciais.filter((atividade) => resultados[atividade.id]?.correta).length}
          <div class="quiz__conclusao">
            <p class="quiz__sobretitulo">Sequência concluída</p>
            <h2>Você passou por {atividadesSequenciais.length} etapas práticas</h2>
            <p class="quiz__pontuacao">{aprovadas} de {atividadesSequenciais.length} aprovadas</p>
            <p>Revise as explicações ou refaça a sequência para praticar os conceitos deste tópico.</p>
            <button class="botao botao--destaque" type="button" onclick={reiniciarSequencia}>Refazer sequência</button>
          </div>
        {:else if perguntaAtual}
          {@const respostaQuiz = respostaDa(perguntaAtual)}
          {@const resultadoQuiz = resultados[perguntaAtual.id]}
          {@const tentativasQuiz = tentativasDa(perguntaAtual.id)}
          {@const formatoVerdadeiroFalso = perguntaAtual.configuracao.formato === "verdadeiro-falso"}
          <header class="quiz__progresso">
            <div><p class="quiz__sobretitulo">Etapa {indiceEtapa + 1} <span>de {atividadesSequenciais.length}</span></p><span>{perguntaAtual.dificuldade}</span></div>
            <progress value={indiceEtapa + 1} max={atividadesSequenciais.length} aria-label="Progresso da sequência"></progress>
          </header>
          <article class="quiz__cartao">
            <p class="quiz__tipo">{formatoVerdadeiroFalso ? "Verdadeiro ou falso" : "Múltipla escolha"} <span>·</span> {perguntaAtual.tipo === "erro" ? "identifique o erro" : "escolha a resposta"}</p>
            <h2>{perguntaAtual.titulo}</h2>
            <p class="quiz__enunciado">{perguntaAtual.enunciado}</p>
            {#if perguntaAtual.configuracao.codigo}<pre class="atividade__codigo"><code>{perguntaAtual.configuracao.codigo}</code></pre>{/if}
            <fieldset class="quiz__alternativas" aria-label="Alternativas da pergunta">
              {#each perguntaAtual.configuracao.alternativas as alternativa, indice}
                {@const selecionada = respostaQuiz.alternativas.includes(alternativa.id)}
                <label class:quiz__opcao--selecionada={selecionada} class:quiz__opcao--verdadeiro={formatoVerdadeiroFalso && alternativa.id === "verdadeiro"} class:quiz__opcao--falso={formatoVerdadeiroFalso && alternativa.id === "falso"}>
                  <input type={perguntaAtual.configuracao.multipla ? "checkbox" : "radio"} name={perguntaAtual.id} checked={selecionada} onchange={() => alternarAlternativa(perguntaAtual, alternativa.id)} />
                  {#if !formatoVerdadeiroFalso}<span class="quiz__letra">{String.fromCharCode(65 + indice)}</span>{/if}
                  <span>{alternativa.texto}</span>
                </label>
              {/each}
            </fieldset>
            {#if !sessao.carregando && !sessao.conectado}
              <p class="quiz__convite">Entre na conta para confirmar respostas e guardar seu progresso. <a href="{base}/conta" data-sveltekit-reload>Entrar</a></p>
            {/if}
            {#if resultadoQuiz}
              <div class="quiz__feedback" data-correta={resultadoQuiz.correta ? "sim" : "nao"} aria-live="polite">
                <strong>{resultadoQuiz.correta ? "Resposta correta" : "Não foi dessa vez"}</strong>
                <p>{resultadoQuiz.feedback}</p>
              </div>
            {/if}
            <footer class="quiz__acoes">
              <button class="botao botao--secundario" type="button" disabled={indiceEtapa === 0} onclick={() => indiceEtapa -= 1}>← Etapa anterior</button>
              {#if resultadoQuiz}
                <button class="botao botao--destaque" type="button" onclick={avancarEtapa}>{indiceEtapa === atividadesSequenciais.length - 1 ? "Concluir sequência" : "Próxima etapa →"}</button>
              {:else}
                <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || respostaQuiz.alternativas.length === 0 || atividadesRemotas.enviando} onclick={() => confirmarPergunta(perguntaAtual)}>{atividadesRemotas.enviando ? "Corrigindo…" : "Confirmar resposta"}</button>
              {/if}
            </footer>
          </article>
          {#if sessao.conectado}
            <details class="atividade__historico quiz__historico">
              <summary>Histórico desta pergunta <span>{tentativasQuiz.length}</span></summary>
              {#if tentativasQuiz.length}
                <ol>
                  {#each tentativasQuiz as tentativa (tentativa.id)}
                    <li data-correta={tentativa.correta ? "sim" : "nao"}><time datetime={tentativa.criada_em}>{dataDaTentativa(tentativa.criada_em)}</time><strong>{tentativa.correta ? "Resposta correta" : "Resposta incorreta"}</strong><span>{tentativa.pontuacao}%</span>{#if tentativa.feedback}<p>{tentativa.feedback}</p>{/if}</li>
                  {/each}
                </ol>
              {:else}<p class="atividade__historico-vazio">Suas tentativas desta pergunta aparecerão aqui.</p>{/if}
            </details>
          {/if}
        {/if}
      </section>
    {/if}

    {#if atividadesSequenciais.length > 0 && !sequenciaConcluida}
      {#if !perguntaAtual}
        <header class="quiz__progresso quiz__progresso--atividade">
          <div><p class="quiz__sobretitulo">Etapa {indiceEtapa + 1} <span>de {atividadesSequenciais.length} · {atividadeAtual?.tipo}</span></p><span>{atividadeAtual?.dificuldade}</span></div>
          <progress value={indiceEtapa + 1} max={atividadesSequenciais.length} aria-label="Progresso da sequência"></progress>
        </header>
      {/if}
    {/if}

    {#each atividadesComplementares.filter((item) => (!sequenciaConcluida && item.id === atividadeAtual?.id) || item.tipo === "projeto") as atividade (atividade.id)}
      {@const resposta = respostaDa(atividade)}
      {@const resultado = resultados[atividade.id]}
      {@const tentativas = tentativasDa(atividade.id)}
      {@const projetoAguardando = tentativas.some((tentativa) => tentativa.detalhes?.status === "aguardando_avaliacao")}
      <article class="atividade" class:atividade--projeto={atividade.tipo === "projeto"} class:atividade--completar={atividade.tipo === "completar"} data-tipo={atividade.tipo}>
        <section class="atividade__instrucao">
          <p class="atividade__tipo">{atividade.tipo} <span>·</span> {atividade.dificuldade}</p>
          {#if sessao.conectado}<p class="atividade__estado" data-estado={estadoDaAtividade(atividade.id)}>{estadoDaAtividade(atividade.id)}</p>{/if}
          <h2>{atividade.titulo}</h2>
          <p class="atividade__enunciado">{atividade.enunciado}</p>
          {#if atividade.configuracao.codigo && atividade.tipo !== "completar"}<pre class="atividade__codigo"><code>{atividade.configuracao.codigo}</code></pre>{/if}
          {#if atividade.tipo === "completar"}
            {@const partesPrevias = partesDaPrevia(atividade, resposta)}
            <div class="atividade__lacuna-previa" aria-live="polite">
              <p>Sua prévia</p>
              {#if atividade.configuracao.codigo}
                <pre><code>{#each partesPrevias as parte}<span class:atividade__lacuna-escolhida={parte.escolhida}>{parte.texto}</span>{/each}</code></pre>
              {:else}
                <p>{#each partesPrevias as parte}<span class:atividade__lacuna-escolhida={parte.escolhida}>{parte.texto}</span>{/each}</p>
              {/if}
            </div>
          {/if}
          {#if atividade.tipo === "projeto"}
            <div class="projeto__objetivo"><strong>Objetivo</strong><p>{atividade.configuracao.objetivo}</p></div>
            <h3>Requisitos do projeto</h3>
            <ol class="projeto__requisitos">
              {#each atividade.configuracao.requisitos as requisito}
                <li><strong>{requisito.titulo}</strong><span>{requisito.descricao}</span></li>
              {/each}
            </ol>
            <h3>Como será avaliado</h3>
            <ul class="projeto__criterios">
              {#each atividade.configuracao.criterios as criterio}
                <li><strong>{criterio.titulo}:</strong> {criterio.descricao}</li>
              {/each}
            </ul>
            <p class="atividade__salvamento">{atividade.configuracao.instrucoes}</p>
          {/if}
          {#if atividade.tipo === "desafio"}
            <div class="atividade__amostra"><p>Exemplo</p><code>Entrada: {atividade.configuracao.entradaExemplo}</code><code>Saída: {atividade.configuracao.saidaExemplo}</code></div>
            <p class="atividade__salvamento">Seu código é salvo ao executar ou avaliar a solução.</p>
          {/if}
        </section>

        <section class="atividade__resolucao" aria-label="Sua resposta">
          {#if atividade.tipo === "quiz" || atividade.tipo === "erro"}
            <div class="atividade__alternativas">
              {#each atividade.configuracao.alternativas as alternativa}
                <label><input type={atividade.configuracao.multipla ? "checkbox" : "radio"} name={atividade.id} checked={resposta.alternativas.includes(alternativa.id)} onchange={() => alternarAlternativa(atividade, alternativa.id)} /> {alternativa.texto}</label>
              {/each}
            </div>
          {:else if atividade.tipo === "saida"}
            <div class="saida__painel">
              <header class="saida__cabecalho"><span>Terminal Python</span><span>Previsão</span></header>
              <label class="saida__entrada">
                <span class="saida__rotulo">{atividade.configuracao.rotuloResposta}</span>
                <span class="saida__linha"><span aria-hidden="true">›</span><textarea rows="3" placeholder="Digite o que será exibido…" value={resposta.texto} oninput={(evento) => definir(atividade.id, { texto: evento.currentTarget.value })}></textarea></span>
              </label>
              <p>Considere exatamente o texto e as quebras de linha exibidas pelo programa.</p>
            </div>
          {:else if atividade.tipo === "completar"}
            {#each atividade.configuracao.lacunas as lacuna}
              {#if lacuna.alternativas?.length}
                <fieldset class="atividade__lacuna">
                  <legend>Escolha para preencher</legend>
                  <div class="atividade__lacuna-opcoes">
                    {#each lacuna.alternativas as alternativa}
                      <button class="atividade__lacuna-opcao" class:atividade__lacuna-opcao--selecionada={resposta.lacunas[lacuna.id] === alternativa.id} type="button" aria-pressed={resposta.lacunas[lacuna.id] === alternativa.id} onclick={() => definirLacuna(atividade, lacuna.id, alternativa.id)}>{alternativa.texto}</button>
                    {/each}
                  </div>
                </fieldset>
              {:else}
                <label class="atividade__campo">{lacuna.rotulo}<input value={resposta.lacunas[lacuna.id] ?? ""} oninput={(evento) => definirLacuna(atividade, lacuna.id, evento.currentTarget.value)} /></label>
              {/if}
            {/each}
            <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando || !lacunasPreenchidas(atividade, resposta)} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Corrigindo…" : "Verificar resposta"}</button>
          {:else if atividade.tipo === "projeto"}
            {#if !sessao.conectado}
              <p>Entre na sua conta para salvar o projeto e receber uma avaliação.</p>
            {:else}
              <label class="atividade__campo">Link público do repositório
                <input type="url" inputmode="url" placeholder="Opcional se você enviar o arquivo .zip" value={resposta.repositorio} oninput={(evento) => definir(atividade.id, { ...resposta, repositorio: evento.currentTarget.value })} />
              </label>
              <label class="projeto__upload">
                <strong>Arquivo do projeto <span>· opcional se informou o repositório</span></strong>
                <input type="file" accept=".zip,application/zip" onchange={(evento) => selecionarArquivoProjeto(atividade, evento)} />
                <small>Envie seu projeto compactado em .zip (até 20 MB). O arquivo fica privado e só você e a equipe de revisão podem acessá-lo.</small>
                {#if arquivosProjetos[atividade.id]}<span class="projeto__arquivo">{arquivosProjetos[atividade.id].name} · {(arquivosProjetos[atividade.id].size / 1024 / 1024).toFixed(1)} MB</span>{/if}
              </label>
              <label class="atividade__campo">Conte o que você construiu e aprendeu
                <textarea maxlength={atividade.configuracao.limiteResumo} rows="5" value={resposta.resumo} oninput={(evento) => definir(atividade.id, { ...resposta, resumo: evento.currentTarget.value })}></textarea>
              </label>
              <fieldset class="projeto__autoavaliacao"><legend>O que você conseguiu verificar?</legend>
                {#each atividade.configuracao.requisitos as requisito}
                  <label><input type="checkbox" checked={resposta.requisitos.includes(requisito.id)} onchange={() => alternarRequisito(atividade, requisito.id)} /> <span>{requisito.titulo}</span></label>
                {/each}
              </fieldset>
              {#if projetoAguardando}<p class="atividade__salvamento">Seu projeto já está na fila de avaliação. Você poderá enviar uma nova versão quando receber o feedback.</p>{/if}
              <button class="botao botao--destaque" type="button" disabled={atividadesRemotas.enviando || projetoAguardando} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Enviando…" : projetoAguardando ? "Aguardando avaliação" : "Enviar para avaliação"}</button>
              {#if resultado}<p class="atividade__resultado" data-correta={resultado.correta ? "sim" : "nao"}><strong>Projeto {estadoDaSubmissao(resultado)}.</strong> {resultado.feedback}</p>{/if}
            {/if}
          {:else if atividade.tipo === "desafio"}
            <div class="atividade__editor-cabecalho"><span>Editor <code>Python</code></span><span>Seu código</span></div>
            <EditorCodigo codigo={resposta.codigo} aoAlterar={(codigo) => atualizarCodigo(atividade, codigo)} rotulo="Editor do desafio Python" />
            <div class="atividade__acoes">
              <button class="botao botao--secundario" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando} onclick={() => executar(atividade)}>{atividadesRemotas.enviando ? "Executando…" : "▶ Executar"}</button>
              <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Testando…" : "Avaliar solução"}</button>
            </div>
            <div class="atividade__saida">
              <p>CONSOLE <span>·</span> TESTES</p>
              {#if execucoes[atividade.id]}<section class="atividade__console" aria-live="polite"><strong>Execução · {execucoes[atividade.id].estado}</strong>{#if execucoes[atividade.id].saida}<pre>{execucoes[atividade.id].saida}</pre>{/if}{#if execucoes[atividade.id].erro}<p>Mensagem de erro</p><pre>{execucoes[atividade.id].erro}</pre>{/if}{#if !execucoes[atividade.id].saida && !execucoes[atividade.id].erro}<p>O programa não produziu saída.</p>{/if}</section>{:else if resultado}<p class="atividade__saida-vazia">Resultado dos testes aparece aqui após avaliar a solução.</p>{:else}<p class="atividade__saida-vazia">Execute seu código para ver a saída.</p>{/if}
              {#if resultado}<section class="atividade__testes" aria-live="polite"><p class="atividade__resultado" data-correta={resultado.correta ? "sim" : "nao"}><strong>{resultado.correta ? "Solução aprovada." : `${resultado.pontuacao}% dos testes passaram.`}</strong> {resultado.feedback}</p><ul>{#each resultado.detalhes.testes ?? [] as teste}<li data-aprovado={teste.aprovado ? "sim" : "nao"}>Teste {teste.numero}: {teste.aprovado ? "passou" : teste.estado}</li>{/each}</ul></section>{/if}
            </div>
          {:else}
            <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando || (atividade.tipo === "completar" && !lacunasPreenchidas(atividade, resposta))} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Corrigindo…" : "Verificar resposta"}</button>
          {/if}
          {#if resultado && atividade.tipo !== "desafio"}<p class="atividade__resultado" data-correta={resultado.correta ? "sim" : "nao"}><strong>{resultado.correta ? "Correto." : "Tente de novo."}</strong> {resultado.feedback}</p>{/if}
        </section>
        {#if sessao.conectado}
          <details class="atividade__historico">
            <summary>Histórico de tentativas <span>{tentativas.length}</span></summary>
            {#if tentativas.length}
              <p class="atividade__historico-nota">Exibindo até 100 tentativas recentes.</p>
              <ol>
                {#each tentativas as tentativa (tentativa.id)}
                  {@const execucaoLivre = tentativa.acao === "executar"}
                  {@const falhaTecnica = tentativa.detalhes?.falha === true}
                  <li data-correta={tentativa.correta ? "sim" : "nao"} data-falha={falhaTecnica ? "sim" : "nao"}>
                    <time datetime={tentativa.criada_em}>{dataDaTentativa(tentativa.criada_em)}</time>
                    <strong>{falhaTecnica ? "Não avaliada · falha técnica" : execucaoLivre ? "Executou o código" : atividade.tipo === "projeto" ? `Projeto ${estadoDaSubmissao(tentativa)}` : tentativa.correta ? "Resposta aprovada" : "Precisa de revisão"}</strong>
                    {#if !execucaoLivre && !falhaTecnica}<span>{tentativa.pontuacao}%</span>{/if}
                    {#if tentativa.feedback}<p>{tentativa.feedback}</p>{/if}
                    {#if atividade.tipo === "projeto" && tentativa.resposta?.repositorio}<a href={tentativa.resposta.repositorio} target="_blank" rel="noreferrer">Abrir repositório ↗</a>{/if}
                    {#if atividade.tipo === "projeto" && tentativa.resposta?.arquivo}<button class="projeto__download" type="button" onclick={() => baixarProjeto(tentativa)}>Baixar arquivo enviado ↓</button>{/if}
                  </li>
                {/each}
              </ol>
            {:else}
              <p class="atividade__historico-vazio">Suas tentativas desta atividade aparecerão aqui.</p>
            {/if}
          </details>
        {/if}
        {#if atividade.tipo !== "projeto"}
          <footer class="quiz__acoes atividade__etapas">
            <button class="botao botao--secundario" type="button" disabled={indiceEtapa === 0} onclick={() => indiceEtapa -= 1}>← Etapa anterior</button>
            {#if resultado}
              <button class="botao botao--destaque" type="button" onclick={avancarEtapa}>{indiceEtapa === atividadesSequenciais.length - 1 ? "Concluir sequência" : "Próxima etapa →"}</button>
            {:else}
              <span>Confirme sua resposta para avançar.</span>
            {/if}
          </footer>
        {/if}
        {#if atividade.tipo === "projeto" && acompanhamento.ehAdministrador}
          {@const pendentes = acompanhamento.submissoes.filter((tentativa) => tentativa.atividade_id === atividade.id && tentativa.detalhes?.status === "aguardando_avaliacao")}
          <section class="projeto__fila" aria-label="Fila de avaliação de projetos">
            <h3>Revisão de projetos <span>{pendentes.length} pendentes</span></h3>
            {#if pendentes.length === 0}<p>Não há projetos aguardando revisão.</p>{/if}
            {#each pendentes as pendente (pendente.id)}
              {@const revisao = revisoes[pendente.id] ?? { pontuacao: 80, feedback: "" }}
              <article class="projeto__envio">
                <p><strong>Aluno:</strong> {pendente.usuario_id}</p>
                {#if pendente.resposta.repositorio}<a href={pendente.resposta.repositorio} target="_blank" rel="noreferrer">Abrir repositório ↗</a>{/if}
                {#if pendente.resposta.arquivo}<button class="botao botao--secundario" type="button" onclick={() => baixarProjeto(pendente)}>Baixar arquivo do projeto ↓</button>{/if}
                <p>{pendente.resposta.resumo}</p>
                <p><strong>Requisitos marcados pelo aluno:</strong> {pendente.resposta.requisitos.join(", ") || "nenhum"}</p>
                <label class="atividade__campo">Nota (0–100)
                  <input type="number" min="0" max="100" step="1" value={revisao.pontuacao} oninput={(evento) => revisoes = { ...revisoes, [pendente.id]: { ...revisao, pontuacao: evento.currentTarget.value } }} />
                </label>
                <label class="atividade__campo">Feedback para o aluno
                  <textarea rows="4" maxlength="2000" value={revisao.feedback} oninput={(evento) => revisoes = { ...revisoes, [pendente.id]: { ...revisao, feedback: evento.currentTarget.value } }}></textarea>
                </label>
                <div class="atividade__acoes">
                  <button class="botao botao--secundario" type="button" disabled={atividadesRemotas.enviando} onclick={() => revisarProjeto(pendente, false)}>Solicitar ajustes</button>
                  <button class="botao botao--destaque" type="button" disabled={atividadesRemotas.enviando} onclick={() => revisarProjeto(pendente, true)}>Aprovar projeto</button>
                </div>
              </article>
            {/each}
          </section>
        {/if}
      </article>
    {/each}

    <section class="acompanhamento" aria-labelledby="acompanhamento-titulo">
      <p class="etiqueta">Acompanhamento</p>
      <h2 id="acompanhamento-titulo">Competências deste tópico</h2>
      {#if sessao.carregando || acompanhamentoCarregando}
        <p>Carregando seu progresso…</p>
      {:else if !sessao.conectado}
        <p>Entre na sua conta para acompanhar tentativas e competências demonstradas.</p>
      {:else if competenciasComProgresso.length === 0}
        <p>Este tópico ainda não possui competências cadastradas.</p>
      {:else}
        <ul class="acompanhamento__lista">
          {#each competenciasComProgresso as competencia (competencia.id)}
            <li data-estado={competencia.estado}>
              <div class="acompanhamento__titulo"><strong>{competencia.titulo}</strong><span>{competencia.estado}</span></div>
              <p>{competencia.criterio}</p>
              {#if competencia.atividadesVinculadas.length}
                <small>Evidência: {competencia.aprovadas} de {competencia.atividadesVinculadas.length} atividades aprovadas.</small>
              {:else}
                <small>Ainda não há atividade avaliativa vinculada a esta competência.</small>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</main>

<AvisoFalha falha={atividadesRemotas.ultimaFalha} />
