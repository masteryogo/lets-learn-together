<!-- ============================================================
     O carimbo da folha — o rodapé de todas as telas.

     É o cartucho das plantas de levantamento: o quadro no canto
     inferior onde cada célula tem um campo e cada campo tem um nome.
     Nasceu na mesa e passou a valer no site inteiro, que é o que um
     carimbo faz numa prancha — ele identifica a folha, qualquer
     folha.

     PRIMEIRO COMPONENTE DO REPOSITÓRIO COM ESTILO PRÓPRIO, e por
     necessidade: ele é desenhado dentro de três folhas globais
     diferentes (mesa.css, estilos/base.css, apoio.css) que dão
     valores distintos aos mesmos nomes de token. Escopado e com
     paleta própria, ele é o mesmo carimbo nas cinco telas — que é o
     que "global" tinha de significar aqui.
     ============================================================ -->
<script>
  import { base } from "$app/paths";
</script>

<footer class="cartucho">
  <section class="cartucho__campo cartucho__campo--larga">
    <h2 class="cartucho__rotulo">Let's Learn Together</h2>
    <p class="cartucho__valor">
      Dá para aprender qualquer coisa por conta própria. O que falta, quase
      sempre, não é conteúdo: é o caminho. Feito por quem e para quem estuda
      sozinho.
    </p>
    <p class="cartucho__assinatura">
      <span class="cartucho__rotulo">feito por</span>
      <a
        class="cartucho__chip"
        href="https://github.com/masteryogo"
        target="_blank"
        rel="noopener noreferrer">@masteryogo</a
      >
      <span class="cartucho__e" aria-hidden="true">&amp;</span>
      <a
        class="cartucho__chip"
        href="https://github.com/melchisedekdev"
        target="_blank"
        rel="noopener noreferrer">@melchisedekdev</a
      >
    </p>
  </section>

  <!-- a vacância é o conteúdo: uma célula em branco no carimbo diz
       "aberta" melhor que um anúncio dizendo que está aberta -->
  <section class="cartucho__campo cartucho__campo--vaga">
    <h2 class="cartucho__rotulo">patrocínio</h2>
    <p class="cartucho__valor">
      A sua empresa quer falar com quem está estudando dados, visão e
      aprendizado de máquina ou qualquer outra tecnologia?
    </p>
    <a class="cartucho__link" href="{base}/apoio" data-sveltekit-reload
      >Conversar sobre apoio</a
    >
  </section>

  <!-- o pé do carimbo: o que é obrigatório estar escrito à esquerda,
       o que se assina à direita -->
  <section class="cartucho__campo cartucho__barra">
    <nav class="cartucho__miudo">
      <a class="cartucho__link" href="{base}/privacidade" data-sveltekit-reload
        >Privacidade</a
      >
      <a class="cartucho__link" href="{base}/termos" data-sveltekit-reload>Termos</a>
    </nav>
    <p class="cartucho__assinatura">
      <span class="cartucho__rotulo">contribua com suas ideias</span>
      <a
        class="cartucho__acao"
        href="{base}/kanban"
        data-sveltekit-reload
        target="_blank"
        rel="noopener noreferrer">Contribuir</a
      >
    </p>
  </section>
</footer>

<style>
.cartucho {
  /* Os tokens vivem aqui, e não num :root, porque este rodapé aparece
     dentro de três folhas globais que dão valores diferentes aos mesmos
     nomes: `--linha` é preta na mesa e azul no apoio, e `--papel` não
     existe na casca escura. Herdar faria o mesmo rodapé mudar de cor
     conforme a tela em que caiu. */
  --papel:         #faf8f2;
  --borda:         #b9b0a0;
  --malha-fina:    #e2e9ee;
  --tinta:         #2b3a45;
  --tinta-fraca:   #6b6558;
  --roxo:          #7c5cf0;
  --tinta-roxo:    #ffffff;
  --amarelo:       #f5c518;
  --tinta-bloco:   #15141a;
  --linha-dura:    #15141a;
  --sombra-dura:    4px 4px 0 var(--linha-dura);
  --sombra-dura-sm: 2px 2px 0 var(--linha-dura);
  /* a família também é token próprio, e pela mesma razão que as
     cores: a folha de apoio põe a Plex Sans no body, e sem esta
     linha o mesmo carimbo saía em monoespaçada em cinco telas e em
     sans na sexta. */
  --mono: "Departure Mono", ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-family: var(--mono);

  position: relative;
  /* colado nas bordas: as margens negativas desfazem, exatamente, o
     padding do body — o carimbo é o fim da folha, não um cartão
     pousado sobre o tampo */
  width: auto;
  /* as margens negativas desfazem, exatamente, o padding do body — o
     carimbo é o fim da folha, não um cartão pousado sobre ela.

     O valor não pode estar escrito aqui: o rodapé vive no layout e
     aparece dentro de três folhas com paddings diferentes. Cada uma
     declara o seu em `--sangria-x` / `--sangria-b`, e o fallback 0px
     cobre a folha que ainda não declarou — aí ele só não sangra. */
  margin: clamp(88px, 14vh, 176px)
          calc(-1 * var(--sangria-x, 0px))
          calc(-1 * var(--sangria-b, 0px));
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0;
  /* o papel vai até a janela, o conteúdo não: as colunas se alinham à
     mesa de cartas (três cartas e dois vãos), que é a medida da página
     inteira. Sem isto, numa tela larga a célula do manifesto tem 8
     colunas e o texto para em 62ch — o resto é buraco. */
  padding-inline: max(clamp(16px, 2.4vw, 32px),
                      calc((100% - (404px * 3 + 32px * 2)) / 2));
  background: var(--papel);
  /* o contorno volta nos três lados que ainda têm limite: encostado na
     janela, o traço é o que diz onde o papel acaba. Em cima não há
     borda — lá o limite é o rasgo, e linha reta o desmentiria.
     A sombra dura fica fora: ela só faz sentido em peça que paira. */
  border: 2px solid var(--linha-dura);
  border-top: none;
}

/* a folha foi arrancada: o dente de 11px × 5,5px é a mesma grade da
   tipografia, então o serrilhado cai em pixel cheio. A linha de
   nanquim é drop-shadow e não border porque precisa acompanhar o
   recorte da máscara, e borda só sabe desenhar reto. */
.cartucho::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -5.5px;
  height: 5.5px;
  background: var(--papel);
  mask: conic-gradient(from -45deg at 50% 100%, #000 0 90deg, #0000 0)
        0 0 / 11px 5.5px repeat-x;
  filter: drop-shadow(0 -2px 0 var(--linha-dura));
  pointer-events: none;
}

.cartucho__campo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  /* três colunas de campo curto na fileira de baixo */
  grid-column: span 3;
  padding: clamp(1.1rem, 2vw, 1.6rem);
  background: var(--papel);
}

/* a fileira de cima: o que o site é, e a célula à venda. Sete e cinco,
   e não seis e seis — quem faz o site tem mais a dizer que o espaço
   que ainda não foi vendido. */
.cartucho__campo--larga { grid-column: span 8; }
.cartucho__campo--vaga  { grid-column: span 4; }

/* rótulo e valor na mesma linha: numa fileira sem traço, empilhar os
   dois criava uma segunda coluna invisível que ninguém pediu */
.cartucho__assinatura {
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* o pé: ocupa a fileira inteira e separa dever de convite */
.cartucho__barra {
  grid-column: span 12;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem clamp(1rem, 4vw, 3rem);
  /* a fileira de cima já deixou o seu padding aqui: repetir o de cima
     empilha dois respiros e abre um vão que ninguém pediu */
  padding-top: 0;
}

.cartucho__miudo { display: flex; gap: clamp(1rem, 2vw, 2rem); }

/* a célula vaga, no papel quadriculado em que os mapas são desenhados:
   folha ainda não preenchida é exatamente o que ela é */
.cartucho__campo--vaga {
  background:
    repeating-linear-gradient(to right, var(--malha-fina) 0 1px, transparent 1px 11px),
    repeating-linear-gradient(to bottom, var(--malha-fina) 0 1px, transparent 1px 11px),
    var(--papel);
}

/* o nome do campo. Minúsculo e pequeno, não em caixa alta: no carimbo
   o nome do campo é dado — "desenho: @masteryogo" diz o que o nome
   sozinho não diria —, e a mesa já escreve `buscar` assim. */
/* 13.75px e não 11px: o carimbo é a última coisa que se lê, muitas
   vezes depois de rolar a mesa inteira, e um rótulo no menor degrau da
   grade pedia aproximação. A hierarquia continua existindo — o valor
   está um degrau acima. */
.cartucho__rotulo {
  margin: 0;
  font-size: 13.75px;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--tinta-fraca);
}

/* a medida de leitura manda na largura, não a célula: a de cima tem
   mais de 90 caracteres de folga, e em 13.75px o olho perde o começo
   da linha seguinte */
.cartucho__valor {
  margin: 0;
  max-width: 62ch;
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--tinta);
}

/* o valor de um campo que leva a algum lugar: mesmo tamanho do texto,
   com o traço aparecendo só no gesto — três sublinhados fixos viriam
   a ser uma segunda grade por cima do carimbo */
.cartucho__link {
  font-size: 16.5px;
  color: var(--linha-dura);
  text-decoration: none;
  border-bottom: 1px solid var(--borda);
}

.cartucho__link:hover { border-bottom-color: var(--linha-dura); }

.cartucho__chip {
  padding: 0.3rem 0.7rem;
  font-size: 16.5px;
  background: var(--roxo);
  color: var(--tinta-roxo);
  border: 2px solid var(--linha-dura);
  box-shadow: var(--sombra-dura-sm);
  text-decoration: none;
  transition: transform 0.08s, box-shadow 0.08s;
}

.cartucho__chip:hover { transform: translate(2px, 2px); box-shadow: none; }

/* o conectivo entre dois autores: tinta fraca e um degrau abaixo dos
   chips, porque ele não é um terceiro nome — se tivesse o mesmo peso,
   a linha leria como três coisas e não como duas. O gap do flex já
   afasta demais para um `&`, então ele puxa os vizinhos de volta. */
.cartucho__e {
  margin: 0 -0.3rem;
  font-size: 13.75px;
  color: var(--tinta-fraca);
}

.cartucho__link:focus-visible,
.cartucho__chip:focus-visible { outline: 3px solid var(--linha-dura); outline-offset: 3px; }

/* o convite a contribuir. Era `.botao .botao--destaque`, servido pelas
   regras globais da mesa; aqui tem nome próprio, porque um rodapé que
   aparece em cinco telas não pode depender da folha de nenhuma. */
.cartucho__acao {
  display: inline-block;
  font: inherit;
  padding: 0.5rem 1.2rem;
  font-size: 16.5px;
  color: var(--tinta-bloco);
  background: var(--amarelo);
  border: 2px solid var(--linha-dura);
  box-shadow: var(--sombra-dura);
  text-decoration: none;
  transition: transform 0.08s, box-shadow 0.08s;
}

.cartucho__acao:hover { transform: translate(4px, 4px); box-shadow: none; }
.cartucho__acao:focus-visible { outline: 3px solid var(--roxo); outline-offset: 3px; }

/* o carimbo vira uma coluna de campos empilhados: em 390px, seis
   células lado a lado dariam duas palavras de largura cada, e ele
   deixaria de ser legível como tabela */
@media (max-width: 900px) {
  .cartucho { grid-template-columns: 1fr; }
  .cartucho__campo,
  .cartucho__campo--larga,
  .cartucho__campo--vaga { grid-column: span 1; }
}
</style>
