<!-- ============================================================
     O aviso de que algo não chegou ao banco.

     Existe porque o pior desfecho deste projeto não é o erro: é a
     tela dizer que salvou. Marcar um tópico muda o mapa na hora,
     como deve ser — e se a escrita falhar, sem este aviso a pessoa
     continua marcando por cima de nada.

     Fica no rodapé e não bloqueia: o que ela pode fazer é tentar de
     novo ou entrar de novo, e as duas coisas são dela, não nossas.
     ============================================================ -->
<script>
  let { falha = null } = $props();

  /* a mensagem do Supabase é para quem integra. Traduzimos o que se
     reconhece e guardamos o resto atrás de um detalhe, para o relato
     de defeito não perder a pista. */
  const recado = $derived.by(() => {
    if (!falha) return null;
    const m = String(falha).toLowerCase();
    if (m.includes("jwt") || m.includes("expired") || m.includes("401")) {
      return "Sua sessão expirou. Entre de novo para continuar salvando.";
    }
    if (m.includes("failed to fetch") || m.includes("network")) {
      return "Sem conexão: o que você marcou agora não foi salvo.";
    }
    return "Não consegui salvar na conta.";
  });
</script>

{#if recado}
  <div class="aviso-falha" role="status" aria-live="polite">
    <span class="aviso-falha__marca" aria-hidden="true">×</span>
    <span>
      {recado}
      <!-- o texto cru fica à mão: é o que transforma "deu erro" em
           relato que se resolve -->
      <span class="aviso-falha__cru">({falha})</span>
    </span>
  </div>
{/if}
