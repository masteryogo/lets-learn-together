<script>
  let { resultado } = $props();

  const diagnostico = $derived(resultado?.detalhes?.diagnostico ?? null);
</script>

{#if diagnostico}
  <section class="feedback-pedagogico" data-correta={resultado.correta ? "sim" : "nao"} aria-live="polite">
    <header>
      <p>DIAGNÓSTICO DA PRÁTICA</p>
      <strong>{resultado.correta ? "Você demonstrou este conceito." : "Este conceito ainda precisa de reforço."}</strong>
    </header>
    <dl>
      <div>
        <dt>POR QUÊ</dt>
        <dd>{diagnostico.porQue}</dd>
      </div>
      <div>
        <dt>PARA NÍVEL PROFISSIONAL</dt>
        <dd>{diagnostico.nivelProfissional}</dd>
      </div>
      <div>
        <dt>PRÓXIMO PASSO</dt>
        <dd>{diagnostico.proximoPasso}</dd>
      </div>
    </dl>
  </section>
{/if}
