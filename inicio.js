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
  var estojo = document.getElementById("estojo");
  var miniaturas = document.getElementById("estojo-miniaturas");
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
      /* o que falta andar é a cor da trilha esmaecida, não um cinza:
         numa carta zerada o tracejado é o único desenho visível, e era
         ele que deixava as três quase iguais */
      d: d, fill: "none", stroke: "var(--rota)", "stroke-opacity": "0.4",
      "stroke-width": "2.5",
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
     as peças do estojo

     Calendário e notas não são trilhas: não têm rota, não têm
     progresso e não entram em `nos` — o Obi passeia entre trilhas, e
     ele não saberia o que dizer sobre estas.

     Por isso moram no estojo, e não na fileira: a fileira de trilhas
     cresce sem teto, e o que vale para todas elas não pode ficar
     pendurado no fim da fila da quinquagésima.

     No lugar da rota, cada uma mostra em miniatura o que a pessoa
     vai encontrar do outro lado, desenhado em var(--rota) — que
     aqui é a cor da peça, não a de uma trilha.
     ------------------------------------------------------------ */
  var ESTOJO = [
    {
      id: "agenda",
      href: "calendario.html",
      nome: "Calendário",
      rodape: "Planeje o mês",
      rotulo: "Calendário de estudos, planejar o mês entre as trilhas",
      desenho: desenharMes
    },
    {
      id: "notas",
      href: "notas.html",
      nome: "Notas",
      rodape: "Escreva o que aprendeu",
      rotulo: "Mural de notas, um por trilha",
      desenho: desenharMural
    }
  ];

  function montarEstojo() {
    if (!estojo) return;
    ESTOJO.forEach(function (f) {
      estojo.appendChild(montarPeca(f));
      if (miniaturas) miniaturas.appendChild(montarMiniatura(f));
    });
    ligarTampa();
  }

  /* a miniatura é o mesmo desenho da peça, menor e sem texto: a tampa
     mostra o que guarda, não repete o nome do que guarda */
  function montarMiniatura(f) {
    var cela = texto("span", "estojo__mini carta--" + f.id);
    cela.appendChild(f.desenho());
    return cela;
  }

  /* ------------------------------------------------------------
     abrir e fechar o estojo

     O <dialog> nativo resolve sozinho o que daria mais trabalho que
     o resto junto: foco preso dentro, Esc que fecha, e um ::backdrop
     em camada própria — nada de z-index brigando com o Obi, que voa
     solto por cima da mesa.
     ------------------------------------------------------------ */
  function ligarTampa() {
    var tampa = document.getElementById("estojo-tampa");
    var painel = document.getElementById("estojo-aberto");
    var fechar = document.getElementById("estojo-fechar");
    if (!tampa || !painel) return;

    function abrir() {
      tampa.setAttribute("aria-expanded", "true");
      if (painel.showModal) {
        painel.showModal();
      } else {
        painel.setAttribute("open", "");   /* sem <dialog>: abre sem véu */
      }
      /* a primeira peça recebe o foco: quem abriu o estojo quer pegar
         alguma coisa, e não ler o título de novo */
      var primeira = painel.querySelector(".carta--peca");
      if (primeira && primeira.focus) primeira.focus();
    }

    function fechada() {
      tampa.setAttribute("aria-expanded", "false");
      /* o foco volta para a tampa: sem isso ele cai no começo da
         página e quem usa teclado perde o lugar */
      if (tampa.focus) tampa.focus();
    }

    tampa.addEventListener("click", abrir);
    if (fechar) fechar.addEventListener("click", function () { painel.close(); });

    /* clique no veu fecha: o alvo é o próprio <dialog> só quando se
       acerta a área de fora do painel */
    painel.addEventListener("click", function (ev) {
      if (ev.target === painel) painel.close();
    });

    painel.addEventListener("close", fechada);
    painel.addEventListener("cancel", fechada);
  }

  function montarPeca(f) {
    var classe = "carta carta--peca carta--" + f.id;

    var a = document.createElement("a");
    a.className = classe;
    a.href = f.href;
    a.setAttribute("aria-label", f.rotulo);

    /* a etiqueta do estojo já disse o que isto é; na carta
       sobra o que distingue uma da outra — para quem ela vale */
    var carimbo = texto("span", "carta__carimbo");
    carimbo.appendChild(texto("span", null, f.escopo));

    var quadro = texto("span", "carta__quadro");
    quadro.appendChild(f.desenho());

    var rodape = texto("span", "carta__rodape");
    rodape.appendChild(texto("span", null, f.rodape));

    a.appendChild(carimbo);
    a.appendChild(texto("span", "carta__nome", f.nome));
    a.appendChild(quadro);
    a.appendChild(rodape);

    a.addEventListener("click", function (ev) {
      /* mesma regra das trilhas: modificador ou botão do meio é
         pedido de nova aba, e aí quem anima seria a aba errada */
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
        return;
      }
      ev.preventDefault();
      a.className = classe + " carta--indo";

      /* 900ms é o que a cascata leva: o último pedaço começa aos
         470ms e a animação dura 420. Sair antes disso deixaria a
         carta pela metade na saída. */
      var espera = semMovimento() ? 120 : 900;
      window.setTimeout(function () { window.location.href = a.href; }, espera);
    });

    return a;
  }

  /* o mês em miniatura, no quadro de 300×240 das outras cartas: seis
     colunas cheias e a sétima vazia, que é o domingo de folga */
  function desenharMes() {
    var raiz = svg("svg", {
      viewBox: "0 0 300 240", class: "carta__mapa",
      role: "img", "aria-hidden": "true"
    });

    var col, lin, x, y, marcado;
    for (lin = 0; lin < 5; lin++) {
      for (col = 0; col < 7; col++) {
        x = 44 + col * 32;
        y = 54 + lin * 28;
        marcado = col < 6 && (lin + col) % 3 !== 2;
        raiz.appendChild(svg("rect", {
          /* só o dia marcado ganha a classe: a cascata do clique
             acende o que está escrito, e o vazio continua vazio */
          class: marcado ? "carta__acender" : "",
          x: x, y: y, width: 22, height: 18,
          fill: marcado ? "var(--rota)" : "none",
          "fill-opacity": marcado ? "0.75" : "0",
          stroke: "var(--rota)",
          "stroke-opacity": marcado ? "1" : "0.35",
          "stroke-width": "2",
          "shape-rendering": "crispEdges",
          /* a cascata corre por semana, de cima para baixo: é a
             ordem em que se lê um mês, não a ordem do DOM */
          style: marcado ? "animation-delay: " + (lin * 90 + col * 22) + "ms" : ""
        }));
      }
    }

    /* a faixa de cabeçalho do mês, para a miniatura não virar um
       xadrez solto no meio do papel */
    raiz.appendChild(svg("rect", {
      x: 44, y: 30, width: 214, height: 10,
      fill: "var(--rota)", "fill-opacity": "0.35",
      "shape-rendering": "crispEdges"
    }));

    return raiz;
  }

  /* o mural em miniatura: post-its espalhados e tortos, cada um com
     duas linhas de escrita. A torção é fixa por nota, como na tela —
     papel pregado não fica reto, mas também não dança sozinho. */
  function desenharMural() {
    var raiz = svg("svg", {
      viewBox: "0 0 300 240", class: "carta__mapa",
      role: "img", "aria-hidden": "true"
    });

    var postits = [
      { x: 44,  y: 36,  g: -5 },
      { x: 168, y: 28,  g: 4 },
      { x: 60,  y: 132, g: 3 },
      { x: 178, y: 140, g: -4 }
    ];

    postits.forEach(function (p, i) {
      var g = svg("g", {
        class: "carta__acender",
        transform: "rotate(" + p.g + " " + (p.x + 39) + " " + (p.y + 34) + ")",
        style: "animation-delay: " + (i * 130) + "ms"
      });

      g.appendChild(svg("rect", {
        x: p.x, y: p.y, width: 78, height: 68,
        fill: "var(--rota)", "fill-opacity": "0.75",
        stroke: "var(--rota)", "stroke-width": "2",
        "shape-rendering": "crispEdges"
      }));

      /* as duas linhas de escrita: é o que diferencia um post-it de
         um retângulo qualquer */
      g.appendChild(svg("rect", {
        x: p.x + 12, y: p.y + 22, width: 54, height: 5,
        fill: "var(--papel)", "fill-opacity": "0.85",
        "shape-rendering": "crispEdges"
      }));
      g.appendChild(svg("rect", {
        x: p.x + 12, y: p.y + 38, width: 36, height: 5,
        fill: "var(--papel)", "fill-opacity": "0.85",
        "shape-rendering": "crispEdges"
      }));

      raiz.appendChild(g);
    });

    return raiz;
  }

  /* ------------------------------------------------------------
     montagem
     ------------------------------------------------------------ */
  function montar() {
    Object.keys(window.TRILHAS).forEach(function (id, i) {
      var t = window.TRILHAS[id];
      if (!t.rota) return;   /* trilha sem rota ainda não vai à mesa */

      var feitos = Math.min(feitosDe(id), t.topicos);
      var fracao = t.topicos ? feitos / t.topicos : 0;
      var pct = Math.round(fracao * 100);

      var a = document.createElement("a");
      a.className = "carta";
      a.href = "roadmap.html?trilha=" + id;

      /* uma declaração pinta a carta inteira: o traço vencido, os marcos
         já cumpridos e a barra do rodapé todos leem var(--rota), então
         redefini-la aqui desce por herança até dentro do SVG */
      if (t.cor) a.style.setProperty("--rota", t.cor);
      a.setAttribute("aria-label",
        t.rotulo + ", " + t.etapas + " etapas, " + t.topicos + " tópicos, " +
        feitos + " concluídos");

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

    montarEstojo();
  }

  /* ------------------------------------------------------------
     o mascote espera no meio e só caminha quando uma carta é
     escolhida. As posições são medidas no DOM, não calculadas: a
     largura das cartas é clamp() e muda com a janela.
     ------------------------------------------------------------ */
  function centros() {
    var base = mesa.getBoundingClientRect();
    return nos.map(function (n) {
      var r = n.el.getBoundingClientRect();
      return r.left + r.width / 2 - base.left;
    });
  }

  /* a posição de descanso: o canto direito da mesa, debaixo do
     estojo. No meio ele dividia a atenção com a grade — e, com a
     grade rolando, ficava plantado no caminho da leitura. */
  function descanso() {
    /* 61 é metade da largura dele; os 80 são a folga que a caminha
       precisa à direita para ficar centrada nele sem sair da mesa */
    return mesa.getBoundingClientRect().width - 61 - 80;
  }

  /* o ponteiro ainda levanta a carta e vira o rosto do Obi — só não
     o faz andar */
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
    ator.setAttribute("data-andando", "sim");
    pintar();
    ator.removeAttribute("data-pulando");
    void ator.offsetWidth;          /* reinicia a animação do pulo */
    ator.setAttribute("data-pulando", "sim");

    var espera = semMovimento() ? 120 : 1250;
    /* a caminhada dura o tempo da transição do `left` (0.44s); depois
       ele chega e fica parado olhando a carta até a página trocar */
    window.setTimeout(function () { ator.removeAttribute("data-andando"); }, 460);
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

    /* no colo ou pousando, a posição do Obi é do arrasto, não da
       escolha: mexer no `left` aqui o arrancaria da mão de quem o
       segura */
    if (!obi || !obi.ocupado()) {
      /* o Obi anda atrás da carta escolhida, não da que está sob o
         ponteiro. Com a grade em duas linhas, seguir o ponteiro só no
         eixo X o deixaria apontando para a coluna certa e a linha
         errada — e um mascote que corre a cada passada de mouse
         disputa a atenção com a leitura das cartas. */
      var x = escolhido === null ? descanso() : centrosX[escolhido];
      ator.style.left = Math.round(x - 61) + "px";
    }

    cara.style.transform = foco === null ? "translateY(0)" : "translateY(-8px)";

    var t = foco === null ? null : nos[foco];
    document.getElementById("ator-svg").setAttribute("aria-label",
      t ? "Obi olhando a carta de " + t.dados.rotulo : "Obi, esperando");
  }

  /* ------------------------------------------------------------ */
  montar();

  /* inclinação leve e fixa por carta: mapas largados numa mesa não
     ficam alinhados. Fixa, e não aleatória, para não dançar a cada
     repintura. */
  [-1.4, 0.9, -0.7, 1.1].forEach(function (g, i) {
    if (nos[i]) nos[i].giro = g;
  });

  mesa.addEventListener("mousemove", function (ev) {
    if (escolhido !== null || obi.pegado()) return;
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

  /* ------------------------------------------------------------
     O olhar: os olhos acompanham o ponteiro pela mesa.

     As contas são em unidades do viewBox (406x310 desenhado em
     122px), não em pixels de tela: o transform de um elemento SVG
     com `transform-box: fill-box` vive no sistema do desenho. Daí os
     limites parecerem grandes — 14 unidades dão uns 4px na tela, que
     é o quanto um olho de 13 de raio pode correr sem ficar vesgo.
     ------------------------------------------------------------ */
  var olhos = [].slice.call(ator.querySelectorAll(".ator__olho"));
  var ALCANCE_X = 14;
  var ALCANCE_Y = 9;
  var vezOlhar = null;
  var olharAgendado = false;
  var ultimoEvento = null;

  /* susto, tontura, cutucada e colo já mandam nos olhos pelo CSS.
     Dois donos para o mesmo transform e o último a escrever ganha —
     então o olhar sai de cena enquanto qualquer um deles estiver. */
  function olhosOcupados() {
    return ator.hasAttribute("data-reagindo") ||
           ator.hasAttribute("data-humor") ||
           ator.hasAttribute("data-pendurado") ||
           ator.hasAttribute("data-voltando");
  }

  function soltarOlhar() {
    ator.removeAttribute("data-olhando");
    olhos.forEach(function (o) { o.style.transform = ""; });
  }

  function mirar() {
    olharAgendado = false;
    if (!ultimoEvento || estreito() || olhosOcupados()) return soltarOlhar();

    var r = ator.getBoundingClientRect();
    var dx = ultimoEvento.clientX - (r.left + r.width / 2);
    /* a mira sai da altura dos olhos, não do centro do corpo: ele
       olharia por cima de tudo se a conta partisse dos pés */
    var dy = ultimoEvento.clientY - (r.top + r.height * 0.42);

    /* a distância satura rápido: a meia tela de distância o olho já
       está no canto, e insistir só faria o gesto parar de responder */
    var escala = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 320);
    var ang = Math.atan2(dy, dx);

    var x = Math.cos(ang) * ALCANCE_X * escala;
    var y = Math.sin(ang) * ALCANCE_Y * escala;
    var t = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";

    ator.setAttribute("data-olhando", "sim");
    olhos.forEach(function (o) { o.style.transform = t; });

    /* parado o bastante, o olhar se desfaz e o piscar volta: um Obi
       de olho travado no canto fica com cara de quebrado */
    window.clearTimeout(vezOlhar);
    vezOlhar = window.setTimeout(soltarOlhar, 2600);
  }

  document.addEventListener("pointermove", function (ev) {
    if (ev.pointerType === "touch") return;
    ultimoEvento = ev;
    /* um frame por vez: pointermove dispara muito mais que isso, e
       cada chamada custa um getBoundingClientRect */
    if (olharAgendado) return;
    olharAgendado = true;
    window.requestAnimationFrame(mirar);
  });

  /* ------------------------------------------------------------
     O Obi reage a quem mexe nele — encostar, cutucar e carregar no
     colo moram no obi.js, que o roadmap também usa. O que é da mesa
     entra aqui pelas opções: aqui ele tem chão, e cutucada é
     cutucada mesmo (no roadmap ela segue o link).
     ------------------------------------------------------------ */
  var cutucadas = 0;
  var vezCutucadas = null;

  var obi = window.Obi.animar(ator, {
    chao: true,

    podeMexer: function () { return !estreito() && escolhido === null; },

    /* o limite é a própria mesa: na mesa ele tem onde morar, e sair
       dela o deixaria pairando sobre o rodapé */
    limite: function () {
      return { x: mesa.getBoundingClientRect().width / 2, y: 9999 };
    },

    /* insistir rende outra reação: a primeira graça é a surpresa, a
       quinta seguida só seria repetição */
    aoCutucar: function () {
      cutucadas += 1;
      window.clearTimeout(vezCutucadas);
      vezCutucadas = window.setTimeout(function () { cutucadas = 0; }, 1800);

      /* sem a ficha, o aviso da quinta cutucada não tem onde ser
         escrito: a tontura é a resposta inteira, como já é no
         roadmap */
      if (cutucadas >= 5) {
        cutucadas = 0;
        obi.reagir("tonto", 1500);
      } else {
        obi.reagir("susto", 480);
      }
    },

    aoChegar: function () { pintar(); }
  });

  pintar();
})();
