<!-- ============================================================
     A tela de conta: entrar, criar, confirmar e redefinir.

     Uma rota para os seis passos, e não seis rotas: eles não são
     endereços que alguém guarda, são estados de um fluxo — e manter
     o passo fora da URL evita que recarregar a página caia no meio
     de uma confirmação que já expirou.

     `confirmar` fala com o Supabase (Sessao.svelte.js) e só avança o
     passo quando o servidor concorda. Sem Supabase configurado os
     verbos devolvem recado em vez de lançar, e a tela continua
     navegável — é a mesma tolerância do resto do projeto.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { MediaQuery } from "svelte/reactivity";

  import { FALAS, FLUXO } from "$lib/conta/fluxo.js";
  import { sessao } from "$lib/conta/Sessao.svelte.js";
  import Ficha from "$lib/conta/Ficha.svelte";
  import Obi from "$lib/obi/Obi.svelte";
  import { ControleObi } from "$lib/obi/ControleObi.svelte.js";
  import { olhar } from "$lib/obi/olhar.js";

  import "$lib/estilos/base.css";
  import "$lib/obi/obi.css";
  import "./conta.css";

  let atual = $state("entrar");
  let erro = $state(null);
  let recado = $state(null);
  let obiEl = $state(null);
  let enviando = $state(false);
  let saindo = $state(false);

  /* o passo do código serve a dois caminhos, e o token de um não vale
     pelo outro: cadastro manda "signup", redefinição manda "email" */
  let origem = $state("criar");

  $effect(() => sessao.iniciar());

  /* quem volta do link chega com sessão aberta, e a tela precisa dizer
     o que aconteceu em vez de continuar no passo em que estava:
     redefinição vai para a senha nova, confirmação vai para o fim */
  $effect(() => {
    if (sessao.recuperando) {
      atual = "novaSenha";
    } else if (sessao.conectado && (atual === "conferir" || atual === "entrar")) {
      atual = "pronto";
    }
  });

  let dados = $state({
    nome: "",
    email: "",
    senha: "",
    senhaNova: "",
    senhaRepetida: "",
    codigo: "",
  });

  const passo = $derived(FLUXO[atual]);
  const fala = $derived(FALAS[atual]);

  /* arrastar o Obi só vale em tela larga, como nas outras telas: aqui
     o gesto disputaria com a rolagem do formulário */
  const estreito = new MediaQuery("max-width: 56rem");

  const controle = new ControleObi({
    /* não tem chão nesta tela: volta flutuando, como no roadmap */
    chao: false,
    podeMexer: () => !estreito.current,
    limite: () => {
      const r = obiEl.getBoundingClientRect();
      return {
        x: Math.max(innerWidth - r.right, r.left) + r.width,
        y: Math.max(innerHeight - r.bottom, r.top) + r.height,
      };
    },
  });

  let mira = null;

  $effect(() => {
    if (!obiEl) return;
    mira = olhar(obiEl, {
      ativo: () => !estreito.current,
      olho: ".logo__olho",
    });
    return () => {
      mira.destroy();
      mira = null;
    };
  });

  /* os propulsores acendem com os dígitos do código: confirmar o
     e-mail é a decolagem, e o avanço se lê no mascote antes de se
     ler nas caixas */
  $effect(() => {
    if (!obiEl) return;
    const digitos = atual === "codigo" ? dados.codigo.length : 0;
    if (!digitos) {
      obiEl.removeAttribute("data-ignicao");
      obiEl.style.removeProperty("--obi-ignicao");
      return;
    }
    obiEl.setAttribute("data-ignicao", "sim");
    obiEl.style.setProperty("--obi-ignicao", String(0.4 + digitos * 0.22));
  });

  /* ele fecha os olhos enquanto a senha é digitada. O olhar escreve
     transform inline nos olhos, e inline ganha da regra do CSS —
     então ele precisa largá-los antes de eles se fecharem. */
  function fecharOlhos(sim) {
    if (!obiEl) return;
    if (sim) {
      mira?.soltar();
      obiEl.setAttribute("data-fechando", "sim");
    } else {
      obiEl.removeAttribute("data-fechando");
    }
  }

  function ir(destino) {
    if (!destino) return;
    erro = null;
    recado = null;
    fecharOlhos(false);
    atual = destino;
  }

  /* As checagens daqui são de forma, não de verdade: elas dizem se
     dá para tentar, não se deu certo. Quem sabe se o e-mail existe
     ou se a senha confere é o servidor, que ainda não existe. */
  async function confirmar() {
    if (enviando) return;
    const campos = passo.campos;

    if (campos.includes("nome") && dados.nome.trim().length < 2) {
      erro = { campo: "nome", texto: "Diga ao menos duas letras." };
      return;
    }
    if (campos.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erro = { campo: "email", texto: "Esse e-mail não parece completo." };
      return;
    }
    if (campos.includes("senhaNova") && dados.senhaNova.length < 8) {
      erro = { campo: "senhaNova", texto: "A senha precisa de 8 caracteres ou mais." };
      return;
    }
    if (campos.includes("senhaRepetida") && dados.senhaRepetida !== dados.senhaNova) {
      erro = { campo: "senhaRepetida", texto: "As duas senhas estão diferentes." };
      return;
    }
    if (campos.includes("codigo") && dados.codigo.length < 6) {
      erro = { campo: "codigo", texto: "Faltam dígitos no código." };
      return;
    }

    erro = null;
    recado = null;
    enviando = true;
    const falha = await chamar();
    enviando = false;
    /* a falha do servidor vai para o recado, não para `erro`: a ficha
       só desenha erro preso a um campo, e "e-mail ou senha não
       conferem" não é de um campo nem do outro — é do gesto. */
    if (falha) {
      recado = { tom: "ruim", texto: falha };
      return;
    }

    avancar();
  }

  /* a mesa é outro documento: apaga aqui antes de pedir a troca, para
     a travessia não ser um branco seco. O tempo bate com a transição
     do .palco no conta.css. */
  function atravessar() {
    saindo = true;
    setTimeout(() => (location.href = `${base}/`), 180);
  }

  /* o verbo de cada passo. Devolve null quando deu certo. */
  function chamar() {
    switch (atual) {
      case "entrar":
        return sessao.entrar(dados.email, dados.senha);
      case "criar":
        origem = "criar";
        return sessao.cadastrar(dados.email, dados.senhaNova, dados.nome.trim());
      case "codigo":
        return sessao.confirmarCodigo(
          dados.email,
          dados.codigo,
          origem === "criar" ? "signup" : "email"
        );
      /* o botão desta tela reenvia; não há o que confirmar */
      case "conferir":
        return sessao.reenviar(dados.email);
      case "esqueci":
        origem = "esqueci";
        return sessao.pedirRedefinicao(dados.email);
      case "novaSenha":
        return sessao.trocarSenha(dados.senhaNova);
      /* "pronto" não chama ninguém: o botão dele é só a saída */
      default:
        return Promise.resolve(null);
    }
  }

  function avancar() {
    /* entrar e "ir para a mesa" terminam fora do fluxo. location.href
       e não goto: a mesa tem folha de estilo própria, e a travessia
       entre telas é documento novo. */
    if (atual === "entrar" || atual === "pronto") {
      atravessar();
      return;
    }

    /* reenviar não avança: a pessoa continua esperando o mesmo clique */
    if (atual === "conferir") {
      recado = { tom: "bom", texto: `Mandamos outro e-mail para ${dados.email}.` };
      return;
    }

    /* o código volta para a nova senha quando veio da redefinição, e
       segue para o fim quando veio do cadastro */
    const destino =
      atual === "codigo" && origem === "esqueci" ? "novaSenha" : passo.seguinte;

    const anterior = atual;
    ir(destino);

    if (atual === "conferir") {
      recado = {
        tom: "neutro",
        texto:
          anterior === "esqueci"
            ? `Link de redefinição enviado para ${dados.email}.`
            : `Link de confirmação enviado para ${dados.email}.`,
      };
    } else if (atual === "novaSenha") {
      recado = { tom: "bom", texto: "Senha trocada. As outras sessões caíram." };
    }
  }

  async function comGoogle() {
    if (enviando) return;
    enviando = true;
    const falha = await sessao.entrarComGoogle();
    enviando = false;
    /* no caso feliz o navegador já saiu para o Google; só a recusa
       imediata volta até aqui */
    if (falha) recado = { tom: "ruim", texto: falha };
  }

  async function gesto(qual) {
    if (enviando) return;
    enviando = true;
    const falha = await (qual === "sair"
      ? sessao.sair()
      : sessao.reenviar(dados.email));
    enviando = false;

    if (falha) {
      recado = { tom: "ruim", texto: falha };
      return;
    }

    if (qual === "sair") {
      /* os campos saem junto: deixar o e-mail preenchido depois de
         sair entrega quem estava aqui a quem chegar depois */
      dados = { nome: "", email: "", senha: "", senhaNova: "", senhaRepetida: "", codigo: "" };
      ir("entrar");
      recado = { tom: "neutro", texto: "Você saiu. Até a próxima." };
      return;
    }

    recado = { tom: "bom", texto: `Mandamos outro e-mail para ${dados.email}.` };
  }
</script>

<svelte:head>
  <title>Conta — Let's Learn Together</title>
  <meta
    name="description"
    content="Entrar ou criar conta para levar o progresso das trilhas entre aparelhos."
  />
</svelte:head>

<!-- a saída da tela: quem abriu a conta por curiosidade precisa de
     uma porta que não seja o botão do navegador. Usa a travessia com
     fade, como o resto desta tela. -->
<button
  class="botao botao--icone conta-volta"
  type="button"
  title="Voltar para a escolha de trilha"
  aria-label="Voltar para a escolha de trilha"
  onclick={atravessar}
>
  <!-- casa: telhado em degraus, duas paredes e o vão da porta -->
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="7" y="1" width="2" height="1" />
    <rect x="6" y="2" width="4" height="1" />
    <rect x="5" y="3" width="6" height="1" />
    <rect x="4" y="4" width="8" height="1" />
    <rect x="3" y="5" width="10" height="1" />
    <rect x="2" y="6" width="12" height="1" />
    <rect x="3" y="7" width="3" height="8" />
    <rect x="10" y="7" width="3" height="8" />
    <rect x="6" y="7" width="4" height="2" />
  </svg>
</button>

<main class="palco" data-saindo={saindo ? "sim" : null}>
  <!-- a cena: o Obi e o que ele tem a dizer. Ele não é ilustração de
       canto — é quem guarda o que a pessoa marcou, e por isso fica do
       mesmo tamanho da ficha. -->
  <section class="cena">
    <p class="cena__fala">{fala}</p>
    <Obi variante="ninho" {controle} bind:elemento={obiEl} />
  </section>

  <Ficha
    {passo}
    bind:dados
    {erro}
    {recado}
    ocupado={enviando}
    aoGoogle={atual === "entrar" || atual === "criar" ? comGoogle : null}
    aoConfirmar={confirmar}
    aoIr={ir}
    aoGesto={gesto}
    aoFechar={fecharOlhos}
  />

  <!-- os dois documentos: é aqui que alguém decide criar conta, e é
       aqui que eles precisam estar a um clique. O Google também os
       exige para publicar o login social. -->
  <p class="palco__legais">
    <a href="{base}/privacidade" data-sveltekit-reload>Privacidade</a>
    <span aria-hidden="true">·</span>
    <a href="{base}/termos" data-sveltekit-reload>Termos de uso</a>
  </p>
</main>
