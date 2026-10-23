import { SignJWT, importPKCS8 } from "npm:jose@6.2.13";

const versaoApi = "2022-11-28";

export function cabecalhosGitHub(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": versaoApi,
  };
}

async function jwtDaApp(id: string, chave: string) {
  const chavePrivada = await importPKCS8(chave.replace(/\\n/g, "\n"), "RS256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(id)
    .setIssuedAt()
    .setExpirationTime("9m")
    .sign(chavePrivada);
}

/* O token é criado para cada pedido e fica só durante a execução. Assim a
   chave da App não atravessa a fronteira do servidor e o navegador nunca
   recebe poder de escrita no repositório. */
export async function tokenDaInstalacao(instalacaoId: number) {
  const appId = Deno.env.get("GITHUB_APP_ID");
  const chave = Deno.env.get("GITHUB_APP_CHAVE_PRIVADA");
  if (!appId || !chave) throw new Error("A integração com GitHub ainda não foi configurada.");
  const resposta = await fetch(`https://api.github.com/app/installations/${instalacaoId}/access_tokens`, {
    method: "POST",
    headers: cabecalhosGitHub(await jwtDaApp(appId, chave)),
  });
  if (!resposta.ok) throw new Error("Não consegui obter acesso temporário à instalação GitHub.");
  const corpo = await resposta.json();
  if (typeof corpo.token !== "string") throw new Error("O GitHub não devolveu um token de instalação válido.");
  return corpo.token;
}

export function base64DoTexto(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";
  for (let inicio = 0; inicio < bytes.length; inicio += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(inicio, inicio + 0x8000));
  }
  return btoa(binario);
}
