/* ============================================================
   A sessão, como estado reativo.

   Um objeto para a tela inteira: quem está conectado, se ainda
   estamos descobrindo isso, e os verbos que o fluxo da conta usa.
   A Ficha não conhece o Supabase — ela chama um método e recebe
   erro ou nada, em português, pronto para mostrar.

   Sem Supabase configurado nada quebra: `usuario` fica nulo para
   sempre e cada verbo devolve o mesmo recado. É a postura do resto
   do projeto — funciona, só não lembra.

   A confirmação é por link, não por código: o plano gratuito do
   Supabase não permite editar o modelo de e-mail, e o modelo padrão
   manda {{ .ConfirmationURL }}. Os verbos de código seguem aqui,
   dormentes, para o dia em que houver SMTP próprio — é só o fluxo
   voltar a passar por eles.

   Para onde o link volta é decidido aqui (`paraOndeVoltar`) e
   precisa constar na lista de endereços permitidos do projeto.
   ============================================================ */
import { base } from "$app/paths";
import { supabase, temSupabase } from "$lib/supabase.js";

/* o e-mail leva de volta para a própria tela de conta, que é quem sabe
   o que fazer com uma sessão recém-aberta */
function paraOndeVoltar() {
  return `${location.origin}${base}/conta`;
}

const SEM_BANCO = "Conta indisponível agora. Seu progresso segue salvo neste navegador.";

/* o Supabase responde em inglês e com texto voltado a quem integra.
   Traduzir pelo código é frágil (eles mudam), então casamos pelo
   trecho estável da mensagem e caímos num recado genérico quando
   não reconhecemos — melhor genérico que inglês cru na tela. */
function recado(erro) {
  const m = (erro?.message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha não conferem.";
  if (m.includes("email not confirmed")) return "Confirme o e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Já existe conta com esse e-mail.";
  if (m.includes("password should be")) return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("token has expired") || m.includes("invalid token"))
    return "Código expirado ou incorreto. Peça outro.";
  if (m.includes("for security purposes") || m.includes("rate limit"))
    return "Muitas tentativas seguidas. Espere um minuto.";
  if (m.includes("failed to fetch")) return "Sem conexão com o servidor.";
  return "Não deu certo. Tente de novo.";
}

export class Sessao {
  usuario = $state(null);
  /* nasce verdadeiro: entre o carregamento da página e a resposta do
     getSession existe um instante em que não se sabe, e tratá-lo como
     "deslogado" faria a tela piscar o formulário para quem já entrou */
  carregando = $state(temSupabase);
  /* o link de redefinição abre sessão como qualquer outro, e só o
     evento distingue "entrei" de "vim trocar a senha" */
  recuperando = $state(false);

  #parar = null;

  get conectado() {
    return this.usuario !== null;
  }

  /* chamado uma vez, no onMount de quem monta a tela: só no navegador,
     porque na pré-renderização não há sessão para recuperar */
  iniciar() {
    const sb = supabase();
    if (!sb) return () => {};

    sb.auth.getSession().then(({ data }) => {
      this.usuario = data.session?.user ?? null;
      this.carregando = false;
    });

    /* a fonte da verdade depois do início: cobre login, logout, refresh
       de token e — o caso que motiva escutar em vez de só perguntar —
       a sessão aberta em outra aba */
    const { data } = sb.auth.onAuthStateChange((evento, sessao) => {
      this.usuario = sessao?.user ?? null;
      this.carregando = false;
      if (evento === "PASSWORD_RECOVERY") this.recuperando = true;
    });
    this.#parar = () => data.subscription.unsubscribe();
    return this.#parar;
  }

  parar() {
    this.#parar?.();
    this.#parar = null;
  }

  /* --------------------------- os verbos ---------------------------
     Todos devolvem null quando dá certo e uma string quando não dá.
     É o contrato mais simples que a Ficha consegue consumir: `erro =
     await sessao.entrar(...)`. */

  async entrar(email, senha) {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    return error ? recado(error) : null;
  }

  async cadastrar(email, senha, nome) {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: paraOndeVoltar(),
        /* o gatilho criar_perfil_do_usuario lê exatamente esta chave */
        data: { nome },
      },
    });
    return error ? recado(error) : null;
  }

  /* o nome escolhido no cadastro; o Google manda `full_name` e `name`,
     que não escolhemos — por isso os três, nesta ordem, com o e-mail
     como último recurso */
  get nome() {
    const m = this.usuario?.user_metadata ?? {};
    return m.nome || m.full_name || m.name || this.usuario?.email || "";
  }

  /* Entrar com Google: sai do site e volta pela mesma porta do link
     de confirmação (?code= na URL, trocado por sessão pelo
     detectSessionInUrl). Não devolve erro útil no caso feliz — a
     página some antes —, então o recado só vale para a recusa
     imediata, tipo provedor desligado no painel. */
  async entrarComGoogle() {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: paraOndeVoltar() },
    });
    return error ? recado(error) : null;
  }

  /* O tipo não é detalhe: o token do cadastro é "signup" e o da
     redefinição é "email", e um não vale pelo outro. Quem chama sabe
     de qual passo veio — por isso o parâmetro, com o cadastro como
     padrão, que é o caminho mais andado. */
  async confirmarCodigo(email, codigo, tipo = "signup") {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.verifyOtp({ email, token: codigo, type: tipo });
    return error ? recado(error) : null;
  }

  /* reenvia o e-mail de confirmação — hoje com link, e com código no
     dia em que houver SMTP próprio */
  async reenviar(email) {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: paraOndeVoltar() },
    });
    return error ? recado(error) : null;
  }

  /* link, como a confirmação: quem volta dele chega com sessão aberta
     e o evento PASSWORD_RECOVERY, que é o que leva a tela ao passo da
     senha nova */
  async pedirRedefinicao(email) {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: paraOndeVoltar(),
    });
    return error ? recado(error) : null;
  }

  /* só funciona com sessão aberta — o código do passo anterior é que
     a abre. Trocar a senha derruba as outras sessões, e é isso que o
     aviso do passo novaSenha promete. */
  async trocarSenha(senhaNova) {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.updateUser({ password: senhaNova });
    if (error) return recado(error);
    /* a recuperação terminou: sem isto a tela voltaria para a senha
       nova a cada visita, porque a sessão continua a mesma */
    this.recuperando = false;
    return null;
  }

  async sair() {
    const sb = supabase();
    if (!sb) return SEM_BANCO;
    const { error } = await sb.auth.signOut();
    return error ? recado(error) : null;
  }
}

/* uma sessão para o site todo: duas instâncias escutariam o mesmo
   evento e divergiriam na hora de parar */
export const sessao = new Sessao();
