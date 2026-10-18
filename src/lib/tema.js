/* ============================================================
   Tema claro/escuro, comum a todas as trilhas.

   O atributo vive no <html>, e quem o escreve pela primeira vez é
   um script no app.html, antes de qualquer pintura — ler o tema
   salvo só depois da hidratação faria a página nascer clara e
   piscar para escura.
   ============================================================ */
import { CHAVE_TEMA } from "./progresso.js";

export function temaAtual() {
  return document.documentElement.getAttribute("data-tema") || "claro";
}

export function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  try {
    /* string crua, sem JSON: é a mesma gravação que o script inline do
       app.html lê antes de o bundle existir */
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* sem persistência: a sessão ainda funciona */
  }
}

export function alternarTema() {
  aplicarTema(temaAtual() === "escuro" ? "claro" : "escuro");
}
