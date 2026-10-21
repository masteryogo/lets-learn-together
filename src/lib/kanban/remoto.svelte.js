/* ============================================================
   O quadro e as sugestões, no banco.

   Os cards moravam em dados.js, escritos à mão. Saíram de lá quando
   o quadro passou a aceitar sugestão de quem usa o site: dado que
   muda sem deploy não pode depender de deploy para mudar.

   Ler é público — a tela do quadro funciona deslogado, porque é ela
   que explica o projeto a quem chega. Escrever exige conta.
   ============================================================ */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

export const estado = $state({ falha: null });

/* aqui o cliente não depende de sessão: o select é público */
function cliente() {
  return supabase();
}

/* o banco fala veja_tambem; a tela sempre falou vejaTambem */
function daLinha(c) {
  return {
    id: c.id,
    titulo: c.titulo,
    raia: c.raia,
    coluna: c.coluna,
    resumo: c.resumo,
    porque: c.porque,
    blocos: c.blocos ?? [],
    vejaTambem: c.veja_tambem ?? [],
  };
}

export async function listarCards() {
  const sb = cliente();
  if (!sb) return null;

  const { data, error } = await sb
    .from("kanban_card")
    .select("id, titulo, raia, coluna, resumo, porque, blocos, veja_tambem, ordem")
    .order("ordem");

  estado.falha = error ? error.message : null;
  return error ? null : data.map(daLinha);
}

/* devolve null quando dá certo e uma frase quando não — o mesmo
   contrato dos verbos da sessão */
export async function sugerir({ titulo, corpo, raia }) {
  const sb = cliente();
  if (!sb || !sessao.conectado) return "Entre na conta para sugerir.";

  const { error } = await sb.from("sugestao").insert({
    usuario_id: sessao.usuario.id,
    titulo: titulo.trim(),
    corpo: corpo.trim(),
    raia: raia || null,
  });

  if (!error) return null;
  /* os CHECK de tamanho são a única recusa prevista, e a mensagem do
     banco não serve para quem escreveu */
  return error.code === "23514"
    ? "O título precisa de 3 a 120 caracteres, e o texto de ao menos 10."
    : "Não consegui enviar. Tente de novo.";
}

/* o que esta pessoa já sugeriu, com a resposta que recebeu. A RLS
   garante que ninguém vê a sugestão de outro — aqui não há filtro
   por usuário, e é de propósito: o filtro está no banco. */
export async function minhasSugestoes() {
  const sb = cliente();
  if (!sb || !sessao.conectado) return [];

  const { data, error } = await sb
    .from("sugestao")
    .select("id, titulo, corpo, raia, estado, resposta, card_id, criado_em")
    .order("criado_em", { ascending: false });

  return error ? [] : data;
}
