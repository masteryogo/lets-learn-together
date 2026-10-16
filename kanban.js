/* ============================================================
   Quadro de trabalho — montagem e painel

   Nada de innerHTML aqui: o texto dos cards contém aspas e coisas
   como `trilhas/<id>/*.js`, que viram tag se forem coladas como
   HTML. createElement + textContent é mais verboso e não tem esse
   buraco.
   ============================================================ */

(function () {
  "use strict";

  var quadro  = document.getElementById("quadro");
  var raias   = document.getElementById("raias");
  var numeros = document.getElementById("numeros");
  var aviso   = document.getElementById("aviso");

  var painel  = document.getElementById("painel");
  var veu     = document.getElementById("veu");

  /* quem abriu o painel, para devolver o foco ao fechar: aria-modal
     sem isso deixa o teclado largado no começo da página */
  var origem = null;
  var raiaAtiva = "todas";

  function elemento(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) { el.className = classe; }
    if (texto)  { el.textContent = texto; }
    return el;
  }

  function rotuloRaia(id) {
    for (var i = 0; i < KANBAN_RAIAS.length; i++) {
      if (KANBAN_RAIAS[i].id === id) { return KANBAN_RAIAS[i].rotulo; }
    }
    return id;
  }

  function cardPorId(id) {
    for (var i = 0; i < KANBAN_CARDS.length; i++) {
      if (KANBAN_CARDS[i].id === id) { return KANBAN_CARDS[i]; }
    }
    return null;
  }

  /* -------------------------------------------- números */

  function montarNumeros() {
    var partes = [];
    var grupos = 0, topicos = 0;
    for (var i = 0; i < KANBAN_NUMEROS.trilhas.length; i++) {
      var t = KANBAN_NUMEROS.trilhas[i];
      grupos += t.grupos; topicos += t.topicos;
      partes.push(t.rotulo + " " + t.grupos + "/" + t.topicos);
    }
    numeros.textContent = "Grupos/tópicos por trilha: " + partes.join(" · ") +
      " — total " + grupos + "/" + topicos +
      ". Contados em " + KANBAN_NUMEROS.medidoEm + ".";
  }

  /* -------------------------------------------- quadro */

  function montarCard(card) {
    var botao = elemento("button", "card");
    botao.type = "button";
    botao.setAttribute("data-card", card.id);
    botao.setAttribute("data-raia", card.raia);
    botao.appendChild(elemento("span", "etiqueta", rotuloRaia(card.raia)));
    botao.appendChild(elemento("span", "card__titulo", card.titulo));
    if (card.resumo) {
      botao.appendChild(elemento("p", "card__resumo", card.resumo));
    }
    botao.addEventListener("click", function () { abrir(card.id, botao); });
    return botao;
  }

  function montarQuadro() {
    for (var i = 0; i < KANBAN_COLUNAS.length; i++) {
      var coluna = KANBAN_COLUNAS[i];
      var caixa = elemento("section", "coluna");
      caixa.setAttribute("data-coluna", coluna.id);
      caixa.style.setProperty("--cor-coluna", "var(--col-" + coluna.id + ")");
      caixa.setAttribute("aria-labelledby", "coluna-" + coluna.id);

      var topo = elemento("div", "coluna__topo");
      var rotulo = elemento("h2", "coluna__rotulo", coluna.rotulo);
      rotulo.id = "coluna-" + coluna.id;
      topo.appendChild(rotulo);
      topo.appendChild(elemento("span", "coluna__contagem"));
      caixa.appendChild(topo);

      if (coluna.nota) {
        caixa.appendChild(elemento("p", "coluna__nota", coluna.nota));
      }

      var lista = elemento("div", "coluna__cards");
      var achou = false;
      for (var j = 0; j < KANBAN_CARDS.length; j++) {
        if (KANBAN_CARDS[j].coluna === coluna.id) {
          lista.appendChild(montarCard(KANBAN_CARDS[j]));
          achou = true;
        }
      }
      caixa.appendChild(lista);
      if (!achou) {
        caixa.appendChild(elemento("p", "coluna__vazio", "Nada aqui."));
      }
      quadro.appendChild(caixa);
    }
  }

  /* -------------------------------------------- filtro */

  function aplicarFiltro() {
    var cards = quadro.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) {
      var fora = raiaAtiva !== "todas" &&
                 cards[i].getAttribute("data-raia") !== raiaAtiva;
      cards[i].setAttribute("data-oculto", fora ? "sim" : "nao");
    }

    /* a contagem conta o que está visível, não o que existe: número
       que não acompanha o filtro mente sobre a tela */
    var colunas = quadro.querySelectorAll(".coluna");
    var total = 0;
    for (var c = 0; c < colunas.length; c++) {
      var visiveis = colunas[c].querySelectorAll('.card[data-oculto="nao"]');
      colunas[c].querySelector(".coluna__contagem").textContent = visiveis.length;
      total += visiveis.length;
    }

    aviso.textContent = raiaAtiva === "todas"
      ? total + " cards, todas as áreas."
      : total + " cards em " + rotuloRaia(raiaAtiva) + ".";
  }

  function montarRaias() {
    var opcoes = [{ id: "todas", rotulo: "Todas" }].concat(KANBAN_RAIAS);
    for (var i = 0; i < opcoes.length; i++) {
      (function (opcao) {
        var botao = elemento("button", "botao", opcao.rotulo);
        botao.type = "button";
        botao.setAttribute("aria-pressed", opcao.id === raiaAtiva ? "true" : "false");
        botao.addEventListener("click", function () {
          raiaAtiva = opcao.id;
          var todos = raias.querySelectorAll(".botao");
          for (var k = 0; k < todos.length; k++) {
            todos[k].setAttribute("aria-pressed", todos[k] === botao ? "true" : "false");
          }
          aplicarFiltro();
        });
        raias.appendChild(botao);
      })(opcoes[i]);
    }
  }

  /* -------------------------------------------- painel */

  function montarBlocos(card) {
    var alvo = document.getElementById("painel-blocos");
    alvo.textContent = "";
    if (!card.blocos) { return; }
    for (var i = 0; i < card.blocos.length; i++) {
      var bloco = card.blocos[i];
      if (bloco.tipo === "lista") {
        var ul = elemento("ul");
        for (var j = 0; j < bloco.itens.length; j++) {
          ul.appendChild(elemento("li", null, bloco.itens[j]));
        }
        alvo.appendChild(ul);
      } else {
        alvo.appendChild(elemento("p", null, bloco.texto));
      }
    }
  }

  function montarVejaTambem(card) {
    var secao = document.getElementById("painel-secao-veja");
    var alvo  = document.getElementById("painel-veja");
    alvo.textContent = "";
    if (!card.vejaTambem || !card.vejaTambem.length) {
      secao.hidden = true;
      return;
    }
    for (var i = 0; i < card.vejaTambem.length; i++) {
      (function (id) {
        var outro = cardPorId(id);
        if (!outro) { return; }
        var botao = elemento("button", "botao", outro.titulo);
        botao.type = "button";
        /* troca o conteúdo do painel sem fechar: origem continua
           sendo o card que abriu tudo, e o foco volta para lá */
        botao.addEventListener("click", function () { preencher(outro); });
        alvo.appendChild(botao);
      })(card.vejaTambem[i]);
    }
    secao.hidden = false;
  }

  function preencher(card) {
    var coluna = null;
    for (var i = 0; i < KANBAN_COLUNAS.length; i++) {
      if (KANBAN_COLUNAS[i].id === card.coluna) { coluna = KANBAN_COLUNAS[i]; }
    }
    painel.style.setProperty("--cor-coluna", "var(--col-" + card.coluna + ")");
    document.getElementById("painel-coluna").textContent = coluna ? coluna.rotulo : "";
    document.getElementById("painel-raia").textContent = rotuloRaia(card.raia);
    document.getElementById("painel-titulo").textContent = card.titulo;
    document.getElementById("painel-resumo").textContent = card.resumo || "";
    document.getElementById("painel-porque").textContent = card.porque;
    montarBlocos(card);
    montarVejaTambem(card);
    painel.querySelector(".painel__corpo").scrollTop = 0;
  }

  function abrir(id, botao) {
    var card = cardPorId(id);
    if (!card) { return; }
    origem = botao || null;
    preencher(card);
    painel.hidden = false;
    veu.hidden = false;
    document.getElementById("painel-fechar").focus();
  }

  function fechar() {
    painel.hidden = true;
    veu.hidden = true;
    if (origem) { origem.focus(); origem = null; }
  }

  document.getElementById("painel-fechar").addEventListener("click", fechar);
  veu.addEventListener("click", fechar);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !painel.hidden) { fechar(); }
  });

  montarNumeros();
  montarQuadro();
  montarRaias();
  aplicarFiltro();
})();
