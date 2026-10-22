/* ============================================================
   O contato de apoio no banco.

   A camada mais fina do projeto: uma escrita, sem leitura. A RLS
   não deixa ninguém ler esta tabela além de quem administra, e a
   página não teria o que fazer com a resposta — quem escreveu já
   sabe o que escreveu.

   Diferente de notas/remoto.svelte.js e de roadmap/sincronia, aqui
   não se exige conta: a página é para quem vem de fora.
   ============================================================ */
import { supabase, temSupabase } from "$lib/supabase.js";
import { IDS_NIVEIS } from "$lib/apoio/niveis.js";

/* o pior desfecho de um formulário é dizer que enviou sem ter
   enviado: a tela só troca para "recebido" depois que esta função
   devolve null. Por isso ela devolve mensagem em português, e não
   o erro do Supabase — a regra vale aqui como nas outras telas. */
export async function enviar({ empresa, pessoa, email, nivel, mensagem }) {
  if (!temSupabase) {
    return "O envio está fora do ar nesta versão do site. Tente de novo mais tarde.";
  }

  const sb = supabase();
  if (!sb) {
    return "O envio está fora do ar nesta versão do site. Tente de novo mais tarde.";
  }

  const { error } = await sb.from("contato_apoio").insert({
    empresa: empresa.trim(),
    pessoa: pessoa.trim(),
    email: email.trim(),
    /* nulo é "ainda não sei", que é a primeira opção da ficha e a
       resposta honesta de quem chegou hoje. Qualquer coisa fora da
       lista vira nulo pelo mesmo motivo: o `check` da tabela recusa
       a linha inteira, e quem enviou veria um erro que não é dele. */
    nivel: IDS_NIVEIS.includes(nivel) ? nivel : null,
    /* vazio e nulo são a mesma coisa aqui, e nulo é o que o banco
       entende por "não disse nada" */
    mensagem: mensagem.trim() || null,
  });

  if (!error) return null;

  /* 23514 é violação de check: tamanho fora do combinado ou e-mail
     sem arroba. É erro de preenchimento, e merece ser dito como tal
     em vez de virar "algo deu errado". */
  if (error.code === "23514") {
    return "Confira os campos: algum deles está curto demais, longo demais, ou o e-mail não parece um e-mail.";
  }

  return "A mensagem não chegou. Verifique a conexão e tente de novo.";
}
