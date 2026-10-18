<!-- ============================================================
     O calendário de estudos.

     Maquete, e continua sendo: o calendario.html original não tinha
     JavaScript nenhum — outubro de 2026 está escrito dia a dia, à
     mão, e os controles do diálogo não ligam em nada. Portei assim
     de propósito. Transformar os dias em dados seria redesenhar a
     tela, não migrá-la, e o que ela precisa de verdade (plano que
     persiste, lembrete que chega no celular) está no quadro
     esperando o Supabase.

     Uma consequência herdada a registrar: o botão "Ajustar" não
     abre o <dialog>, porque nunca houve quem o abrisse.
     ============================================================ -->
<script>
  import Canto from "$lib/Canto.svelte";
  import "$lib/estilos/base.css";
  import "./calendario.css";

  /* a classe vive no <body> porque é ele que recebe o fundo da
     página; sai quando a rota sai */
  $effect(() => {
    document.body.classList.add("calendario-pagina");
    return () => document.body.classList.remove("calendario-pagina");
  });
</script>

<svelte:head>
  <title>Calendário de estudos</title>
</svelte:head>

<Canto />


  <header class="cabecalho-cal">
    <h1 class="cabecalho-cal__titulo">Calendário</h1>

    <!-- O calendário é de todas as trilhas: o modelo do mês mistura
         ML e OpenCV, e separá-los em calendários distintos devolveria
         o problema que ele resolve. Chegando de um roadmap
         (/calendario?trilha=ml), a aba daquela trilha nasce ativa
         — mas "Todas" fica ao lado, visível, a um clique. -->
    <nav class="filtro" aria-label="Filtrar por trilha">
      <a class="filtro__aba" href="/calendario" aria-current="page">Todas</a>
      <a class="filtro__aba" href="/calendario?trilha=ml" data-trilha="ml" style="--trilha-cor: var(--trilha-ml)">Machine Learning</a>
      <a class="filtro__aba" href="/calendario?trilha=cv" data-trilha="cv" style="--trilha-cor: var(--trilha-cv)">OpenCV</a>
      <a class="filtro__aba" href="/calendario?trilha=pr" data-trilha="pr" style="--trilha-cor: var(--trilha-pr)">Projetos</a>
    </nav>
  </header>

  <!-- ========================= tira do modelo ========================= -->
  <!-- o modelo é configuração, e configuração não disputa leitura com o
       mês: aqui fica só o resumo do que está valendo; os controles moram
       no diálogo lá embaixo. -->
  <section class="modelo-tira" aria-label="Modelo do mês">
    <span class="modelo-tira__rotulo">Modelo</span>
    <span class="modelo-tira__janela">seg–sáb · 19:00 · 1h30</span>
    <span class="modelo-tira__mistura">
      <span class="modelo-tira__barra" role="img"
            aria-label="50% Machine Learning, 40% OpenCV, 10% Projetos">
        <span class="modelo-tira__parte" data-trilha="ml" style="width: 50%"></span>
        <span class="modelo-tira__parte" data-trilha="cv" style="width: 40%"></span>
        <span class="modelo-tira__parte" data-trilha="pr" style="width: 10%"></span>
      </span>
      <span class="modelo-tira__contas">ML 13d · OpenCV 11d · Projetos 3d</span>
    </span>
    <button class="botao" type="button" id="btn-modelo">Ajustar</button>
    <span class="modelo-tira__eco" role="status" aria-live="polite"></span>
  </section>

  <div class="calendario">

    <!-- ============================= mês ============================= -->
    <section class="mes" aria-label="Outubro de 2026">
      <div class="mes__topo">
        <div>
          <span class="mes__ano">2026</span>
          <span class="mes__nome">Outubro</span>
        </div>
        <div class="mes__nav">
          <button class="botao botao--icone" type="button" aria-label="Mês anterior">&lt;</button>
          <button class="botao botao--icone" type="button" aria-label="Próximo mês">&gt;</button>
        </div>
      </div>

      <!-- a semana começa na segunda: é onde o plano de estudo começa,
           e o domingo fica no fim, junto do outro dia de folga -->
      <div class="mes__semana" aria-hidden="true">
        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span>
        <span>Sex</span><span>Sáb</span><span>Dom</span>
      </div>

      <div class="mes__dias" id="mes-dias" role="group" aria-label="Dias de outubro">
        <!-- a virada do mês fica visível e apagada: o dia existe, mas
             não é desta grade -->
        <div class="dia dia--fora"><span class="dia__n">28</span></div>
        <div class="dia dia--fora"><span class="dia__n">29</span></div>
        <div class="dia dia--fora"><span class="dia__n">30</span></div>

        <button class="dia" type="button" aria-pressed="false" aria-label="1 de outubro, sem sessões">
          <span class="dia__n">1</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="2 de outubro, sem sessões">
          <span class="dia__n">2</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="3 de outubro, sem sessões">
          <span class="dia__n">3</span>
        </button>
        <!-- domingo: fora da janela do modelo -->
        <button class="dia dia--off" type="button" aria-pressed="false" aria-label="4 de outubro, fora da janela">
          <span class="dia__n">4</span>
        </button>

        <button class="dia" type="button" aria-pressed="false" aria-label="5 de outubro, 1 sessão cumprida">
          <span class="dia__n">5</span>
          <span class="dia__bloco" data-estado="feito">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="6 de outubro, 1 sessão cumprida">
          <span class="dia__n">6</span>
          <span class="dia__bloco" data-estado="feito">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="7 de outubro, 1 sessão cumprida">
          <span class="dia__n">7</span>
          <span class="dia__bloco" data-estado="feito">19:00 ML</span>
        </button>
        <!-- passou e ficou em branco: traço no lugar de cor -->
        <button class="dia" type="button" aria-pressed="false" aria-label="8 de outubro, 1 sessão perdida">
          <span class="dia__n">8</span>
          <span class="dia__bloco" data-estado="perdido">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="9 de outubro, 1 sessão cumprida">
          <span class="dia__n">9</span>
          <span class="dia__bloco" data-estado="feito">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="10 de outubro, sem sessões">
          <span class="dia__n">10</span>
        </button>
        <button class="dia dia--off" type="button" aria-pressed="false" aria-label="11 de outubro, fora da janela">
          <span class="dia__n">11</span>
        </button>

        <button class="dia" type="button" aria-pressed="false" aria-label="12 de outubro, sem sessões">
          <span class="dia__n">12</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="13 de outubro, 1 sessão cumprida">
          <span class="dia__n">13</span>
          <span class="dia__bloco" data-estado="feito">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="14 de outubro, 1 sessão cumprida">
          <span class="dia__n">14</span>
          <span class="dia__bloco" data-estado="feito">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="15 de outubro, 1 sessão cumprida">
          <span class="dia__n">15</span>
          <span class="dia__bloco" data-estado="feito">19:00 Projetos</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="16 de outubro, 1 sessão cumprida">
          <span class="dia__n">16</span>
          <span class="dia__bloco" data-estado="feito">19:00 OpenCV</span>
        </button>
        <button class="dia dia--hoje" type="button" aria-pressed="true" aria-label="17 de outubro, hoje, 1 sessão planejada">
          <span class="dia__n">17</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia dia--off" type="button" aria-pressed="false" aria-label="18 de outubro, fora da janela">
          <span class="dia__n">18</span>
        </button>

        <button class="dia" type="button" aria-pressed="false" aria-label="19 de outubro, 1 sessão planejada">
          <span class="dia__n">19</span>
          <span class="dia__bloco" data-trilha="cv">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="20 de outubro, 1 sessão planejada">
          <span class="dia__n">20</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="21 de outubro, 1 sessão planejada">
          <span class="dia__n">21</span>
          <span class="dia__bloco" data-trilha="cv">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="22 de outubro, 1 sessão planejada">
          <span class="dia__n">22</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="23 de outubro, 1 sessão planejada">
          <span class="dia__n">23</span>
          <span class="dia__bloco" data-trilha="pr">19:00 Projetos</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="24 de outubro, 1 sessão planejada">
          <span class="dia__n">24</span>
          <span class="dia__bloco" data-trilha="cv">19:00 OpenCV</span>
        </button>
        <button class="dia dia--off" type="button" aria-pressed="false" aria-label="25 de outubro, fora da janela">
          <span class="dia__n">25</span>
        </button>

        <button class="dia" type="button" aria-pressed="false" aria-label="26 de outubro, 1 sessão planejada">
          <span class="dia__n">26</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="27 de outubro, 1 sessão planejada">
          <span class="dia__n">27</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="28 de outubro, 1 sessão planejada">
          <span class="dia__n">28</span>
          <span class="dia__bloco" data-trilha="cv">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="29 de outubro, 1 sessão planejada">
          <span class="dia__n">29</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="30 de outubro, 1 sessão planejada">
          <span class="dia__n">30</span>
          <span class="dia__bloco" data-trilha="cv">19:00 OpenCV</span>
        </button>
        <button class="dia" type="button" aria-pressed="false" aria-label="31 de outubro, 1 sessão planejada">
          <span class="dia__n">31</span>
          <span class="dia__bloco" data-trilha="ml">19:00 ML</span>
        </button>

        <div class="dia dia--fora"><span class="dia__n">1</span></div>
      </div>
    </section>

    <!-- =========================== ficha =========================== -->
    <aside class="ficha-dia" aria-label="Sessões do dia">
      <p class="ficha-dia__rotulo">Dia</p>
      <p class="ficha-dia__titulo">Sábado, 17 de outubro</p>
      <p class="ficha-dia__carga">1 sessão · 1h30</p>

      <!-- a régua existe para o choque de horário aparecer antes de
           escrever: duas sessões sobrepostas uma lista não mostra.
           A faixa vai das 17h à 1h, que é a janela de quem estuda à
           noite — a madrugada cai no fim, não no começo. -->
      <div class="regua" aria-hidden="true">
        <div class="regua__eixo">
          <span>17:00</span><span>19:00</span><span>21:00</span><span>23:00</span><span>01:00</span>
        </div>
        <div class="regua__pista">
          <div class="regua__faixa" data-trilha="ml" style="top: 25%; height: 18.75%">19:00 ML</div>
        </div>
      </div>

      <div class="ficha-dia__lista">
        <article class="sessao" data-trilha="ml">
          <div class="sessao__topo">
            <span class="sessao__trilha">Machine Learning</span>
            <span class="sessao__hora">19:00 · 1h30</span>
          </div>
          <p class="sessao__nota">Árvores de decisão</p>
          <p class="sessao__estado">□ planejada</p>
        </article>
      </div>

      <form class="escrever" id="form-sessao">
        <p class="escrever__rotulo">Escrever neste dia</p>

        <label class="campo" for="sessao-trilha">
          <span class="campo__rotulo">Assunto</span>
          <select class="campo__controle" id="sessao-trilha">
            <option value="ml">Machine Learning</option>
            <option value="cv">OpenCV</option>
            <option value="pr">Projetos</option>
          </select>
        </label>

        <div class="campo-par">
          <label class="campo" for="sessao-hora">
            <span class="campo__rotulo">Começa</span>
            <input class="campo__controle" id="sessao-hora" type="time" value="19:00">
          </label>
          <label class="campo" for="sessao-dur">
            <span class="campo__rotulo">Dura</span>
            <input class="campo__controle" id="sessao-dur" type="text" value="1h30">
          </label>
        </div>

        <label class="campo" for="sessao-nota">
          <span class="campo__rotulo">O que vai estudar</span>
          <input class="campo__controle" id="sessao-nota" type="text" placeholder="ex.: árvores de decisão">
        </label>

        <button class="botao botao--destaque" type="submit">Escrever</button>
        <p class="escrever__eco" role="status" aria-live="polite"></p>
      </form>
    </aside>
  </div>

  <!-- a legenda é a mesma estrutura do roadmap; aqui a amostra decodifica
       trilha e estado, não prioridade -->
  <div class="legenda legenda--cal">
    <span class="legenda__item"><span class="legenda__amostra" data-trilha="ml"></span>Machine Learning</span>
    <span class="legenda__item"><span class="legenda__amostra" data-trilha="cv"></span>OpenCV</span>
    <span class="legenda__item"><span class="legenda__amostra" data-trilha="pr"></span>Projetos</span>
    <span class="legenda__item"><span class="legenda__amostra" data-estado="feito"></span>Cumprida</span>
    <span class="legenda__item"><span class="legenda__amostra" data-estado="perdido"></span>Perdida</span>
  </div>

  <!-- ========================== modelo do mês ========================== -->
  <!-- o que o Google não faz: descrever o mês uma vez e deixar a grade
       se preencher. Em diálogo nativo por causa do foco preso e do Esc,
       que vêm de graça — e do ::backdrop, que não briga de z-index com
       a ficha sticky nem com o Obi solto. -->
  <dialog class="modelo" id="dlg-modelo" aria-labelledby="modelo-titulo">
    <div class="modelo__topo">
      <h2 class="modelo__titulo" id="modelo-titulo">Modelo do mês</h2>
      <button class="botao" type="button" id="btn-modelo-fechar">Fechar</button>
    </div>

    <div class="modelo__corpo">
      <section class="modelo__secao">
        <p class="modelo__rotulo">Janela</p>
        <div class="semana-chaves" role="group" aria-label="Dias da semana que entram no plano">
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="segunda">S</button>
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="terça">T</button>
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="quarta">Q</button>
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="quinta">Q</button>
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="sexta">S</button>
          <button class="semana-chave" type="button" aria-pressed="true"  aria-label="sábado">S</button>
          <button class="semana-chave" type="button" aria-pressed="false" aria-label="domingo">D</button>
        </div>
        <div class="campo-par">
          <label class="campo" for="modelo-hora">
            <span class="campo__rotulo">A partir de</span>
            <input class="campo__controle" id="modelo-hora" type="time" value="19:00">
          </label>
          <label class="campo" for="modelo-dur">
            <span class="campo__rotulo">Cada sessão</span>
            <input class="campo__controle" id="modelo-dur" type="text" value="1h30">
          </label>
        </div>
      </section>

      <section class="modelo__secao">
        <p class="modelo__rotulo">Mistura</p>
        <!-- a porcentagem é de dias, não de horas: é o que se confere
             olhando a grade -->
        <div class="mistura">
          <div class="fatia">
            <span class="fatia__nome"><span class="legenda__amostra" data-trilha="ml"></span>ML</span>
            <input class="fatia__n" id="mistura-ml" type="number" min="0" max="100" step="5" value="50"
                   aria-label="Porcentagem de Machine Learning">
            <span class="fatia__trilho"><span class="fatia__barra" data-trilha="ml" style="width: 50%"></span></span>
            <span class="fatia__dias">13 dias</span>
          </div>
          <div class="fatia">
            <span class="fatia__nome"><span class="legenda__amostra" data-trilha="cv"></span>OpenCV</span>
            <input class="fatia__n" id="mistura-cv" type="number" min="0" max="100" step="5" value="40"
                   aria-label="Porcentagem de OpenCV">
            <span class="fatia__trilho"><span class="fatia__barra" data-trilha="cv" style="width: 40%"></span></span>
            <span class="fatia__dias">11 dias</span>
          </div>
          <div class="fatia">
            <span class="fatia__nome"><span class="legenda__amostra" data-trilha="pr"></span>Projetos</span>
            <input class="fatia__n" id="mistura-pr" type="number" min="0" max="100" step="5" value="10"
                   aria-label="Porcentagem de Projetos">
            <span class="fatia__trilho"><span class="fatia__barra" data-trilha="pr" style="width: 10%"></span></span>
            <span class="fatia__dias">3 dias</span>
          </div>
        </div>
        <p class="mistura__soma"><span>Soma</span><span>100%</span></p>
        <p class="mistura__previa">27 dias no mês · 40h30</p>
      </section>

      <section class="modelo__secao">
        <p class="modelo__rotulo">Aplicar</p>
        <button class="botao botao--destaque" type="button" id="btn-preencher">Preencher outubro</button>
        <button class="botao" type="button" id="btn-limpar">Limpar o que vem</button>
      </section>
    </div>
  </dialog>
