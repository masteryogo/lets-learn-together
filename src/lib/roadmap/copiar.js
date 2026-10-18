/* ============================================================
   Copiar para a área de transferência.

   navigator.clipboard só existe em contexto seguro — e não basta
   checar o contexto: a API também *rejeita* em tempo de execução,
   por documento sem foco ou permissão negada. Por isso o campo fora
   da tela é o fim de qualquer caminho, e não só o plano B.
   ============================================================ */

export function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard
      .writeText(texto)
      .catch(() => copiarPorCampo(texto));
  }
  return copiarPorCampo(texto);
}

function copiarPorCampo(texto) {
  return new Promise((resolver, rejeitar) => {
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.top = "-1000px";
    document.body.appendChild(campo);
    campo.focus();
    campo.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(campo);

    if (ok) resolver();
    else rejeitar();
  });
}
