/* ============================================================
   Roadmap de estudos — comportamento, comum a todas as trilhas.
   Depende do data.js da trilha (ROADMAP, ROADMAP_ETAPAS, PROJETOS,
   RECURSOS, LEGENDA, ESTADOS, CRITERIOS) e dos conteudo-*.js
   ============================================================ */

(function () {
  "use strict";

  var TRILHA = window.TRILHA_ATUAL || "ml";
  var CHAVE_PROGRESSO = "roadmap:" + TRILHA + ":progresso:v1";
  var CHAVE_TEMA = "roadmap:tema:v1";           /* tema é comum às trilhas */
  var CHAVE_LEGADA = "roadmap-ml:progresso:v1"; /* de antes das trilhas */

  var CICLO = ["pendente", "estudando", "feito", "pulado"];
  var MARCAS = { pendente: "", estudando: "◔", feito: "✓", pulado: "–" };

  /* arraste para fechar o painel */
  var INICIO_ARRASTO = 8;     /* px antes de decidir o eixo do gesto */
  var FRACAO_FECHAR = 0.3;    /* fração da largura que confirma o fechamento */
  var DURACAO_AJUSTE = 200;   /* ms do ajuste final — igual ao CSS */

  /* o gesto de ler o detalhe muda com o aparelho; resolvido uma vez só */
  var DICA_LER = (window.matchMedia &&
                  window.matchMedia("(pointer: coarse)").matches)
    ? "toque no ⓘ para ler"
    : "shift + clique para ler";

  /* índice id -> { topico, etapa, grupo } para o drawer e o progresso */
  var INDICE = {};

  var progresso = carregarProgresso();
  var aberto = null; /* { tipo: "topico" | "etapa", id } */

  /* ------------------------------------------------------------
     persistência — tolerante a localStorage bloqueado (file://,
     janela anônima, site data desabilitado)
     ------------------------------------------------------------ */
  function carregarProgresso() {
    try {
      var bruto = window.localStorage.getItem(CHAVE_PROGRESSO);
      if (!bruto && TRILHA === "ml") {
        /* adota o progresso salvo antes de existirem trilhas */
        bruto = window.localStorage.getItem(CHAVE_LEGADA);
      }
      return bruto ? JSON.parse(bruto) : {};
    } catch (e) {
      return {};
    }
  }

  function salvarProgresso() {
    try {
      window.localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
    } catch (e) {
      /* sem persistência: a sessão ainda funciona */
    }
  }

  function estadoDe(id) {
    return progresso[id] || "pendente";
  }

  function definirEstado(id, estado) {
    if (estado === "pendente") delete progresso[id];
    else progresso[id] = estado;
    salvarProgresso();
    pintarTopico(id);
    atualizarProgresso();
    if (aberto && aberto.tipo === "topico" && aberto.id === id) {
      marcarBotoesEstado(id);
    }
  }

  /* ------------------------------------------------------------
     montagem do mapa
     ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     seletor de trilha — troca a trilha pela querystring, o que
     recarrega a página e faz o trilhas.js injetar outros dados
     ------------------------------------------------------------ */
  function montarSeletorTrilha() {
    var seletor = document.getElementById("trilha");
    if (!seletor || !window.TRILHAS) return;

    Object.keys(window.TRILHAS).forEach(function (id) {
      var op = document.createElement("option");
      op.value = id;
      op.textContent = window.TRILHAS[id].rotulo;
      op.selected = id === TRILHA;
      seletor.appendChild(op);
    });

    seletor.addEventListener("change", function (ev) {
      window.location.search = "?trilha=" + ev.target.value;
    });
  }

  function montar() {
    document.title = "Roadmap de " + ROADMAP.titulo;
    montarSeletorTrilha();
    document.getElementById("titulo").textContent = ROADMAP.titulo;
    document.getElementById("subtitulo").textContent = ROADMAP.subtitulo;

    montarLegenda();
    montarDica();

    var mapa = document.getElementById("mapa");
    ROADMAP.etapas.forEach(function (etapa) {
      mapa.appendChild(criarEtapa(etapa));
    });

    montarBotoesEstado();
    atualizarProgresso();
  }

  function montarLegenda() {
    var alvo = document.getElementById("legenda-prioridade");
    LEGENDA.forEach(function (item) {
      var el = document.createElement("span");
      el.className = "legenda__item";
      el.title = item.desc;

      var amostra = document.createElement("span");
      amostra.className = "legenda__amostra";
      amostra.setAttribute("data-prioridade", item.chave);

      el.appendChild(amostra);
      el.appendChild(document.createTextNode(item.rotulo));
      alvo.appendChild(el);
    });
  }

  /* ------------------------------------------------------------
     dica da legenda — o gesto anunciado tem que ser o gesto que o
     aparelho tem. `pointer: coarse` descreve o ponteiro primário,
     que é o dedo em celular e tablet. Montada em nós, não em
     innerHTML, pela mesma razão de escreverComCodigo().
     ------------------------------------------------------------ */
  function montarDica() {
    var toque = window.matchMedia &&
                window.matchMedia("(pointer: coarse)").matches;

    var alvo = document.getElementById("legenda-dica");
    alvo.textContent = "";

    (toque
      ? [["Toque", " cicla o estado · "], ["ⓘ", " abre o detalhe"]]
      : [["Clique", " cicla o estado · "], ["Shift + clique", " abre o detalhe"]]
    ).forEach(function (par) {
      var forte = document.createElement("strong");
      forte.textContent = par[0];
      alvo.appendChild(forte);
      alvo.appendChild(document.createTextNode(par[1]));
    });
  }

  function criarEtapa(etapa) {
    var secao = document.createElement("section");
    secao.className = "etapa";
    secao.setAttribute("data-etapa", etapa.id);

    secao.appendChild(criarNucleo(etapa));

    var esq = document.createElement("div");
    esq.className = "ramo ramo--esq";
    var dir = document.createElement("div");
    dir.className = "ramo ramo--dir";

    distribuirGrupos(etapa).forEach(function (par) {
      (par.lado === "esq" ? esq : dir).appendChild(criarGrupo(par.grupo, etapa));
    });

    secao.appendChild(esq);
    secao.appendChild(dir);
    return secao;
  }

  function criarNucleo(etapa) {
    var nucleo = document.createElement("button");
    nucleo.type = "button";
    nucleo.className = "etapa__nucleo";
    nucleo.setAttribute("data-etapa-id", etapa.id);
    nucleo.title = etapa.objetivo + " (clique para ler a introdução)";

    var numero = document.createElement("span");
    numero.className = "etapa__numero";
    numero.textContent = "Etapa " + etapa.numero;

    var titulo = document.createElement("span");
    titulo.className = "etapa__titulo";
    titulo.textContent = etapa.titulo;

    var meta = document.createElement("span");
    meta.className = "etapa__meta";
    meta.textContent = etapa.duracao
      ? etapa.duracao + " · pré: " + etapa.preRequisitos
      : "pré: " + etapa.preRequisitos;

    var anel = document.createElement("span");
    anel.className = "etapa__anel";
    anel.appendChild(document.createElement("span"));

    nucleo.appendChild(numero);
    nucleo.appendChild(titulo);
    nucleo.appendChild(meta);
    nucleo.appendChild(anel);

    nucleo.addEventListener("click", function () {
      abrirEtapa(etapa.id);
    });

    return nucleo;
  }

  /* Um grupo sem título (etapas Python e PyTorch) vira dois meio-grupos,
     um de cada lado, para a etapa não ficar torta. Grupos com título
     alternam lados na ordem em que aparecem. */
  function distribuirGrupos(etapa) {
    var pares = [];

    /* um grupo sozinho na etapa deixa a etapa torta se ficar todo
       de um lado, então o limite para dividi-lo é menor — e vale
       mesmo que ele tenha título. */
    var sozinho = etapa.grupos.length === 1;
    var limite = sozinho ? 4 : 6;

    etapa.grupos.forEach(function (grupo) {
      if ((grupo.titulo === null || sozinho) && grupo.topicos.length > limite) {
        var meio = Math.ceil(grupo.topicos.length / 2);
        pares.push({
          lado: "esq",
          grupo: clonarGrupo(grupo, grupo.topicos.slice(0, meio), "-a"),
        });
        /* o título aparece só na metade da esquerda, para não repetir */
        pares.push({
          lado: "dir",
          grupo: clonarGrupo(grupo, grupo.topicos.slice(meio), "-b", null),
        });
      } else {
        pares.push({ lado: pares.length % 2 === 0 ? "esq" : "dir", grupo: grupo });
      }
    });

    return pares;
  }

  function clonarGrupo(grupo, topicos, sufixo, titulo) {
    return {
      id: grupo.id + sufixo,
      titulo: titulo === undefined ? grupo.titulo : titulo,
      duracao: grupo.duracao,
      descricao: grupo.descricao,
      topicos: topicos,
      /* o clone aponta para o grupo real, para o drawer mostrar o
         título e a descrição originais mesmo em um meio-grupo */
      origem: grupo,
    };
  }

  function criarGrupo(grupo, etapa) {
    var bloco = document.createElement("div");
    bloco.className = "grupo";

    if (grupo.titulo) {
      var titulo = document.createElement("h3");
      titulo.className = "grupo__titulo";
      titulo.textContent = grupo.titulo;

      if (grupo.duracao) {
        var dur = document.createElement("span");
        dur.className = "grupo__duracao";
        dur.textContent = " · " + grupo.duracao;
        titulo.appendChild(dur);
      }
      bloco.appendChild(titulo);
    }

    var lista = document.createElement("div");
    lista.className = "grupo__topicos";

    grupo.topicos.forEach(function (topico) {
      INDICE[topico.id] = {
        topico: topico,
        etapa: etapa,
        grupo: grupo.origem || grupo,
      };
      lista.appendChild(criarTopico(topico));
    });

    bloco.appendChild(lista);
    return bloco;
  }

  function criarTopico(topico) {
    /* o ⓘ não pode morar dentro do tópico: button dentro de button é
       HTML inválido. Os dois viram irmãos num invólucro, que passa a
       ser o item da lista no lugar do botão. */
    var par = document.createElement("div");
    par.className = "topico-par";

    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "topico";
    botao.id = "topico-" + topico.id;
    botao.setAttribute("data-id", topico.id);
    botao.setAttribute("data-prioridade", topico.prioridade);

    var marca = document.createElement("span");
    marca.className = "topico__marca";

    botao.appendChild(marca);
    botao.appendChild(document.createTextNode(topico.titulo));

    botao.addEventListener("click", function (ev) {
      if (ev.shiftKey) abrirTopico(topico.id);
      else ciclar(topico.id);
    });

    /* clique com o botão direito também abre o detalhe — atalho
       para quem prefere não usar o Shift */
    botao.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
      abrirTopico(topico.id);
    });

    var info = document.createElement("button");
    info.type = "button";
    info.className = "topico__info";
    info.textContent = "ⓘ";
    info.title = "Ler o detalhe de " + topico.titulo;
    info.setAttribute("aria-label", "Detalhe de " + topico.titulo);
    info.addEventListener("click", function () { abrirTopico(topico.id); });

    par.appendChild(botao);
    par.appendChild(info);

    aplicarEstado(botao, estadoDe(topico.id), topico.titulo);
    return par;
  }

  function ciclar(id) {
    var atual = estadoDe(id);
    definirEstado(id, CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }

  function pintarTopico(id) {
    var botao = document.getElementById("topico-" + id);
    if (botao) aplicarEstado(botao, estadoDe(id), INDICE[id].topico.titulo);
  }

  function aplicarEstado(botao, estado, titulo) {
    botao.setAttribute("data-estado", estado);
    botao.querySelector(".topico__marca").textContent = MARCAS[estado];
    botao.setAttribute("aria-label", titulo + " — " + rotuloEstado(estado));
    botao.title = titulo + " — " + rotuloEstado(estado) + " (" + DICA_LER + ")";
  }

  function rotuloEstado(chave) {
    for (var i = 0; i < ESTADOS.length; i++) {
      if (ESTADOS[i].chave === chave) return ESTADOS[i].rotulo;
    }
    return chave;
  }

  /* ------------------------------------------------------------
     progresso
     ------------------------------------------------------------ */
  function atualizarProgresso() {
    var total = 0, feitos = 0, pulados = 0, estudando = 0;

    ROADMAP.etapas.forEach(function (etapa) {
      var t = 0, f = 0;

      etapa.grupos.forEach(function (grupo) {
        grupo.topicos.forEach(function (topico) {
          var estado = estadoDe(topico.id);
          t++;
          if (estado === "feito") f++;
          else if (estado === "pulado") pulados++;
          else if (estado === "estudando") estudando++;
        });
      });

      total += t;
      feitos += f;

      var anel = document.querySelector(
        '.etapa[data-etapa="' + etapa.id + '"] .etapa__anel span'
      );
      if (anel) anel.style.width = (t ? (f / t) * 100 : 0) + "%";
    });

    var pct = total ? Math.round((feitos / total) * 100) : 0;

    document.getElementById("progresso-preenchido").style.width = pct + "%";
    document
      .querySelector(".progresso__barra")
      .setAttribute("aria-valuenow", String(pct));

    var texto = feitos + " de " + total + " tópicos concluídos (" + pct + "%)";
    if (estudando) texto += " · " + estudando + " em estudo";
    if (pulados) texto += " · " + pulados + " pulados";
    document.getElementById("progresso-texto").textContent = texto;
  }

  /* ------------------------------------------------------------
     drawer
     ------------------------------------------------------------ */
  var drawer = document.getElementById("drawer");
  var sobreposicao = document.getElementById("sobreposicao");

  function abrirTopico(id) {
    var ref = INDICE[id];
    if (!ref) return;
    aberto = { tipo: "topico", id: id };

    etiqueta(ref.topico.prioridade, ref.topico.prioridade);
    document.getElementById("drawer-titulo").textContent = ref.topico.titulo;

    var trilha = "Etapa " + ref.etapa.numero + " · " + ref.etapa.titulo;
    if (ref.grupo.titulo) trilha += " · " + ref.grupo.titulo;
    document.getElementById("drawer-trilha").textContent = trilha;

    escreverComCodigo(document.getElementById("drawer-desc"), ref.topico.desc);
    escreverParagrafos("drawer-detalhe", ref.topico.detalhe);

    /* contexto do grupo, para o tópico não ficar solto */
    secao("drawer-secao-grupo", !!ref.grupo.descricao, function () {
      document.getElementById("drawer-grupo-titulo").textContent =
        ref.grupo.titulo || "Sobre este bloco";
      escreverComCodigo(
        document.getElementById("drawer-grupo-desc"), ref.grupo.descricao);
    });

    document.getElementById("drawer-secao-estados").hidden = false;
    marcarBotoesEstado(id);

    preencherCriterios(ref.etapa);
    preencherRecursos(ref.etapa.id);
    preencherProjetos(ref.etapa.id);

    mostrarDrawer();
  }

  function abrirEtapa(etapaId) {
    var etapa = ROADMAP.etapas.filter(function (e) {
      return e.id === etapaId;
    })[0];
    if (!etapa) return;
    aberto = { tipo: "etapa", id: etapaId };

    etiqueta("Etapa " + etapa.numero, null);
    document.getElementById("drawer-titulo").textContent = etapa.titulo;

    var meta = "Pré-requisitos: " + etapa.preRequisitos;
    if (etapa.duracao) meta += " · " + etapa.duracao;
    meta += " · " + contarTopicos(etapa) + " tópicos";
    document.getElementById("drawer-trilha").textContent = meta;

    escreverComCodigo(document.getElementById("drawer-desc"), etapa.objetivo);
    escreverParagrafos("drawer-detalhe", etapa.descricao);

    document.getElementById("drawer-secao-grupo").hidden = true;
    document.getElementById("drawer-secao-estados").hidden = true;

    preencherCriterios(etapa);
    preencherRecursos(etapa.id);
    preencherProjetos(etapa.id);

    mostrarDrawer();
  }

  function mostrarDrawer() {
    sobreposicao.hidden = false;
    drawer.hidden = false;
    drawer.scrollTop = 0;
    document.getElementById("drawer-fechar").focus();
  }

  function fecharDrawer() {
    drawer.hidden = true;
    sobreposicao.hidden = true;

    if (aberto && aberto.tipo === "topico") {
      var botao = document.getElementById("topico-" + aberto.id);
      if (botao) botao.focus();
    }
    aberto = null;
  }

  /* ------------------------------------------------------------
     arrastar o painel para a direita fecha — em telas de toque o
     painel cobre a sobreposição inteira, então o ✕ era a única
     saída. Só toque e caneta: com mouse já existem o ✕, o clique
     fora e o Esc.
     ------------------------------------------------------------ */
  var arrasto = null;

  function limparArrasto() {
    drawer.classList.remove("drawer--ajustando");
    drawer.style.transform = "";
    sobreposicao.style.opacity = "";
  }

  drawer.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType === "mouse") return;
    arrasto = { x0: ev.clientX, y0: ev.clientY, eixo: null, dx: 0 };
  });

  drawer.addEventListener("pointermove", function (ev) {
    if (!arrasto) return;

    var dx = ev.clientX - arrasto.x0;
    var dy = ev.clientY - arrasto.y0;

    /* o eixo se decide no primeiro movimento que passa do tremor do
       dedo, e não muda mais: sem travar, um arraste meio torto ficaria
       alternando entre rolar o texto e empurrar o painel */
    if (arrasto.eixo === null) {
      if (Math.abs(dx) < INICIO_ARRASTO && Math.abs(dy) < INICIO_ARRASTO) return;
      arrasto.eixo = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (arrasto.eixo === "y") return;   /* é rolagem: o navegador cuida */

    /* só para a direita: para a esquerda não há para onde o painel ir */
    arrasto.dx = Math.max(0, dx);
    drawer.style.transform = "translateX(" + arrasto.dx + "px)";
    sobreposicao.style.opacity = String(1 - arrasto.dx / drawer.offsetWidth);
  });

  drawer.addEventListener("pointerup", function () {
    if (!arrasto) return;
    var dx = arrasto.dx;
    var horizontal = arrasto.eixo === "x";
    arrasto = null;

    /* toque parado ou rolagem: nada a desfazer, e o click segue
       normalmente para o botão ou link que estava sob o dedo */
    if (!horizontal) { limparArrasto(); return; }

    drawer.classList.add("drawer--ajustando");

    if (dx > drawer.offsetWidth * FRACAO_FECHAR) {
      /* sai deslizando e só então some, para não piscar no meio da tela */
      drawer.style.transform = "translateX(100%)";
      sobreposicao.style.opacity = "0";
      window.setTimeout(function () {
        fecharDrawer();
        limparArrasto();
      }, DURACAO_AJUSTE);
      return;
    }

    /* não foi longe o bastante: volta ao lugar */
    drawer.style.transform = "";
    sobreposicao.style.opacity = "";
    window.setTimeout(function () {
      drawer.classList.remove("drawer--ajustando");
    }, DURACAO_AJUSTE);
  });

  drawer.addEventListener("pointercancel", function () {
    arrasto = null;
    limparArrasto();
  });

  function etiqueta(texto, prioridade) {
    var el = document.getElementById("drawer-etiqueta");
    el.textContent = texto;
    if (prioridade) el.setAttribute("data-prioridade", prioridade);
    else el.removeAttribute("data-prioridade");
  }

  function contarTopicos(etapa) {
    return etapa.grupos.reduce(function (acc, g) {
      return acc + g.topicos.length;
    }, 0);
  }

  /* quebra o texto em parágrafos para blocos longos ficarem legíveis */
  /* ------------------------------------------------------------
     escreve texto em um elemento, convertendo `trecho` em <code>.
     Usa split + createTextNode em vez de innerHTML: o texto tem
     sinais como < e & que o innerHTML interpretaria como marcação.
     ------------------------------------------------------------ */
  function escreverComCodigo(alvo, texto) {
    alvo.textContent = "";
    if (!texto) return;

    /* índice par = texto comum, ímpar = o que estava entre crases */
    texto.split("`").forEach(function (parte, i) {
      if (parte === "") return;
      if (i % 2 === 1) {
        var code = document.createElement("code");
        code.textContent = parte;
        alvo.appendChild(code);
      } else {
        alvo.appendChild(document.createTextNode(parte));
      }
    });
  }

  function escreverParagrafos(idAlvo, texto) {
    var alvo = document.getElementById(idAlvo);
    alvo.textContent = "";
    if (!texto) return;

    texto.split(/\n{2,}/).forEach(function (bloco) {
      var p = document.createElement("p");
      escreverComCodigo(p, bloco.trim());
      alvo.appendChild(p);
    });
  }

  function secao(id, visivel, preencher) {
    var el = document.getElementById(id);
    el.hidden = !visivel;
    if (visivel) preencher();
  }

  function preencherCriterios(etapa) {
    var secaoEl = document.getElementById("drawer-secao-criterios");
    var lista = document.getElementById("drawer-criterios");
    lista.textContent = "";

    /* o CV tem critério próprio por iteração; o ML tem 4 globais */
    var itens = (etapa && etapa.criterios) || CRITERIOS || [];
    itens.forEach(function (texto) {
      var li = document.createElement("li");
      escreverComCodigo(li, texto);
      lista.appendChild(li);
    });
    secaoEl.hidden = itens.length === 0;
  }

  function preencherRecursos(etapaId) {
    var itens = RECURSOS.filter(function (r) { return r.etapa === etapaId; });
    var lista = document.getElementById("drawer-recursos");
    lista.textContent = "";

    itens.forEach(function (r) {
      var li = document.createElement("li");

      if (r.url) {
        var a = document.createElement("a");
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = r.titulo;
        li.appendChild(a);
      } else {
        li.appendChild(document.createTextNode(r.titulo));
      }

      if (r.nota) {
        var nota = document.createElement("span");
        nota.className = "lista__nota";
        escreverComCodigo(nota, " — " + r.nota);
        li.appendChild(nota);
      }
      lista.appendChild(li);
    });

    document.getElementById("drawer-secao-recursos").hidden = itens.length === 0;
  }

  function preencherProjetos(etapaId) {
    var itens = PROJETOS[etapaId] || [];
    var lista = document.getElementById("drawer-projetos");
    lista.textContent = "";

    itens.forEach(function (texto) {
      var li = document.createElement("li");
      escreverComCodigo(li, texto);
      lista.appendChild(li);
    });

    document.getElementById("drawer-secao-projetos").hidden = itens.length === 0;
  }

  function montarBotoesEstado() {
    var alvo = document.getElementById("drawer-estados");
    ESTADOS.forEach(function (estado) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "estado-btn";
      botao.textContent = estado.rotulo;
      botao.setAttribute("data-estado", estado.chave);
      botao.setAttribute("aria-pressed", "false");
      botao.addEventListener("click", function () {
        if (aberto && aberto.tipo === "topico") {
          definirEstado(aberto.id, estado.chave);
        }
      });
      alvo.appendChild(botao);
    });
  }

  function marcarBotoesEstado(id) {
    var atual = estadoDe(id);
    var botoes = document.querySelectorAll("#drawer-estados .estado-btn");
    Array.prototype.forEach.call(botoes, function (botao) {
      botao.setAttribute(
        "aria-pressed",
        botao.getAttribute("data-estado") === atual ? "true" : "false"
      );
    });
  }

  /* ------------------------------------------------------------
     busca — procura em título, descrição curta e explicação
     ------------------------------------------------------------ */
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""); /* ignora acentos */
  }

  function buscar(termo) {
    var alvo = normalizar(termo.trim());
    var mapa = document.getElementById("mapa");

    if (!alvo) {
      mapa.removeAttribute("data-filtrando");
      Object.keys(INDICE).forEach(function (id) {
        var botao = document.getElementById("topico-" + id);
        if (botao) botao.removeAttribute("data-oculto");
      });
      atualizarContagemBusca(null);
      return;
    }

    mapa.setAttribute("data-filtrando", "sim");
    var achados = 0;

    Object.keys(INDICE).forEach(function (id) {
      var t = INDICE[id].topico;
      var corpus = normalizar(
        t.titulo + " " + t.desc + " " + (t.detalhe || "")
      );
      var bate = corpus.indexOf(alvo) !== -1;

      var botao = document.getElementById("topico-" + id);
      if (botao) {
        if (bate) {
          botao.removeAttribute("data-oculto");
          achados++;
        } else {
          botao.setAttribute("data-oculto", "sim");
        }
      }
    });

    atualizarContagemBusca(achados);
  }

  function atualizarContagemBusca(achados) {
    var el = document.getElementById("progresso-texto");
    if (achados === null) {
      atualizarProgresso();
      return;
    }
    el.textContent =
      achados === 0
        ? "Nenhum tópico encontrado"
        : achados + (achados === 1 ? " tópico encontrado" : " tópicos encontrados");
  }

  /* ------------------------------------------------------------
     tema
     ------------------------------------------------------------ */
  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-tema", tema);
    try { window.localStorage.setItem(CHAVE_TEMA, tema); } catch (e) {}
  }

  function temaInicial() {
    try {
      var salvo = window.localStorage.getItem(CHAVE_TEMA);
      if (salvo) return salvo;
    } catch (e) {}
    return window.matchMedia &&
           window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro";
  }

  /* ------------------------------------------------------------
     ligações de interface
     ------------------------------------------------------------ */
  document.getElementById("drawer-fechar").addEventListener("click", fecharDrawer);
  sobreposicao.addEventListener("click", fecharDrawer);

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      if (!drawer.hidden) { fecharDrawer(); return; }
      var busca = document.getElementById("busca");
      if (document.activeElement === busca && busca.value) {
        busca.value = "";
        buscar("");
      }
    }
  });

  document.getElementById("busca").addEventListener("input", function (ev) {
    buscar(ev.target.value);
  });

  document.getElementById("btn-tema").addEventListener("click", function () {
    var atual = document.documentElement.getAttribute("data-tema");
    aplicarTema(atual === "escuro" ? "claro" : "escuro");
  });

  document.getElementById("btn-reset").addEventListener("click", function () {
    if (!window.confirm("Zerar todo o progresso deste roadmap?")) return;
    progresso = {};
    salvarProgresso();
    Object.keys(INDICE).forEach(pintarTopico);
    atualizarProgresso();
  });

  aplicarTema(temaInicial());
  montar();
})();
