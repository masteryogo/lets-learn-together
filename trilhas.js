/* ============================================================
   Manifesto das trilhas + carregador.

   Único script que o index.html conhece. Lê ?trilha= da URL,
   injeta os arquivos daquela trilha e, por último, o app.js —
   que depende de tudo já estar definido quando é avaliado.

   Para acrescentar uma trilha: criar trilhas/<id>/ com um
   data.js e os conteudo-*.js, e registrar o id aqui embaixo.
   ============================================================ */
(function () {
  "use strict";

  var TRILHAS = {
    ml: {
      rotulo: "Machine Learning",
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
      if (mapa) {
        mapa.textContent =
          "Falha ao carregar " + src + ". A trilha não pôde ser montada.";
      }
    };
    document.head.appendChild(s);
  });
})();
