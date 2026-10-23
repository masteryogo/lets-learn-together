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

export async function listarRascunhos(atividadeIds) {
  const sb = supabase();
  if (!sb || !sessao.conectado || !atividadeIds.length) return {};
  const { data, error } = await sb
    .from("tentativa_atividade")
    .select("atividade_id, resposta, criada_em")
    .eq("usuario_id", sessao.usuario.id)
    .in("atividade_id", atividadeIds)
    .order("criada_em", { ascending: false });
  if (error) throw new Error("Não consegui recuperar seu código salvo: " + error.message);
  const rascunhos = {};
  for (const tentativa of data ?? []) {
    if (rascunhos[tentativa.atividade_id]) continue;
    const codigo = tentativa.resposta?.codigo;
    if (typeof codigo === "string") rascunhos[tentativa.atividade_id] = codigo;
  }
  return rascunhos;
}

export async function listarAcompanhamento(trilha, topicoId, atividadeIds) {
  const sb = supabase();
  if (!sb) throw new Error("Sem conexão com as atividades.");

  const [perfil, competencias, vinculos] = await Promise.all([
    sessao.conectado
      ? sb.from("perfil").select("admin").eq("id", sessao.usuario.id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    sb.from("competencia")
      .select("id, titulo, descricao, criterio, ordem")
      .eq("trilha", trilha)
      .eq("topico_id", topicoId)
      .order("ordem"),
    atividadeIds.length
      ? sb.from("atividade_competencia")
          .select("atividade_id, competencia_id")
          .in("atividade_id", atividadeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (perfil.error) throw new Error("Não consegui verificar sua permissão de revisão: " + perfil.error.message);
  if (competencias.error) throw new Error("Não consegui carregar as competências: " + competencias.error.message);
  if (vinculos.error) throw new Error("Não consegui carregar as relações das competências: " + vinculos.error.message);

  const ehAdministrador = perfil.data?.admin === true;
  let tentativas = { data: [], error: null };
  let submissoes = { data: [], error: null };
  if (sessao.conectado && atividadeIds.length) {
    const consulta = () => sb.from("tentativa_atividade")
      .select("id, atividade_id, usuario_id, resposta, correta, pontuacao, feedback, detalhes, criada_em, acao")
      .in("atividade_id", atividadeIds)
      .order("criada_em", { ascending: false })
      .limit(100);
    const proprias = consulta().eq("usuario_id", sessao.usuario.id);
    if (ehAdministrador) {
      [tentativas, submissoes] = await Promise.all([proprias, consulta()]);
    } else {
      tentativas = await proprias;
    }
  }
  if (tentativas.error) throw new Error("Não consegui carregar seu histórico: " + tentativas.error.message);
  if (submissoes.error) throw new Error("Não consegui carregar a fila de projetos: " + submissoes.error.message);

  return {
    competencias: competencias.data ?? [],
    vinculos: vinculos.data ?? [],
    tentativas: tentativas.data ?? [],
    submissoes: submissoes.data ?? [],
    ehAdministrador,
  };
}

export async function enviarTentativa(atividadeId, resposta, arquivoProjeto = null) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.enviando = true;
  atividadesRemotas.ultimaFalha = null;
  let caminhoArquivo = null;
  try {
    let respostaEnvio = resposta;
    if (arquivoProjeto) {
      if (arquivoProjeto.size > 20 * 1024 * 1024 || !/\.zip$/i.test(arquivoProjeto.name)) {
        throw new Error("Envie um arquivo .zip de até 20 MB.");
      }
      caminhoArquivo = `${sessao.usuario.id}/${atividadeId}/${crypto.randomUUID()}.zip`;
      const { error: falhaUpload } = await sb.storage.from("entregas-projetos").upload(caminhoArquivo, arquivoProjeto, {
        contentType: "application/zip",
        upsert: false,
      });
      if (falhaUpload) throw new Error("Não consegui enviar o arquivo do projeto: " + falhaUpload.message);
      respostaEnvio = {
        ...resposta,
        arquivo: { caminho: caminhoArquivo, nome: arquivoProjeto.name, tamanho: arquivoProjeto.size },
      };
    }
    if (atividadeId === "py-projeto-financeiro" && !respostaEnvio.repositorio && !respostaEnvio.arquivo) {
      throw new Error("Informe o link do repositório ou envie o projeto em .zip.");
    }
    const { data, error } = await sb.functions.invoke("corrigir-atividade", {
      body: { atividadeId, resposta: respostaEnvio },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    return data.tentativa;
  } catch (erro) {
    if (caminhoArquivo) await sb.storage.from("entregas-projetos").remove([caminhoArquivo]);
    atividadesRemotas.ultimaFalha = erro?.message ?? "falha de rede";
    return null;
  } finally {
    atividadesRemotas.enviando = false;
  }
}

export async function obterArquivoProjeto(tentativaId) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("obter-arquivo-projeto", {
      body: { tentativaId },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    return data.url;
  } catch (erro) {
    atividadesRemotas.ultimaFalha = erro?.message ?? "falha de rede";
    return null;
  }
}

export async function avaliarProjeto(tentativaId, aprovada, pontuacao, feedback) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.enviando = true;
  atividadesRemotas.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("avaliar-projeto", {
      body: { tentativaId, aprovada, pontuacao, feedback },
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

export async function acionarDesafio(atividadeId, codigo, acao) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.enviando = true;
  atividadesRemotas.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("executar-desafio", {
      body: { atividadeId, codigo, acao },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    return data;
  } catch (erro) {
    atividadesRemotas.ultimaFalha = erro?.message ?? "falha de rede";
    return null;
  } finally {
    atividadesRemotas.enviando = false;
  }
}

export async function publicarDesafioGitHub(atividadeId, codigo) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return null;
  atividadesRemotas.enviando = true;
  atividadesRemotas.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("publicar-desafio-github", { body: { atividadeId, codigo } });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    return data;
  } catch (erro) {
    atividadesRemotas.ultimaFalha = erro?.message ?? "Não consegui publicar no GitHub.";
    return null;
  } finally {
    atividadesRemotas.enviando = false;
  }
}
