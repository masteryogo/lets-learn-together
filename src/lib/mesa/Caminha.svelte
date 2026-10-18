<!-- ============================================================
     A caminha do Obi. São duas peças e não uma: o aro de trás vem
     antes dele no DOM e o da frente depois — é a ordem do DOM que o
     põe DENTRO da cama em vez de em cima dela. Sem z-index de
     propósito: pendurado, o próprio Obi sobe para 60 e sai da cama
     sozinho.

     Aqui a profundidade é contada por valor e não por sombra: o aro
     de trás mais escuro, o da frente mais claro, a almofada no meio.

       parte  "fundo" antes do Obi, "frente" depois
     ============================================================ -->
<script>
  let { parte } = $props();
</script>

{#if parte === "fundo"}
  <div class="caminha caminha--fundo" aria-hidden="true">
    <svg viewBox="0 0 240 58" width="240" height="58">
      <!-- o aro de trás: largo o bastante para sobrar dos dois lados
           dele. Enquanto era estreito, o Obi cobria o fundo inteiro e
           só restavam duas lascas nas beiras — e duas lascas não
           fazem uma cama. -->
      <g stroke="var(--borda-tampo)" stroke-width="2">
        <path d="M25 1h190v22H25z" fill="var(--cama-aro)" />
        <path d="M25 1v22L1 55V31z" fill="var(--cama-aro-lado)" />
        <path d="M215 1v22l24 32V31z" fill="var(--cama-aro-lado)" />
        <!-- a almofada é mais CLARA que o tampo, ao contrário do aro:
             é a inversão que a faz ler como tecido macio posto sobre
             a mesa, e não como um buraco nela -->
        <path d="M25 23h190l24 32H1z" fill="var(--cama-almofada)" />
      </g>

      <!-- o acolchoado do aro: tiques verticais, como o costurado de
           uma almofada de rolo. É o detalhe que diz "cama" antes de
           qualquer formato. -->
      <g fill="var(--cama-costura)">
        <rect x="49" y="5" width="2" height="14" />
        <rect x="85" y="5" width="2" height="14" />
        <rect x="121" y="5" width="2" height="14" />
        <rect x="157" y="5" width="2" height="14" />
        <rect x="193" y="5" width="2" height="14" />
      </g>

      <!-- as peças dele: brinquedo de robô é parafuso -->
      <rect x="46" y="44" width="8" height="7" fill="var(--amarelo)" />
      <rect x="182" y="46" width="8" height="6" fill="var(--roxo)" />
    </svg>
  </div>
{:else}
  <div class="caminha caminha--frente" aria-hidden="true">
    <svg viewBox="0 0 240 36" width="240" height="36">
      <path
        d="M1 1h238v34H1z"
        fill="var(--cama-aro-frente)"
        stroke="var(--borda-tampo)"
        stroke-width="2"
      />
      <!-- a dobra de onde o aro encontra a almofada: sem esta linha o
           aro da frente lia como um degrau, não como um rolo -->
      <path d="M2 3h236v4H2z" fill="var(--cama-aro)" />

      <!-- a mesma costura do aro de trás, para os dois serem a mesma
           peça dando a volta -->
      <g fill="var(--cama-costura)">
        <rect x="37" y="12" width="2" height="18" />
        <rect x="73" y="12" width="2" height="18" />
        <rect x="167" y="12" width="2" height="18" />
        <rect x="203" y="12" width="2" height="18" />
      </g>

      <!-- a luz do carregador: ele é robô, a cama dele carrega -->
      <rect x="14" y="15" width="7" height="7" fill="var(--amarelo)" />
      <!-- a chapinha de nome, costurada no aro -->
      <path d="M88 9h64v19H88z" fill="var(--cama-chapa)" />
    </svg>
    <span class="caminha__etiqueta">obi</span>
  </div>
{/if}
