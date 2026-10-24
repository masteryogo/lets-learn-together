import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

export const perfilRemoto = $state({
  resumo: null,
  carregando: false,
  ultimaFalha: null,
});

function dataCurta(valor) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(valor));
}

/* As tentativas corretas são a evidência que uma competência usa. Contar
   tentativas brutas premiaria repetir a mesma resposta, então cada atividade
   aprovada entra uma única vez nos totais do perfil. */
export async function carregarResumoPerfil() {
  const sb = supabase();
  if (!sb || !sessao.conectado) {
    perfilRemoto.resumo = null;
    return;
  }

  perfilRemoto.carregando = true;
  perfilRemoto.ultimaFalha = null;
  try {
    const usuarioId = sessao.usuario.id;
    const [topicos, tentativas, competencias, vinculos, publicacoes] = await Promise.all([
      sb.from("progresso_topico").select("estado").eq("usuario_id", usuarioId),
      sb.from("tentativa_atividade")
        .select("atividade_id, criada_em, atividade:atividade_id(titulo, trilha)")
        .eq("usuario_id", usuarioId)
        .eq("correta", true)
        .order("criada_em", { ascending: false }),
      sb.from("competencia").select("id, titulo").order("ordem"),
      sb.from("atividade_competencia").select("atividade_id, competencia_id"),
      sb.from("publicacao_github")
        .select("id, atividade_titulo, repositorio_completo, url, publicada_em")
        .eq("usuario_id", usuarioId)
        .order("publicada_em", { ascending: false })
        .limit(4),
    ]);

    const respostas = [topicos, tentativas, competencias, vinculos, publicacoes];
    if (respostas.some((resposta) => resposta.error)) {
      throw new Error("Não consegui carregar a evolução do seu perfil.");
    }

    const atividadesAprovadas = new Set((tentativas.data ?? []).map((tentativa) => tentativa.atividade_id));
    const demonstradas = (competencias.data ?? []).filter((competencia) => {
      const atividades = (vinculos.data ?? [])
        .filter((vinculo) => vinculo.competencia_id === competencia.id)
        .map((vinculo) => vinculo.atividade_id);
      return atividades.length > 0 && atividades.every((atividadeId) => atividadesAprovadas.has(atividadeId));
    });

    perfilRemoto.resumo = {
      topicosFeitos: (topicos.data ?? []).filter((topico) => topico.estado === "feito").length,
      topicosEstudando: (topicos.data ?? []).filter((topico) => topico.estado === "estudando").length,
      atividadesAprovadas: atividadesAprovadas.size,
      competenciasDemonstradas: demonstradas.length,
      ultimosAvancos: (tentativas.data ?? []).slice(0, 4).map((tentativa) => ({
        titulo: tentativa.atividade?.titulo ?? "Atividade aprovada",
        trilha: tentativa.atividade?.trilha ?? null,
        data: dataCurta(tentativa.criada_em),
      })),
      publicacoes: (publicacoes.data ?? []).map((publicacao) => ({
        ...publicacao,
        data: dataCurta(publicacao.publicada_em),
      })),
    };
  } catch (erro) {
    perfilRemoto.resumo = null;
    perfilRemoto.ultimaFalha = erro.message ?? "Não consegui carregar a evolução do seu perfil.";
  } finally {
    perfilRemoto.carregando = false;
  }
}
