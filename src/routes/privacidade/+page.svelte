<!-- ============================================================
     Política de privacidade.

     Existe por duas razões, nesta ordem: o site guarda dado de
     pessoa (e-mail, nome, progresso, notas), e o Google exige o
     link para publicar o login social.

     Escrita no que o projeto faz de verdade, não num modelo. Se
     algum dia o site passar a medir audiência, mandar e-mail ou
     integrar outro serviço, é este arquivo que muda primeiro.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
  import Canto from "$lib/Canto.svelte";
  import "$lib/estilos/base.css";
  import "../documento.css";
</script>

<svelte:head>
  <title>Privacidade — Let's Learn Together</title>
  <meta
    name="description"
    content="O que o Let's Learn Together guarda, por quê, e o que você pode pedir."
  />
</svelte:head>

<Canto />

<main class="documento">
  <h1 class="documento__titulo">Privacidade</h1>
  <p class="documento__data">Atualizada em 20 de outubro de 2026</p>

  <p>
    O <strong>Let's Learn Together</strong> é um site de roadmaps de estudo. Ele
    guarda o mínimo necessário para lembrar o que você já estudou — e nada
    além disso.
  </p>

  <h2>O que é guardado</h2>
  <ul>
    <li>
      <strong>Sua conta:</strong> e-mail e o nome que você escolher. Se entrar
      com o Google, recebemos do Google apenas o e-mail e o nome da conta.
    </li>
    <li>
      <strong>Seu progresso:</strong> quais tópicos você marcou como estudando,
      feito ou pulado, em cada trilha.
    </li>
    <li><strong>Suas notas:</strong> o texto, a cor e a posição no mural.</li>
    <li>
      <strong>Seu calendário:</strong> as sessões de estudo que você escreve ou
      gera pelo modelo do mês.
    </li>
  </ul>

  <h2>O que não é guardado</h2>
  <ul>
    <li>Não há rastreamento, análise de audiência nem cookies de publicidade.</li>
    <li>Não há anúncios, e seus dados não são vendidos nem compartilhados.</li>
    <li>
      Sua senha não é vista por nós: quem a guarda, já cifrada, é o serviço de
      autenticação.
    </li>
  </ul>

  <h2>Onde isso fica</h2>
  <p>
    Num banco de dados hospedado no <strong>Supabase</strong>, protegido por
    regras que só deixam cada pessoa ler e escrever as próprias linhas. O site
    em si é um arquivo estático servido pelo GitHub Pages.
  </p>
  <p>
    Algumas preferências ficam só no seu navegador, e não no banco: o tema
    claro ou escuro e quais etapas você deixou fechadas. Elas não identificam
    ninguém e somem quando você limpa os dados do site.
  </p>

  <h2>Por quanto tempo</h2>
  <p>
    Enquanto a conta existir. Ao pedir a exclusão, apagamos a conta e tudo que
    está preso a ela — progresso, notas e sessões de estudo — sem cópia de
    segurança que sobreviva.
  </p>

  <h2>Seus direitos</h2>
  <p>
    Você pode pedir uma cópia do que está guardado, a correção do que estiver
    errado ou a exclusão de tudo. O pedido vai para
    <a href="mailto:matosjoaopedro.jp@gmail.com">matosjoaopedro.jp@gmail.com</a>
    e é atendido em até 30 dias, como manda a LGPD.
  </p>

  <h2>Mudanças</h2>
  <p>
    Se esta política mudar, a data acima muda junto. Alteração que afete o que
    é guardado será avisada no próprio site.
  </p>

  <p>
    <a href="{base}/termos" data-sveltekit-reload>Ver os termos de uso</a>
  </p>
</main>
