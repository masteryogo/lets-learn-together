import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@6.2.13";

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

async function jwtDaApp(id: string, chave: string) {
  const pem = chave.replace(/\\n/g, "\n");
  const chavePrivada = await importPKCS8(pem, "RS256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(id)
    .setIssuedAt()
    .setExpirationTime("9m")
    .sign(chavePrivada);
}

Deno.serve(async (requisicao: Request) => {
  if (requisicao.method === "OPTIONS") return new Response("ok", { headers: cabecalhosCors });
  if (requisicao.method !== "POST") return responder({ erro: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const servico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appId = Deno.env.get("GITHUB_APP_ID");
  const chave = Deno.env.get("GITHUB_APP_CHAVE_PRIVADA");
  if (!url || !anon || !servico || !appId || !chave) {
    return responder({ erro: "A integração com GitHub ainda não foi configurada." }, 503);
  }

  const autorizacao = requisicao.headers.get("Authorization") ?? "";
  const cliente = createClient(url, anon, { global: { headers: { Authorization: autorizacao } } });
  const { data: { user }, error: falhaSessao } = await cliente.auth.getUser();
  if (falhaSessao || !user) return responder({ erro: "Entre na conta para conectar o GitHub." }, 401);

  const corpo = await requisicao.json().catch(() => null);
  const instalacaoRecebida = typeof corpo?.instalacaoId === "string" ? corpo.instalacaoId : null;
  if (instalacaoRecebida !== null && !/^\d+$/.test(instalacaoRecebida)) {
    return responder({ erro: "Instalação GitHub inválida." }, 400);
  }

  const administrador = createClient(url, servico);
  const { data: usuario, error: falhaUsuario } = await administrador.auth.admin.getUserById(user.id);
  if (falhaUsuario || !usuario.user) return responder({ erro: "Não consegui verificar sua conta." }, 500);

  const identidade = usuario.user.identities?.find((item) => item.provider === "github") as any;
  const idGitHub = Number(
    identidade?.provider_id ?? identidade?.identity_data?.provider_id ?? identidade?.identity_data?.id
  );
  if (!Number.isSafeInteger(idGitHub)) {
    return responder({ erro: "Vincule sua conta GitHub antes de instalar a integração." }, 403);
  }

  let instalacao: any;
  try {
    const cabecalhos = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${await jwtDaApp(appId, chave)}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const respostaGitHub = await fetch(
      instalacaoRecebida
        ? `https://api.github.com/app/installations/${instalacaoRecebida}`
        : "https://api.github.com/app/installations?per_page=100",
      {
      headers: {
          ...cabecalhos,
        },
      },
    );
    if (respostaGitHub.status === 404) return responder({ erro: "Não encontrei esta instalação da integração." }, 404);
    if (!respostaGitHub.ok) return responder({ erro: "Não consegui confirmar a instalação no GitHub." }, 502);
    const dadosGitHub = await respostaGitHub.json();
    instalacao = instalacaoRecebida
      ? dadosGitHub
      : Array.isArray(dadosGitHub)
        ? dadosGitHub.find((item) => item.target_type === "User" && item.account?.id === idGitHub)
        : null;
  } catch {
    return responder({ erro: "Não consegui falar com o GitHub agora." }, 502);
  }

  if (!instalacao) return responder({ erro: "Não encontrei uma instalação da integração na sua conta GitHub." }, 404);

  /* A primeira versão aceita somente a conta pessoal vinculada. Uma
     organização exige verificar também a associação da pessoa a ela. */
  if (instalacao.target_type !== "User" || instalacao.account?.id !== idGitHub) {
    return responder({ erro: "A instalação precisa ser feita na sua conta pessoal do GitHub." }, 403);
  }
  if (instalacao.permissions?.contents !== "write" || instalacao.permissions?.metadata !== "read") {
    return responder({ erro: "A integração precisa de leitura de metadados e escrita de conteúdo." }, 422);
  }

  const { error: falhaGravacao } = await administrador.from("conexao_github").upsert({
    usuario_id: user.id,
    instalacao_id: Number(instalacao.id),
    conta_id: instalacao.account.id,
    conta_login: instalacao.account.login,
    repositorio_id: null,
    repositorio_completo: null,
    branch: null,
    atualizada_em: new Date().toISOString(),
  }, { onConflict: "usuario_id" });
  if (falhaGravacao) return responder({ erro: "Não consegui registrar sua conexão com o GitHub." }, 500);
  return responder({ conexao: { contaLogin: instalacao.account.login } });
});
