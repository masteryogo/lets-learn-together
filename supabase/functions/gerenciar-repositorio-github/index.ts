import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cabecalhosGitHub, tokenDaInstalacao } from "../_shared/github.ts";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cabecalhosCors, "Content-Type": "application/json" } });
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
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para escolher seu repositório." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const acao = corpo?.acao;
  if (acao !== "listar" && acao !== "escolher" && acao !== "desconectar") return responder({ erro: "Ação GitHub inválida." }, 400);

  const administrador = createClient(url, servico);
  const { data: conexao, error: falhaConexao } = await administrador.from("conexao_github")
    .select("instalacao_id, conta_id")
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (falhaConexao || !conexao) return responder({ erro: "Conecte a integração GitHub antes de escolher um repositório." }, 409);

  /* Desconectar não revoga a instalação no GitHub: isso seria uma mudança
     de escopo que pode afetar outros usos da App. Aqui só some o vínculo
     desta conta, e os arquivos que já foram publicados permanecem seus. */
  if (acao === "desconectar") {
    const { error: falhaRemocao } = await administrador.from("conexao_github").delete().eq("usuario_id", user.id);
    if (falhaRemocao) return responder({ erro: "Não consegui desconectar a integração GitHub." }, 500);
    return responder({ desconectada: true });
  }

  let token: string;
  let repositorios: any[];
  try {
    token = await tokenDaInstalacao(Number(conexao.instalacao_id));
    const resposta = await fetch("https://api.github.com/installation/repositories?per_page=100", { headers: cabecalhosGitHub(token) });
    if (!resposta.ok) throw new Error();
    const dados = await resposta.json();
    repositorios = Array.isArray(dados.repositories) ? dados.repositories : [];
  } catch {
    return responder({ erro: "Não consegui listar os repositórios autorizados no GitHub." }, 502);
  }

  /* Mesmo que a API retorne uma colaboração externa, esta versão é pessoal:
     o repositório precisa pertencer à conta que instalou a App. */
  const permitidos = repositorios.filter((repositorio) =>
    repositorio.owner?.id === conexao.conta_id && !repositorio.archived && !repositorio.disabled
  );
  if (acao === "listar") {
    return responder({ repositorios: permitidos.map((repositorio) => ({
      id: repositorio.id,
      nome: repositorio.full_name,
      branch: repositorio.default_branch,
      privado: repositorio.private === true,
    })) });
  }

  const repositorioId = Number(corpo?.repositorioId);
  const escolhido = permitidos.find((repositorio) => repositorio.id === repositorioId);
  if (!Number.isSafeInteger(repositorioId) || !escolhido) {
    return responder({ erro: "Escolha um repositório pessoal autorizado para a integração." }, 422);
  }
  const { error: falhaGravacao } = await administrador.from("conexao_github").update({
    repositorio_id: escolhido.id,
    repositorio_completo: escolhido.full_name,
    branch: escolhido.default_branch,
    atualizada_em: new Date().toISOString(),
  }).eq("usuario_id", user.id);
  if (falhaGravacao) return responder({ erro: "Não consegui guardar o repositório escolhido." }, 500);
  return responder({ repositorio: { nome: escolhido.full_name, branch: escolhido.default_branch } });
});
