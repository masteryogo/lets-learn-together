/* ============================================================
   O Obi — o comportamento, compartilhado pelas duas telas.

   Três reações que valem em qualquer lugar onde ele apareça:
   encostar, cutucar e carregar no colo. O que muda de tela para
   tela entra pelas opções, não por um `if` aqui dentro.

   Por que isto continua imperativo, e não virou markup reativo:
   o gesto é captura de ponteiro, transform inline escrito a cada
   pointermove e reinício de animação por reflow forçado. Descrever
   isso como estado derivado custaria um frame e a fidelidade do
   movimento. O que a página de fato precisa observar — se o Obi
   está na mão de alguém — sai daqui como $state, e só isso.

   A posição de descanso nunca é escrita por este arquivo: o
   arrasto é um transform por cima de onde quer que a tela tenha
   colocado o Obi. Por isso ele volta sozinho para o lugar certo
   mesmo que esse lugar tenha mudado no meio do caminho — e por
   isso quem o faz passear precisa consultar `ocupado` antes de
   mexer na posição, para não arrancá-lo da mão de quem o segura.

   Nada daqui muda estado da página nem persiste: é deleite. Por
   isso também não há equivalente de teclado para o arrasto —
   como não produz nada, não há o que oferecer a quem não o faz.
   ============================================================ */

const VOLTA_MS = 1200; /* espelha a transição de transform do obi.css */

/* Com o Obi fora do ninho, a página inteira precisa saber: só o
   z-index dele não basta quando o que o cobre está em outro contexto
   de empilhamento (no roadmap, as faixas de etapa, que também são
   sticky e vêm depois no DOM). A bandeira vai na raiz porque há um
   Obi por página — se um dia houver dois, isto vira uma contagem. */
const SOLTO = "data-obi-solto";

export function semMovimento() {
  return window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function travar(v, max) {
  return Math.max(-max, Math.min(max, v));
}

export class ControleObi {
  /* na mão de alguém agora */
  pegado = $state(false);
  /* ainda refazendo o caminho de volta ao lugar de descanso */
  voltando = $state(false);

  /* opcoes:
       podeMexer()  se agora é hora de reagir
       aoCutucar()  o que fazer com um toque que não virou arrasto
       limite()     {x, y} de deslocamento máximo a partir da partida
       chao         true onde ele tem chão: ganha o quique do pouso
       aoChegar()   chamada quando ele termina de voltar */
  constructor(opcoes = {}) {
    this.op = opcoes;
  }

  /* quem o faz passear consulta isto antes de mexer na posição dele */
  get ocupado() {
    return this.pegado || this.voltando;
  }

  /* ação Svelte: <div class="obi" use:controle.arrastavel> */
  arrastavel = (el) => {
    const corpo = el.querySelector(".obi__corpo");
    if (!corpo) return;

    const op = this.op;
    const podeMexer = op.podeMexer || (() => true);
    const limite = op.limite || (() => ({ x: 9999, y: 9999 }));

    /* um só para tudo: desmontar o componente desliga todos os
       listeners de uma vez. O módulo antigo nunca removia nenhum —
       podia, porque a página só morria recarregando. */
    const corte = new AbortController();
    const sinal = { signal: corte.signal };

    let vezReacao = null;
    let vezVolta = null;
    let px0 = 0;
    let py0 = 0;
    let arrastou = false;

    const marcarSolto = (sim) => {
      if (sim) document.documentElement.setAttribute(SOLTO, "sim");
      else document.documentElement.removeAttribute(SOLTO);
    };

    const reagir = (nome, ms) => {
      el.removeAttribute("data-reagindo");
      void el.offsetWidth; /* reinicia a animação de uma vez só */
      el.setAttribute("data-reagindo", nome);
      clearTimeout(vezReacao);
      vezReacao = setTimeout(() => {
        el.removeAttribute("data-reagindo");
        if (op.aoChegar) op.aoChegar();
      }, ms);
    };
    this.reagir = reagir;

    const limpar = () => {
      el.style.transform = "";
      corpo.style.transform = "";
    };

    /* ---------------------- encostar ---------------------- */
    el.addEventListener("mouseenter", () => {
      if (!podeMexer() || this.pegado) return;
      el.setAttribute("data-humor", "cutucado");
    }, sinal);

    el.addEventListener("mouseleave", () => {
      el.removeAttribute("data-humor");
    }, sinal);

    /* ------------------- carregar no colo ------------------- */
    el.addEventListener("pointerdown", (ev) => {
      if (!podeMexer()) return;
      if (ev.button && ev.button !== 0) return;

      this.pegado = true;
      arrastou = false;
      px0 = ev.clientX;
      py0 = ev.clientY;

      clearTimeout(vezVolta);
      this.voltando = false;
      el.removeAttribute("data-voltando");
      el.removeAttribute("data-reagindo");
      el.setAttribute("data-pendurado", "sim");
      marcarSolto(true);

      /* sem a captura, sair da área dele derrubaria o Obi no meio do
         gesto — e a área dele tem pouco mais de cem pixels */
      try {
        el.setPointerCapture(ev.pointerId);
      } catch {}
    }, sinal);

    el.addEventListener("pointermove", (ev) => {
      if (!this.pegado) return;

      const max = limite();
      const dx = travar(ev.clientX - px0, max.x);
      const dy = travar(ev.clientY - py0, max.y);

      if (!arrastou && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) arrastou = true;

      /* dois eixos, dois elementos: o horizontal vai no invólucro (a
         sombra anda junto, porque ela acompanha de fato) e o vertical
         vai no corpo (a sombra fica no chão, que é o que vende o "no
         ar"). O corpo também pende para quem puxa. */
      const pendor = travar(dx / 14, 10);

      el.style.transform = "translateX(" + Math.round(dx) + "px)";
      corpo.style.transform =
        "translateY(" + Math.round(dy) + "px) " +
        "rotate(" + pendor.toFixed(1) + "deg) scale(0.94, 1.09)";
    }, sinal);

    const soltar = (ev) => {
      if (!this.pegado) return;
      this.pegado = false;
      el.removeAttribute("data-pendurado");

      if (ev && ev.pointerId !== undefined) {
        try {
          el.releasePointerCapture(ev.pointerId);
        } catch {}
      }

      /* ponteiro que desceu e subiu no mesmo lugar foi cutucada, e não
         arrasto: é aqui que o toque é reconhecido, e não num listener
         de "click", para os dois gestos nunca dispararem juntos — é
         isso que deixa o Obi ser um link e um bicho ao mesmo tempo,
         sem que arrastá-lo navegue sem querer */
      if (!arrastou) {
        limpar();
        marcarSolto(false);
        if (op.aoCutucar) op.aoCutucar(ev);
        return;
      }

      this.voltando = true;
      el.setAttribute("data-voltando", "sim");
      void el.offsetWidth;
      el.style.transform = "translateX(0px)";
      corpo.style.transform = "translateY(0px) rotate(0deg) scale(1, 1)";

      /* transitionend não serve sozinho: com movimento reduzido a
         transição nem chega a acontecer */
      clearTimeout(vezVolta);
      vezVolta = setTimeout(() => {
        this.voltando = false;
        el.removeAttribute("data-voltando");
        limpar();
        marcarSolto(false);
        if (op.chao) reagir("pouso", 420);
        else if (op.aoChegar) op.aoChegar();
      }, semMovimento() ? 60 : VOLTA_MS);
    };

    el.addEventListener("pointerup", soltar, sinal);
    el.addEventListener("pointercancel", soltar, sinal);

    /* arrastar um <a> ou um <svg> dispara o arrasto nativo do navegador
       por cima do nosso, com direito a imagem fantasma */
    el.addEventListener("dragstart", (ev) => ev.preventDefault(), sinal);

    return {
      destroy() {
        corte.abort();
        clearTimeout(vezReacao);
        clearTimeout(vezVolta);
        marcarSolto(false);
      },
    };
  };
}
