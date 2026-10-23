import { SignJWT, importPKCS8 } from "npm:jose@6.2.13";

const versaoApi = "2022-11-28";

function juntarBytes(...partes: Uint8Array[]) {
  const tamanho = partes.reduce((total, parte) => total + parte.length, 0);
  const resultado = new Uint8Array(tamanho);
  let inicio = 0;
  for (const parte of partes) {
    resultado.set(parte, inicio);
    inicio += parte.length;
  }
  return resultado;
}

function comprimentoDer(tamanho: number) {
  if (tamanho < 128) return Uint8Array.of(tamanho);
  const bytes: number[] = [];
  for (let valor = tamanho; valor > 0; valor >>= 8) bytes.unshift(valor & 0xff);
  return Uint8Array.of(0x80 | bytes.length, ...bytes);
}

function elementoDer(tipo: number, ...conteudos: Uint8Array[]) {
  const conteudo = juntarBytes(...conteudos);
  return juntarBytes(Uint8Array.of(tipo), comprimentoDer(conteudo.length), conteudo);
}

function pkcs8DeRsaPkcs1(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----|-----END RSA PRIVATE KEY-----|\s/g, "");
  const binario = atob(base64);
  const pkcs1 = Uint8Array.from(binario, (caractere) => caractere.charCodeAt(0));
  const versao = Uint8Array.of(0x02, 0x01, 0x00);
  const algoritmoRsa = Uint8Array.of(
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
    0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  );
  return elementoDer(0x30, versao, algoritmoRsa, elementoDer(0x04, pkcs1));
}

async function chavePrivadaDaApp(chave: string) {
  const pem = chave.replace(/\\n/g, "\n").trim();
  if (!pem.startsWith("-----BEGIN RSA PRIVATE KEY-----")) return importPKCS8(pem, "RS256");
  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8DeRsaPkcs1(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export function cabecalhosGitHub(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": versaoApi,
  };
}

export async function jwtDaApp(id: string, chave: string) {
  const chavePrivada = await chavePrivadaDaApp(chave);
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
