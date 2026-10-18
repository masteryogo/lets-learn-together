<!-- ============================================================
     O estojo: uma tampa, não uma prateleira.

     Calendário e notas valem para todas as trilhas, e a fileira de
     trilhas cresce sem teto — o que vale para todas não pode ficar
     pendurado no fim da fila da quinquagésima. Por isso o estojo
     mostra o que guarda em miniatura e abre num clique só, como uma
     pasta de aplicativos: o conteúdo cresce sem a mesa crescer junto.

     O <dialog> nativo resolve sozinho o que daria mais trabalho que
     o resto junto: foco preso dentro, Esc que fecha, e um ::backdrop
     em camada própria — nada de z-index brigando com o Obi, que voa
     solto por cima da mesa.
     ============================================================ -->
<script>
  import Peca from "./Peca.svelte";
  import Mes from "./desenhos/Mes.svelte";
  import Mural from "./desenhos/Mural.svelte";
  import { semMovimento } from "$lib/obi/ControleObi.svelte.js";

  const PECAS = [
    {
      id: "agenda",
      href: "/calendario",
      nome: "Calendário",
      rodape: "Planeje o mês",
      rotulo: "Calendário de estudos, planejar o mês entre as trilhas",
      Desenho: Mes,
    },
    {
      id: "notas",
      href: "/notas",
      nome: "Notas",
      rodape: "Escreva o que aprendeu",
      rotulo: "Mural de notas, um por trilha",
      Desenho: Mural,
    },
  ];

  let painel = $state(null);
  let tampa = $state(null);
  let aberto = $state(false);

  function abrir() {
    aberto = true;
    painel.showModal();
    /* a primeira peça recebe o foco: quem abriu o estojo quer pegar
       alguma coisa, e não ler o título de novo */
    painel.querySelector(".carta--peca")?.focus();
  }

  function fechada() {
    aberto = false;
    /* o foco volta para a tampa: sem isso ele cai no começo da página
       e quem usa teclado perde o lugar */
    tampa?.focus();
  }

  /* 900ms é o que a cascata leva: o último pedaço começa aos 470ms e a
     animação dura 420. Sair antes disso deixaria a carta pela metade
     na saída. */
  function sair(href) {
    /* documento novo: cada tela tem a sua folha global */
    setTimeout(() => (location.href = href), semMovimento() ? 120 : 900);
  }
</script>

<!-- as miniaturas são desenho, não botões: o alvo é a tampa inteira,
     senão metade dos cliques erraria o que queria abrir -->
<button
  class="estojo"
  type="button"
  bind:this={tampa}
  aria-haspopup="dialog"
  aria-expanded={aberto}
  aria-label="Abrir o estojo: calendário e notas"
  onclick={abrir}
>
  <span class="estojo__etiqueta">Estojo</span>
  <span class="estojo__miniaturas" aria-hidden="true">
    {#each PECAS as peca}
      <!-- a miniatura é o mesmo desenho da peça, menor e sem texto: a
           tampa mostra o que guarda, não repete o nome do que guarda -->
      <span class="estojo__mini carta--{peca.id}">
        <peca.Desenho />
      </span>
    {/each}
  </span>
  <span class="estojo__abrir">abrir</span>
</button>

<dialog
  class="aberto"
  bind:this={painel}
  aria-labelledby="aberto-titulo"
  onclose={fechada}
  oncancel={fechada}
  onclick={(ev) => {
    /* clique no véu fecha: o alvo é o próprio <dialog> só quando se
       acerta a área de fora do painel */
    if (ev.target === painel) painel.close();
  }}
>
  <div class="aberto__topo">
    <p class="aberto__titulo" id="aberto-titulo">Estojo</p>
    <button
      class="aberto__fechar"
      type="button"
      aria-label="Fechar o estojo"
      onclick={() => painel.close()}
    >×</button>
  </div>
  <div class="aberto__itens">
    {#each PECAS as peca}
      <Peca {peca} Desenho={peca.Desenho} aoSair={sair} />
    {/each}
  </div>
</dialog>
