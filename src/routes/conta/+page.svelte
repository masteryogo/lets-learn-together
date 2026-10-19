<!-- ============================================================
     A tela de conta: entrar, criar, confirmar e redefinir.

     Uma rota para os seis passos, e não seis rotas: eles não são
     endereços que alguém guarda, são estados de um fluxo — e manter
     o passo fora da URL evita que recarregar a página caia no meio
     de uma confirmação que já expirou.

     A autenticação ainda não existe. `confirmar` só avança o passo,
     e é esse o lugar onde o Supabase entra — ver o quadro, ficha
     "Supabase DB + Auth". Enquanto isso a tela é honesta sobre o
     que faz: o aviso no rodapé diz que nada é enviado.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import { MediaQuery } from "svelte/reactivity";

  import { FALAS, FLUXO } from "$lib/conta/fluxo.js";
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

  let dados = $state({
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
  function confirmar() {
    const campos = passo.campos;

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

    /* entrar e "ir para a mesa" não têm passo seguinte: os dois
       terminam na mesa, e é daí que a conta vai fazer falta */
    if (!passo.seguinte) {
      recado = {
        tom: "neutro",
        texto: "A conta ainda não existe: isto é a tela, sem servidor por trás.",
      };
      return;
    }

    ir(passo.seguinte);

    if (atual === "codigo") {
      recado = { tom: "neutro", texto: `Código enviado para ${dados.email}.` };
    } else if (atual === "novaSenha") {
      recado = { tom: "bom", texto: "Link enviado. Confira a caixa de entrada e o spam." };
    }
  }

  function gesto(qual) {
    if (qual === "reenviar") {
      recado = { tom: "bom", texto: "Outro código enviado." };
    }
  }
</script>

<svelte:head>
  <title>Conta — Lets learn together</title>
  <meta
    name="description"
    content="Entrar ou criar conta para levar o progresso das trilhas entre aparelhos."
  />
</svelte:head>

<main class="palco">
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
    aoConfirmar={confirmar}
    aoIr={ir}
    aoGesto={gesto}
    aoFechar={fecharOlhos}
  />
</main>
