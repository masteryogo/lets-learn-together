import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const limiteCodigo = 12_000;
const limiteTestes = 10;
const limitePorMinuto = 10;

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cabecalhosCors, "Content-Type": "application/json" },
  });
}

function texto(valor: unknown) {
  return String(valor ?? "");
}

function saidaNormalizada(valor: string) {
  return valor.replace(/\r\n/g, "\n").trim();
}

function limiteInteiro(valor: string | undefined, padrao: number) {
  const convertido = Number(valor);
  return Number.isInteger(convertido) && convertido > 0 ? convertido : padrao;
}

function rotuloEstado(id: number) {
  if (id === 3) return "Executou corretamente";
  if (id === 4) return "A saída ficou diferente do esperado";
  if (id === 5) return "O programa passou do tempo limite";
  if (id === 6) return "Erro de sintaxe ou compilação";
  if (id >= 7 && id <= 12) return "Erro durante a execução";
  return "Não foi possível concluir a execução";
}

function urlDoExecutor(valor: string) {
  const url = new URL(valor);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("O endereço do executor precisa ser HTTPS e não pode conter credenciais ou parâmetros.");
  }
  return url.toString().replace(/\/+$/, "");
}

/* Testes aprovados demonstram comportamento, mas não substituem revisão de
   qualidade. O diagnóstico deixa esse limite claro para quem está aprendendo. */
function diagnosticoDoDesafio(correta: boolean, feedback: string, gabarito: Record<string, unknown>) {
  return {
    porQue: feedback,
    nivelProfissional: texto(gabarito.nivelProfissional) || (correta
      ? "Os testes validaram o comportamento esperado. Ainda revise nomes, organização, casos de borda e mensagens de erro."
      : "Isole o caso que falhou, acompanhe os valores passo a passo e confira entrada, saída e condições de borda."),
    proximoPasso: texto(gabarito.proximoPasso) || (correta
      ? "Avance para o próximo desafio e tente explicar por que sua solução funciona antes de reutilizá-la."
      : "Ajuste a solução, execute novamente e envie uma nova versão para confirmar todos os testes."),
  };
}

async function executarNoIsolamento(codigo: string, entrada: string) {
  const endereco = Deno.env.get("JUDGE0_URL");
  const chave = Deno.env.get("JUDGE0_API_KEY");
  if (!endereco || !chave) throw new Error("O executor seguro ainda não está configurado.");

  const base = urlDoExecutor(endereco);
  const linguagem = limiteInteiro(Deno.env.get("JUDGE0_PYTHON_LANGUAGE_ID"), 71);
  const resposta = await fetch(`${base}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": chave },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      source_code: codigo,
      language_id: linguagem,
      stdin: entrada,
      cpu_time_limit: 2,
      cpu_extra_time: 0.5,
      wall_time_limit: 5,
      memory_limit: 128_000,
      stack_limit: 64_000,
      max_processes_and_or_threads: 20,
      max_file_size: 1_024,
    }),
  });

  if (!resposta.ok) throw new Error("O executor não conseguiu processar o código.");
  const resultado = await resposta.json();
  const codigoEstado = Number(resultado.status?.id);
  return {
    codigoEstado,
    estado: rotuloEstado(codigoEstado),
    saida: texto(resultado.stdout),
    erro: texto(resultado.stderr || resultado.compile_output || resultado.message),
  };
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const tamanhoCorpo = Number(requisicao.headers.get("Content-Length") ?? 0);
  if (tamanhoCorpo > limiteCodigo + 2_000) return responder({ erro: "O código excede o limite permitido." }, 413);
  const textoCorpo = await requisicao.text();
  if (new TextEncoder().encode(textoCorpo).length > limiteCodigo + 2_000) {
    return responder({ erro: "O código excede o limite permitido." }, 413);
  }

  const urlSupabase = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!urlSupabase || !anon || !servico) return responder({ erro: "Função sem configuração do Supabase." }, 500);

  const autorizacao = requisicao.headers.get("Authorization") ?? "";
  const cliente = createClient(urlSupabase, anon, { global: { headers: { Authorization: autorizacao } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para executar um desafio." }, 401);

  let corpo: Record<string, unknown> | null;
  try {
    corpo = JSON.parse(textoCorpo || "null");
  } catch {
    return responder({ erro: "O pedido não contém JSON válido." }, 400);
  }
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return responder({ erro: "O pedido da atividade é inválido." }, 400);
  }
  const atividadeId = texto(corpo?.atividadeId).trim();
  const codigo = typeof corpo.codigo === "string" ? corpo.codigo : "";
  const acao = corpo?.acao;
  if (!atividadeId || !codigo.trim() || codigo.length > limiteCodigo || (acao !== "executar" && acao !== "enviar")) {
    return responder({ erro: "Código ou ação inválida. O limite é de 12.000 caracteres." }, 400);
  }

  const administrador = createClient(urlSupabase, servico);
  const { data: atividade, error: falhaAtividade } = await administrador
    .from("atividade")
    .select("id, tipo, configuracao")
    .eq("id", atividadeId)
    .eq("publicada", true)
    .maybeSingle();
  if (falhaAtividade || !atividade || atividade.tipo !== "desafio") {
    return responder({ erro: "Desafio não encontrado." }, 404);
  }

  const agora = new Date();
  const { count, error: falhaLimite } = await administrador
    .from("tentativa_atividade")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .gte("criada_em", new Date(agora.getTime() - 60_000).toISOString());
  if (falhaLimite) return responder({ erro: "Não consegui verificar o limite de execuções." }, 500);
  if ((count ?? 0) >= limitePorMinuto) return responder({ erro: "Você atingiu o limite de 10 execuções por minuto. Tente novamente em instantes." }, 429);

  const { data: tentativa, error: falhaTentativa } = await administrador
    .from("tentativa_atividade")
    .insert({
      usuario_id: user.id,
      atividade_id: atividadeId,
      resposta: { codigo },
      acao,
      correta: false,
      pontuacao: 0,
      feedback: acao === "executar" ? "Execução em andamento." : "Testes em andamento.",
      detalhes: { acao },
    })
    .select("id")
    .single();
  if (falhaTentativa || !tentativa) return responder({ erro: "Não consegui guardar seu código." }, 500);

  try {
    if (acao === "executar") {
      const configuracao = atividade.configuracao as Record<string, unknown>;
      const resultado = await executarNoIsolamento(codigo, texto(configuracao.entradaExemplo));
      const { error: falhaAtualizacao } = await administrador.from("tentativa_atividade").update({
        feedback: `Execução: ${resultado.estado}.`,
        detalhes: { acao, estado: resultado.estado },
      }).eq("id", tentativa.id);
      if (falhaAtualizacao) throw new Error("Não consegui guardar o resultado da execução.");
      return responder({ tentativaId: tentativa.id, execucao: resultado });
    }

    const { data: chave, error: falhaChave } = await administrador
      .from("atividade_gabarito")
      .select("configuracao")
      .eq("atividade_id", atividadeId)
      .maybeSingle();
    if (falhaChave || !chave) throw new Error("Não consegui carregar os testes privados.");

    const gabarito = chave.configuracao as Record<string, unknown>;
    const testes = Array.isArray(gabarito.testes) ? gabarito.testes : [];
    if (!testes.length || testes.length > limiteTestes) throw new Error("Configuração de testes inválida.");

    const resultados = await Promise.all(testes.map(async (caso, indice) => {
      const teste = caso as Record<string, unknown>;
      const resultado = await executarNoIsolamento(codigo, texto(teste.entrada));
      const aprovado = resultado.codigoEstado === 3 && saidaNormalizada(resultado.saida) === saidaNormalizada(texto(teste.saida));
      return { numero: indice + 1, aprovado, estado: resultado.estado };
    }));
    const aprovados = resultados.filter((resultado) => resultado.aprovado).length;
    const pontuacao = Math.round((aprovados / resultados.length) * 100);
    const correta = aprovados === resultados.length;
    const explicacao = texto(gabarito.explicacao).trim();
    const feedback = correta
      ? `Todos os ${resultados.length} testes passaram. ${explicacao}`
      : `${aprovados} de ${resultados.length} testes passaram. Revise a entrada, a saída e os casos com números negativos. ${explicacao}`;
    const detalhes = { acao, testes: resultados, diagnostico: diagnosticoDoDesafio(correta, feedback, gabarito) };
    const { data: tentativaAtualizada, error: falhaAtualizacao } = await administrador
      .from("tentativa_atividade")
      .update({ correta, pontuacao, feedback, detalhes })
      .eq("id", tentativa.id)
      .select("id, correta, pontuacao, feedback, detalhes, criada_em")
      .single();
    if (falhaAtualizacao) throw new Error("Não consegui registrar o resultado dos testes.");
    return responder({ tentativa: tentativaAtualizada });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha ao executar o código.";
    await administrador.from("tentativa_atividade").update({
      feedback: mensagem,
      detalhes: { acao, falha: true },
    }).eq("id", tentativa.id);
    return responder({ erro: mensagem }, mensagem.includes("configurado") ? 503 : 502);
  }
});
