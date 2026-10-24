/* Recomendações não definem quem pode avançar. Elas só tornam visível a
   diferença entre marcar um assunto como feito e demonstrá-lo na prática. */
import { sessao } from "$lib/conta/Sessao.svelte.js";
import { supabase } from "$lib/supabase.js";

export const recomendacoes = $state({ itens: [], carregando: false, ultimaFalha: null });

function tentativaAvaliavel(tentativa) {
  return tentativa.acao !== "executar"
    && tentativa.detalhes?.falha !== true
    && tentativa.detalhes?.status !== "aguardando_avaliacao";
}

export async function carregarRecomendacoes(trilha, estados) {
  if (!sessao.conectado) {
    recomendacoes.itens = [];
    recomendacoes.ultimaFalha = null;
    return;
  }

  const sb = supabase();
  if (!sb) {
    recomendacoes.itens = [];
    recomendacoes.ultimaFalha = "Não consegui conectar as recomendações de estudo.";
    return;
  }

  recomendacoes.carregando = true;
  recomendacoes.ultimaFalha = null;
  try {
    const { data: atividades, error: falhaAtividades } = await sb
      .from("atividade")
      .select("id, topico_id, titulo, tipo")
      .eq("trilha", trilha)
      .eq("publicada", true)
      .neq("tipo", "projeto");
    if (falhaAtividades) throw new Error("Não consegui ler as práticas desta trilha: " + falhaAtividades.message);

    const ids = (atividades ?? []).map((atividade) => atividade.id);
    if (!ids.length) {
      recomendacoes.itens = [];
      return;
    }

    const { data: tentativas, error: falhaTentativas } = await sb
      .from("tentativa_atividade")
      .select("atividade_id, correta, criada_em, detalhes, acao")
      .in("atividade_id", ids)
      .order("criada_em", { ascending: false });
    if (falhaTentativas) throw new Error("Não consegui ler suas tentativas: " + falhaTentativas.message);

    const ultimaPorAtividade = new Map();
    for (const tentativa of tentativas ?? []) {
      if (!tentativaAvaliavel(tentativa) || ultimaPorAtividade.has(tentativa.atividade_id)) continue;
      ultimaPorAtividade.set(tentativa.atividade_id, tentativa);
    }

    const porTopico = new Map();
    for (const atividade of atividades ?? []) {
      if (estados[atividade.topico_id] !== "feito") continue;
      const tentativa = ultimaPorAtividade.get(atividade.id);
      if (!tentativa || tentativa.correta) continue;
      const existente = porTopico.get(atividade.topico_id);
      if (!existente || tentativa.criada_em > existente.criadaEm) {
        porTopico.set(atividade.topico_id, {
          topicoId: atividade.topico_id,
          atividadeTitulo: atividade.titulo,
          criadaEm: tentativa.criada_em,
        });
      }
    }
    recomendacoes.itens = [...porTopico.values()].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  } catch (erro) {
    recomendacoes.itens = [];
    recomendacoes.ultimaFalha = erro?.message ?? "Não consegui montar suas recomendações de estudo.";
  } finally {
    recomendacoes.carregando = false;
  }
}
