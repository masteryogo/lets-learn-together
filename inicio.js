/* ============================================================
   Página de entrada — monta as cartas a partir do manifesto.

   Depende só do window.TRILHAS que o trilhas.js expõe (com
   SO_MANIFESTO ligado, ele não baixa nenhuma trilha). O progresso
   vem do localStorage, a mesma chave que o roadmap grava.
   ============================================================ */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* o quadro é exibido na altura em que foi desenhado: o espaço
     vertical que sobrava embaixo agora é do rodapé */
  var ALTURA = 240;
  var CHAVE_LEGADA = "roadmap-ml:progresso:v1"; /* de antes das trilhas */

  var cartas = document.getElementById("cartas");
  var mesa = document.getElementById("mesa");
  var ator = document.getElementById("ator");
  var cara = document.getElementById("ator-cara");

  var foco = null;      /* índice sob o ponteiro */
  var escolhido = null; /* índice clicado */
  var nos = [];

  /* ------------------------------------------------------------
     progresso: conta os tópicos marcados como feito na trilha
     ------------------------------------------------------------ */
  function feitosDe(id) {
    var chaves = ["roadmap:" + id + ":progresso:v1"];
    if (id === "ml") chaves.push(CHAVE_LEGADA);

    for (var i = 0; i < chaves.length; i++) {
      try {
        var bruto = window.localStorage.getItem(chaves[i]);
        if (!bruto) continue;
        var mapa = JSON.parse(bruto);
        var n = 0;
        Object.keys(mapa).forEach(function (k) {
          if (mapa[k] === "feito") n++;
        });
        return n;
      } catch (e) {
        /* localStorage bloqueado: a trilha aparece como intocada */
      }
    }
    return 0;
  }

  function svg(tag, atributos) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(atributos).forEach(function (chave) {
      el.setAttribute(chave, atributos[chave]);
    });
    return el;
  }

  function texto(tag, classe, conteudo) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (conteudo !== undefined) el.textContent = conteudo;
    return el;
  }

  /* ------------------------------------------------------------
     o quadro da carta: relevo, rota e marcos
     ------------------------------------------------------------ */
  function estreito() {
    return window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
  }

  /* na largura cheia de um celular o quadro quadrado deixaria cada
     carta com quase mil pixels de altura. Lá a rota deita: mesmo
     traçado, comprimido na vertical, sem relevo nem bússola. */
  function montarQuadro(t, fracao) {
    var deitado = estreito();
    var pontos = t.rota.map(function (p) {
      return deitado
        ? [p[0], Math.round(22 + (p[1] - 46) * (74 / 168))]
        : [p[0], p[1]];
    });
    var d = "M" + pontos.map(function (p) { return p[0] + " " + p[1]; }).join(" L");
    var vencidas = Math.round(fracao * t.etapas);

    var raiz = svg("svg", {
      viewBox: deitado ? "0 0 300 118" : "0 0 300 " + ALTURA,
      "aria-hidden": "true",
    });

    /* dois montes em curvas de nível, iguais em toda carta: é o
       relevo do papel, não informação */
    var relevo = svg("g", { fill: "none", stroke: "var(--relevo)", "stroke-width": "1" });
    [
      "M56 96 q8.8 -15.6 32 -2.1 q-4.8 17.7 -32 2.1 z",
      "M40 96 q17.6 -31.2 64 -4.2 q-9.6 35.4 -64 4.2 z",
      "M24 96 q26.4 -46.8 96 -6.2 q-14.4 53 -96 6.2 z",
      "M202 150 q11 -19.5 40 -2.6 q-6 22.1 -40 2.6 z",
      "M182 150 q22 -39 80 -5.2 q-12 44.2 -80 5.2 z",
      "M162 150 q33 -58.5 120 -7.8 q-18 66.3 -120 7.8 z",
    ].forEach(function (curva) {
      relevo.appendChild(svg("path", { d: curva }));
    });
    if (!deitado) raiz.appendChild(relevo);

    /* o caminho inteiro, tracejado: o que ainda falta andar */
    raiz.appendChild(svg("path", {
      d: d, fill: "none", stroke: "var(--rota-falta)", "stroke-width": "2.5",
      "stroke-dasharray": "7 6", "stroke-linecap": "round", "stroke-linejoin": "round",
    }));

    /* o trecho já vencido, em tinta cheia. pathLength normaliza o
       traçado em 100, então o offset é a porcentagem direta. */
    raiz.appendChild(svg("path", {
      d: d, pathLength: "100", fill: "none", stroke: "var(--rota)", "stroke-width": "3.5",
      "stroke-linecap": "round", "stroke-linejoin": "round",
      "stroke-dasharray": "100", "stroke-dashoffset": String(100 - fracao * 100),
    }));

    /* a mesma rota em destaque, que se desenha ao escolher */
    var cheia = svg("path", {
      d: d, pathLength: "100", fill: "none", stroke: "var(--alfinete)", "stroke-width": "3",
      "stroke-linecap": "round", "stroke-linejoin": "round",
      "stroke-dasharray": "100", "stroke-dashoffset": "100",
    });
    cheia.setAttribute("class", "carta__rota-cheia");
    raiz.appendChild(cheia);

    pontos.forEach(function (p, i) {
      raiz.appendChild(svg("rect", {
        x: p[0] - 4, y: p[1] - 4, width: 8, height: 8,
        stroke: "var(--tinta)", "stroke-width": "1.6",
        fill: i < vencidas ? "var(--rota)" : "var(--papel)",
      }));
    });

    /* onde você parou */
    if (fracao > 0 && fracao < 1) {
      var atual = Math.min(Math.max(vencidas - 1, 0), pontos.length - 1);
      var pino = svg("g", {
        transform: "translate(" + pontos[atual][0] + "," + pontos[atual][1] + ")",
      });
      pino.appendChild(svg("path", { d: "M0 -26 L6 -14 L-6 -14 Z", fill: "var(--alfinete)" }));
      pino.appendChild(svg("circle", { cx: 0, cy: -26, r: 5, fill: "var(--alfinete)" }));
      raiz.appendChild(pino);
    }

    if (deitado) return raiz;

    var bussola = svg("g", { transform: "translate(30,46)", fill: "var(--tinta-fraca)" });
    bussola.appendChild(svg("path", { d: "M0 -15 L4 0 L0 15 L-4 0 Z", fill: "var(--tinta)" }));
    bussola.appendChild(svg("path", { d: "M-15 0 L0 -4 L15 0 L0 4 Z" }));
    var norte = svg("text", {
      x: 0, y: -19, "font-size": "9", "text-anchor": "middle", fill: "var(--tinta)",
    });
    norte.textContent = "N";
    bussola.appendChild(norte);
    raiz.appendChild(bussola);

    return raiz;
  }

  /* ------------------------------------------------------------
     montagem
     ------------------------------------------------------------ */
  function montar() {
    Object.keys(window.TRILHAS).forEach(function (id, i) {
      var t = window.TRILHAS[id];
      if (!t.rota) return;   /* trilha sem ficha ainda não vai à mesa */

      var feitos = Math.min(feitosDe(id), t.topicos);
      var fracao = t.topicos ? feitos / t.topicos : 0;
      var pct = Math.round(fracao * 100);

      var a = document.createElement("a");
      a.className = "carta";
      a.href = "roadmap.html?trilha=" + id;
      a.setAttribute("aria-label",
        t.rotulo + ", " + t.etapas + " etapas, " + t.topicos + " tópicos, " +
        feitos + " concluídos");

      var carimbo = texto("span", "carta__carimbo");
      carimbo.appendChild(texto("span", null, "Folha " + ("0" + (i + 1)).slice(-2)));
      carimbo.appendChild(texto("span", null, t.etapas + " etapas"));

      var quadro = texto("span", "carta__quadro");
      quadro.appendChild(montarQuadro(t, fracao));

      var rodape = texto("span", "carta__rodape");
      rodape.appendChild(texto("span", null, feitos + "/" + t.topicos));
      var barra = texto("span", "carta__barra");
      var cheio = document.createElement("span");
      cheio.style.width = pct + "%";
      barra.appendChild(cheio);
      rodape.appendChild(barra);
      rodape.appendChild(texto("span", null, pct + "%"));

      a.appendChild(carimbo);
      a.appendChild(texto("span", "carta__nome", t.rotulo));
      a.appendChild(quadro);
      a.appendChild(rodape);

      var indice = nos.length;
      a.addEventListener("click", function (ev) {
        /* Ctrl/Cmd, Shift ou botão do meio: é pedido de nova aba, e o
           navegador cuida. Só o clique simples vira animação. */
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
          return;
        }
        ev.preventDefault();
        escolher(indice, a.href);
      });
      a.addEventListener("mouseenter", function () { focar(indice); });
      a.addEventListener("focus", function () { focar(indice); });

      cartas.appendChild(a);
      nos.push({
        el: a, id: id, dados: t, feitos: feitos, fracao: fracao, quadro: quadro,
      });
    });

    /* a vaga: o README pede trilhas novas, e a mesa tem espaço */
    var vaga = document.createElement("a");
    vaga.className = "vaga";
    vaga.href = "https://github.com/masteryogo/lets-learn-together/issues/new";
    vaga.target = "_blank";
    vaga.rel = "noopener noreferrer";
    vaga.setAttribute("aria-label", "Sugerir uma trilha nova");
    vaga.appendChild(texto("span", "vaga__marca", "?"));
    vaga.appendChild(texto("span", "vaga__texto", "território por mapear"));
    cartas.appendChild(vaga);
  }

  /* ------------------------------------------------------------
     o mascote segue o ponteiro. As posições são medidas no DOM, não
     calculadas: a largura das cartas é clamp() e muda com a janela.
     ------------------------------------------------------------ */
  function centros() {
    var base = mesa.getBoundingClientRect();
    return nos.map(function (n) {
      var r = n.el.getBoundingClientRect();
      return r.left + r.width / 2 - base.left;
    });
  }

  function meio() { return mesa.getBoundingClientRect().width / 2; }

  function focar(i) {
    if (escolhido !== null || foco === i) return;
    foco = i;
    pintar();
  }

  /* a rota se desenha e a página entra sozinha quando ela termina:
     ver a animação não pode custar um clique a mais */
  function escolher(i, destino) {
    escolhido = i;
    foco = i;
    pintar();
    ator.removeAttribute("data-pulando");
    void ator.offsetWidth;          /* reinicia a animação do pulo */
    ator.setAttribute("data-pulando", "sim");

    var espera = semMovimento() ? 120 : 1250;
    window.setTimeout(function () { window.location.href = destino; }, espera);
  }

  function semMovimento() {
    return window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pintar() {
    var centrosX = centros();

    nos.forEach(function (n, i) {
      var sob = escolhido !== null;
      var eu = escolhido === i;

      n.el.classList.toggle("carta--aberta", eu);

      var y = 0, s = 1, g = n.giro;
      if (eu) { y = -16; s = 1.06; g = 0; }
      else if (!sob && foco === i) { y = -10; g = 0; }

      n.el.style.transform =
        "translateY(" + y + "px) rotate(" + g + "deg) scale(" + s + ")";
      n.el.style.opacity = sob && !eu ? "0.3" : "1";
      n.el.style.boxShadow = eu
        ? "0 26px 40px rgba(21,20,26,0.35)"
        : "0 8px 18px rgba(21,20,26,0.2)";
    });

    var x = foco === null ? meio() : centrosX[foco];
    ator.style.left = Math.round(x - 61) + "px";

    if (foco !== null && escolhido === null) ator.setAttribute("data-andando", "sim");
    else ator.removeAttribute("data-andando");

    cara.style.transform = foco === null ? "translateY(0)" : "translateY(-8px)";

    var t = foco === null ? null : nos[foco];
    document.getElementById("ator-svg").setAttribute("aria-label",
      t ? "O mascote olhando a carta de " + t.dados.rotulo : "O mascote, esperando");

    document.getElementById("ficha-titulo").textContent =
      t ? t.dados.rotulo : "Escolha um território";

    document.getElementById("ficha-linha").textContent = !t
      ? "Passe o ponteiro pelas cartas — o mascote vai junto."
      : escolhido !== null
        ? "Rota traçada. Abrindo o roadmap de " + t.dados.rotulo + "…"
        : t.dados.etapas + " etapas · " + t.dados.topicos + " tópicos · " +
          (t.feitos === 0 ? "território intocado"
           : t.feitos >= t.dados.topicos ? "percorrida inteira"
           : t.feitos + " marcos vencidos");

    var partir = document.getElementById("ficha-partir");
    partir.hidden = escolhido === null;
    if (escolhido !== null) partir.href = "roadmap.html?trilha=" + nos[escolhido].id;
    /* o botão só serve de rede: se o salto automático falhar, ele leva */
  }

  /* ------------------------------------------------------------ */
  montar();

  /* inclinação leve e fixa por carta: mapas largados numa bancada não
     ficam alinhados. Fixa, e não aleatória, para não dançar a cada
     repintura. */
  [-1.4, 0.9, -0.7, 1.1].forEach(function (g, i) {
    if (nos[i]) nos[i].giro = g;
  });

  mesa.addEventListener("mousemove", function (ev) {
    if (escolhido !== null) return;
    var base = mesa.getBoundingClientRect();
    var x = ev.clientX - base.left;
    var melhor = null, menor = Infinity;
    centros().forEach(function (c, i) {
      var d = Math.abs(c - x);
      if (d < menor) { menor = d; melhor = i; }
    });
    if (menor > 190) melhor = null;
    if (melhor !== foco) { foco = melhor; pintar(); }
  });

  mesa.addEventListener("mouseleave", function () {
    if (escolhido !== null) return;
    foco = null;
    pintar();
  });

  /* a janela mudou de tamanho: as cartas andaram, o mascote vai atrás.
     E se cruzou o limite do layout, o quadro é redesenhado deitado
     ou em pé — não dá para fazer isso só com CSS, porque o viewBox
     e as coordenadas da rota mudam. */
  var eraEstreito = estreito();

  window.addEventListener("resize", function () {
    var agora = estreito();
    if (agora !== eraEstreito) {
      eraEstreito = agora;
      nos.forEach(function (n) {
        n.quadro.textContent = "";
        n.quadro.appendChild(montarQuadro(n.dados, n.fracao));
      });
    }
    pintar();
  });

  pintar();
})();
