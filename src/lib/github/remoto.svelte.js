/* O navegador só lê o vínculo já confirmado. A instalação é validada por
   uma Edge Function porque `installation_id` vindo da URL não prova a quem
   ela pertence — confiar nele aqui ligaria a conta errada. */
import { env } from "$env/dynamic/public";
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

export const githubRemoto = $state({
  conexao: null,
  identidadeVinculada: false,
  carregando: false,
  ultimaFalha: null,
});

export async function carregarConexaoGitHub() {
  const sb = supabase();
  if (!sb || !sessao.conectado) {
    githubRemoto.conexao = null;
    githubRemoto.identidadeVinculada = false;
    return;
  }

  githubRemoto.carregando = true;
  githubRemoto.ultimaFalha = null;
  try {
    const [conexao, identidades] = await Promise.all([
      sb.from("conexao_github")
        .select("conta_login, repositorio_completo, branch, conectada_em")
        .eq("usuario_id", sessao.usuario.id)
        .maybeSingle(),
      sb.auth.getUserIdentities(),
    ]);
    if (conexao.error || identidades.error) {
      throw new Error("Não consegui carregar sua conexão com o GitHub.");
    }
    githubRemoto.conexao = conexao.data;
    githubRemoto.identidadeVinculada = identidades.data.identities.some((identidade) => identidade.provider === "github");
  } catch (erro) {
    githubRemoto.conexao = null;
    githubRemoto.ultimaFalha = erro.message;
  } finally {
    githubRemoto.carregando = false;
  }
}

export function abrirInstalacaoGitHub() {
  const url = env.PUBLIC_GITHUB_APP_INSTALACAO_URL;
  if (!url) return "A conexão com GitHub ainda está sendo preparada.";
  location.assign(url);
  return null;
}

export async function confirmarConexaoGitHub(instalacaoId) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta antes de confirmar a conexão.";
  if (!/^\d+$/.test(instalacaoId)) return "A instalação recebida do GitHub é inválida.";
  githubRemoto.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("confirmar-conexao-github", {
      body: { instalacaoId },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    await carregarConexaoGitHub();
    return null;
  } catch (erro) {
    githubRemoto.ultimaFalha = erro.message ?? "Não consegui confirmar a conexão com o GitHub.";
    return githubRemoto.ultimaFalha;
  }
}
