/* ============================================================
   O fluxo da conta: que passos existem e para onde cada um leva.

   Dado puro, separado da Ficha de propósito. A autenticação de
   verdade ainda não existe — ela chega com o Supabase, e quando
   chegar é `seguinte` que deixa de ser uma transição escrita à mão
   e vira o que o servidor respondeu. A interface não muda.
   ============================================================ */

/* o que o Obi diz em cada passo. Fala dele, não da interface: a
   ficha ao lado já diz o que fazer, e repetir instrução na boca do
   mascote o transformaria em legenda. */
export const FALAS = {
  entrar: "Você voltou. Vou buscar onde parou.",
  criar: "Guardo tudo. Até o que você pulou.",
  codigo: "Seis dígitos e a gente decola.",
  conferir: "Mandei o caminho. Confere lá.",
  esqueci: "Acontece. Mando outro caminho.",
  novaSenha: "Não vou olhar, prometo.",
  pronto: "Pronto. A mesa está posta.",
};

export const FLUXO = {
  entrar: {
    titulo: "Entrar",
    linha: "Suas trilhas, do jeito que você deixou.",
    campos: ["email", "senha"],
    acao: "Entrar",
    /* sem `seguinte` de propósito: entrar não leva a outro passo do
       fluxo, leva à mesa — e essa transição depende do Supabase.
       Deixar o campo vazio marca o buraco em vez de escondê-lo com
       um valor plausível. */
    elos: [
      { rotulo: "Esqueci a senha", passo: "esqueci" },
      { rotulo: "Criar conta", passo: "criar" },
    ],
  },

  criar: {
    titulo: "Criar conta",
    linha: "Uma conta guarda o progresso das trilhas e as notas do mural.",
    campos: ["nome", "email", "senhaNova"],
    acao: "Criar conta",
    /* o progresso que já está no localStorage entra na conta nova.
       Sem isso, criar conta é perder o que já foi marcado — e
       ninguém marca a mesma trilha duas vezes. */
    avisa: "O que você já marcou neste navegador entra na conta nova.",
    /* era "codigo". O plano gratuito do Supabase não deixa editar o
       modelo de e-mail, e o padrão manda link — então o passo seguinte
       é esperar o clique, não digitar dígito. O passo do código fica
       abaixo, dormente, para quando houver SMTP próprio. */
    seguinte: "conferir",
    elos: [{ antes: "Já tem conta?", rotulo: "Entrar", passo: "entrar" }],
  },

  /* o e-mail já saiu; esta tela só explica o que fazer com ele. Sem
     campo nenhum: o gesto que falta acontece na caixa de entrada, e
     fingir um formulário aqui pediria à pessoa algo que ela não tem. */
  conferir: {
    titulo: "Confira seu e-mail",
    linha: "Abrimos a conta e mandamos um link de confirmação. Clique nele e volte aqui.",
    campos: [],
    acao: "Reenviar o e-mail",
    avisa: "O link vale por uma hora e serve uma vez só.",
    elos: [
      { rotulo: "Trocar o e-mail", passo: "criar" },
      { rotulo: "Voltar para entrar", passo: "entrar" },
    ],
  },

  /* dormente: só volta ao fluxo com SMTP próprio, que destrava o
     modelo de e-mail e permite mandar {{ .Token }} em vez do link */
  codigo: {
    titulo: "Confirmar e-mail",
    linha: "Enviamos um código de 6 dígitos.",
    campos: ["codigo"],
    acao: "Confirmar e-mail",
    seguinte: "pronto",
    elos: [
      { rotulo: "Enviar outro código", gesto: "reenviar" },
      { rotulo: "Trocar o e-mail", passo: "criar" },
    ],
  },

  esqueci: {
    titulo: "Redefinir senha",
    linha: "Diga o e-mail da conta e enviamos um código para criar outra senha.",
    campos: ["email"],
    acao: "Enviar o link",
    /* era "novaSenha" direto, quando o passo era desenho. Trocar a senha
       exige sessão aberta, e quem a abre é o link do e-mail: voltando
       dele, o evento PASSWORD_RECOVERY leva a tela ao passo da senha. */
    seguinte: "conferir",
    elos: [{ rotulo: "Voltar para entrar", passo: "entrar" }],
  },

  novaSenha: {
    titulo: "Nova senha",
    linha: "Escolha a senha que vai usar daqui em diante.",
    campos: ["senhaNova", "senhaRepetida"],
    acao: "Salvar a senha",
    avisa: "Ao salvar, as outras sessões caem. Você continua conectado aqui.",
    seguinte: "entrar",
    elos: [{ rotulo: "Voltar para entrar", passo: "entrar" }],
  },

  pronto: {
    titulo: "Tudo certo",
    linha: "O progresso deste navegador já está na conta.",
    campos: [],
    acao: "Ir para a mesa",
    /* gesto, não passo: voltar para a tela de entrar sem encerrar a
       sessão deixaria a conta aberta por trás do formulário — e o
       próximo a usar o aparelho entraria sem saber em quem */
    elos: [{ antes: "Não é você?", rotulo: "Sair da conta", gesto: "sair" }],
  },
};

/* A ficha desenha um campo pelo nome; o fluxo não carrega `type` nem
   `autocomplete`. Se carregasse, mudar a aparência de um campo
   exigiria mexer no arquivo que descreve as regras de navegação. */
export const CAMPOS = {
  /* o nome vai para o metadado do usuário e de lá, pelo gatilho do
     banco, para a tabela perfil. É o que a quina da mesa mostra
     depois — sem ele, sobra o e-mail, que ninguém escolheu ver. */
  nome: {
    rotulo: "Como podemos te chamar",
    tipo: "text",
    completar: "name",
  },
  email: {
    rotulo: "E-mail",
    tipo: "email",
    completar: "email",
    modo: "email",
  },
  senha: {
    rotulo: "Senha",
    tipo: "password",
    completar: "current-password",
    fecha: true,
  },
  senhaNova: {
    rotulo: "Senha",
    tipo: "password",
    completar: "new-password",
    ajuda: "Mínimo de 8 caracteres.",
    medidor: true,
    fecha: true,
  },
  senhaRepetida: {
    rotulo: "Repita a senha",
    tipo: "password",
    completar: "new-password",
    fecha: true,
  },
  codigo: { rotulo: "Código", caixas: 6 },
};

export const DIGITOS_DO_CODIGO = 6;

/* quanto tempo o código vale, dito uma vez e usado nos dois lugares
   que falam dele */
export const VALIDADE_DO_CODIGO = "10 minutos";

/* força da senha em quatro células, a mesma escala da barra de
   progresso do mapa. Não é medida de entropia — é sinal de que o
   campo está sendo lido, e por isso satura cedo. */
export function forcaDaSenha(senha) {
  if (!senha) return 0;
  let f = Math.min(3, Math.floor(senha.length / 4));
  if (senha.length >= 8 && /[^a-z]/.test(senha)) f += 1;
  return Math.min(4, f);
}

export const ROTULOS_DA_FORCA = [
  "curta demais",
  "fraca",
  "ok",
  "boa",
  "boa",
];
