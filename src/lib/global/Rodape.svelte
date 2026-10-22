<script>
  import { base } from "$app/paths";
  import { env } from "$env/dynamic/public";

  let elemento = $state(null);
  const abrirApp = env.PUBLIC_APP_URL || `${base}/app`;

  /* As telas internas usam esta medida para não pousar avisos e barras
     fixas por cima do fim da página. O desenho do rodapé pode mudar;
     essa informação continua sendo responsabilidade dele. */
  $effect(() => {
    if (!elemento) return;

    const raiz = document.documentElement;
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const retangulo = elemento.getBoundingClientRect();
      raiz.style.setProperty("--rodape-visivel", Math.max(0, window.innerHeight - retangulo.top) + "px");
    };
    const agendar = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };

    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        window.addEventListener("scroll", agendar, { passive: true });
        medir();
      } else {
        window.removeEventListener("scroll", agendar);
        raiz.style.setProperty("--rodape-visivel", "0px");
      }
    });
    observador.observe(elemento);
    window.addEventListener("resize", agendar);
    medir();

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (pedido) cancelAnimationFrame(pedido);
      raiz.style.removeProperty("--rodape-visivel");
    };
  });
</script>

<footer class="rodape" bind:this={elemento}>
  <div class="rodape__principal">
    <div class="rodape__marca">
      <a class="rodape__nome" href="{base}/" data-sveltekit-reload>Let's Learn Together</a>
      <p>Feito para quem aprende construindo caminho.</p>
      <p class="rodape__autoria">
        feito por
        <a href="https://github.com/masteryogo" target="_blank" rel="noopener noreferrer">@masteryogo</a>
        &amp;
        <a href="https://github.com/melchisedekdev" target="_blank" rel="noopener noreferrer">@melchisedekdev</a>
      </p>
      <a class="rodape__apoio" href="{base}/parcerias" data-sveltekit-reload>
        Conversar sobre parceria <span aria-hidden="true">→</span>
      </a>
    </div>

    <div>
      <h2>Produto</h2>
      <a href="{base}/#territorios" data-sveltekit-reload>Trilhas</a>
      <a href={abrirApp}>Abrir aplicativo</a>
      <a href="{base}/#planos" data-sveltekit-reload>Planos futuros</a>
    </div>

    <div>
      <h2>Junto com a gente</h2>
      <a href="{base}/#como-funciona" data-sveltekit-reload>Como funciona</a>
      <a href="{base}/#parcerias" data-sveltekit-reload>Parcerias</a>
      <a href="{base}/parcerias" data-sveltekit-reload>Ver proposta <span aria-hidden="true">→</span></a>
    </div>

    <div>
      <h2>Legal</h2>
      <a href="{base}/termos" data-sveltekit-reload>Termos de uso</a>
      <a href="{base}/privacidade" data-sveltekit-reload>Privacidade</a>
    </div>
  </div>

  <div class="rodape__fim">
    <span>© 2026 Let's Learn Together</span>
    <span>Um mapa aberto para quem quer aprender.</span>
  </div>
</footer>

<style>
  .rodape {
    --fundo: #151914;
    --texto: #d8deca;
    --texto-suave: #aab29d;
    --linha: #46503e;
    --amarelo: #f5c518;
    --mono: "Departure Mono", ui-monospace, monospace;

    width: auto;
    margin: clamp(88px, 14vh, 176px) calc(-1 * var(--sangria-x, 0px)) calc(-1 * var(--sangria-b, 0px));
    padding: 72px max(20px, calc((100% - 1180px) / 2)) 24px;
    background: var(--fundo);
    color: var(--texto);
    font-family: var(--mono);
    font-size: 12px;
  }

  .rodape__principal { display: grid; grid-template-columns: 2.2fr repeat(3, 1fr); gap: 32px; padding-bottom: 62px; }
  .rodape__nome { color: inherit; font-size: 18px; letter-spacing: .16em; text-decoration: none; }
  .rodape__marca p { max-width: 225px; margin: 18px 0 0; color: var(--texto-suave); }
  .rodape__autoria { font-size: 10px; letter-spacing: .04em; }
  .rodape__autoria a { color: var(--texto); text-decoration: none; }
  .rodape__apoio { display: block; width: max-content; max-width: 100%; margin-top: 20px; padding: 9px 11px; border: 1px solid var(--amarelo); color: var(--amarelo); text-decoration: none; }
  .rodape h2 { margin: 3px 0 16px; color: #f5f7ee; font-size: 11px; font-weight: 400; letter-spacing: .12em; text-transform: uppercase; }
  .rodape__principal > div > a:not(.rodape__nome):not(.rodape__apoio) { display: block; width: max-content; max-width: 100%; margin: 9px 0; color: #b6beaa; text-decoration: none; }
  .rodape a:hover { color: #fff; text-decoration: underline; text-underline-offset: 4px; }
  .rodape__apoio:hover { color: var(--amarelo); }
  .rodape__fim { display: flex; justify-content: space-between; gap: 20px; padding-top: 20px; border-top: 1px solid var(--linha); color: #89917f; font-size: 10px; letter-spacing: .04em; }

  @media (max-width: 760px) {
    .rodape { padding-top: 56px; }
    .rodape__principal { grid-template-columns: 1fr 1fr; gap: 36px 24px; }
    .rodape__marca { grid-column: 1 / -1; }
    .rodape__fim { display: block; }
    .rodape__fim span { display: block; }
    .rodape__fim span + span { margin-top: 6px; }
  }
</style>
