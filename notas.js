/* ============================================================
   Mural de notas — comportamento

   Um mural por trilha. A trilha vem do manifesto: `trilhas.js`
   roda antes com SO_MANIFESTO e deixa `TRILHAS` e `TRILHA_ATUAL`
   já resolvidos a partir de ?trilha=, com id desconhecido caindo
   no padrão.

   Nada daqui sobrevive ao recarregar: as notas são estado em
   memória, à espera do banco. É de propósito — texto escrito não
   se refaz, e localStorage não é lugar para o que não se refaz
   (o Safari apaga o de site sem visita em 7 dias). Quando o
   Supabase entrar, só `NOTAS` troca de origem; o resto desta
   página não muda.
   ============================================================ */
(function () {
  "use strict";

  var CORES = ["amarelo", "roxo", "verde", "cinza"];

  /* largura e altura de uma nota, em px, para o cálculo das vagas.
     Batem com .nota no notas.css (13,5rem) — e se saírem de sincronia
     o mural só fica com as vagas mais apertadas, nunca quebrado. */
  var NOTA_L = 216;
  var NOTA_A = 196;

  var trilhas = window.TRILHAS || {};
  var atual = window.TRILHA_ATUAL;

  /* exemplos enquanto não há banco: o mural vazio não ensina o gesto,
     e um mural de mentira é melhor professor que uma dica de texto */
  var NOTAS = [
    { id: 1, trilha: "ml", topico: "Overfitting", cor: "amarelo", x: 24, y: 20,
      texto: "Validação cruzada não conserta vazamento de dado. Separar ANTES de normalizar." },
    { id: 2, trilha: "ml", topico: null, cor: "roxo", x: 268, y: 52,
      texto: "Perguntar no fórum: por que o recall cai tanto quando balanceio as classes?" },
    { id: 3, trilha: "ml", topico: null, cor: "cinza", x: 52, y: 236,
      texto: "Erro que não quero repetir: treinei 40 min com o shuffle desligado." },
    { id: 4, trilha: "cv", topico: "Detecção de bordas", cor: "verde", x: 36, y: 28,
      texto: "Canny: os dois limiares são razão 1:2 ou 1:3. Abaixo disso vira chuvisco." },
    { id: 5, trilha: "cv", topico: null, cor: "amarelo", x: 292, y: 96,
      texto: "findContours altera a imagem de entrada. Sempre passar uma cópia." }
  ];

  var proximoId = 6;
  var zTopo = 10;

  var mural = document.getElementById("mural");
  var caixaFiltro = document.getElementById("filtro");
  var conta = document.getElementById("conta");
  var dica = document.getElementById("dica");

  /* ------------------------------------------------------------
     utilidades
     ------------------------------------------------------------ */
  function texto(tag, classe, conteudo) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (conteudo !== undefined) el.textContent = conteudo;
    return el;
  }

  function rotuloDe(id) {
    return trilhas[id] && trilhas[id].rotulo ? trilhas[id].rotulo : id;
  }

  function daTrilha(n) {
    return n.trilha === atual;
  }

  function visiveis() {
    return NOTAS.filter(daTrilha);
  }

  function contarDe(id) {
    var n = 0;
    NOTAS.forEach(function (nt) { if (nt.trilha === id) n += 1; });
    return n;
  }

  /* o arrasto é de ponteiro fino: no toque a mesma área precisa rolar
     a página, e no celular o mural é grade, onde mover não quer dizer
     nada. A media query do CSS e esta checagem contam a mesma história
     e precisam continuar contando. */
  function arrastavel() {
    return window.matchMedia && window.matchMedia("(min-width: 56.0625rem)").matches;
  }

  /* ------------------------------------------------------------
     abas
     ------------------------------------------------------------ */
  function montarFiltro() {
    caixaFiltro.innerHTML = "";

    Object.keys(trilhas).forEach(function (id) {
      var t = trilhas[id];
      var a = document.createElement("a");
      a.className = "filtro__aba";
      a.href = "notas.html?trilha=" + id;
      a.setAttribute("data-trilha", id);

      /* a cor vem do manifesto, não do CSS: trilha nova entra sem
         ninguém escrever uma regra para ela */
      if (t.cor) a.style.setProperty("--trilha-cor", t.cor);
      if (id === atual) a.setAttribute("aria-current", "page");

      a.appendChild(document.createTextNode(t.rotulo + " "));
      a.appendChild(texto("span", "filtro__n", contarDe(id)));

      /* trocar de mural não recarrega: a querystring muda no histórico
         e o mural se redesenha. Clique com modificador continua sendo
         do navegador — é pedido de nova aba. */
      a.addEventListener("click", function (ev) {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
          return;
        }
        ev.preventDefault();
        irPara(id, true);
      });

      caixaFiltro.appendChild(a);
    });
  }

  function irPara(id, empilhar) {
    if (!trilhas[id]) return;
    atual = id;
    if (empilhar && window.history && window.history.pushState) {
      window.history.pushState({ trilha: id }, "", "notas.html?trilha=" + id);
    }
    mural.setAttribute("aria-label", "Mural de " + rotuloDe(id));
    montarFiltro();
    desenhar();
  }

  /* o botão de voltar troca de mural em vez de sair da página */
  window.addEventListener("popstate", function () {
    var achado = /[?&]trilha=([\w-]+)/.exec(window.location.search);
    irPara(achado && trilhas[achado[1]] ? achado[1] : atual, false);
  });

  /* ------------------------------------------------------------
     o mural
     ------------------------------------------------------------ */
  /* nota sem posição não pode nascer em cima de outra: as vagas
     correm em colunas, dentro da largura que o mural tem agora */
  function vagaLivre(indice) {
    var util = Math.max(mural.clientWidth - 32, NOTA_L);
    var colunas = Math.max(Math.floor(util / NOTA_L), 1);
    var col = indice % colunas;
    var lin = Math.floor(indice / colunas);
    return { x: 16 + col * NOTA_L, y: 16 + lin * NOTA_A };
  }

  function desenhar() {
    mural.innerHTML = "";

    var lista = visiveis();
    conta.textContent = lista.length === 0 ? "nenhuma nota"
                      : lista.length === 1 ? "1 nota"
                      : lista.length + " notas";

    if (!lista.length) {
      mural.appendChild(texto("p", "mural__vazio",
        "O mural de " + rotuloDe(atual) + " está limpo. Escreva a primeira."));
      return;
    }

    lista.forEach(function (n, i) {
      mural.appendChild(montarNota(n, i));
    });
  }

  function montarNota(n, indice) {
    var el = document.createElement("article");
    el.className = "nota";
    el.setAttribute("data-cor", n.cor);
    el.setAttribute("aria-label", n.topico ? "Nota presa em " + n.topico : "Nota solta");

    if (n.x === undefined || n.y === undefined || n.x === null || n.y === null) {
      var vaga = vagaLivre(indice);
      n.x = vaga.x;
      n.y = vaga.y;
    }
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";

    /* a torção vem do id: a mesma nota entorta sempre para o mesmo
       lado, em vez de dançar a cada redesenho */
    el.style.setProperty("--torcao", (((n.id * 37) % 5) - 2) * 0.6 + "deg");

    var alca = texto("div", "nota__alca");
    var ancora = texto("span", "nota__ancora" + (n.topico ? "" : " nota__ancora--solta"),
                       n.topico ? "◆ " + n.topico : "◇ solta");
    alca.appendChild(ancora);

    var acoes = texto("span", "nota__acoes");
    acoes.appendChild(botaoAncora(n));
    acoes.appendChild(botaoApagar(n));
    alca.appendChild(acoes);

    var campo = document.createElement("textarea");
    campo.className = "nota__texto";
    campo.rows = 5;
    campo.value = n.texto;
    campo.setAttribute("aria-label", "Texto da nota");
    campo.addEventListener("input", function () { n.texto = campo.value; });

    var pe = texto("div", "nota__pe");
    pe.appendChild(paleta(n, el));

    el.appendChild(alca);
    el.appendChild(campo);
    el.appendChild(pe);

    ligarArrasto(el, alca, n);
    return el;
  }

  function botaoAncora(n) {
    var b = document.createElement("button");
    b.className = "nota__acao";
    b.type = "button";
    b.textContent = n.topico ? "◆" : "◇";
    /* prender num tópico de verdade espera a lista da trilha, que só
       existe com a trilha carregada; por ora o botão solta o que está
       preso e não inventa âncora nenhuma */
    b.title = n.topico ? "Soltar do tópico " + n.topico : "Prender a um tópico (em breve)";
    b.setAttribute("aria-label", b.title);
    b.disabled = !n.topico;
    b.addEventListener("click", function () {
      n.topico = null;
      desenhar();
    });
    return b;
  }

  function botaoApagar(n) {
    var b = document.createElement("button");
    b.className = "nota__acao";
    b.type = "button";
    b.textContent = "×";
    b.title = "Apagar nota";
    b.setAttribute("aria-label", "Apagar nota");
    b.addEventListener("click", function () {
      NOTAS = NOTAS.filter(function (o) { return o.id !== n.id; });
      montarFiltro();
      desenhar();
    });
    return b;
  }

  function paleta(n, el) {
    var cores = texto("span", "cores");
    cores.setAttribute("role", "group");
    cores.setAttribute("aria-label", "Cor da nota");

    CORES.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "cor";
      b.type = "button";
      b.setAttribute("data-cor", c);
      b.setAttribute("aria-pressed", n.cor === c ? "true" : "false");
      b.setAttribute("aria-label", "Pintar de " + c);
      b.addEventListener("click", function () {
        n.cor = c;
        el.setAttribute("data-cor", c);
        /* só os irmãos mudam de estado: redesenhar o mural inteiro
           por uma troca de cor roubaria o foco de quem escrevia */
        var irmaos = cores.getElementsByClassName("cor");
        var i;
        for (i = 0; i < irmaos.length; i += 1) {
          irmaos[i].setAttribute("aria-pressed",
            irmaos[i].getAttribute("data-cor") === c ? "true" : "false");
        }
      });
      cores.appendChild(b);
    });

    return cores;
  }

  /* ------------------------------------------------------------
     arrastar

     Um eixo por propriedade (left e top), nunca transform: o
     transform da nota já está ocupado com a torção, e juntar os dois
     faria o gesto brigar com o enfeite.
     ------------------------------------------------------------ */
  function ligarArrasto(el, alca, n) {
    alca.addEventListener("pointerdown", function (ev) {
      if (!arrastavel() || ev.button !== 0) return;
      ev.preventDefault();

      var caixa = mural.getBoundingClientRect();
      var nota = el.getBoundingClientRect();
      var pegoX = ev.clientX - nota.left;
      var pegoY = ev.clientY - nota.top;

      el.setAttribute("data-pegada", "sim");
      zTopo += 1;
      el.style.zIndex = zTopo;
      alca.setPointerCapture(ev.pointerId);

      function mover(e) {
        var x = e.clientX - caixa.left - pegoX;
        var y = e.clientY - caixa.top - pegoY;
        /* o mural é o limite: nota largada fora dele é nota perdida */
        x = Math.max(0, Math.min(x, caixa.width - nota.width));
        y = Math.max(0, Math.min(y, caixa.height - nota.height));
        n.x = Math.round(x);
        n.y = Math.round(y);
        el.style.left = n.x + "px";
        el.style.top = n.y + "px";
      }

      function largar(e) {
        el.removeAttribute("data-pegada");
        try { alca.releasePointerCapture(e.pointerId); } catch (erro) { /* já solto */ }
        alca.removeEventListener("pointermove", mover);
        alca.removeEventListener("pointerup", largar);
        alca.removeEventListener("pointercancel", largar);
        /* aqui entra a gravação quando houver banco: uma escrita por
           arrasto, no soltar — nunca a cada pixel do pointermove */
      }

      alca.addEventListener("pointermove", mover);
      alca.addEventListener("pointerup", largar);
      alca.addEventListener("pointercancel", largar);
    });
  }

  /* ------------------------------------------------------------
     nota nova
     ------------------------------------------------------------ */
  document.getElementById("btn-nova").addEventListener("click", function () {
    NOTAS.unshift({
      id: proximoId,
      trilha: atual,          /* a nota nasce na trilha do mural aberto */
      topico: null,
      cor: "amarelo",
      texto: "",
      x: null,
      y: null
    });
    proximoId += 1;

    montarFiltro();
    desenhar();

    /* escrever é o passo seguinte do gesto: o cursor já vai para lá */
    var primeiro = mural.querySelector(".nota__texto");
    if (primeiro) primeiro.focus();
  });

  /* ------------------------------------------------------------
     a dica muda com o apontador, como a legenda do mapa
     ------------------------------------------------------------ */
  function pintarDica() {
    dica.textContent = arrastavel()
      ? "Arraste pela faixa de cima · ◆ marca a nota presa a um tópico"
      : "Toque para escrever · ◆ marca a nota presa a um tópico";
  }

  window.addEventListener("resize", pintarDica);

  /* ------------------------------------------------------------
     partida
     ------------------------------------------------------------ */
  if (!trilhas[atual]) {
    atual = Object.keys(trilhas)[0];
  }
  mural.setAttribute("aria-label", "Mural de " + rotuloDe(atual));
  montarFiltro();
  desenhar();
  pintarDica();
}());
