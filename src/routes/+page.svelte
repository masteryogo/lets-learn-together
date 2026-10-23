<script>
  import { base } from "$app/paths";
  import { env } from "$env/dynamic/public";
  import ObiMarca from "$lib/obi/ObiMarca.svelte";

  import "./landing.css";

  /* No domínio principal a porta é o subdomínio do produto. O caminho
     local mantém a demonstração utilizável antes de o DNS existir. */
  const abrirApp = env.PUBLIC_APP_URL || `${base}/app`;
</script>

<style>
  @media (prefers-reduced-motion: no-preference) {
    .carta:not(.carta--fantasma), .plano { transition: transform .18s ease-out, box-shadow .18s ease-out; }
    .carta:not(.carta--fantasma):hover, .plano:hover { box-shadow: 0 15px 22px #15141a2b; }
    .carta--ml:hover { transform: translateY(-8px) rotate(-1deg); }
    .carta--cv:hover { transform: translateY(3px) rotate(.7deg); }
    .carta--dados:hover { transform: translateY(-6px) rotate(.45deg); }
    .carta--python:hover { transform: translateY(-8px) rotate(-.5deg); }
    .plano:hover { transform: translateY(-8px); }
    .plano--destaque:hover { transform: translateY(-15px); }
  }
</style>

<svelte:head>
  <title>Let's Learn Together — tecnologia para autodidatas</title>
  <meta
    name="description"
    content="Roadmaps para quem aprende tecnologia por conta própria: ordem, critério por tópico e progresso salvo. 506 tópicos em 5 trilhas, de graça."
  />
</svelte:head>

<header class="cabecalho">
  <a class="marca" href="{base}/">
    <ObiMarca altura="clamp(30px,3.4vw,46px)" />
    <span class="marca__texto">
      <span class="marca__nome">Let's Learn Together</span>
      <span class="marca__descritor">tecnologia para autodidatas</span>
    </span>
  </a>
  <nav aria-label="Navegação principal">
    <a href="#como-funciona">Como funciona</a>
    <a href="#territorios">Trilhas</a>
    <a href="#planos">Planos</a>
    <a href="#parcerias">Parcerias</a>
    <a class="cabecalho__entrar" href={abrirApp}>Entrar</a>
  </nav>
</header>

<main>
  <section class="abertura" aria-labelledby="titulo-principal">
    <div class="abertura__texto">
      <p class="etiqueta">Para quem aprende por conta própria</p>
      <h1 id="titulo-principal">Aprenda tecnologia sozinho, sem adivinhar a ordem.</h1>
      <div class="abertura__acoes">
        <a class="botao botao--principal" href={abrirApp}>Abrir as trilhas <span aria-hidden="true">→</span></a>
        <a class="botao botao--texto" href="#como-funciona">Ver como funciona</a>
      </div>
    </div>

    <div class="palco">
      <figure class="cartaz">
        <div class="cartaz__alfinete cartaz__alfinete--um"></div>
        <div class="cartaz__alfinete cartaz__alfinete--dois"></div>
        <img
          src="{base}/gif-secundaria.gif"
          alt="Cartazes das trilhas de estudo passando um a um: dados, cibersegurança e outras."
          width="800"
          height="450"
          fetchpriority="high"
          decoding="async"
        />
      </figure>
    </div>
  </section>

  <section class="manifesto" id="como-funciona" aria-labelledby="titulo-manifesto">
    <p class="etiqueta">Estudar sem se perder</p>
    <h2 id="titulo-manifesto">Menos abas abertas. Mais direção.</h2>
    <div class="manifesto__grade">
      <article><span class="manifesto__numero">01</span><h3>Escolha uma trilha</h3><p>Cinco trilhas, de Python do zero a visão computacional. Você vê o tamanho antes de começar.</p></article>
      <article><span class="manifesto__numero">02</span><h3>Siga a ordem</h3><p>Cada tópico tem prioridade e um critério que diz quando você já pode seguir em frente.</p></article>
      <article><span class="manifesto__numero">03</span><h3>Marque o que fez</h3><p>Com uma conta, o progresso fica salvo. O que não serve agora você marca como pulado, e ele sai do mapa.</p></article>
    </div>
  </section>

  <section class="territorios" id="territorios" aria-labelledby="titulo-territorios">
    <div class="territorios__cabecalho"><div><p class="etiqueta">Territórios em construção</p><h2 id="titulo-territorios">Não comece do zero. Comece de onde você está.</h2></div><a class="link-seta" href={abrirApp}>Abrir as trilhas <span aria-hidden="true">→</span></a></div>
    <div class="cartas">
      <article class="carta carta--ml"><span class="carta__faixa">Trilha</span><h3>Aprendizado<br />de Máquina</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M25 115 L73 87 126 98 174 56 252 23" /><circle cx="25" cy="115" r="5" /><circle cx="73" cy="87" r="5" /><circle cx="126" cy="98" r="5" /><circle cx="174" cy="56" r="5" /><circle cx="252" cy="23" r="7" /></svg><footer><span>5 etapas</span><span>156 tópicos</span></footer></article>
      <article class="carta carta--cv"><span class="carta__faixa">Trilha</span><h3>Visão<br />Computacional</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M24 108 L64 80 55 50 106 62 144 29 188 64 251 36" /><circle cx="24" cy="108" r="5" /><circle cx="64" cy="80" r="5" /><circle cx="55" cy="50" r="5" /><circle cx="106" cy="62" r="5" /><circle cx="144" cy="29" r="5" /><circle cx="188" cy="64" r="5" /><circle cx="251" cy="36" r="7" /></svg><footer><span>14 etapas</span><span>141 tópicos</span></footer></article>
      <article class="carta carta--dados"><span class="carta__faixa">Trilha</span><h3>Engenharia<br />de Dados</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M24 108 L68 84 114 96 156 57 204 70 252 26" /><circle cx="24" cy="108" r="5" /><circle cx="68" cy="84" r="5" /><circle cx="114" cy="96" r="5" /><circle cx="156" cy="57" r="5" /><circle cx="204" cy="70" r="5" /><circle cx="252" cy="26" r="7" /></svg><footer><span>5 etapas</span><span>84 tópicos</span></footer></article>
      <article class="carta carta--python"><span class="carta__faixa">Trilha</span><h3>Python<br />do Zero</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M24 120 L70 106 116 88 160 74 206 50 252 22" /><circle cx="24" cy="120" r="5" /><circle cx="70" cy="106" r="5" /><circle cx="116" cy="88" r="5" /><circle cx="160" cy="74" r="5" /><circle cx="206" cy="50" r="5" /><circle cx="252" cy="22" r="7" /></svg><footer><span>7 etapas</span><span>70 tópicos</span></footer></article>
      <article class="carta carta--fantasma">
        <span class="carta__mais" aria-hidden="true">+</span>
        <p>E<br />muito mais!</p>
      </article>
    </div>
  </section>

  <section class="planos" id="planos" aria-labelledby="titulo-planos">
    <div class="planos__cabecalho">
      <p class="etiqueta">Para onde isto vai</p>
      <h2 id="titulo-planos">O roadmap é por onde a gente começou. Não é onde a gente para.</h2>
      <p>
        A meta é ensinar, não listar assuntos. O mapa veio primeiro porque saber o caminho é o que falta antes de estudar. O que vem depois está sendo construído em cima dele, e o uso continua gratuito.
      </p>
    </div>
    <div class="planos__grade">
      <article class="plano">
        <p class="plano__selo">No ar</p>
        <h3>O mapa</h3>
        <p>Saber o que estudar, em que ordem, e enxergar o que já ficou de pé.</p>
        <ul><li>Roadmaps com critério</li><li>Calendário de estudos</li><li>Mural de notas</li></ul>
      </article>
      <article class="plano plano--destaque">
        <p class="plano__selo">Primeiros exercícios no ar</p>
        <h3>A prática</h3>
        <p>Ler sobre um assunto não é saber o assunto. Os primeiros exercícios corrigem e devolvem o resultado na hora, por enquanto na trilha de Python.</p>
        <ul><li>Prever a saída do código</li><li>Achar o erro</li><li>Completar o trecho</li><li>Devolutiva por tentativa</li></ul>
      </article>
      <article class="plano">
        <p class="plano__selo">Em desenho</p>
        <h3>O ensino</h3>
        <p>Material próprio, competência medida em vez de caixinha marcada, e uma rota que reage ao que você acerta e erra.</p>
        <ul><li>Conteúdo autoral</li><li>Competências por tópico</li><li>Rota que se ajusta</li></ul>
      </article>
    </div>
  </section>

  <section class="parcerias" id="parcerias" aria-labelledby="titulo-parcerias">
    <p class="etiqueta">Proposta de parceria</p>
    <h2 id="titulo-parcerias">Seja parceiro de quem está aprendendo a sua stack.</h2>
    <p>
      Uma boa parceria coloca sua empresa dentro do material de estudo — onde a descoberta acontece — e não em um banner ao lado dele.
    </p>
    <a
      class="botao botao--claro"
      href="{base}/parcerias"
      data-sveltekit-reload
    >Ver proposta de parceria <span aria-hidden="true">→</span></a>
  </section>

  <section class="convite" aria-labelledby="titulo-convite"><p class="etiqueta">Seu próximo passo cabe aqui</p><h2 id="titulo-convite">Abra uma trilha.<br />Faça dela a sua rota.</h2><a class="botao botao--principal" href={abrirApp}>Abrir as trilhas <span aria-hidden="true">→</span></a></section>
</main>

<footer class="rodape">
  <div class="rodape__principal">
    <div class="rodape__marca"><a class="marca" href="{base}/" aria-label="Let's Learn Together, início">Let's Learn Together</a><p>Autodidata não quer dizer sozinho.</p><p class="rodape__autoria">feito por <a href="https://github.com/masteryogo" target="_blank" rel="noopener noreferrer">@masteryogo</a> &amp; <a href="https://github.com/melchisedekdev" target="_blank" rel="noopener noreferrer">@melchisedekdev</a></p><a class="rodape__apoio" href="{base}/parcerias" data-sveltekit-reload>Conversar sobre parceria <span aria-hidden="true">→</span></a></div>
    <div><h2>Produto</h2><a href="#territorios">Trilhas</a><a href={abrirApp}>Abrir aplicativo</a><a href="#planos">Planos futuros</a></div>
    <div><h2>Junto com a gente</h2><a href="#como-funciona">Como funciona</a><a href="#parcerias">Parcerias</a><a href="{base}/parcerias" data-sveltekit-reload>Ver proposta <span aria-hidden="true">→</span></a></div>
    <div><h2>Legal</h2><a href="{base}/termos" data-sveltekit-reload>Termos de uso</a><a href="{base}/privacidade" data-sveltekit-reload>Privacidade</a></div>
  </div>
  <div class="rodape__fim"><span>© 2026 Let's Learn Together</span><span>Um mapa aberto para quem quer aprender.</span></div>
</footer>
