/* ============================================================
   Manifesto das trilhas + carregador.

   Único script que o index.html conhece. Lê ?trilha= da URL,
   injeta os arquivos daquela trilha e, por último, o app.js —
   que depende de tudo já estar definido quando é avaliado.

   Para acrescentar uma trilha: criar trilhas/<id>/ com um
   data.js e os conteudo-*.js, e registrar o id aqui embaixo.

   O manifesto também carrega a ficha de cada trilha — etapas,
   topicos e a rota desenhada na carta da página de entrada. Esses
   números são derivaveis dos dados, mas descobri-los exigiria baixar
   as tres trilhas inteiras so para montar a tela de escolha. Ao
   mexer no conteudo, confira a contagem (o rodape do roadmap mostra
   o total real) e acerte aqui.
   ============================================================ */
(function () {
  "use strict";

  var TRILHAS = {
    ml: {
      rotulo: "Machine Learning",
      /* a cor da rota desta carta — ver o cabeçalho do inicio.css */
      cor: "#2d6a8a",
      etapas: 5,
      topicos: 156,
      /* a rota da carta: um marco por etapa, num quadro de 300x240 */
      rota: [[32, 198], [96, 168], [152, 118], [216, 94], [272, 46]],
      pasta: "trilhas/ml/",
      arquivos: [
        "data.js",
        "conteudo-1-python.js",
        "conteudo-2-matematica.js",
        "conteudo-3-pytorch.js",
        "conteudo-4a-fundamentos.js",
        "conteudo-4b-fundamentos.js",
        "conteudo-5-especializacao.js",
      ],
    },
    cv: {
      rotulo: "Computer Vision",
      cor: "#1c6e51",
      etapas: 14,
      topicos: 141,
      rota: [[26, 212], [62, 196], [50, 166], [88, 150], [72, 122], [114, 108],
             [98, 80], [142, 70], [134, 46], [182, 52], [198, 86], [230, 70],
             [252, 102], [282, 78]],
      pasta: "trilhas/cv/",
      arquivos: [
        "data.js",
        "conteudo-1-base.js", /* iterações 0–4 */
        "conteudo-2-deep.js", /* iterações 5–8 */
        "conteudo-3-avancado.js", /* iterações 9–13 */
      ],
    },
    langchain: {
      rotulo: "LangChain e LangGraph",
      cor: "#6a4b9e",
      etapas: 8,
      topicos: 55,
      rota: [[30, 168], [62, 202], [106, 198], [142, 168], [148, 126],
             [188, 108], [234, 118], [272, 70]],
      pasta: "trilhas/langchain/",
      arquivos: [
        "data.js",
        "conteudo-1-langchain.js", /* fases 0–3 */
        "conteudo-2-langgraph.js", /* fases 4–7 */
      ],
    },
  };

  var PADRAO = "ml";

  /* ?trilha=cv — vale tanto em file:// quanto em http(s). Um id
     desconhecido cai no padrão em vez de deixar a página vazia. */
  var achado = /[?&]trilha=([\w-]+)/.exec(window.location.search);
  var id = achado && TRILHAS[achado[1]] ? achado[1] : PADRAO;

  window.TRILHAS = TRILHAS;
  window.TRILHA_ATUAL = id;

  /* a pagina de entrada so precisa do manifesto: ela marca esta
     bandeira para o carregador nao baixar uma trilha inteira */
  if (window.SO_MANIFESTO) return;

  var fila = TRILHAS[id].arquivos.map(function (nome) {
    return TRILHAS[id].pasta + nome;
  });
  fila.push("app.js");

  fila.forEach(function (src) {
    var s = document.createElement("script");
    s.src = src;
    /* script criado por JS nasce async: executaria fora de ordem.
       async = false preserva a ordem de inserção e mantém o
       download em paralelo. 4b depende de 4a, então importa. */
    s.async = false;
    s.onerror = function () {
      var mapa = document.getElementById("mapa");
      if (!mapa || mapa.hasAttribute("data-falhou")) return;

      /* trava na primeira falha: uma conexão que cai derruba vários
         scripts em sequência, e sem isto a mensagem acabaria nomeando
         o último arquivo em vez do que realmente faltou primeiro */
      mapa.setAttribute("data-falhou", "sim");
      mapa.textContent = "";

      /* o app.js já está na fila e vai rodar mesmo assim: a bandeira é
         como ele sabe que não deve montar meio mapa por cima disto */
      window.TRILHA_FALHOU = true;

      var titulo = document.createElement("h2");
      titulo.className = "falha__titulo";
      titulo.textContent = "A trilha não carregou";

      var corpo = document.createElement("p");
      corpo.className = "falha__corpo";
      corpo.textContent =
        "O arquivo " + src + " não chegou. Costuma ser conexão caindo no " +
        "meio do caminho — recarregar resolve na maioria das vezes. O " +
        "seletor no topo continua funcionando, se quiser outra trilha.";

      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "botao botao--destaque";
      botao.textContent = "Recarregar a página";
      botao.addEventListener("click", function () {
        window.location.reload();
      });

      var bloco = document.createElement("div");
      bloco.className = "falha";
      bloco.appendChild(titulo);
      bloco.appendChild(corpo);
      bloco.appendChild(botao);
      mapa.appendChild(bloco);
    };
    document.head.appendChild(s);
  });
})();
