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
    .carta, .plano { transition: transform .18s ease-out, box-shadow .18s ease-out; }
    .carta:hover, .plano:hover { box-shadow: 0 15px 22px #15141a2b; }
    .carta--ml:hover { transform: translateY(-8px) rotate(-1deg); }
    .carta--cv:hover { transform: translateY(3px) rotate(.7deg); }
    .carta--dados:hover { transform: translateY(-6px) rotate(.45deg); }
    .carta--lc:hover { transform: translateY(-8px) rotate(-.5deg); }
    .plano:hover { transform: translateY(-8px); }
    .plano--destaque:hover { transform: translateY(-15px); }
  }
</style>

<svelte:head>
  <title>Let's Learn Together — encontre o seu próximo passo</title>
  <meta
    name="description"
    content="Roadmaps visuais para estudar tecnologia com rumo, critério e espaço para acompanhar o próprio caminho."
  />
</svelte:head>

<header class="cabecalho">
  <a class="marca" href="{base}/" aria-label="Let's Learn Together, início">
    <ObiMarca altura="clamp(30px,3.4vw,46px)" />
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
      <h1 id="titulo-principal">Aprender fica mais leve quando você enxerga o caminho.</h1>
      <p class="abertura__resumo">
        Roadmaps de tecnologia feitos para transformar assuntos grandes em próximos passos possíveis.
      </p>
      <div class="abertura__acoes">
        <a class="botao botao--principal" href={abrirApp}>Explorar as trilhas <span aria-hidden="true">→</span></a>
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
      <div class="bilhete" aria-hidden="true">
        <svg viewBox="40 60 420 260">
          <path class="mapa__rota" d="M67 295 C116 252 111 178 185 180 S256 277 307 228 S345 107 432 92" />
          <path class="mapa__rota-pontilhada" d="M67 295 C116 252 111 178 185 180 S256 277 307 228 S345 107 432 92" />
          <circle cx="67" cy="295" r="10" class="mapa__marco mapa__marco--inicio" />
          <circle cx="185" cy="180" r="10" class="mapa__marco" />
          <circle cx="307" cy="228" r="10" class="mapa__marco" />
          <circle cx="432" cy="92" r="13" class="mapa__marco mapa__marco--fim" />
        </svg>
        <span>1 passo por vez</span>
      </div>
    </div>
  </section>

  <section class="manifesto" id="como-funciona" aria-labelledby="titulo-manifesto">
    <p class="etiqueta">Estudar sem se perder</p>
    <h2 id="titulo-manifesto">Menos abas abertas. Mais direção.</h2>
    <div class="manifesto__grade">
      <article><span class="manifesto__numero">01</span><h3>Escolha um território</h3><p>Você entra por uma trilha e sabe onde está antes de começar a correr.</p></article>
      <article><span class="manifesto__numero">02</span><h3>Siga uma rota de verdade</h3><p>Cada assunto tem ordem, prioridade e um critério claro para seguir em frente.</p></article>
      <article><span class="manifesto__numero">03</span><h3>Faça o percurso seu</h3><p>Marque progresso, organize sessões de estudo e guarde suas próprias descobertas.</p></article>
    </div>
  </section>

  <section class="territorios" id="territorios" aria-labelledby="titulo-territorios">
    <div class="territorios__cabecalho"><div><p class="etiqueta">Territórios em construção</p><h2 id="titulo-territorios">Não comece do zero. Comece de onde você está.</h2></div><a class="link-seta" href={abrirApp}>Abrir o mapa completo <span aria-hidden="true">→</span></a></div>
    <div class="cartas">
      <article class="carta carta--ml"><span class="carta__faixa">Trilha</span><h3>Aprendizado<br />de Máquina</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M25 115 L73 87 126 98 174 56 252 23" /><circle cx="25" cy="115" r="5" /><circle cx="73" cy="87" r="5" /><circle cx="126" cy="98" r="5" /><circle cx="174" cy="56" r="5" /><circle cx="252" cy="23" r="7" /></svg><footer><span>5 etapas</span><span>156 tópicos</span></footer></article>
      <article class="carta carta--cv"><span class="carta__faixa">Trilha</span><h3>Visão<br />Computacional</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M24 108 L64 80 55 50 106 62 144 29 188 64 251 36" /><circle cx="24" cy="108" r="5" /><circle cx="64" cy="80" r="5" /><circle cx="55" cy="50" r="5" /><circle cx="106" cy="62" r="5" /><circle cx="144" cy="29" r="5" /><circle cx="188" cy="64" r="5" /><circle cx="251" cy="36" r="7" /></svg><footer><span>14 etapas</span><span>141 tópicos</span></footer></article>
      <article class="carta carta--dados"><span class="carta__faixa">Trilha</span><h3>Engenharia<br />de Dados</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M24 108 L68 84 114 96 156 57 204 70 252 26" /><circle cx="24" cy="108" r="5" /><circle cx="68" cy="84" r="5" /><circle cx="114" cy="96" r="5" /><circle cx="156" cy="57" r="5" /><circle cx="204" cy="70" r="5" /><circle cx="252" cy="26" r="7" /></svg><footer><span>5 etapas</span><span>84 tópicos</span></footer></article>
      <article class="carta carta--lc"><span class="carta__faixa">Trilha</span><h3>LangChain<br />e LangGraph</h3><svg viewBox="0 0 280 138" aria-hidden="true"><path d="M23 48 L70 85 119 80 154 43 188 70 250 25" /><circle cx="23" cy="48" r="5" /><circle cx="70" cy="85" r="5" /><circle cx="119" cy="80" r="5" /><circle cx="154" cy="43" r="5" /><circle cx="188" cy="70" r="5" /><circle cx="250" cy="25" r="7" /></svg><footer><span>8 etapas</span><span>55 tópicos</span></footer></article>
    </div>
  </section>

  <section class="planos" id="planos" aria-labelledby="titulo-planos">
    <div class="planos__cabecalho">
      <p class="etiqueta">Planos futuros</p>
      <h2 id="titulo-planos">A plataforma cresce junto com o seu jeito de aprender.</h2>
      <p>
        Estamos desenhando os próximos recursos com calma. Sem preços e sem promessas vazias: só o que ajudar a estudar melhor.
      </p>
    </div>
    <div class="planos__grade">
      <article class="plano">
        <p class="plano__selo">Em construção</p>
        <h3>Explorar</h3>
        <p>Para encontrar uma rota clara e começar pelo próximo passo possível.</p>
        <ul><li>Roadmaps abertos</li><li>Critérios por assunto</li><li>Trilhas em expansão</li></ul>
      </article>
      <article class="plano plano--destaque">
        <p class="plano__selo">Em construção</p>
        <h3>Planejar</h3>
        <p>Para transformar uma rota de estudo em um ritmo que cabe na sua semana.</p>
        <ul><li>Calendário de estudos</li><li>Distribuição de assuntos</li><li>Visão do mês</li></ul>
      </article>
      <article class="plano">
        <p class="plano__selo">Em construção</p>
        <h3>Acompanhar</h3>
        <p>Para guardar descobertas e enxergar o caminho que você já percorreu.</p>
        <ul><li>Progresso por tópico</li><li>Mural de notas</li><li>Histórico pessoal</li></ul>
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

  <section class="convite" aria-labelledby="titulo-convite"><p class="etiqueta">Seu próximo passo cabe aqui</p><h2 id="titulo-convite">Abra uma trilha.<br />Faça dela a sua rota.</h2><a class="botao botao--principal" href={abrirApp}>Começar a estudar <span aria-hidden="true">→</span></a></section>
</main>

<footer class="rodape">
  <div class="rodape__principal">
    <div class="rodape__marca"><a class="marca" href="{base}/" aria-label="Let's Learn Together, início">Let's Learn Together</a><p>Feito para quem aprende construindo caminho.</p><p class="rodape__autoria">feito por <a href="https://github.com/masteryogo" target="_blank" rel="noopener noreferrer">@masteryogo</a> &amp; <a href="https://github.com/melchisedekdev" target="_blank" rel="noopener noreferrer">@melchisedekdev</a></p><a class="rodape__apoio" href="{base}/parcerias" data-sveltekit-reload>Conversar sobre parceria <span aria-hidden="true">→</span></a></div>
    <div><h2>Produto</h2><a href="#territorios">Trilhas</a><a href={abrirApp}>Abrir aplicativo</a><a href="#planos">Planos futuros</a></div>
    <div><h2>Junto com a gente</h2><a href="#como-funciona">Como funciona</a><a href="#parcerias">Parcerias</a><a href="{base}/parcerias" data-sveltekit-reload>Ver proposta <span aria-hidden="true">→</span></a></div>
    <div><h2>Legal</h2><a href="{base}/termos" data-sveltekit-reload>Termos de uso</a><a href="{base}/privacidade" data-sveltekit-reload>Privacidade</a></div>
  </div>
  <div class="rodape__fim"><span>© 2026 Let's Learn Together</span><span>Um mapa aberto para quem quer aprender.</span></div>
</footer>
