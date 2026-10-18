/* ============================================================
   Subassuntos.

   A maioria dos `desc` já é uma lista de subassuntos escrita como
   frase ("Criação, acesso seguro, iteração."). Um tópico que traga
   `subtopicos` manda; sem ele, tentamos partir a frase — com
   guardas, porque nem toda vírgula separa item de lista.
   ============================================================ */

export function subassuntosDe(topico) {
  if (topico.subtopicos && topico.subtopicos.length) return topico.subtopicos;
  return partirDesc(topico.desc);
}

export function partirDesc(desc) {
  if (!desc) return null;

  /* dois-pontos marca oração ("Padrão: zero abaixo, identidade acima")
     e crase marca trecho de código, que não se pica */
  if (desc.includes(":") || desc.includes("`")) return null;

  let t = desc.trim();
  if (t.endsWith(".")) t = t.slice(0, -1);

  let partes = t.split(",").map((s) => s.trim()).filter(Boolean);

  /* o último trecho costuma fechar a lista com "a e b" */
  if (partes.length) {
    const cauda = partes[partes.length - 1].split(/\s+e\s+/);
    if (cauda.length === 2) {
      partes = [...partes.slice(0, -1), ...cauda.map((s) => s.trim())];
    }
  }

  /* menos de três partes é frase; parte longa é oração, não item */
  if (partes.length < 3) return null;
  for (const parte of partes) {
    if (parte.length < 3) return null;
    if (parte.split(/\s+/).length > 5) return null;
  }
  return partes;
}

/* a chave vem do texto, não do índice: se uma contribuição reescrever
   um subassunto, a marca daquele item se perde — melhor que herdar a
   marca de um item que virou outra coisa */
export function chaveSub(topicoId, texto) {
  return topicoId + "|" + texto;
}
