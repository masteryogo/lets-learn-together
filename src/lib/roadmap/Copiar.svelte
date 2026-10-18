<!-- ============================================================
     O botão de copiar um subassunto.

     O ícone troca para o "certo" por ~1,4s. O relógio é por botão:
     clicar de novo antes do tempo reinicia, em vez de o primeiro
     relógio apagar a confirmação do segundo.

     As duas folhas e o certo moram no mesmo <svg>, e quem troca os
     dois é o CSS, pelo data-copiado.
     ============================================================ -->
<script>
  import { copiarTexto } from "./copiar.js";

  let { rotulo, aoAnunciar } = $props();

  let resultado = $state(null);
  let relogio = null;

  function confirmar(valor, aviso) {
    resultado = valor;
    aoAnunciar(aviso);
    clearTimeout(relogio);
    relogio = setTimeout(() => { resultado = null; }, 1400);
  }

  function copiar() {
    copiarTexto(rotulo).then(
      () => confirmar("sim", rotulo + " copiado"),
      () => confirmar("nao", "Não foi possível copiar")
    );
  }
</script>

<button
  type="button"
  class="subassunto__copiar"
  title={'Copiar “' + rotulo + '”'}
  aria-label={'Copiar “' + rotulo + '”'}
  data-copiado={resultado}
  onclick={copiar}
>
  <!-- duas folhas, em cantos duros como o resto da página -->
  <svg
    viewBox="0 0 14 14"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    shape-rendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    <g class="icone--copiar">
      <rect x="1" y="4" width="8" height="9" />
      <path d="M4 4V1h9v9h-3" />
    </g>
    <g class="icone--ok">
      <path d="M2 7l4 4 6-8" />
    </g>
  </svg>
</button>
