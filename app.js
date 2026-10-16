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
    /* algum arquivo da trilha não chegou e o trilhas.js já desenhou a
       falha no lugar do mapa. Montar o que sobrou seria pior do que
       não montar nada: a pessoa estudaria de um roadmap com etapas
       faltando sem ter como saber que faltam. O seletor continua de pé
       porque trocar de trilha é a saída de verdade — e ele não depende
       do ROADMAP, que pode nem existir se foi o data.js que caiu. */
    if (window.TRILHA_FALHOU) {
      montarSeletorTrilha();
      document.getElementById("titulo").textContent =
        window.TRILHAS && window.TRILHAS[TRILHA]
          ? window.TRILHAS[TRILHA].rotulo
          : "Roadmap";
      document.querySelector(".progresso").hidden = true;
      document.querySelector(".legenda").hidden = true;
      return;
    }

    document.title = "Roadmap de " + ROADMAP.titulo;
    montarSeletorTrilha();
    document.getElementById("titulo").textContent = ROADMAP.titulo;

    montarLegenda();
    montarDica();
    montarMascotes();

    var mapa = document.getElementById("mapa");
    ROADMAP.etapas.forEach(function (etapa) {
      mapa.appendChild(criarEtapa(etapa));
    });

    montarIndice();
    montarBotoesEstado();
    atualizarProgresso();
  }

  /* ------------------------------------------------------------
     o mascote aparece em três lugares: cabeçalho (marca), busca sem
     resultado e fim da trilha. Os dois últimos clonam o SVG do
     cabeçalho em vez de repetir o desenho — um desenho só no projeto,
     e mexer nele conserta os três de uma vez.
     ------------------------------------------------------------ */
  function montarMascotes() {
    var original = document.querySelector(".lateral__logo svg");
    if (!original) return;

    ["vazio-mascote", "completa-selo"].forEach(function (id) {
      var alvo = document.getElementById(id);
      if (alvo) alvo.appendChild(original.cloneNode(true));
    });
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

  /* ------------------------------------------------------------
     índice da trilha — a mesma árvore do mapa, reduzida à lateral.
     Cada tópico tem dois alvos: a marca cicla o estado, o rótulo rola
     até ele no mapa. A marca usa os mesmos glifos do mapa em vez de um
     checkbox: o tópico tem quatro estados, não dois.
     ------------------------------------------------------------ */
  function montarIndice() {
    var alvo = document.getElementById("indice");
    if (!alvo) return;

    ROADMAP.etapas.forEach(function (etapa) {
      var bloco = document.createElement("div");
      bloco.className = "indice__etapa";
      bloco.setAttribute("data-aberta", "nao");

      var cabeca = document.createElement("button");
      cabeca.type = "button";
      cabeca.className = "indice__cabeca";
      cabeca.setAttribute("aria-expanded", "false");

      var selo = document.createElement("span");
      selo.className = "indice__selo";
      selo.setAttribute("aria-hidden", "true");
      selo.textContent = etapa.numero;

      var nome = document.createElement("span");
      nome.className = "indice__nome";
      nome.textContent = etapa.titulo;

      cabeca.appendChild(selo);
      cabeca.appendChild(nome);
      bloco.appendChild(cabeca);

      var lista = document.createElement("ul");
      lista.className = "indice__lista";
      lista.hidden = true;

      etapa.grupos.forEach(function (grupo) {
        if (grupo.titulo) {
          var cab = document.createElement("li");
          cab.className = "indice__grupo";
          cab.textContent = grupo.titulo;
          lista.appendChild(cab);
        }
        grupo.topicos.forEach(function (topico) {
          lista.appendChild(criarLinhaIndice(topico));
        });
      });

      bloco.appendChild(lista);

      cabeca.addEventListener("click", function () {
        abrirNoIndice(etapa, lista.hidden);
      });

      alvo.appendChild(bloco);
      etapa._indiceLista = lista;
      etapa._indiceBloco = bloco;
      etapa._indiceCabeca = cabeca;
    });

    /* as linhas nascem sem marca: pintar depois de estarem no DOM */
    Object.keys(INDICE).forEach(pintarLinhaIndice);
  }

  function abrirNoIndice(etapa, abrir) {
    if (!etapa._indiceLista) return;
    etapa._indiceLista.hidden = !abrir;
    etapa._indiceBloco.setAttribute("data-aberta", abrir ? "sim" : "nao");
    etapa._indiceCabeca.setAttribute("aria-expanded", String(abrir));
  }

  function criarLinhaIndice(topico) {
    var li = document.createElement("li");
    li.className = "indice__item";
    li.id = "indice-" + topico.id;

    var marca = document.createElement("button");
    marca.type = "button";
    marca.className = "indice__marca";
    marca.setAttribute("data-prioridade", topico.prioridade);
    marca.setAttribute("aria-label", "Alternar o estado de " + topico.titulo);
    marca.addEventListener("click", function () { ciclar(topico.id); });

    var rotulo = document.createElement("button");
    rotulo.type = "button";
    rotulo.className = "indice__rotulo";
    rotulo.textContent = topico.titulo;
    rotulo.title = "Ir para " + topico.titulo + " no mapa";
    rotulo.addEventListener("click", function () { irParaTopico(topico.id); });

    li.appendChild(marca);
    li.appendChild(rotulo);
    return li;
  }

  function pintarLinhaIndice(id) {
    var li = document.getElementById("indice-" + id);
    if (!li) return;
    var estado = estadoDe(id);
    li.setAttribute("data-estado", estado);
    li.querySelector(".indice__marca").textContent = MARCAS[estado];
  }

  /* o tópico pode estar numa etapa fechada: abrir primeiro, senão a
     rolagem para numa faixa e o tópico não está em lugar nenhum da
     tela. E só rolar depois da sanfona — mirar numa posição que ainda
     está crescendo deixa o alvo fora de quadro no fim. */
  function irParaTopico(id) {
    var ref = INDICE[id];
    if (!ref) return;

    var precisavaAbrir = !etapaAberta(ref.etapa.id);
    abrirEtapaNoMapa(ref.etapa.id, true, ref.etapa.titulo);

    Object.keys(INDICE).forEach(function (outro) {
      var li = document.getElementById("indice-" + outro);
      if (li) li.removeAttribute("data-atual");
    });
    var atual = document.getElementById("indice-" + id);
    if (atual) atual.setAttribute("data-atual", "sim");

    window.setTimeout(function () {
      var botao = document.getElementById("topico-" + id);
      if (botao) botao.scrollIntoView({ behavior: "smooth", block: "center" });
    }, precisavaAbrir ? 260 : 0);

    /* no celular a gaveta cobre a tela: mantê-la aberta esconderia
       justamente o tópico que a pessoa pediu para ver */
    if (window.innerWidth <= 900) fecharGaveta();
  }

  function criarEtapa(etapa) {
    var secao = document.createElement("section");
    secao.className = "etapa";
    secao.setAttribute("data-etapa", etapa.id);
    secao.setAttribute("data-aberta", "nao");

    secao.appendChild(criarNucleo(etapa));

    /* fluxo único, na ordem em que os grupos foram escritos. Quem
       distribui em colunas é o CSS multicoluna, não o JS — assim a
       contagem de colunas acompanha a largura da tela sozinha. */
    var corpo = document.createElement("div");
    corpo.className = "etapa__grupos";
    corpo.id = "grupos-" + etapa.id;

    etapa.grupos.forEach(function (grupo) {
      corpo.appendChild(criarGrupo(grupo, etapa));
    });

    /* invólucro da sanfona: é a linha de grid dele que anima de 0fr a
       1fr. Sem o invólucro não há o que interpolar. */
    var sanfona = document.createElement("div");
    sanfona.className = "etapa__sanfona";
    sanfona.appendChild(corpo);

    secao.appendChild(sanfona);
    return secao;
  }

  /* o estado mora no atributo da seção: o CSS lê de lá para a sanfona,
     para o giro da seta e para a margem — uma fonte só */
  function etapaAberta(etapaId) {
    var secao = document.querySelector('.etapa[data-etapa="' + etapaId + '"]');
    return !!secao && secao.getAttribute("data-aberta") === "sim";
  }

  function abrirEtapaNoMapa(etapaId, abrir, titulo) {
    var secao = document.querySelector('.etapa[data-etapa="' + etapaId + '"]');
    if (!secao) return;

    secao.setAttribute("data-aberta", abrir ? "sim" : "nao");

    var botao = secao.querySelector(".etapa__expandir");
    if (!botao) return;
    botao.setAttribute("aria-expanded", String(abrir));
    botao.setAttribute("aria-label",
      (abrir ? "Esconder" : "Mostrar") + " os tópicos de " +
      (titulo || secao.querySelector(".etapa__titulo").textContent));
  }

  function criarNucleo(etapa) {
    var nucleo = document.createElement("div");
    nucleo.className = "etapa__nucleo";
    nucleo.setAttribute("data-etapa-id", etapa.id);

    var numero = document.createElement("span");
    numero.className = "etapa__numero";

    /* o selo mostra só o algarismo; a palavra fica para quem lê por
       leitor de tela, onde "4" sozinho não diz nada */
    var palavra = document.createElement("span");
    palavra.className = "oculto-visual";
    palavra.textContent = "Etapa ";
    numero.appendChild(palavra);
    numero.appendChild(document.createTextNode(etapa.numero));

    /* o título é quem abre a introdução agora; a faixa inteira deixou
       de ser botão porque a seta de expandir mora dentro dela, e botão
       dentro de botão é HTML inválido */
    var tituloBtn = document.createElement("button");
    tituloBtn.type = "button";
    tituloBtn.className = "etapa__titulo-btn";
    tituloBtn.title = etapa.objetivo + " (clique para ler a introdução)";

    var titulo = document.createElement("span");
    titulo.className = "etapa__titulo";
    titulo.textContent = etapa.titulo;
    tituloBtn.appendChild(titulo);

    tituloBtn.addEventListener("click", function () {
      abrirEtapa(etapa.id);
    });

    var meta = document.createElement("span");
    meta.className = "etapa__meta";
    meta.textContent = etapa.duracao
      ? etapa.duracao + " · pré: " + etapa.preRequisitos
      : "pré: " + etapa.preRequisitos;

    var anel = document.createElement("span");
    anel.className = "etapa__anel";
    anel.appendChild(document.createElement("span"));

    /* triângulo em degraus, na mesma grade de 16 dos outros ícones */
    var expandir = document.createElement("button");
    expandir.type = "button";
    expandir.className = "etapa__expandir";
    expandir.setAttribute("aria-expanded", "false");
    expandir.setAttribute("aria-controls", "grupos-" + etapa.id);
    expandir.setAttribute("aria-label", "Mostrar os tópicos de " + etapa.titulo);
    expandir.innerHTML =
      '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<rect x="2" y="5" width="12" height="1"/>' +
        '<rect x="3" y="6" width="10" height="1"/>' +
        '<rect x="4" y="7" width="8" height="1"/>' +
        '<rect x="5" y="8" width="6" height="1"/>' +
        '<rect x="6" y="9" width="4" height="1"/>' +
        '<rect x="7" y="10" width="2" height="1"/>' +
      '</svg>';

    expandir.addEventListener("click", function () {
      abrirEtapaNoMapa(etapa.id, !etapaAberta(etapa.id), etapa.titulo);
    });

    nucleo.appendChild(numero);
    nucleo.appendChild(tituloBtn);
    nucleo.appendChild(meta);
    nucleo.appendChild(anel);
    nucleo.appendChild(expandir);

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
    pintarLinhaIndice(id);   /* mapa e índice mostram o mesmo estado */
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

    /* nada de contador visível: a barra mostra a proporção, e um placar
       de 9/156 cansa antes de a pessoa começar. A frase exata continua
       indo para o leitor de tela, que precisa de um valor. */
    var pct = total ? Math.round((feitos / total) * 100) : 0;
    var barra = document.querySelector(".progresso__barra");

    document.getElementById("progresso-preenchido").style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(pct));

    var frase = feitos + " de " + total + " tópicos concluídos (" + pct + "%)";
    if (estudando) frase += ", " + estudando + " em estudo";
    if (pulados) frase += ", " + pulados + " pulados";
    barra.setAttribute("aria-valuetext", frase);

    /* 100% é literal: "pulado" não conta como feito, então chegar aqui
       exige ter marcado todos. É o que torna o momento raro o bastante
       para merecer a faixa. */
    var completa = document.getElementById("completa");
    completa.hidden = !(total > 0 && feitos === total);
    if (!completa.hidden) {
      document.getElementById("completa-meta").textContent =
        ROADMAP.titulo + " · " + feitos + " de " + total + " tópicos";
    }
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
      /* limpar o campo devolve tudo ao fechado, que é o padrão */
      ROADMAP.etapas.forEach(function (etapa) {
        abrirEtapaNoMapa(etapa.id, false, etapa.titulo);
        abrirNoIndice(etapa, false);
      });
      mostrarVazio(false, "");
      atualizarContagemBusca(null);   /* devolve o fim da trilha, se houver */
      return;
    }

    /* a faixa de conclusão fala do mapa inteiro, não do filtro */
    document.getElementById("completa").hidden = true;

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

    /* buscar desdobra o que casou, nos dois lados: esconder o resultado
       atrás de uma seta seria pedir a mesma busca duas vezes */
    ROADMAP.etapas.forEach(function (etapa) {
      var casou = etapa.grupos.some(function (grupo) {
        return grupo.topicos.some(function (t) {
          var botao = document.getElementById("topico-" + t.id);
          return botao && !botao.hasAttribute("data-oculto");
        });
      });
      abrirEtapaNoMapa(etapa.id, casou, etapa.titulo);
      abrirNoIndice(etapa, casou);
    });

    mostrarVazio(achados === 0, termo.trim());
    atualizarContagemBusca(achados);
  }

  /* o termo é repetido de volta porque metade das buscas vazias é erro
     de digitação, e ver o que foi procurado resolve na hora */
  function mostrarVazio(vazio, termo) {
    document.getElementById("vazio").hidden = !vazio;
    if (vazio) {
      document.getElementById("vazio-titulo").textContent =
        "Nada encontrado para “" + termo + "”";
    }
  }

  /* a contagem agora fica ao lado do campo, não na barra de progresso:
     é resultado de busca, não avanço na trilha — misturar os dois fazia
     a barra dizer uma coisa e o texto dela, outra */
  function atualizarContagemBusca(achados) {
    var el = document.getElementById("busca-contagem");
    if (achados === null) {
      el.textContent = "";
      atualizarProgresso();   /* devolve a faixa de fim de trilha */
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

  /* Esc fecha a camada mais de cima primeiro: confirmação, painel,
     gaveta, e só então limpa a busca */
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      if (!modal.hidden) { fecharModalReset(); return; }
      if (!drawer.hidden) { fecharDrawer(); return; }
      if (lateral.getAttribute("data-aberta") === "sim") { fecharGaveta(); return; }
      var busca = document.getElementById("busca");
      if (document.activeElement === busca && busca.value) {
        busca.value = "";
        buscar("");
      }
    }
  });

  /* mesma saída que o Esc já dava: limpa, refaz a busca e devolve o
     cursor ao campo, para a pessoa digitar de novo sem procurar o mouse */
  document.getElementById("vazio-limpar").addEventListener("click", function () {
    var campo = document.getElementById("busca");
    campo.value = "";
    buscar("");
    campo.focus();
  });

  /* o seletor é o controle de verdade; o botão só leva até ele — e
     ele mora na lateral, que pode estar fechada ou em gaveta */
  document.getElementById("completa-trilha").addEventListener("click", function () {
    aplicacao.removeAttribute("data-lateral");
    if (emGaveta() && lateral.getAttribute("data-aberta") !== "sim") abrirGaveta();
    document.getElementById("trilha").focus();
  });

  document.getElementById("busca").addEventListener("input", function (ev) {
    buscar(ev.target.value);
  });

  document.getElementById("btn-tema").addEventListener("click", function () {
    var atual = document.documentElement.getAttribute("data-tema");
    aplicarTema(atual === "escuro" ? "claro" : "escuro");
  });

  /* ------------------------------------------------------------
     zerar, com confirmação própria

     A caixa do navegador não tem a moldura dura da página e entraria
     como corpo estranho. E ela diz quantos tópicos somem em vez de
     "tem certeza?": o número é o que faz pesar o clique.
     ------------------------------------------------------------ */
  var btnReset = document.getElementById("btn-reset");
  var modal = document.getElementById("modal-reset");

  function abrirModalReset() {
    var marcados = Object.keys(progresso).length;
    if (!marcados) {
      anunciar("Nada marcado para zerar.");
      return;
    }
    document.getElementById("modal-texto").textContent = marcados === 1
      ? "1 tópico volta para pendente. Não dá para desfazer."
      : marcados + " tópicos voltam para pendente. Não dá para desfazer.";
    modal.hidden = false;
    document.getElementById("modal-cancelar").focus();
  }

  function fecharModalReset() {
    modal.hidden = true;
    btnReset.focus();
  }

  btnReset.addEventListener("click", abrirModalReset);
  document.getElementById("modal-cancelar").addEventListener("click", fecharModalReset);
  document.getElementById("modal-veu").addEventListener("click", fecharModalReset);

  document.getElementById("modal-confirmar").addEventListener("click", function () {
    progresso = {};
    subMarcados = {};            /* senão os subassuntos remarcariam tudo */
    salvarProgresso();
    salvarSub();
    Object.keys(INDICE).forEach(pintarTopico);
    atualizarProgresso();
    fecharModalReset();
    if (aberto) fecharDrawer();  /* o painel aberto ficaria desatualizado */
  });

  /* ------------------------------------------------------------
     abrir e fechar a lateral

     Um botão só serve aos dois modos: abaixo de 900px ele recolhe a
     gaveta, acima dele colapsa a coluna.
     ------------------------------------------------------------ */
  var aplicacao = document.getElementById("aplicacao");
  var lateral = document.getElementById("lateral");
  var btnGaveta = document.getElementById("btn-gaveta");
  var btnAbrirLateral = document.getElementById("btn-abrir-lateral");
  var btnFecharLateral = document.getElementById("btn-fechar-lateral");
  var veu = null;

  function emGaveta() { return window.innerWidth <= 900; }

  function abrirGaveta() {
    lateral.setAttribute("data-aberta", "sim");
    btnGaveta.setAttribute("aria-expanded", "true");
    veu = document.createElement("div");
    veu.className = "veu";
    veu.addEventListener("click", fecharGaveta);
    document.body.appendChild(veu);
  }

  function fecharGaveta() {
    lateral.removeAttribute("data-aberta");
    btnGaveta.setAttribute("aria-expanded", "false");
    if (veu) { veu.remove(); veu = null; }
  }

  btnGaveta.addEventListener("click", function () {
    if (lateral.getAttribute("data-aberta") === "sim") fecharGaveta();
    else abrirGaveta();
  });

  btnFecharLateral.addEventListener("click", function () {
    if (emGaveta()) { fecharGaveta(); return; }
    aplicacao.setAttribute("data-lateral", "fechada");
    btnAbrirLateral.focus();
  });

  btnAbrirLateral.addEventListener("click", function () {
    aplicacao.removeAttribute("data-lateral");
    btnFecharLateral.focus();
  });

  aplicarTema(temaInicial());
  montar();
})();
