/* ============================================================
   O cliente do Supabase.

   Um só, criado na primeira vez que alguém pede. Pode não existir:
   sem as variáveis de ambiente o site continua de pé, sem conta,
   lendo e gravando no localStorage como sempre fez. É a mesma
   postura do progresso.js diante de cookies bloqueados — funciona,
   só não lembra.

   Por isso ninguém importa `cliente` direto: quem chama pergunta
   antes com `temSupabase`, ou usa o retorno nulo como resposta.
   ============================================================ */
import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";

const URL = env.PUBLIC_SUPABASE_URL;
const CHAVE = env.PUBLIC_SUPABASE_ANON_KEY;

/* a chave publicável é feita para viajar no navegador: quem protege
   os dados é a RLS do banco, não o segredo da chave */
export const temSupabase = Boolean(URL && CHAVE);

/* o supabase-js guarda a sessão no localStorage e assume que ele
   responde. Com cookies bloqueados ou janela anônima do Safari ele
   lança na primeira escrita, e a página inteira cai junto — então
   entregamos um armazenamento que engole o erro e esquece a sessão,
   que é o pior desfecho aceitável: pede login de novo. */
const armazenamentoTolerante = {
  getItem(chave) {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  },
  setItem(chave, valor) {
    try {
      localStorage.setItem(chave, valor);
    } catch {
      /* sessão só nesta aba */
    }
  },
  removeItem(chave) {
    try {
      localStorage.removeItem(chave);
    } catch {
      /* nada a remover que importe */
    }
  },
};

let instancia = null;

/* preguiçoso de propósito: na pré-renderização não há navegador, e
   criar o cliente ali ligaria o relógio de refresh do token no
   processo de build */
export function supabase() {
  if (!temSupabase) return null;
  if (instancia) return instancia;

  instancia = createClient(URL, CHAVE, {
    auth: {
      storage: armazenamentoTolerante,
      persistSession: true,
      autoRefreshToken: true,
      /* Era false enquanto a confirmação seria por código de 6 dígitos.
         O plano gratuito do Supabase não deixa editar o template do
         e-mail, então a confirmação virou link — e é a volta desse link,
         com ?code= na URL, que precisa ser trocada por sessão. */
      detectSessionInUrl: true,
    },
  });
  return instancia;
}
