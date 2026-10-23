/* O navegador só lê o vínculo já confirmado. A instalação é validada por
   uma Edge Function porque `installation_id` vindo da URL não prova a quem
   ela pertence — confiar nele aqui ligaria a conta errada. */
import { supabase } from "$lib/supabase.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";

const CHAVE_CACHE = "github:conexao:v1";
const DURACAO_CACHE = 15 * 60 * 1000;

export const githubRemoto = $state({
  conexao: null,
  identidadeVinculada: false,
  repositorios: [],
  carregando: false,
  ultimaFalha: null,
});

/* O cliente devolve FunctionsHttpError para qualquer resposta não-2xx e
   deixa o JSON da função em context. Sem ler esse corpo, uma configuração
   ausente vira a frase técnica genérica e impede a pessoa de corrigir. */
async function mensagemDaFuncao(erro, padrao) {
  const resposta = erro?.context;
  const corpo = await resposta?.clone?.().json().catch(() => null);
  return corpo?.erro ?? erro?.message ?? padrao;
}

/* A ligação já confirmada não muda sozinha. Guardá-la durante a sessão
   evita que cada troca de tela refaça duas consultas e mostre um estado de
   espera que não ensina nada. Token e qualquer poder de escrita continuam
   exclusivamente no servidor. */
function lerCache(usuarioId) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CHAVE_CACHE));
    if (cache?.usuarioId !== usuarioId || cache?.expiraEm <= Date.now() || !cache?.conexao) {
      sessionStorage.removeItem(CHAVE_CACHE);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

function guardarCache(usuarioId, conexao) {
  if (!conexao) return;
  try {
    sessionStorage.setItem(CHAVE_CACHE, JSON.stringify({
      usuarioId,
      conexao,
      expiraEm: Date.now() + DURACAO_CACHE,
    }));
  } catch {
    /* cache é só rapidez: com armazenamento bloqueado, consultar continua seguro */
  }
}

function apagarCache() {
  try {
    sessionStorage.removeItem(CHAVE_CACHE);
  } catch {
    /* não há cache a apagar */
  }
}

export async function carregarConexaoGitHub(forcar = false) {
  const sb = supabase();
  if (!sb || !sessao.conectado) {
    githubRemoto.conexao = null;
    githubRemoto.identidadeVinculada = false;
    return;
  }

  const cache = forcar ? null : lerCache(sessao.usuario.id);
  if (cache) {
    githubRemoto.conexao = cache.conexao;
    githubRemoto.identidadeVinculada = true;
    githubRemoto.ultimaFalha = null;
    return;
  }

  githubRemoto.carregando = true;
  githubRemoto.ultimaFalha = null;
  try {
    const [conexao, identidades] = await Promise.all([
      sb.from("conexao_github")
        .select("conta_login, repositorio_id, repositorio_completo, branch, conectada_em")
        .eq("usuario_id", sessao.usuario.id)
        .maybeSingle(),
      sb.auth.getUserIdentities(),
    ]);
    if (conexao.error || identidades.error) {
      throw new Error("Não consegui carregar sua conexão com o GitHub.");
    }
    githubRemoto.conexao = conexao.data;
    githubRemoto.identidadeVinculada = identidades.data.identities.some((identidade) => identidade.provider === "github");
    guardarCache(sessao.usuario.id, conexao.data);
  } catch (erro) {
    githubRemoto.conexao = null;
    githubRemoto.ultimaFalha = erro.message;
  } finally {
    githubRemoto.carregando = false;
  }
}

export async function carregarRepositoriosGitHub() {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta antes de listar os repositórios.";
  githubRemoto.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("gerenciar-repositorio-github", { body: { acao: "listar" } });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    githubRemoto.repositorios = data.repositorios;
    return null;
  } catch (erro) {
    githubRemoto.repositorios = [];
    githubRemoto.ultimaFalha = await mensagemDaFuncao(erro, "Não consegui listar seus repositórios.");
    return githubRemoto.ultimaFalha;
  }
}

export async function escolherRepositorioGitHub(repositorioId) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta antes de escolher o repositório.";
  githubRemoto.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("gerenciar-repositorio-github", { body: { acao: "escolher", repositorioId } });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    await carregarConexaoGitHub(true);
    return null;
  } catch (erro) {
    githubRemoto.ultimaFalha = await mensagemDaFuncao(erro, "Não consegui guardar seu repositório.");
    return githubRemoto.ultimaFalha;
  }
}

export async function desconectarGitHub() {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta antes de desconectar o GitHub.";
  githubRemoto.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("gerenciar-repositorio-github", { body: { acao: "desconectar" } });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    githubRemoto.conexao = null;
    githubRemoto.repositorios = [];
    apagarCache();
    return null;
  } catch (erro) {
    githubRemoto.ultimaFalha = await mensagemDaFuncao(erro, "Não consegui desconectar o GitHub.");
    return githubRemoto.ultimaFalha;
  }
}

export function abrirInstalacaoGitHub() {
  const url = import.meta.env.PUBLIC_GITHUB_APP_INSTALACAO_URL;
  if (!url) return "A conexão com GitHub ainda está sendo preparada.";
  location.assign(url);
  return null;
}

export async function confirmarConexaoGitHub(instalacaoId = null) {
  const sb = supabase();
  if (!sb || !sessao.conectado) return "Entre na conta antes de confirmar a conexão.";
  if (instalacaoId !== null && !/^\d+$/.test(instalacaoId)) return "A instalação recebida do GitHub é inválida.";
  githubRemoto.ultimaFalha = null;
  try {
    const { data, error } = await sb.functions.invoke("confirmar-conexao-github", {
      body: instalacaoId === null ? {} : { instalacaoId },
    });
    if (error || data?.erro) throw new Error(data?.erro ?? error.message);
    await carregarConexaoGitHub(true);
    return null;
  } catch (erro) {
    githubRemoto.ultimaFalha = await mensagemDaFuncao(erro, "Não consegui confirmar a conexão com o GitHub.");
    return githubRemoto.ultimaFalha;
  }
}
