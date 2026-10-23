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
  let acompanhamento = $state({ competencias: [], vinculos: [], tentativas: [], submissoes: [] });
  let revisoes = $state({});
  let acompanhamentoCarregando = $state(false);
  let requisicaoAcompanhamento = 0;

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

    {#if !sessao.carregando && !sessao.conectado}
      <section class="atividades__convite"><p>Entre na conta para enviar respostas e guardar suas tentativas.</p><a class="botao botao--destaque" href="{base}/conta" data-sveltekit-reload>Entrar</a></section>
    {/if}

    {#if atividades.length === 0}
      <section class="atividades__vazio"><h2>A prática deste tópico está chegando</h2><p>O conteúdo já pode ser estudado no roadmap. Este tópico ainda não recebeu uma atividade.</p></section>
    {/if}

    {#each atividades as atividade (atividade.id)}
      {@const resposta = respostaDa(atividade)}
      {@const resultado = resultados[atividade.id]}
      {@const tentativas = tentativasDa(atividade.id)}
      {@const projetoAguardando = tentativas.some((tentativa) => tentativa.detalhes?.status === "aguardando_avaliacao")}
      <article class="atividade" class:atividade--projeto={atividade.tipo === "projeto"} data-tipo={atividade.tipo}>
        <section class="atividade__instrucao">
          <p class="atividade__tipo">{atividade.tipo} <span>·</span> {atividade.dificuldade}</p>
          {#if sessao.conectado}<p class="atividade__estado" data-estado={estadoDaAtividade(atividade.id)}>{estadoDaAtividade(atividade.id)}</p>{/if}
          <h2>{atividade.titulo}</h2>
          <p class="atividade__enunciado">{atividade.enunciado}</p>
          {#if atividade.configuracao.codigo}<pre class="atividade__codigo"><code>{atividade.configuracao.codigo}</code></pre>{/if}
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
            <label class="atividade__campo">{atividade.configuracao.rotuloResposta}<input value={resposta.texto} oninput={(evento) => definir(atividade.id, { texto: evento.currentTarget.value })} /></label>
          {:else if atividade.tipo === "completar"}
            {#each atividade.configuracao.lacunas as lacuna}
              <label class="atividade__campo">{lacuna.rotulo}<input value={resposta.lacunas[lacuna.id] ?? ""} oninput={(evento) => definir(atividade.id, { lacunas: { ...resposta.lacunas, [lacuna.id]: evento.currentTarget.value } })} /></label>
            {/each}
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
            <button class="botao botao--destaque" type="button" disabled={!sessao.conectado || atividadesRemotas.enviando} onclick={() => enviar(atividade)}>{atividadesRemotas.enviando ? "Corrigindo…" : "Verificar resposta"}</button>
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
