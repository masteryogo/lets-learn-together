/* Atividades públicas não carregam a chave de correção. Toda resposta
   atravessa a Edge Function: o navegador pode ver o enunciado, nunca o
   critério que decide se acertou. */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

export const atividadesRemotas = $state({ ultimaFalha: null, enviando: false });

export async function listarAtividades(trilha, topicoId) {
  const sb = supabase();
  if (!sb) throw new Error("Sem conexão com as atividades.");
  const { data, error } = await sb
    .from("atividade")
    .select("id, tipo, titulo, enunciado, configuracao, dificuldade, ordem")
    .eq("trilha", trilha)
    .eq("topico_id", topicoId)
    .eq("publicada", true)
    .order("ordem");
  if (error) throw new Error("Não consegui carregar as atividades: " + error.message);
  return data;
}

export async function enviarTentativa(atividadeId, resposta) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.enviando = true;
  atividadesRemotas.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("corrigir-atividade", {
      body: { atividadeId, resposta },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    return data.tentativa;
  } catch (erro) {
    atividadesRemotas.ultimaFalha = erro?.message ?? "falha de rede";
    return null;
  } finally {
    atividadesRemotas.enviando = false;
  }
}
