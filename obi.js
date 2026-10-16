/* ============================================================
   O Obi — o comportamento, compartilhado pelas duas páginas.

   Expõe window.Obi.animar(elemento, opcoes), que instala as três
   reações que valem em qualquer lugar onde ele apareça: encostar,
   cutucar e carregar no colo. O que muda de página para página
   entra pelas opções, não por um `if` aqui dentro.

   A posição de descanso nunca é escrita por este arquivo: o
   arrasto é um transform por cima de onde quer que a página tenha
   colocado o Obi. Por isso ele volta sozinho para o lugar certo
   mesmo que esse lugar tenha mudado no meio do caminho — e por
   isso quem o faz passear precisa consultar `ocupado()` antes de
   mexer na posição, para não arrancá-lo da mão de quem o segura.

   Nada daqui muda estado da página nem persiste: é deleite. Por
   isso também não há equivalente de teclado para o arrasto —
   como não produz nada, não há o que oferecer a quem não o faz.
   ============================================================ */
(function () {
  "use strict";

  var VOLTA_MS = 1200;     /* espelha a transição de transform do obi.css */

  /* Com o Obi fora do ninho, a página inteira precisa saber: só o
     z-index dele não basta quando o que o cobre está em outro
     contexto de empilhamento (no roadmap, as faixas de etapa, que
     também são sticky e vêm depois no DOM). A bandeira vai na raiz
     porque há um Obi por página — se um dia houver dois, isto aqui
     precisa virar uma contagem. */
  var SOLTO = "data-obi-solto";

  function marcarSolto(sim) {
    if (sim) document.documentElement.setAttribute(SOLTO, "sim");
    else document.documentElement.removeAttribute(SOLTO);
  }

  function semMovimento() {
    return window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* opcoes:
       podeMexer()  obrigatória — se agora é hora de reagir
       aoCutucar()  o que fazer com um toque que não virou arrasto
       limite()     {x: px, y: px} de deslocamento máximo a partir
                    do ponto de partida
       chao         true onde ele tem chão: ganha o quique do pouso
       aoChegar()   chamada quando ele termina de voltar
     devolve { pegado(), ocupado() } */
  function animar(el, opcoes) {
    var corpo = el.querySelector(".obi__corpo");
    if (!corpo) return { pegado: naoFn, ocupado: naoFn };

    var op = opcoes || {};
    var podeMexer = op.podeMexer || simFn;
    var limite = op.limite || function () { return { x: 9999, y: 9999 }; };

    var vezReacao = null;
    var vezVolta = null;

    var pendurado = false;
    var arrastou = false;
    var px0 = 0, py0 = 0;

    function reagir(nome, ms) {
      el.removeAttribute("data-reagindo");
      void el.offsetWidth;            /* reinicia a animação de uma vez só */
      el.setAttribute("data-reagindo", nome);
      window.clearTimeout(vezReacao);
      vezReacao = window.setTimeout(function () {
        el.removeAttribute("data-reagindo");
        if (op.aoChegar) op.aoChegar();
      }, ms);
    }

    /* ---------------------- encostar ---------------------- */
    el.addEventListener("mouseenter", function () {
      if (!podeMexer() || pendurado) return;
      el.setAttribute("data-humor", "cutucado");
    });

    el.addEventListener("mouseleave", function () {
      el.removeAttribute("data-humor");
    });

    /* ------------------- carregar no colo ------------------- */
    el.addEventListener("pointerdown", function (ev) {
      if (!podeMexer()) return;
      if (ev.button && ev.button !== 0) return;

      pendurado = true;
      arrastou = false;
      px0 = ev.clientX;
      py0 = ev.clientY;

      window.clearTimeout(vezVolta);
      el.removeAttribute("data-voltando");
      el.removeAttribute("data-reagindo");
      el.setAttribute("data-pendurado", "sim");
      marcarSolto(true);

      /* sem a captura, sair da área dele derrubaria o Obi no meio
         do gesto — e a área dele tem pouco mais de cem pixels */
      if (el.setPointerCapture) {
        try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      }
    });

    el.addEventListener("pointermove", function (ev) {
      if (!pendurado) return;

      var max = limite();
      var dx = travar(ev.clientX - px0, max.x);
      var dy = travar(ev.clientY - py0, max.y);

      if (!arrastou && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) arrastou = true;

      /* dois eixos, dois elementos: o horizontal vai no invólucro
         (a sombra anda junto, porque ela acompanha de fato) e o
         vertical vai no corpo (a sombra fica no chão, que é o que
         vende o "no ar"). O corpo também pende para quem puxa. */
      var pendor = travar(dx / 14, 10);

      el.style.transform = "translateX(" + Math.round(dx) + "px)";
      corpo.style.transform =
        "translateY(" + Math.round(dy) + "px) rotate(" + pendor.toFixed(1) + "deg)" +
        " scale(0.94, 1.09)";
    });

    function soltar(ev) {
      if (!pendurado) return;
      pendurado = false;
      el.removeAttribute("data-pendurado");

      if (el.releasePointerCapture && ev && ev.pointerId !== undefined) {
        try { el.releasePointerCapture(ev.pointerId); } catch (e) {}
      }

      /* ponteiro que desceu e subiu no mesmo lugar foi cutucada, e
         não arrasto: é aqui que o toque é reconhecido, e não num
         listener de "click", para os dois gestos nunca dispararem
         juntos — é isso que deixa o Obi ser um link e um bicho ao
         mesmo tempo, sem que arrastá-lo navegue sem querer */
      if (!arrastou) {
        limpar();
        marcarSolto(false);
        if (op.aoCutucar) op.aoCutucar(ev);
        return;
      }

      el.setAttribute("data-voltando", "sim");
      void el.offsetWidth;
      el.style.transform = "translateX(0px)";
      corpo.style.transform = "translateY(0px) rotate(0deg) scale(1, 1)";

      /* transitionend não serve sozinho: com movimento reduzido a
         transição nem chega a acontecer */
      window.clearTimeout(vezVolta);
      vezVolta = window.setTimeout(function () {
        el.removeAttribute("data-voltando");
        limpar();
        marcarSolto(false);
        if (op.chao) reagir("pouso", 420);
        else if (op.aoChegar) op.aoChegar();
      }, semMovimento() ? 60 : VOLTA_MS);
    }

    function limpar() {
      el.style.transform = "";
      corpo.style.transform = "";
    }

    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);

    /* arrastar um <a> ou um <svg> dispara o arrasto nativo do
       navegador por cima do nosso, com direito a imagem fantasma */
    el.addEventListener("dragstart", function (ev) { ev.preventDefault(); });

    return {
      pegado: function () { return pendurado; },
      ocupado: function () {
        return pendurado || el.hasAttribute("data-voltando");
      },
      reagir: reagir
    };
  }

  function travar(v, max) { return Math.max(-max, Math.min(max, v)); }
  function simFn() { return true; }
  function naoFn() { return false; }

  window.Obi = { animar: animar, semMovimento: semMovimento };
})();
