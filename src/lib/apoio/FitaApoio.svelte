<!-- ============================================================
     A fita: quem sustenta, no alto da mesa.

     Papel contínuo de impressora — o de serrilha, que sai da máquina
     sem fim. A forma é o argumento: uma fita dessas não tem começo
     nem fim, então o laço não é um truque de carrossel, é o material.
     E ela é a saída natural de uma Departure Mono, que é fonte de
     terminal: o que corre aqui é uma listagem impressa.

     Os furos da serrilha são quadrados. `--raio: 0` vale na fita como
     em todo o resto — furo redondo seria a única curva da mesa.

     A fita mostra NOMES, e só. Ela já disse "O rodapé", "Uma trilha",
     "Quem estuda" antes de cada nome: são os lotes da planta de
     expansão, e lá significam alguma coisa. Aqui não — quem chega à
     mesa nunca viu a planta, e lia um rótulo interno colado a um
     nome de empresa. Quem sustenta o quê é assunto de /parcerias.
     ============================================================ -->
<script>
  import { onMount } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { base } from "$app/paths";
  import { listarApoiadores, estado } from "$lib/apoio/apoiadores.svelte.js";

  let apoiadores = $state([]);
  let elemento = $state(null);

  /* Quanto da fita ainda ocupa o topo da JANELA, publicado em
     `--fita-visivel` no <html>.

     Existe porque a barra lateral e a rail são `sticky` no topo e
     precisam medir o que sobra da janela abaixo da fita — e isso
     muda com a rolagem. Descontar `--fita-altura` sempre, como
     antes, deixava as duas 66px curtas depois que a fita saia de
     cena: encolhiam ao rolar. Não descontar nada as fazia
     transbordar antes de rolar, levando o fim delas (onde mora o
     ícone da conta) para fora da janela.

     Como no rodapé, a medida é publicada e não corrigida aqui: quem
     decide o que fazer com ela é cada peça. */
  $effect(() => {
    if (!elemento) return;

    const raiz = document.documentElement;
    let pedido = 0;

    const medir = () => {
      pedido = 0;
      const r = elemento.getBoundingClientRect();
      /* o quanto dela ainda está abaixo do alto da janela; 0 depois
         de a fita ter rolado para fora */
      const sobra = Math.max(0, Math.min(r.bottom, r.height));
      raiz.style.setProperty("--fita-visivel", sobra + "px");
    };

    const agendar = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    medir();

    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (pedido) cancelAnimationFrame(pedido);
      raiz.style.removeProperty("--fita-visivel");
    };
  });

  onMount(async () => {
    const lidos = await listarApoiadores();
    /* null é falha, e falha não é "ninguém apoia": sem isto a fita
       correria afirmando uma vacância que não foi verificada */
    if (lidos) apoiadores = lidos;
  });

  const CONVITE = "Apoie-nos";

  /* sem ninguém, a fita corre só com o convite, repetido. Cinco vezes
     e não uma: a fita é larga, e um convite sozinho deixaria metade
     do papel em branco correndo — que lê como falha de impressão.
     Repetir uma chamada é diferente de repetir um vazio; cada volta
     é o mesmo pedido, não o mesmo buraco.

     Com apoiadores, o convite fecha o grupo: a fita diz quem já está
     e, no fim de cada volta, que ainda cabe gente. */
  const celulas = $derived(
    apoiadores.length
      ? [
          ...apoiadores.map((a) => ({ chave: a.id, texto: a.nome, convite: false })),
          { chave: "convite", texto: CONVITE, convite: true },
        ]
      : Array.from({ length: 5 }, (_, i) => ({
          chave: "convite-" + i,
          texto: CONVITE,
          convite: true,
        }))
  );

  /* a fita precisa ser mais larga que a janela para o laço não mostrar
     o fim do papel. Seis voltas cobrem a tela mais larga; a animação
     anda exatamente uma volta e reinicia, e é por isso que a emenda
     não aparece. */
  const VOLTAS = 6;

  /* quem pediu menos movimento rola a fita na mão, e aí as voltas
     deixam de servir: elas existem para esconder a emenda do laço.
     Sem laço, são a mesma lista seis vezes debaixo do dedo. */
  const parado = new MediaQuery("prefers-reduced-motion: reduce");
  const voltas = $derived(parado.current ? 1 : VOLTAS);

  /* velocidade constante, e não duração constante: com mais células a
     fita andaria mais rápido para cumprir o mesmo tempo */
  const ciclo = $derived(celulas.length * 7);

  /* sem apoiador a fita inteira é a chamada, então a janela toda vira
     o alvo. É o que resolve o alvo em movimento: o papel corre por
     dentro, mas o que se clica é a moldura, que está parada. */
  const soConvite = $derived(apoiadores.length === 0);

  const leitura = $derived(
    soConvite
      ? "Ninguém apoia o site ainda."
      : "Apoiam o site: " + apoiadores.map((a) => a.nome).join(", ") + "."
  );
</script>

<aside class="fita" aria-label="Quem sustenta o site" bind:this={elemento}>
  <!-- a cabeça da impressora: parada, e por isso é ela que leva à
       planta. O rótulo é o nome do campo, como no carimbo do rodapé. -->
  <div class="fita__cabeca">
    <span class="fita__rotulo">Quem confia</span>
    <a class="fita__porta" href="{base}/parcerias" data-sveltekit-reload>apoiar</a>
  </div>

  <svelte:element
    this={soConvite ? "a" : "div"}
    class="fita__janela"
    class:fita__janela--alvo={soConvite}
    href={soConvite ? `${base}/parcerias` : undefined}
    data-sveltekit-reload={soConvite ? "" : undefined}
    aria-label={soConvite ? "Apoiar o Let's Learn Together" : undefined}
  >
    <!-- escondida do leitor de tela: o que ele recebe é a frase escrita
         abaixo, uma vez só, em vez das seis voltas do papel -->
    <div
      class="fita__trilho"
      style="--voltas: {voltas}; --ciclo: {ciclo}s"
      aria-hidden="true"
    >
      {#each Array(voltas) as _, volta}
        {#each celulas as cel (volta + "-" + cel.chave)}
          <span class="fita__celula" class:fita__celula--convite={cel.convite}>
            {cel.texto}
          </span>
        {/each}
      {/each}
    </div>
  </svelte:element>

  <p class="fita__leitura">{leitura}</p>

  {#if estado.falha}
    <!-- a fita correndo só com o convite é uma afirmação sobre quem
         apoia. Se a leitura falhou, ela precisa deixar de ser. -->
    <p class="fita__falha" role="status" aria-live="polite">
      <span aria-hidden="true">×</span> lista não conferida
    </p>
  {/if}
</aside>

<style>
.fita {
  /* paleta própria, como no rodapé: a fita é desenhada dentro de três
     folhas globais que dão valores diferentes aos mesmos nomes. */
  --papel:       #faf8f2;
  --borda:       #b9b0a0;
  --regua:       #ddd5c6;
  --malha-fina:  #e2e9ee;
  --tinta:       #2b3a45;
  --tinta-fraca: #6b6558;
  --linha-dura:  #15141a;
  /* a família também é token próprio, e pela mesma razão que as
     cores: a folha de apoio põe a Plex Sans no body, e sem esta
     linha a mesma fita saía em monoespaçada em cinco telas e em
     sans na sexta. */
  --mono: "Departure Mono", ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-family: var(--mono);

  /* No fluxo, e não fixa. Fixa, ela acompanhava a rolagem em todas as
     telas e virava poluição: um anúncio permanente por cima de quem
     veio estudar. A fita é o alto da folha — some quando se desce,
     como o alto de qualquer folha.

     As margens negativas desfazem o padding do body para ela alcançar
     a borda da janela: papel que termina antes da janela não é fita,
     é cartão. O valor não pode estar escrito aqui, porque a fita
     abre seis telas com paddings diferentes; cada folha declara o
     seu em `--sangria-t` / `--sangria-x`, como já faz para o rodapé. */
  position: relative;
  z-index: 8;
  margin: calc(-1 * var(--sangria-t, 0px))
          calc(-1 * var(--sangria-x, 0px))
          0;
  display: flex;
  align-items: stretch;
  /* 66px: 55 de papel entre duas serrilhas de 5,5. A serrilha fica
     DENTRO da altura, com o conteúdo recuado pelo padding — pendurada
     nas bordas ela se ancorava ao padding box e saía da fita.

     O valor vem de `--fita-altura`, em src/app.css: quem reserva o
     espaço dela são as folhas e a barra lateral do roadmap, e o
     número tem de ser o mesmo nos quatro lugares. */
  height: var(--fita-altura, 66px);
  padding: 5.5px 0;
  background: var(--papel);
  --dente: repeating-linear-gradient(to right, #000 0 5.5px, #0000 5.5px 11px);
  mask:
    var(--dente) 0 0 / 11px 5.5px repeat-x,
    linear-gradient(#000 0 0) 0 5.5px / 100% calc(100% - 11px) no-repeat,
    var(--dente) 0 100% / 11px 5.5px repeat-x;
}

/* os furos: quadrados, no passo de 11px da malha dos mapas. São
   VAZADOS, por máscara, e não pintados por cima: antes eles eram
   quadrados da cor do tampo, o que só funcionava na mesa — em
   qualquer outra tela a fita apareceria com dentes oliva sobre fundo
   escuro. Recortada, ela deixa passar o que estiver atrás, seja qual
   for a tela. É a mesma técnica do rasgo do carimbo. */

/* a cabeça: parada, e por isso é ela que leva a algum lugar. Fundo
   sólido porque a fita passa por baixo — sem ele, nome de apoiador
   e rótulo se sobrepõem no instante do laço. */
.fita__cabeca {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  gap: 11px;
  padding: 0 16.5px 0 clamp(16px, 2.4vw, 32px);
  background: var(--papel);
  border-right: 1px solid var(--borda);
}

.fita__rotulo {
  align-self: center;
  font-size: 13.75px;
  letter-spacing: 0.06em;
  color: var(--tinta-fraca);
}

.fita__porta {
  align-self: center;
  font-size: 13.75px;
  color: var(--linha-dura);
  text-decoration: none;
  border-bottom: 1px solid var(--borda);
}

.fita__porta:hover { border-bottom-color: var(--linha-dura); }
.fita__porta:focus-visible { outline: 2px solid var(--linha-dura); outline-offset: 3px; }

/* a janela por onde o papel passa. O quadriculado fino é o mesmo da
   tira de busca e da célula à venda do carimbo: é o papel do site. */
.fita__janela {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;
  /* `display: block` porque sem apoiador a janela é um <a>, e um link
     em linha ignoraria a altura da fita */
  display: block;
  text-decoration: none;
  background:
    repeating-linear-gradient(to right, var(--malha-fina) 0 1px, transparent 1px 11px),
    repeating-linear-gradient(to bottom, var(--malha-fina) 0 1px, transparent 1px 11px),
    var(--papel);
}

.fita__trilho {
  display: flex;
  align-items: center;
  height: 100%;
  width: max-content;
  animation: fita-corre var(--ciclo) linear infinite;
}

/* anda exatamente uma volta das seis e reinicia: como as voltas são
   idênticas, o salto cai sobre si mesmo e não se vê emenda */
@keyframes fita-corre {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-100% / var(--voltas))); }
}

/* a célula da listagem: um nome, e nada em volta dele. A divisória é
   a estrutura da própria folha impressa — separa um registro do outro
   e poupa um separador decorativo entre os nomes. */
.fita__celula {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 22px;
  white-space: nowrap;
  font-size: 16.5px;
  color: var(--tinta);
  border-right: 1px solid var(--regua);
}

/* o convite é o mesmo tamanho dos nomes e um degrau mais claro: ele
   acompanha a lista, não a encabeça. Quando é a fita inteira, a
   janela já é o link — aqui ele não finge ser botão. */
.fita__celula--convite { color: var(--tinta-fraca); }

/* e quando a janela é o alvo, o convite responde ao gesto nela */
.fita__janela--alvo:hover .fita__celula--convite,
.fita__janela--alvo:focus-visible .fita__celula--convite { color: var(--linha-dura); }

.fita__janela--alvo:focus-visible {
  outline: 2px solid var(--linha-dura);
  outline-offset: -2px;
}

/* a falha encostada na borda direita, sobre a fita: é um aviso sobre
   tudo o que está correndo, não sobre uma célula */
.fita__falha {
  position: absolute;
  z-index: 2;
  right: clamp(16px, 2.4vw, 32px);
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  padding: 0 11px;
  font-size: 13.75px;
  color: var(--tinta);
  background: var(--papel);
}

/* a lista que o leitor de tela recebe: uma volta só, em vez das seis
   do papel */
.fita__leitura {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* papel parado para quem pediu menos movimento. A fita continua
   legível: a janela rola na mão, e a primeira volta já tem a lista
   inteira. */
@media (prefers-reduced-motion: reduce) {
  .fita__trilho { animation: none; }
  .fita__janela { overflow-x: auto; }
}

/* no telefone a cabeça fica só com a porta. Em 390px o rótulo comia
   150 dos 390, e sobrava uma janela de 169 — larga demais para caber
   um nome, estreita demais para ser uma fita. O que a fita é fica
   dito pelas próprias células; o que não se podia perder era o
   caminho para a página de parceria. */
@media (max-width: 900px) {
  .fita__rotulo { display: none; }
  .fita__cabeca { padding-right: 11px; }
  .fita__celula { padding: 0 14px; }
}
</style>
