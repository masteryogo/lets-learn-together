<!-- ============================================================
     O calendário de estudos.

     Era maquete: outubro de 2026 escrito dia a dia, com sessões
     cumpridas e perdidas que nunca aconteceram. Saiu — sessão de
     mentira é indistinguível da verdadeira até alguém tentar
     apagá-la, e então a tela mente sobre o que guarda.

     Agora a grade é calculada do mês de verdade e as sessões vêm da
     tabela `sessao_estudo`. Sem conta não há o que mostrar nem onde
     escrever, e a tela diz isso.

     O que ainda não existe: aplicar o modelo do mês (a distribuição
     por porcentagem de dias) e o modo Google. A tira do modelo
     mostra o que está salvo; o diálogo de ajuste continua inerte, e
     o botão que o abriria está desabilitado em vez de fingir.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import Canto from "$lib/Canto.svelte";
  import Convite from "$lib/conta/Convite.svelte";
  import AvisoFalha from "$lib/conta/AvisoFalha.svelte";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import { TRILHAS } from "$lib/trilhas.js";
  import {
    aplicarPlano,
    diaISO,
    escrever as escreverSessao,
    apagarSessao,
    leitura,
    limparFuturoDoModelo,
    modeloDoMes,
    salvarModelo as salvarModeloRemoto,
    sessoesDoMes,
  } from "$lib/calendario/remoto.svelte.js";
  import { cotas, distribuir, diasElegiveis } from "$lib/calendario/distribuir.js";
  import "$lib/estilos/base.css";
  import "./calendario.css";

  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"];

  /* "pr" não é trilha do manifesto: projetos atravessam todas, e o
     calendário precisa de um lugar para eles */
  const ASSUNTOS = [
    ...Object.entries(TRILHAS).map(([id, t]) => ({ id, rotulo: t.rotulo })),
    { id: "pr", rotulo: "Projetos" },
  ];

  const hoje = new Date();
  const hojeISO = diaISO(hoje);

  let ancora = $state(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  let selecionado = $state(hojeISO);
  let sessoes = $state([]);
  let modelo = $state(null);
  let convite = $state(false);
  let eco = $state(null);

  /* o formulário de escrever */
  let form = $state({ trilha: "", inicio: "19:00", duracao: 90, nota: "" });

  const filtro = $derived(page.url.searchParams.get("trilha"));
  const primeiro = $derived(new Date(ancora.getFullYear(), ancora.getMonth(), 1));
  const ultimo = $derived(new Date(ancora.getFullYear(), ancora.getMonth() + 1, 0));

  /* a semana começa na segunda, como a grade sempre começou: o
     getDay() devolve 0 para domingo, então ele vira o sétimo */
  const grade = $derived.by(() => {
    const vagasAntes = (primeiro.getDay() + 6) % 7;
    const celulas = [];

    const mesAnterior = new Date(primeiro);
    mesAnterior.setDate(0);
    for (let i = vagasAntes; i > 0; i--) {
      celulas.push({ fora: true, n: mesAnterior.getDate() - i + 1 });
    }

    for (let d = 1; d <= ultimo.getDate(); d++) {
      const data = new Date(ancora.getFullYear(), ancora.getMonth(), d);
      celulas.push({ fora: false, n: d, iso: diaISO(data), semana: data.getDay() });
    }

    /* completa a última linha, para a grade não terminar quebrada */
    while (celulas.length % 7) {
      celulas.push({ fora: true, n: celulas.length % 7 });
    }
    return celulas;
  });

  /* as abas vêm do que foi escrito, não de uma lista fixa. Com o
     assunto em texto livre, três abas de trilha escondiam tudo que
     não se chamasse ml, cv ou pr — foi o que sumiu com a sessão de
     "Computer Vision". */
  const assuntosDoMes = $derived([...new Set(sessoes.map((s) => s.trilha))].sort());

  /* filtro que não casa com nada é ignorado. Um link guardado de
     quando as abas eram fixas (?trilha=pr) escondia o mês inteiro, e
     a tela não tinha como explicar a ausência — esconder só é
     defensável quando algo diz por que sumiu. */
  const filtroAtivo = $derived(
    filtro && assuntosDoMes.includes(filtro) ? filtro : null
  );

  const visiveis = $derived(
    filtroAtivo ? sessoes.filter((s) => s.trilha === filtroAtivo) : sessoes
  );

  const doDia = $derived(visiveis.filter((s) => s.dia === selecionado));

  const tituloDoDia = $derived.by(() => {
    const [a, m, d] = selecionado.split("-").map(Number);
    const data = new Date(a, m - 1, d);
    return `${DIAS[data.getDay()]}, ${d} de ${MESES[m - 1]}`;
  });

  const cargaDoDia = $derived.by(() => {
    if (!doDia.length) return "nenhuma sessão";
    const min = doDia.reduce((t, s) => t + s.duracao_min, 0);
    const h = Math.floor(min / 60);
    const r = min % 60;
    const dur = h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${r}min`;
    return `${doDia.length} ${doDia.length === 1 ? "sessão" : "sessões"} · ${dur}`;
  });

  /* a classe vive no <body> porque é ele que recebe o fundo da
     página; sai quando a rota sai */
  $effect(() => {
    document.body.classList.add("calendario-pagina");
    return () => document.body.classList.remove("calendario-pagina");
  });

  /* observa a conta e o mês: entrar pelo convite enche a grade sem
     recarregar, e virar o mês busca o seguinte */
  $effect(() => {
    sessao.conectado;
    const a = primeiro;
    const b = ultimo;
    let vivo = true;
    sessoesDoMes(a, b).then((linhas) => {
      if (vivo) sessoes = linhas;
    });
    modeloDoMes().then((m) => {
      if (vivo) modelo = m;
    });
    return () => (vivo = false);
  });

  /* ------------------------- o modelo do mês ------------------------- */

  let dlg = $state(null);
  let rascunho = $state(null);
  let aplicando = $state(false);

  const LETRAS = [
    { d: 1, letra: "S", nome: "segunda" },
    { d: 2, letra: "T", nome: "terça" },
    { d: 3, letra: "Q", nome: "quarta" },
    { d: 4, letra: "Q", nome: "quinta" },
    { d: 5, letra: "S", nome: "sexta" },
    { d: 6, letra: "S", nome: "sábado" },
    { d: 0, letra: "D", nome: "domingo" },
  ];

  const somaDaMistura = $derived(
    (rascunho?.mistura ?? []).reduce((t, f) => t + (Number(f.pct) || 0), 0)
  );

  /* a prévia é a mesma conta que a aplicação faz, rodada antes: ver o
     número de dias por assunto é o que torna a porcentagem concreta */
  const previa = $derived.by(() => {
    if (!rascunho) return null;
    const mistura = Object.fromEntries(
      rascunho.mistura.filter((f) => f.assunto.trim() && f.pct > 0)
        .map((f) => [f.assunto.trim(), Number(f.pct)])
    );
    const dias = diasElegiveis(
      ancora.getFullYear(), ancora.getMonth(), rascunho.dias, inicioDaAplicacao()
    );
    return { dias: dias.length, cotas: cotas(mistura, dias.length), mistura };
  });

  /* nunca reescreve o passado: no mês corrente começa hoje, nos
     próximos começa no dia 1 */
  function inicioDaAplicacao() {
    const primeiroDoMes = new Date(ancora.getFullYear(), ancora.getMonth(), 1);
    const h = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return primeiroDoMes > h ? primeiroDoMes : h;
  }

  function abrirModelo() {
    if (!sessao.conectado) {
      convite = true;
      return;
    }
    rascunho = {
      dias: modelo?.dias_semana?.map(Number) ?? [1, 2, 3, 4, 5, 6],
      hora: (modelo?.hora_inicio ?? "19:00").slice(0, 5),
      duracao: modelo?.duracao_min ?? 90,
      mistura: Object.entries(modelo?.mistura ?? {}).map(([assunto, pct]) => ({
        assunto,
        pct,
      })),
    };
    /* mistura vazia não se edita: uma linha em branco mostra o gesto */
    if (!rascunho.mistura.length) rascunho.mistura = [{ assunto: "", pct: 100 }];
    dlg?.showModal();
  }

  function alternarDia(d) {
    rascunho.dias = rascunho.dias.includes(d)
      ? rascunho.dias.filter((x) => x !== d)
      : [...rascunho.dias, d].sort();
  }

  async function salvarModelo() {
    const falha = await salvarModeloRemoto({
      dias_semana: rascunho.dias,
      hora_inicio: rascunho.hora,
      duracao_min: Number(rascunho.duracao) || 90,
      mistura: previa.mistura,
      aplicado_ate: modelo?.aplicado_ate ?? null,
    });
    eco = falha ?? "Modelo salvo.";
    if (!falha) modelo = await modeloDoMes();
  }

  async function aplicar() {
    aplicando = true;
    await salvarModelo();

    const dias = diasElegiveis(
      ancora.getFullYear(), ancora.getMonth(), rascunho.dias, inicioDaAplicacao()
    );
    /* o que já foi estudado no mês conta na cota, como o quadro
       decidiu — senão aplicar no dia 20 pede um mês inteiro em 11 dias */
    const feitos = {};
    for (const s of sessoes) {
      if (s.dia < diaISO(inicioDaAplicacao())) {
        feitos[s.trilha] = (feitos[s.trilha] ?? 0) + 1;
      }
    }

    const plano = distribuir(dias, previa.mistura, feitos);
    const falha = await aplicarPlano(
      plano.map((p) => ({
        dia: diaISO(p.dia),
        trilha: p.assunto,
        inicio: rascunho.hora,
        duracao_min: Number(rascunho.duracao) || 90,
      }))
    );

    sessoes = await sessoesDoMes(primeiro, ultimo);
    aplicando = false;
    eco = falha ?? `${plano.length} sessões escritas.`;
    if (!falha) dlg?.close();
  }

  async function limparFuturo() {
    aplicando = true;
    await limparFuturoDoModelo(diaISO(inicioDaAplicacao()));
    sessoes = await sessoesDoMes(primeiro, ultimo);
    aplicando = false;
    eco = "O que o modelo tinha escrito daqui em diante saiu.";
  }

  function virar(passo) {
    ancora = new Date(ancora.getFullYear(), ancora.getMonth() + passo, 1);
  }

  /* O assunto virou texto livre, e a paleta era de três ids fixos:
     o que não fosse ml/cv/pr ficava sem fundo, tinta escura sobre
     fundo escuro — invisível. Agora a cor sai do próprio texto, pela
     mesma ideia da torção das notas: o mesmo assunto recebe sempre a
     mesma cor, sem ninguém ter que escolhê-la. */
  const PALETA = ["var(--roxo)", "var(--amarelo)", "var(--verde)", "var(--cinza)"];
  /* a borda do cartão e a amostra da legenda pedem a versão saturada:
     elas são traço fino, e traço fino em cor apagada não se vê */
  const PALETA_FORTE = [
    "var(--roxo-forte)",
    "var(--amarelo-forte)",
    "var(--verde-forte)",
    "var(--texto-suave)",
  ];

  function indiceDa(assunto) {
    if (assunto === "ml") return 0;
    if (assunto === "cv") return 1;
    if (assunto === "pr") return 3;
    let soma = 0;
    for (let i = 0; i < assunto.length; i++) soma += assunto.charCodeAt(i);
    return soma % PALETA.length;
  }

  const corDe = (assunto) => PALETA[indiceDa(assunto)];
  const corForteDe = (assunto) => PALETA_FORTE[indiceDa(assunto)];

  function rotuloDe(id) {
    return ASSUNTOS.find((a) => a.id === id)?.rotulo ?? id;
  }

  /* a régua vai das 17h à 1h: oito horas de janela, e a madrugada
     cai no fim, não no começo */
  function faixa(s) {
    const [h, m] = s.inicio.split(":").map(Number);
    const minutos = (h < 17 ? h + 24 : h) * 60 + m - 17 * 60;
    return {
      top: Math.max(0, (minutos / 480) * 100),
      altura: Math.min(100, (s.duracao_min / 480) * 100),
    };
  }

  async function escrever(ev) {
    ev.preventDefault();
    if (!sessao.conectado) {
      convite = true;
      return;
    }
    eco = null;
    const assunto = form.trilha.trim();
    if (!assunto) {
      eco = "Diga o que vai estudar nesse horário.";
      return;
    }
    const falha = await escreverSessao({
      dia: selecionado,
      trilha: assunto,
      inicio: form.inicio,
      duracao_min: Number(form.duracao) || 90,
      anotacao: form.nota.trim(),
    });
    if (falha) {
      eco = falha;
      return;
    }
    form.nota = "";
    sessoes = await sessoesDoMes(primeiro, ultimo);
    eco = "Escrito.";
  }

  async function apagar(id) {
    await apagarSessao(id);
    sessoes = sessoes.filter((s) => s.id !== id);
  }
</script>

<svelte:head>
  <title>Calendário de estudos</title>
</svelte:head>

<Canto />

<Convite aberto={convite} aoFechar={() => (convite = false)} />
<AvisoFalha falha={leitura.falha} />


  <header class="cabecalho-cal">

    <!-- O calendário é de todas as trilhas: o modelo do mês mistura
         ML e OpenCV, e separá-los em calendários distintos devolveria
         o problema que ele resolve. Chegando de um roadmap
         (/calendario?trilha=ml), a aba daquela trilha nasce ativa
         — mas "Todas" fica ao lado, visível, a um clique. -->
    <!-- uma aba por assunto escrito no mês. Mês sem nada escrito não
         tem o que filtrar, e aí a barra inteira some em vez de
         oferecer filtros que não filtram nada. -->
    {#if assuntosDoMes.length > 1}
      <nav class="filtro" aria-label="Filtrar por assunto">
        <a
          class="filtro__aba"
          href="{base}/calendario"
          aria-current={filtroAtivo ? null : "page"}>Todas</a
        >
        {#each assuntosDoMes as assunto}
          <a
            class="filtro__aba"
            href="{base}/calendario?trilha={encodeURIComponent(assunto)}"
            data-trilha={assunto}
            style="--trilha-cor: {corForteDe(assunto)}"
            aria-current={filtroAtivo === assunto ? "page" : null}>{rotuloDe(assunto)}</a
          >
        {/each}
      </nav>
    {/if}
  </header>

  <!-- ========================= tira do modelo ========================= -->
  <!-- o modelo é configuração, e configuração não disputa leitura com o
       mês: aqui fica só o resumo do que está valendo; os controles moram
       no diálogo lá embaixo. -->
  <section class="modelo-tira" aria-label="Modelo do mês">
    <span class="modelo-tira__rotulo">Modelo</span>
    {#if modelo}
      <span class="modelo-tira__janela">
        {modelo.hora_inicio.slice(0, 5)} · {modelo.duracao_min} min
      </span>
      <span class="modelo-tira__mistura">
        <span class="modelo-tira__barra" role="img" aria-label="Mistura do mês">
          {#each Object.entries(modelo.mistura ?? {}) as [id, parte]}
            <span class="modelo-tira__parte" data-trilha={id} style="width: {parte}%"></span>
          {/each}
        </span>
      </span>
    {:else}
      <!-- sem modelo salvo não há o que resumir, e inventar 50/40/10
           seria a maquete de volta -->
      <span class="modelo-tira__janela">nenhum modelo definido</span>
    {/if}
    <!-- aplicar o modelo ainda não existe; botão que não faz nada
         ensina a desconfiar dos que fazem -->
    <button class="botao" type="button" onclick={abrirModelo}>Ajustar</button>
    <span class="modelo-tira__eco" role="status" aria-live="polite">{eco ?? ""}</span>
  </section>

  <div class="calendario">

    <!-- ============================= mês ============================= -->
    <section class="mes" aria-label="{MESES[ancora.getMonth()]} de {ancora.getFullYear()}">
      <div class="mes__topo">
        <div>
          <span class="mes__ano">{ancora.getFullYear()}</span>
          <span class="mes__nome">{MESES[ancora.getMonth()]}</span>
        </div>
        <div class="mes__nav">
          <button class="botao botao--icone" type="button" aria-label="Mês anterior"
            onclick={() => virar(-1)}>&lt;</button>
          <button class="botao botao--icone" type="button" aria-label="Próximo mês"
            onclick={() => virar(1)}>&gt;</button>
        </div>
      </div>

      <!-- a semana começa na segunda: é onde o plano de estudo começa,
           e o domingo fica no fim, junto do outro dia de folga -->
      <div class="mes__semana" aria-hidden="true">
        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span>
        <span>Sex</span><span>Sáb</span><span>Dom</span>
      </div>

      <div class="mes__dias" role="group"
        aria-label="Dias de {MESES[ancora.getMonth()]}">
        {#each grade as celula}
          {#if celula.fora}
            <!-- a virada do mês fica visível e apagada: o dia existe,
                 mas não é desta grade -->
            <div class="dia dia--fora"><span class="dia__n">{celula.n}</span></div>
          {:else}
            {@const doDiaCelula = visiveis.filter((s) => s.dia === celula.iso)}
            <button
              class="dia"
              class:dia--off={celula.semana === 0}
              class:dia--hoje={celula.iso === hojeISO}
              type="button"
              aria-pressed={celula.iso === selecionado}
              aria-label="{celula.n} de {MESES[ancora.getMonth()]}, {doDiaCelula.length
                ? doDiaCelula.length + (doDiaCelula.length === 1 ? ' sessão' : ' sessões')
                : 'sem sessões'}"
              onclick={() => (selecionado = celula.iso)}
            >
              <span class="dia__n">{celula.n}</span>
              {#each doDiaCelula as s}
                <!-- sem estado inventado: o banco não sabe se a sessão
                     foi cumprida, e dizer que foi seria chute -->
                <!-- hora e assunto em linhas separadas: numa célula de
                     grade, "19:00 Comp…" esconde justamente o que
                     distingue um dia do outro -->
                <span class="dia__bloco" style="--cor-assunto: {corDe(s.trilha)}">
                  <span class="dia__hora">{s.inicio.slice(0, 5)}</span>
                  <span class="dia__assunto">{rotuloDe(s.trilha)}</span>
                </span>
              {/each}
            </button>
          {/if}
        {/each}
      </div>
    </section>

    <!-- =========================== ficha =========================== -->
    <aside class="ficha-dia" aria-label="Sessões do dia">
      <p class="ficha-dia__rotulo">Dia</p>
      <p class="ficha-dia__titulo">{tituloDoDia}</p>
      <p class="ficha-dia__carga">{cargaDoDia}</p>

      <!-- a régua existe para o choque de horário aparecer antes de
           escrever: duas sessões sobrepostas uma lista não mostra.
           A faixa vai das 17h à 1h, que é a janela de quem estuda à
           noite — a madrugada cai no fim, não no começo. -->
      <div class="regua" aria-hidden="true">
        <div class="regua__eixo">
          <span>17:00</span><span>19:00</span><span>21:00</span><span>23:00</span><span>01:00</span>
        </div>
        <div class="regua__pista">
          {#each doDia as s}
            {@const f = faixa(s)}
            <div class="regua__faixa"
              style="top: {f.top}%; height: {f.altura}%; --cor-assunto: {corDe(s.trilha)}">
              {s.inicio.slice(0, 5)} {rotuloDe(s.trilha)}
            </div>
          {/each}
        </div>
      </div>

      <div class="ficha-dia__lista">
        {#each doDia as s (s.id)}
          <article class="sessao" style="--cor-assunto: {corForteDe(s.trilha)}">
            <div class="sessao__topo">
              <span class="sessao__trilha">{rotuloDe(s.trilha)}</span>
              <span class="sessao__hora">{s.inicio.slice(0, 5)} · {s.duracao_min} min</span>
            </div>
            {#if s.anotacao}
              <p class="sessao__nota">{s.anotacao}</p>
            {/if}
            <button class="sessao__apagar" type="button" onclick={() => apagar(s.id)}>
              × apagar
            </button>
          </article>
        {:else}
          {#if leitura.falha}
            <!-- mês vazio por erro de leitura é indistinguível de mês
                 sem nada escrito, e o primeiro precisa se denunciar -->
            <p class="ficha-dia__vazio">Não consegui ler as sessões: {leitura.falha}</p>
          {:else}
            <p class="ficha-dia__vazio">
              {sessao.conectado
                ? "Nada escrito neste dia."
                : "Entre na conta para planejar seus estudos."}
            </p>
          {/if}
        {/each}
      </div>

      <form class="escrever" onsubmit={escrever}>
        <p class="escrever__rotulo">Escrever neste dia</p>

        <label class="campo" for="sessao-trilha">
          <span class="campo__rotulo">Assunto</span>
          <!-- texto livre, e não uma lista de trilhas: o que se estuda
               numa noite raramente tem o nome de uma trilha inteira, e
               uma lista fechada obrigaria a inventar a trilha certa
               para "revisar derivadas". As cores da grade continuam
               reconhecendo ml, cv e pr; o resto fica neutro. -->
          <input
            class="campo__controle"
            id="sessao-trilha"
            type="text"
            list="assuntos-conhecidos"
            placeholder="ex.: Machine Learning"
            bind:value={form.trilha}
            required
          />
          <datalist id="assuntos-conhecidos">
            {#each ASSUNTOS as a}
              <option value={a.rotulo}></option>
            {/each}
          </datalist>
        </label>

        <div class="campo-par">
          <label class="campo" for="sessao-hora">
            <span class="campo__rotulo">Começa</span>
            <input class="campo__controle" id="sessao-hora" type="time" bind:value={form.inicio} />
          </label>
          <label class="campo" for="sessao-dur">
            <span class="campo__rotulo">Dura (min)</span>
            <input class="campo__controle" id="sessao-dur" type="number" min="15" step="15"
              bind:value={form.duracao} />
          </label>
        </div>

        <label class="campo" for="sessao-nota">
          <span class="campo__rotulo">O que vai estudar</span>
          <input class="campo__controle" id="sessao-nota" type="text"
            placeholder="ex.: árvores de decisão" bind:value={form.nota} />
        </label>

        <button class="botao botao--destaque" type="submit">Escrever</button>
        <p class="escrever__eco" role="status" aria-live="polite">{eco ?? ""}</p>
      </form>
    </aside>
  </div>

  <!-- a legenda é a mesma estrutura do roadmap; aqui a amostra decodifica
       trilha e estado, não prioridade -->
  <div class="legenda legenda--cal">
    <!-- a legenda também é dos dados: decodificar três trilhas fixas
         enquanto o assunto é texto livre descreveria outra tela -->
    {#each assuntosDoMes as assunto}
      <span class="legenda__item">
        <span class="legenda__amostra" style="background: {corForteDe(assunto)}"></span>{rotuloDe(assunto)}
      </span>
    {/each}
    <!-- "cumprida" e "perdida" saíram com a maquete: o banco guarda o
         plano, e ninguém marca o que aconteceu -->
  </div>

  <!-- ========================== modelo do mês ========================== -->
  <!-- o que o Google não faz: descrever o mês uma vez e deixar a grade
       se preencher. Em diálogo nativo por causa do foco preso e do Esc,
       que vêm de graça — e do ::backdrop, que não briga de z-index com
       a ficha sticky nem com o Obi solto. -->
  <dialog class="modelo" bind:this={dlg} aria-labelledby="modelo-titulo">
    {#if rascunho}
      <div class="modelo__topo">
        <h2 class="modelo__titulo" id="modelo-titulo">Modelo de {MESES[ancora.getMonth()]}</h2>
        <button class="botao" type="button" onclick={() => dlg.close()}>Fechar</button>
      </div>

      <div class="modelo__corpo">
        <section class="modelo__secao">
          <p class="modelo__rotulo">Janela</p>
          <div class="semana-chaves" role="group"
            aria-label="Dias da semana que entram no plano">
            {#each LETRAS as dia}
              <button
                class="semana-chave"
                type="button"
                aria-pressed={rascunho.dias.includes(dia.d)}
                aria-label={dia.nome}
                onclick={() => alternarDia(dia.d)}>{dia.letra}</button
              >
            {/each}
          </div>
          <div class="campo-par">
            <label class="campo" for="modelo-hora">
              <span class="campo__rotulo">A partir de</span>
              <input class="campo__controle" id="modelo-hora" type="time"
                bind:value={rascunho.hora} />
            </label>
            <label class="campo" for="modelo-dur">
              <span class="campo__rotulo">Cada sessão (min)</span>
              <input class="campo__controle" id="modelo-dur" type="number"
                min="15" step="15" bind:value={rascunho.duracao} />
            </label>
          </div>
        </section>

        <section class="modelo__secao">
          <p class="modelo__rotulo">Mistura</p>
          <!-- a porcentagem é de dias, não de horas: é o que se confere
               olhando a grade -->
          <div class="mistura">
            {#each rascunho.mistura as fatia, i}
              <div class="fatia">
                <span class="fatia__nome">
                  <span class="legenda__amostra"
                    style="background: {corForteDe(fatia.assunto || '—')}"></span>
                  <input
                    class="campo__controle fatia__assunto"
                    type="text"
                    placeholder="assunto"
                    aria-label="Assunto da fatia {i + 1}"
                    bind:value={fatia.assunto}
                  />
                </span>
                <input
                  class="fatia__n"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  aria-label="Porcentagem de {fatia.assunto || 'assunto ' + (i + 1)}"
                  bind:value={fatia.pct}
                />
                <span class="fatia__trilho">
                  <span class="fatia__barra"
                    style="width: {somaDaMistura ? (fatia.pct / somaDaMistura) * 100 : 0}%;
                           background: {corDe(fatia.assunto || '—')}"></span>
                </span>
                <span class="fatia__dias">
                  {previa?.cotas[fatia.assunto?.trim()] ?? 0} dias
                </span>
                <button
                  class="fatia__fora"
                  type="button"
                  aria-label="Tirar {fatia.assunto || 'esta fatia'}"
                  onclick={() => (rascunho.mistura = rascunho.mistura.filter((_, j) => j !== i))}
                >×</button>
              </div>
            {/each}
          </div>

          <button
            class="botao"
            type="button"
            onclick={() => (rascunho.mistura = [...rascunho.mistura, { assunto: "", pct: 0 }])}
            >+ assunto</button
          >

          <!-- a soma não precisa dar 100: as fatias são proporção entre
               si, e exigir o número redondo seria aritmética imposta a
               quem só quer "mais disto que daquilo" -->
          <p class="mistura__soma">
            <span>Soma</span><span>{somaDaMistura}%</span>
          </p>
          <p class="mistura__previa">
            {previa?.dias ?? 0} dias livres daqui até o fim do mês
          </p>
        </section>

        <section class="modelo__secao">
          <p class="modelo__rotulo">Aplicar</p>
          <!-- aplicar nunca reescreve o passado: começa hoje, e o que
               já foi estudado no mês conta na cota -->
          <button class="botao botao--destaque" type="button"
            disabled={aplicando || !previa?.dias} onclick={aplicar}>
            Preencher {MESES[ancora.getMonth()]}
          </button>
          <button class="botao" type="button" disabled={aplicando}
            onclick={limparFuturo}>Limpar o que vem</button>
          <p class="modelo__aviso">
            O que você escreveu à mão não é tocado, nem o que já passou.
          </p>
        </section>
      </div>
    {/if}
  </dialog>
