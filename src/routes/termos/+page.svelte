<!-- ============================================================
     Termos de uso.

     Curtos de propósito: o site é gratuito, não vende nada e não
     promete disponibilidade. Termo longo aqui seria teatro — o que
     existe de verdade é um roadmap de estudo e um banco com o
     progresso de quem o usa.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import Canto from "$lib/Canto.svelte";
  import "$lib/estilos/base.css";
  import "../documento.css";
</script>

<svelte:head>
  <title>Termos de uso — Let's Learn Together</title>
  <meta
    name="description"
    content="As regras de uso do Let's Learn Together: o que ele oferece e o que não promete."
  />
</svelte:head>

<Canto />

<main class="documento">
  <h1 class="documento__titulo">Termos de uso</h1>
  <p class="documento__data">Atualizados em 20 de outubro de 2026</p>

  <p>
    Ao usar o <strong>Let's Learn Together</strong>, você concorda com o que
    está escrito aqui. É curto porque o site é simples.
  </p>

  <h2>O que o site é</h2>
  <p>
    Um guia de estudo gratuito, com roadmaps, um mural de notas e um
    calendário. O conteúdo das trilhas é material de referência, montado com
    cuidado mas sem garantia de estar completo ou atualizado — ele indica um
    caminho, não substitui curso, livro nem orientação profissional.
  </p>

  <h2>Sua conta</h2>
  <ul>
    <li>
      Uma conta é pessoal. Você é responsável pelo que escreve nela e por
      manter sua senha fora do alcance de outras pessoas.
    </li>
    <li>
      Você pode apagá-la quando quiser; o que estava nela vai junto. Ver a
      <a href="{base}/privacidade" data-sveltekit-reload>política de privacidade</a>.
    </li>
    <li>
      Contas usadas para enviar conteúdo ilegal, ofensivo ou automatizado em
      massa podem ser encerradas sem aviso.
    </li>
  </ul>

  <h2>O que não é prometido</h2>
  <p>
    O site é oferecido como está, sem garantia de funcionamento ininterrupto.
    Ele depende de serviços de terceiros — GitHub Pages e Supabase — e pode
    sair do ar, mudar ou ser descontinuado. Faça cópia do que for importante
    para você.
  </p>
  <p>
    Dito isso, perda de dado não é tratada como detalhe: as notas e o
    progresso existem no banco justamente para não depender de um navegador
    só.
  </p>

  <h2>Conteúdo que você escreve</h2>
  <p>
    Suas notas e sessões de estudo são suas. Não as usamos para nada além de
    mostrá-las de volta para você.
  </p>

  <h2>Mudanças</h2>
  <p>
    Estes termos podem mudar; a data acima acompanha. Continuar usando o site
    depois de uma mudança significa aceitá-la.
  </p>

  <p>
    <a href="{base}/privacidade" data-sveltekit-reload>Ver a política de privacidade</a>
  </p>
</main>
