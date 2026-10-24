import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cabecalhosCors, "Content-Type": "application/json" },
  });
}

function texto(valor: unknown) {
  return String(valor ?? "").trim().replace(/\s+/g, " ");
}

function validarRepositorio(valor: unknown) {
  if (typeof valor !== "string" || valor.length > 300) return null;
  try {
    const url = new URL(valor);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    if (!["github.com", "gitlab.com", "bitbucket.org"].includes(url.hostname.toLowerCase())) return null;
    if (url.pathname.split("/").filter(Boolean).length < 2) return null;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function corrigir(tipo: string, resposta: Record<string, unknown>, gabarito: Record<string, unknown>) {
  if (tipo === "completar") {
    const esperadas = gabarito.lacunas as Record<string, string[]>;
    const dadas = (resposta.lacunas ?? {}) as Record<string, unknown>;
    const correta = Object.entries(esperadas).every(([chave, opcoes]) =>
      opcoes.map(texto).includes(texto(dadas[chave]))
    );
    return { correta, detalhes: { lacunas: Object.keys(esperadas) } };
  }

  if (tipo === "saida") {
    const aceita = (gabarito.aceitas as string[]).map(texto);
    return { correta: aceita.includes(texto(resposta.texto)), detalhes: {} };
  }

  const corretas = new Set((gabarito.corretas as string[]).map(texto));
  const marcadas = new Set((Array.isArray(resposta.alternativas) ? resposta.alternativas : []).map(texto));
  const correta = corretas.size === marcadas.size && [...corretas].every((id) => marcadas.has(id));
  return { correta, detalhes: { marcadas: [...marcadas] } };
}

/* O resultado automático confirma a resposta, não a maturidade da solução.
   Este resumo separa as duas coisas e dá um próximo passo concreto sem
   expor o gabarito no navegador. */
function diagnosticoPedagogico(correta: boolean, explicacao: string, gabarito: Record<string, unknown>) {
  return {
    porQue: explicacao || (correta
      ? "Sua resposta atende ao conceito avaliado nesta prática."
      : "A resposta não atende ao conceito avaliado nesta prática."),
    nivelProfissional: texto(gabarito.nivelProfissional) || (correta
      ? "Além de acertar, explique a decisão, escolha nomes claros e confira casos fora do exemplo."
      : "Antes de avançar, consiga explicar o conceito com suas palavras e aplique-o em um exemplo diferente."),
    proximoPasso: texto(gabarito.proximoPasso) || (correta
      ? "Avance para a próxima etapa e procure reconhecer este mesmo conceito em outro contexto."
      : "Revise a explicação acima e tente esta atividade outra vez antes de seguir."),
  };
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !servico) return responder({ erro: "Função sem configuração do Supabase." }, 500);

  const autorizacao = requisicao.headers.get("Authorization") ?? "";
  const cliente = createClient(url, anon, { global: { headers: { Authorization: autorizacao } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para enviar uma resposta." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const atividadeId = texto(corpo?.atividadeId);
  if (!atividadeId || !corpo?.resposta || typeof corpo.resposta !== "object") {
    return responder({ erro: "Resposta de atividade inválida." }, 400);
  }

  const administrador = createClient(url, servico);
  const { data: atividade, error: falhaAtividade } = await administrador
    .from("atividade")
    .select("id, tipo, publicada")
    .eq("id", atividadeId)
    .eq("publicada", true)
    .maybeSingle();
  if (falhaAtividade || !atividade) return responder({ erro: "Atividade não encontrada." }, 404);

  if (atividade.tipo === "projeto") {
    const configuracao = atividade.configuracao as Record<string, unknown>;
    const repositorio = corpo.resposta.repositorio ? validarRepositorio(corpo.resposta.repositorio) : null;
    const resumo = typeof corpo.resposta.resumo === "string" ? corpo.resposta.resumo.trim() : "";
    const arquivoRecebido = corpo.resposta.arquivo && typeof corpo.resposta.arquivo === "object"
      ? corpo.resposta.arquivo as Record<string, unknown>
      : null;
    const requisitos = Array.isArray(corpo.resposta.requisitos)
      ? corpo.resposta.requisitos.filter((id): id is string => typeof id === "string")
      : [];
    const idsValidos = new Set(
      Array.isArray(configuracao.requisitos)
        ? (configuracao.requisitos as Array<Record<string, unknown>>).map((item) => item.id).filter((id): id is string => typeof id === "string")
        : [],
    );
    let arquivo = null;
    if (arquivoRecebido) {
      const caminho = typeof arquivoRecebido.caminho === "string" ? arquivoRecebido.caminho : "";
      const prefixo = `${user.id}/${atividadeId}/`;
      if (!caminho.startsWith(prefixo) || !/^[0-9a-f-]{36}\.zip$/i.test(caminho.slice(prefixo.length))) {
        return responder({ erro: "O arquivo enviado não pertence a esta entrega." }, 400);
      }
      const nomeArquivo = caminho.slice(prefixo.length);
      const { data: objetos, error: falhaObjeto } = await administrador.storage
        .from("entregas-projetos")
        .list(`${user.id}/${atividadeId}`, { search: nomeArquivo });
      const objeto = objetos?.find((item) => item.name === nomeArquivo);
      if (falhaObjeto || !objeto || Number(objeto.metadata?.size) < 1 || Number(objeto.metadata?.size) > 20 * 1024 * 1024 || objeto.metadata?.mimetype !== "application/zip") {
        return responder({ erro: "Não consegui confirmar o arquivo enviado." }, 400);
      }
      const nome = typeof arquivoRecebido.nome === "string" ? arquivoRecebido.nome.trim().slice(0, 180) : "projeto.zip";
      arquivo = { caminho: objeto.name, nome: nome.replace(/[\\/\r\n]/g, "_") || "projeto.zip", tamanho: Number(objeto.metadata?.size) };
    }
    if ((!repositorio && !arquivo) || (corpo.resposta.repositorio && !repositorio) || resumo.length < 20 || resumo.length > Number(configuracao.limiteResumo ?? 2000) || requisitos.some((id) => !idsValidos.has(id))) {
      return responder({ erro: "Informe um repositório válido ou um arquivo .zip, escreva o resumo e confira os requisitos selecionados." }, 400);
    }
    const respostaProjeto = { ...(repositorio ? { repositorio } : {}), ...(arquivo ? { arquivo } : {}), resumo, requisitos: [...new Set(requisitos)] };
    const { data: tentativa, error: falhaTentativa } = await administrador
      .from("tentativa_atividade")
      .insert({
        usuario_id: user.id,
        atividade_id: atividadeId,
        resposta: respostaProjeto,
        correta: false,
        pontuacao: 0,
        feedback: "Projeto enviado. Ele ainda precisa ser revisado por uma pessoa antes da competência ser demonstrada.",
        detalhes: { tipo: "projeto", status: "aguardando_avaliacao" },
      })
      .select("id, correta, pontuacao, feedback, detalhes, criada_em")
      .single();
    if (falhaTentativa) return responder({ erro: "Não consegui registrar o envio do projeto." }, 500);
    return responder({ tentativa });
  }

  const { data: chave, error: falhaChave } = await administrador
    .from("atividade_gabarito")
    .select("configuracao")
    .eq("atividade_id", atividadeId)
    .maybeSingle();
  if (falhaChave || !chave) return responder({ erro: "Não consegui corrigir esta atividade." }, 500);

  const resultado = corrigir(atividade.tipo, corpo.resposta, chave.configuracao as Record<string, unknown>);
  const configuracaoGabarito = chave.configuracao as Record<string, unknown>;
  const explicacao = texto(configuracaoGabarito.explicacao);
  const feedback = ["quiz", "erro"].includes(atividade.tipo)
    ? resultado.correta
      ? texto(configuracaoGabarito.explicacaoCorreta) || explicacao
      : texto(configuracaoGabarito.explicacaoIncorreta) || explicacao
    : resultado.correta
      ? `Correto. ${explicacao}`
      : `Ainda não. ${explicacao}`;
  const diagnostico = diagnosticoPedagogico(resultado.correta, feedback, configuracaoGabarito);
  const { data: tentativa, error: falhaTentativa } = await administrador
    .from("tentativa_atividade")
    .insert({
      usuario_id: user.id,
      atividade_id: atividadeId,
      resposta: corpo.resposta,
      correta: resultado.correta,
      pontuacao: resultado.correta ? 100 : 0,
      feedback,
      detalhes: { ...resultado.detalhes, diagnostico },
    })
    .select("id, correta, pontuacao, feedback, detalhes, criada_em")
    .single();
  if (falhaTentativa) return responder({ erro: "Não consegui registrar sua tentativa." }, 500);
  return responder({ tentativa });
});
