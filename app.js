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
  var CHAVE_SUB = "roadmap:" + TRILHA + ":sub:v1";

  var CICLO = ["pendente", "estudando", "feito", "pulado"];
  /* glifos que a Departure Mono tem — ◔ e ✓ não estão nela. "pendente"
     deixa de ser vazio: o estado passa a ter forma, e não só cor. */
  var MARCAS = { pendente: "□", estudando: "►", feito: "■", pulado: "×" };

  /* arraste para fechar o painel */
  var INICIO_ARRASTO = 8;     /* px antes de decidir o eixo do gesto */
  var FRACAO_FECHAR = 0.3;    /* fração da largura que confirma o fechamento */
  var DURACAO_AJUSTE = 200;   /* ms do ajuste final — igual ao CSS */

  /* o gesto de ler o detalhe muda com o aparelho; resolvido uma vez só */
  var DICA_LER = (window.matchMedia &&
                  window.matchMedia("(pointer: coarse)").matches)
    ? "toque no [i] para ler"
    : "shift + clique para ler";

  /* índice id -> { topico, etapa, grupo } para o drawer e o progresso */
  var INDICE = {};

  var progresso = carregarProgresso();
  var subMarcados = carregarSub();
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

  /* os subassuntos marcados moram numa chave própria: são granularidade
     dentro do tópico, e misturá-los no mesmo objeto do progresso faria
     a contagem de tópicos concluídos somar coisa que não é tópico. */
  function carregarSub() {
    try {
      var bruto = window.localStorage.getItem(CHAVE_SUB);
      return bruto ? JSON.parse(bruto) : {};
    } catch (e) {
      return {};
    }
  }

  function salvarSub() {
    try {
      window.localStorage.setItem(CHAVE_SUB, JSON.stringify(subMarcados));
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
      marcarEstadoNoPainel(id);
    }
  }

  /* ------------------------------------------------------------
     subassuntos

     A maioria dos `desc` já é uma lista de subassuntos escrita como
     frase ("Criação, acesso seguro, iteração."). Um tópico que traga
     `subtopicos` manda; sem ele, tentamos partir a frase — com
     guardas, porque nem toda vírgula separa item de lista.
     ------------------------------------------------------------ */
  function subassuntosDe(topico) {
    if (topico.subtopicos && topico.subtopicos.length) return topico.subtopicos;
    return partirDesc(topico.desc);
  }

  function aparar(s) { return s.trim(); }

  function partirDesc(desc) {
    if (!desc) return null;

    /* dois-pontos marca oração ("Padrão: zero abaixo, identidade
       acima") e crase marca trecho de código, que não se pica */
    if (desc.indexOf(":") >= 0 || desc.indexOf("`") >= 0) return null;

    var t = aparar(desc);
    if (t.charAt(t.length - 1) === ".") t = t.slice(0, -1);

    var partes = t.split(",").map(aparar).filter(Boolean);

    /* o último trecho costuma fechar a lista com "a e b" */
    if (partes.length) {
      var cauda = partes[partes.length - 1].split(/\s+e\s+/);
      if (cauda.length === 2) {
        partes = partes.slice(0, -1).concat(cauda.map(aparar));
      }
    }

    /* menos de três partes é frase; parte longa é oração, não item */
    if (partes.length < 3) return null;
    for (var i = 0; i < partes.length; i++) {
      if (partes[i].length < 3) return null;
      if (partes[i].split(/\s+/).length > 5) return null;
    }
    return partes;
  }

  /* a chave vem do texto, não do índice: se uma contribuição reescrever
     um subassunto, a marca daquele item se perde — melhor que herdar a
     marca de um item que virou outra coisa */
  function chaveSub(topicoId, texto) {
    return topicoId + "|" + texto;
  }

  function contarSub(topicoId, subs) {
    var n = 0;
    subs.forEach(function (texto) {
      if (subMarcados[chaveSub(topicoId, texto)]) n++;
    });
    return n;
  }

  function montarSubassuntos(topicoId, subs) {
    var secao = document.getElementById("drawer-secao-sub");
    var alvo = document.getElementById("drawer-sub");
    alvo.textContent = "";

    if (!subs) {
      secao.hidden = true;
      return;
    }
    secao.hidden = false;

    var titulo = INDICE[topicoId] ? INDICE[topicoId].topico.titulo : "";
    subs.forEach(function (texto) {
      alvo.appendChild(criarSubassunto(topicoId, titulo, texto, subs));
    });
    atualizarContagemSub(topicoId, subs);
  }

  /* o par alternar + copiar: botão dentro de botão é HTML inválido, então
     os dois são irmãos num invólucro — é o invólucro que desenha a caixa,
     e os dois viram segmentos dela. Mesma solução do ⓘ no mapa. */
  function criarSubassunto(topicoId, tituloTopico, texto, subs) {
    var par = document.createElement("div");
    par.className = "subassunto-par";

    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "subassunto";

    var marca = document.createElement("span");
    marca.className = "subassunto__marca";

    botao.appendChild(marca);
    botao.appendChild(document.createTextNode(texto));
    pintarSub(botao, marca, !!subMarcados[chaveSub(topicoId, texto)]);

    botao.addEventListener("click", function () {
      var chave = chaveSub(topicoId, texto);
      if (subMarcados[chave]) delete subMarcados[chave];
      else subMarcados[chave] = 1;
      salvarSub();

      pintarSub(botao, marca, !!subMarcados[chave]);
      atualizarContagemSub(topicoId, subs);
      propagarEstado(topicoId, subs);
    });

    par.appendChild(botao);
    par.appendChild(criarCopiar(tituloTopico + " - " + texto));
    return par;
  }

  function criarCopiar(rotulo) {
    var copiar = document.createElement("button");
    copiar.type = "button";
    copiar.className = "subassunto__copiar";
    copiar.title = "Copiar “" + rotulo + "”";
    copiar.setAttribute("aria-label", copiar.title);
    copiar.appendChild(iconeCopiar());

    copiar.addEventListener("click", function () {
      copiarTexto(rotulo).then(
        function () { confirmarCopia(copiar, "sim", rotulo + " copiado"); },
        function () { confirmarCopia(copiar, "nao", "Não foi possível copiar"); }
      );
    });

    return copiar;
  }

  /* o ícone troca para o certo por ~1,4s. Guarda o relógio no próprio
     elemento: clicar de novo antes do tempo reinicia em vez de o
     primeiro relógio apagar a confirmação do segundo. */
  function confirmarCopia(botao, resultado, aviso) {
    botao.setAttribute("data-copiado", resultado);
    anunciar(aviso);

    window.clearTimeout(botao._relogio);
    botao._relogio = window.setTimeout(function () {
      botao.removeAttribute("data-copiado");
    }, 1400);
  }

  /* o leitor de tela não vê a troca de ícone; a região viva narra */
  function anunciar(texto) {
    var el = document.getElementById("aviso");
    if (el) el.textContent = texto;
  }

  /* navigator.clipboard só existe em contexto seguro, e o README manda
     abrir o index.html direto — em file:// não há API nenhuma.

     Mas não basta checar o contexto: a API também *rejeita* em tempo de
     execução, por documento sem foco ou permissão negada. Por isso o
     campo fora da tela é o fim de qualquer caminho, e não só o plano
     para file://. */
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () {
        return copiarPorCampo(texto);
      });
    }
    return copiarPorCampo(texto);
  }

  function copiarPorCampo(texto) {
    return new Promise(function (resolver, rejeitar) {
      var campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.top = "-1000px";
      document.body.appendChild(campo);
      campo.focus();
      campo.select();

      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(campo);

      if (ok) resolver();
      else rejeitar();
    });
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svg(tag, atributos) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(atributos).forEach(function (chave) {
      el.setAttribute(chave, atributos[chave]);
    });
    return el;
  }

  /* duas folhas, em cantos duros como o resto da página. O "certo" mora
     no mesmo <svg> e quem troca os dois é o CSS, pelo data-copiado. */
  function iconeCopiar() {
    var raiz = svg("svg", {
      viewBox: "0 0 14 14",
      width: "13",
      height: "13",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.6",
      "shape-rendering": "crispEdges",
      "aria-hidden": "true",
      focusable: "false",
    });

    var folhas = svg("g", { class: "icone--copiar" });
    folhas.appendChild(svg("rect", { x: "1", y: "4", width: "8", height: "9" }));
    folhas.appendChild(svg("path", { d: "M4 4V1h9v9h-3" }));

    var certo = svg("g", { class: "icone--ok" });
    certo.appendChild(svg("path", { d: "M2 7l4 4 6-8" }));

    raiz.appendChild(folhas);
    raiz.appendChild(certo);
    return raiz;
  }

  function pintarSub(botao, marca, marcado) {
    botao.setAttribute("aria-pressed", marcado ? "true" : "false");
    marca.textContent = marcado ? MARCAS.feito : MARCAS.pendente;
  }

  function atualizarContagemSub(topicoId, subs) {
    document.getElementById("drawer-sub-contagem").textContent =
      contarSub(topicoId, subs) + "/" + subs.length;
  }

  /* o estado do tópico segue os subassuntos: o primeiro marcado põe em
     estudo, todos marcados concluem, desmarcar volta. "Pulado" é uma
     decisão explícita e fica imune — senão espiar um subassunto
     desfaria o que a pessoa decidiu pular. */
  function propagarEstado(topicoId, subs) {
    if (estadoDe(topicoId) === "pulado") return;

    var n = contarSub(topicoId, subs);
    var alvo = n === 0 ? "pendente"
             : n === subs.length ? "feito"
             : "estudando";

    if (estadoDe(topicoId) !== alvo) definirEstado(topicoId, alvo);
  }

  function marcarEstadoNoPainel(id) {
    var el = document.getElementById("drawer-estado");
    var estado = estadoDe(id);
    el.hidden = false;
    el.setAttribute("data-estado", estado);
    el.textContent = MARCAS[estado] + " " + rotuloEstado(estado).toLowerCase();
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
      ? [["Toque", " cicla o estado · "], ["[i]", " abre o detalhe"]]
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

    /* fluxo único, na ordem em que os grupos foram escritos. Quem
       distribui em colunas é o CSS multicoluna, não o JS — assim a
       contagem de colunas acompanha a largura da tela sozinha. */
    var corpo = document.createElement("div");
    corpo.className = "etapa__grupos";

    etapa.grupos.forEach(function (grupo) {
      corpo.appendChild(criarGrupo(grupo, etapa));
    });

    secao.appendChild(corpo);
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

    /* o selo mostra só o algarismo; a palavra fica para quem lê por
       leitor de tela, onde "4" sozinho não diz nada */
    var palavra = document.createElement("span");
    palavra.className = "oculto-visual";
    palavra.textContent = "Etapa ";
    numero.appendChild(palavra);
    numero.appendChild(document.createTextNode(etapa.numero));

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
    info.textContent = "[i]";
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
    selo(ref.etapa.numero);
    marcarEstadoNoPainel(id);
    document.getElementById("drawer-titulo").textContent = ref.topico.titulo;

    /* o número da etapa está no selo, então aqui sobra só o caminho —
       e "›" diz que o grupo está dentro da etapa, que o "·" não dizia */
    var trilha = ref.etapa.titulo;
    if (ref.grupo.titulo) trilha += " › " + ref.grupo.titulo;
    document.getElementById("drawer-trilha").textContent = trilha;

    var subs = subassuntosDe(ref.topico);
    montarSubassuntos(id, subs);

    var desc = document.getElementById("drawer-desc");
    desc.hidden = !!subs;
    if (!subs) escreverComCodigo(desc, ref.topico.desc);

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

    /* o selo já carrega "Etapa N": a etiqueta repetiria a mesma coisa */
    etiqueta(null, null);
    selo(etapa.numero);
    document.getElementById("drawer-estado").hidden = true;
    document.getElementById("drawer-titulo").textContent = etapa.titulo;

    var meta = "Pré-requisitos: " + etapa.preRequisitos;
    if (etapa.duracao) meta += " · " + etapa.duracao;
    meta += " · " + contarTopicos(etapa) + " tópicos";
    document.getElementById("drawer-trilha").textContent = meta;

    montarSubassuntos(null, null);

    var descEtapa = document.getElementById("drawer-desc");
    descEtapa.hidden = false;
    escreverComCodigo(descEtapa, etapa.objetivo);
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
    el.hidden = !texto;
    el.textContent = texto || "";
    if (prioridade) el.setAttribute("data-prioridade", prioridade);
    else el.removeAttribute("data-prioridade");
  }

  function selo(numero) {
    document.getElementById("drawer-selo").textContent = numero;
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
    subMarcados = {};            /* senão os subassuntos remarcariam tudo */
    salvarProgresso();
    salvarSub();
    Object.keys(INDICE).forEach(pintarTopico);
    atualizarProgresso();
    if (aberto) fecharDrawer();  /* o painel aberto ficaria desatualizado */
  });

  aplicarTema(temaInicial());
  montar();
})();
