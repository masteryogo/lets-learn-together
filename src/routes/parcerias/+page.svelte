<script>
  import { base } from "$app/paths";
  import { env } from "$env/dynamic/public";
  import "$lib/estilos/base.css";
  import "./parcerias.css";

  const abrirApp = env.PUBLIC_APP_URL || `${base}/app`;

  const niveis = [
    ["Apoiador", "Sua marca no rodapé de todas as telas e na fita do topo da página inicial, escrita no mesmo papel do resto do site. Sem banner, sem rede de anúncio, sem rastreador.", "Uma conversa e um acordo de doze meses. No ar em uma semana."],
    ["Parceiro", "Tudo do Apoiador, mais um roadmap sobre a sua stack: um caminho de estudo de verdade, do começo ao avançado, escrito por nós e revisado pelo seu time. A carta dele diz quem o ergueu.", "Conversa, desenho do conteúdo e de seis a dez semanas de escrita."],
    ["Parceiro fundador", "Tudo do Parceiro, mais o nome na página de quem faz o site e voz nas próximas trilhas que vamos escrever — inclusive nas que não são sobre a sua ferramenta.", "Enquanto houver vaga: 3 de 3 abertas. Quem chega primeiro assume um risco que os próximos não vão assumir."]
  ];
  const beneficios = [
    ["Marca no rodapé de todas as telas", "incluído", "incluído", "incluído"],
    ["Marca na fita do topo da página inicial", "incluído", "incluído", "incluído"],
    ["Selo para usar no seu site", "incluído", "incluído", "incluído"],
    ["Um roadmap sobre a sua stack", "não incluído", "incluído", "incluído"],
    ["Seu nome na carta dessa trilha", "não incluído", "incluído", "incluído"],
    ["Revisão técnica do conteúdo com o seu time", "não incluído", "incluído", "incluído"],
    ["Nome na página de quem faz o site", "não incluído", "não incluído", "incluído"],
    ["Voz nas próximas trilhas", "não incluído", "não incluído", "incluído"],
    ["Falar com quem estuda", "depois", "depois", "depois"]
  ];
</script>

<style>
  .cabecalho > .marca { font-size: 18px !important; font-weight: 400; letter-spacing: .16em !important; text-decoration: none; text-transform: none; }
  nav a { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
  nav a:first-child { font-size: 11px !important; letter-spacing: .1em !important; text-transform: uppercase !important; }
  nav a[aria-current="page"] { text-decoration: underline; text-underline-offset: 4px; }
  @media (max-width: 760px) { nav a:not(:last-child) { display: none; } }
  @media (prefers-reduced-motion: no-preference) {
    .niveis article { transition: transform .18s ease-out, box-shadow .18s ease-out; }
    .niveis article:hover { transform: translateY(-8px); box-shadow: 0 15px 22px #15141a2b; }
    .niveis article.fundador:hover { transform: translateY(-15px); }
  }
  @media (max-width: 720px) and (prefers-reduced-motion: no-preference) {
    .niveis article.fundador:hover { transform: translateY(-8px) rotate(.5deg); }
  }
</style>

<svelte:head><title>Parcerias — Let's Learn Together</title><meta name="description" content="Parcerias que ajudam a manter roadmaps de estudo abertos, em português." /></svelte:head>

<header class="cabecalho">
  <a class="marca" href="{base}/" data-sveltekit-reload>Let's Learn Together</a>
  <nav aria-label="Navegação principal" style="display:flex; align-items:center; gap:clamp(16px, 3vw, 38px);">
    <a href="{base}/#como-funciona" data-sveltekit-reload>Como funciona</a>
    <a href="{base}/#territorios" data-sveltekit-reload>Trilhas</a>
    <a href="{base}/#planos" data-sveltekit-reload>Planos</a>
    <a href="{base}/parcerias" aria-current="page">Parcerias</a>
    <a href={abrirApp} style="padding:7px 12px; border:1px solid currentColor; box-shadow:2px 2px 0 currentColor;">Entrar</a>
  </nav>
</header>
<main>
  <section class="hero"><h1>Seja parceiro de quem está aprendendo a sua stack.</h1><p>Publicamos roadmaps de estudo em português, de graça, para quem aprende sozinho. Uma parceria coloca a sua empresa dentro desse material — não num banner ao lado dele.</p><div class="acoes"><a class="botao" href="#falar">Falar com a equipe</a><a href="#niveis">Ver os três níveis</a></div><small>A primeira conversa leva trinta minutos e não compromete nada.</small></section>
  <section class="processo" aria-label="Como funciona"><article><b>Conversa</b><span>Trinta minutos para entender o que você quer alcançar.</span></article><article><b>Desenho</b><span>Escolhemos juntos o nível, o conteúdo e o prazo.</span></article><article><b>No ar</b><span>Publicamos, e você vê exatamente onde ficou.</span></article></section>
  <section id="niveis" class="secao"><p class="rotulo">níveis</p><h2>Três formas de entrar</h2><p class="introducao">Cada nível inclui o anterior. A diferença entre eles é quanto do site passa a levar o seu nome — e quanto trabalho a gente faz junto.</p><div class="niveis">{#each niveis as nivel, i}<article class:fundador={i === 2}><p class="numero">0{i + 1}</p><h3>{nivel[0]}</h3><p>{nivel[1]}</p><footer><b>Como entrar</b> {nivel[2]}</footer></article>{/each}</div></section>
  <section class="secao comparacao"><p class="rotulo">o que cada nível inclui</p><h2>A comparação, inteira</h2><div class="tabela" role="table"><div class="linha cabeca" role="row"><b>Benefício</b><b>Apoiador</b><b>Parceiro</b><b>Fundador</b></div>{#each beneficios as beneficio}<div class="linha" role="row"><span>{beneficio[0]}</span><span>{beneficio[1]}</span><span>{beneficio[2]}</span><span>{beneficio[3]}</span></div>{/each}</div><p class="nota">“Depois” é o que ainda não existe: contato com pessoas que aceitarem receber vaga na área que estudam. Precisa de consentimento explícito de cada uma, e nada disso está construído. Anunciamos para você saber o rumo, não para vender hoje.</p><p class="nota">O que não prometemos: nenhuma dessas marcas é número de impressão ou alcance garantido. Ainda não medimos audiência com rigor suficiente para colocar um número nesta página. A parceria entrega posição e permanência.</p></section>
  <section class="selo secao"><p class="rotulo">o selo</p><h2>Um carimbo que você leva com você</h2><p>Todo parceiro recebe o selo para usar no próprio site, na página de carreiras ou no material de recrutamento. Ele diz que a sua empresa paga por material de estudo aberto, em português.</p><div class="carimbo"><span>Apoiador</span><b>Let's Learn Together</b></div></section>
  <section id="falar" class="falar" style="padding-inline: max(20px, calc((100vw - 1180px) / 2));"><p class="rotulo">conversar</p><h2>Falar com a equipe</h2><p>Conte o que você tem em mente. Respondemos no e-mail que você deixar, normalmente em até dois dias.</p><a class="botao" href="mailto:matosjoaopedro.jp@gmail.com?subject=Parceria%20com%20a%20Let's%20Learn%20Together">Escrever para a equipe</a><small>O canal de formulário está em preparação. Enquanto isso, o e-mail vai direto para a equipe.</small><p class="privacidade">Guardamos a mensagem só para responder. <a href="{base}/privacidade" data-sveltekit-reload>Privacidade</a></p></section>
</main>
<footer>Let's Learn Together — roadmaps de estudo em português, feitos por quem e para quem estuda sozinho.</footer>
