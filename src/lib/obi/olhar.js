/* ============================================================
   O olhar: os olhos do Obi acompanham o ponteiro pela mesa.

   As contas são em unidades do viewBox (406x310 desenhado em 122px),
   não em pixels de tela: o transform de um elemento SVG com
   `transform-box: fill-box` vive no sistema do desenho. Daí os
   limites parecerem grandes — 14 unidades dão uns 4px na tela, que é
   o quanto um olho de 13 de raio pode correr sem ficar vesgo.

   Ação Svelte, e não estado derivado, pela mesma razão do arrasto:
   escreve transform inline a cada frame e lê getBoundingClientRect.

   Mora aqui e não em mesa/ porque a tela de conta também o usa: o
   olho tem nome de classe diferente em cada variante do Obi, então
   quem chama diz qual é. O padrão é o da mesa, que veio primeiro.
   ============================================================ */

const ALCANCE_X = 14;
const ALCANCE_Y = 9;

/* parado o bastante, o olhar se desfaz e o piscar volta: um Obi de
   olho travado no canto fica com cara de quebrado */
const ESQUECER_MS = 2600;

export function olhar(ator, opcoes) {
  let { ativo, olho = ".ator__olho" } = opcoes;

  const olhos = [...ator.querySelectorAll(olho)];
  const corte = new AbortController();

  let vezOlhar = null;
  let agendado = false;
  let ultimo = null;

  /* susto, tontura, cutucada e colo já mandam nos olhos pelo CSS.
     Dois donos para o mesmo transform e o último a escrever ganha —
     então o olhar sai de cena enquanto qualquer um deles estiver. */
  function ocupados() {
    return ator.hasAttribute("data-reagindo") ||
      ator.hasAttribute("data-humor") ||
      ator.hasAttribute("data-pendurado") ||
      ator.hasAttribute("data-voltando") ||
      ator.hasAttribute("data-fechando");
  }

  function soltar() {
    ator.removeAttribute("data-olhando");
    for (const o of olhos) o.style.transform = "";
  }

  function mirar() {
    agendado = false;
    if (!ultimo || !ativo() || ocupados()) return soltar();

    const r = ator.getBoundingClientRect();
    const dx = ultimo.clientX - (r.left + r.width / 2);
    /* a mira sai da altura dos olhos, não do centro do corpo: ele
       olharia por cima de tudo se a conta partisse dos pés */
    const dy = ultimo.clientY - (r.top + r.height * 0.42);

    /* a distância satura rápido: a meia tela de distância o olho já
       está no canto, e insistir só faria o gesto parar de responder */
    const escala = Math.min(1, Math.hypot(dx, dy) / 320);
    const ang = Math.atan2(dy, dx);

    const x = Math.cos(ang) * ALCANCE_X * escala;
    const y = Math.sin(ang) * ALCANCE_Y * escala;
    const t = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;

    ator.setAttribute("data-olhando", "sim");
    for (const o of olhos) o.style.transform = t;

    clearTimeout(vezOlhar);
    vezOlhar = setTimeout(soltar, ESQUECER_MS);
  }

  document.addEventListener("pointermove", (ev) => {
    if (ev.pointerType === "touch") return;
    ultimo = ev;
    /* um frame por vez: pointermove dispara muito mais que isso, e
       cada chamada custa um getBoundingClientRect */
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(mirar);
  }, { signal: corte.signal });

  return {
    /* o olhar escreve transform inline, e inline ganha da regra do
       CSS: quem for mandar nos olhos por classe precisa pedir que
       ele largue antes, ou o estado novo não aparece */
    soltar,

    update(novas) {
      ativo = novas.ativo;
    },
    destroy() {
      corte.abort();
      clearTimeout(vezOlhar);
    },
  };
}
