import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { base64DoTexto, cabecalhosGitHub, tokenDaInstalacao } from "../_shared/github.ts";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const limiteCodigo = 12_000;

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cabecalhosCors, "Content-Type": "application/json" } });
}

function caminhoCodificado(caminho: string) {
  return caminho.split("/").map(encodeURIComponent).join("/");
}

async function gravarArquivo(token: string, repositorio: string, branch: string, caminho: string, conteudo: string, mensagem: string, autoria: { name: string; email: string }) {
  const endereco = `https://api.github.com/repos/${repositorio}/contents/${caminhoCodificado(caminho)}`;
  const atual = await fetch(endereco, { headers: cabecalhosGitHub(token) });
  let sha: string | undefined;
  if (atual.ok) {
    const dados = await atual.json();
    if (typeof dados.sha === "string") sha = dados.sha;
  } else if (atual.status !== 404) {
    throw new Error("Não consegui conferir o arquivo atual no GitHub.");
  }
  const resposta = await fetch(endereco, {
    method: "PUT",
    headers: { ...cabecalhosGitHub(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message: mensagem, content: base64DoTexto(conteudo), branch, sha, author: autoria, committer: autoria }),
  });
  if (!resposta.ok) throw new Error("O GitHub recusou a publicação do arquivo.");
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !servico) return responder({ erro: "Função sem configuração do Supabase." }, 503);
  const cliente = createClient(url, anon, { global: { headers: { Authorization: requisicao.headers.get("Authorization") ?? "" } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para publicar no GitHub." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const atividadeId = typeof corpo?.atividadeId === "string" ? corpo.atividadeId.trim() : "";
  const codigo = typeof corpo?.codigo === "string" ? corpo.codigo : "";
  if (!atividadeId || !codigo.trim() || codigo.length > limiteCodigo) {
    return responder({ erro: "Código inválido. O limite é de 12.000 caracteres." }, 400);
  }

  const administrador = createClient(url, servico);
  const [{ data: conexao, error: falhaConexao }, { data: atividade, error: falhaAtividade }] = await Promise.all([
    administrador.from("conexao_github").select("instalacao_id, conta_id, conta_login, repositorio_id, repositorio_completo, branch").eq("usuario_id", user.id).maybeSingle(),
    administrador.from("atividade").select("id, tipo, titulo, enunciado, trilha, topico_id").eq("id", atividadeId).eq("publicada", true).maybeSingle(),
  ]);
  if (falhaConexao || !conexao?.repositorio_id || !conexao.repositorio_completo || !conexao.branch) {
    return responder({ erro: "Escolha um repositório na sua conta antes de publicar." }, 409);
  }
  if (falhaAtividade || !atividade || atividade.tipo !== "desafio") return responder({ erro: "Desafio não encontrado." }, 404);

  const urlPublicacao = `https://github.com/${conexao.repositorio_completo}/blob/${encodeURIComponent(conexao.branch)}/praticas/${encodeURIComponent(atividade.id)}.py`;
  let token: string;
  try {
    token = await tokenDaInstalacao(Number(conexao.instalacao_id));
    const resposta = await fetch("https://api.github.com/installation/repositories?per_page=100", { headers: cabecalhosGitHub(token) });
    const dados = resposta.ok ? await resposta.json() : null;
    const permitido = dados?.repositories?.some((repositorio: any) => repositorio.id === conexao.repositorio_id && repositorio.owner?.id === conexao.conta_id && !repositorio.archived && !repositorio.disabled);
    if (!permitido) return responder({ erro: "O repositório escolhido não está mais autorizado pela integração." }, 409);

    const autoria = { name: conexao.conta_login, email: `${conexao.conta_id}+${conexao.conta_login}@users.noreply.github.com` };
    const caminho = `praticas/${atividade.id}.py`;
    const cabecalho = `# ${atividade.titulo}\n# Trilha: ${atividade.trilha} · tópico: ${atividade.topico_id}\n# Gerado pelo Let's Learn Together a pedido da pessoa estudante.\n\n`;
    await gravarArquivo(token, conexao.repositorio_completo, conexao.branch, caminho, cabecalho + codigo.trimEnd() + "\n", `prática: ${atividade.titulo}`, autoria);
    const registro = `# Práticas do Let's Learn Together\n\nEste diretório é atualizado somente quando a pessoa estudante escolhe publicar uma solução.\n\n- Última publicação: **${atividade.titulo}**\n- Arquivo: [${caminho.replace("praticas/", "../praticas/")}](../${caminho})\n`;
    await gravarArquivo(token, conexao.repositorio_completo, conexao.branch, ".lets-learn-together/README.md", registro, `portfólio: registra ${atividade.titulo}`, autoria);
  } catch (erro) {
    return responder({ erro: erro instanceof Error ? erro.message : "Não consegui publicar no GitHub." }, 502);
  }

  const { error: falhaHistorico } = await administrador.from("publicacao_github").insert({
    usuario_id: user.id,
    atividade_id: atividade.id,
    atividade_titulo: atividade.titulo,
    repositorio_completo: conexao.repositorio_completo,
    url: urlPublicacao,
  });
  /* O arquivo já existe no GitHub neste ponto. Não o chamamos de falha se o
     histórico local cair; devolvemos o link e tornamos a pendência explícita. */
  return responder({
    url: urlPublicacao,
    aviso: falhaHistorico ? "O código foi publicado, mas não consegui registrar esta publicação no seu perfil." : null,
  });
});
