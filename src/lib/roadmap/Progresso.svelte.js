/* ============================================================
   O progresso de uma trilha, como estado reativo.

   Era o trio de objetos soltos no topo do app.js (`progresso`,
   `subMarcados`, `etapasFechadas`) mais sete funções que liam,
   gravavam e repintavam o DOM à mão. Aqui eles são $state: quem
   muda um valor não repinta nada, e quem mostra não sabe quem
   mudou.

   O banco é o único dono do progresso. O localStorage saiu: com
   dois donos do mesmo dado, a mesa contava de um e o mapa do outro,
   e eles divergiam sem que ninguém mentisse.

   Consequência aceita: sem conta não se marca nada. `podeMarcar`
   diz isso à tela, e as escritas saem pela porta sem fazer nada —
   antes de bloquear no componente, bloqueia aqui, para não depender
   de toda tela lembrar.

   Fechadas e `revelarPulados` continuam no localStorage: não são
   progresso, são como esta pessoa olha a trilha neste aparelho.
   ============================================================ */
import {
  chaveEtapas,
  chaveVista,
  chaveProgressoLegado,
  chaveSubLegado,
  ler,
  gravar,
} from "$lib/progresso.js";
import { sessao } from "$lib/conta/Sessao.svelte.js";
import { chaveSub as chaveDoSub } from "./subassuntos.js";
import {
  baixar,
  limparTrilha,
  salvarEstado,
  salvarSub,
  enviarTudo,
} from "./sincronia.svelte.js";

export const CICLO = ["pendente", "estudando", "feito", "pulado"];

/* glifos que a Departure Mono tem — ◔ e ✓ não estão nela. "pendente"
   deixa de ser vazio: o estado passa a ter forma, e não só cor. */
export const MARCAS = {
  pendente: "□",
  estudando: "►",
  feito: "■",
  pulado: "×",
};

export class Progresso {
  estados = $state({});
  sub = $state({});
  /* guarda o que foi FECHADO, não o que foi aberto: o padrão é a etapa
     aberta, então a ausência da chave — primeira visita, localStorage
     bloqueado — já cai no estado certo, sem valor inicial */
  fechadas = $state({});

  /* pulado sai do mapa por padrão: é o que a pessoa decidiu não fazer, e
     mantê-lo ocupando linha é lembrar de uma decisão já tomada. Quem
     revela é o chip, que também é o que explica a ausência — esconder
     sem explicar faz o tópico parecer inexistente. */
  revelarPulados = $state(false);

  constructor(trilha) {
    this.trilha = trilha;
  }

  /* quem já pode marcar. A tela pergunta antes de oferecer o gesto,
     e os métodos de escrita perguntam de novo — a primeira é
     cortesia, a segunda é a garantia. */
  #recusar() {
    this.recusas += 1;
  }

  get podeMarcar() {
    return sessao.conectado;
  }

  /* quantas vezes um gesto foi recusado por falta de conta. A tela
     observa o número e anuncia; a classe não sabe avisar ninguém, e
     um gesto que não faz nada e não diz nada parece defeito. */
  recusas = $state(0);

  /* true enquanto o banco não respondeu: o mapa nasce vazio e não
     deve parecer "nada marcado" para quem tem marcas */
  carregando = $state(false);

  /* só no navegador. A preferência de vista é local; o progresso vem
     do banco, e só dele. */
  carregar() {
    this.fechadas = ler(chaveEtapas(this.trilha)) || {};
    this.revelarPulados = !!(ler(chaveVista(this.trilha)) || {}).revelarPulados;
  }

  /* A leitura do progresso, agora que o banco é o único dono.
     Devolve o que aconteceu, porque a tela precisa saber:

       "sem-conta"  deslogado: o mapa fica vazio e não se marca nada
       "pronto"     o que está na conta passou a valer
       "importar"   a conta está vazia e este navegador guarda marcas
                    de antes do banco — a ponte de uma vez só, que
                    some quando ninguém mais tiver localStorage antigo */
  async sincronizar() {
    if (!sessao.conectado) {
      this.estados = {};
      this.sub = {};
      return "sem-conta";
    }

    this.carregando = true;
    const remoto = await baixar(this.trilha);
    this.carregando = false;
    if (!remoto) return "sem-conta";

    this.estados = remoto.estados;
    this.sub = remoto.sub;

    if (!Object.keys(remoto.estados).length && this.#temHeranca()) {
      return "importar";
    }
    return "pronto";
  }

  /* o que ficou de quando o progresso morava aqui. Lido uma vez, para
     oferecer a subida — nunca para desenhar o mapa. */
  #heranca() {
    const antigo =
      ler(chaveProgressoLegado(this.trilha)) ||
      (this.trilha === "ml" ? ler("roadmap-ml:progresso:v1") : null) ||
      {};
    const sub = ler(chaveSubLegado(this.trilha)) || {};
    return { estados: antigo, sub };
  }

  #temHeranca() {
    return Object.keys(this.#heranca().estados).length > 0;
  }

  /* "Levar": sobe a herança e passa a mostrá-la, já vinda da conta */
  async importarHeranca() {
    const { estados, sub } = this.#heranca();
    await enviarTudo(this.trilha, estados, sub);
    this.descartarHeranca();
    const remoto = await baixar(this.trilha);
    if (remoto) {
      this.estados = remoto.estados;
      this.sub = remoto.sub;
    }
  }

  /* "Começar limpo": a herança é apagada, senão a pergunta volta em
     toda visita e a recusa não teria efeito nenhum */
  descartarHeranca() {
    gravar(chaveProgressoLegado(this.trilha), null);
    gravar(chaveSubLegado(this.trilha), null);
    try {
      localStorage.removeItem(chaveProgressoLegado(this.trilha));
      localStorage.removeItem(chaveSubLegado(this.trilha));
      if (this.trilha === "ml") localStorage.removeItem("roadmap-ml:progresso:v1");
    } catch {
      /* bloqueado: nada a remover que importe */
    }
  }

  alternarPulados() {
    this.revelarPulados = !this.revelarPulados;
    gravar(chaveVista(this.trilha), { revelarPulados: this.revelarPulados });
  }

  /* ----------------------------- tópicos ----------------------------- */

  estadoDe(id) {
    return this.estados[id] || "pendente";
  }

  definir(id, estado) {
    if (!this.podeMarcar) return this.#recusar();
    const copia = { ...this.estados };
    if (estado === "pendente") delete copia[id];
    else copia[id] = estado;
    this.estados = copia;
    salvarEstado(this.trilha, id, estado);
  }

  ciclar(id) {
    const atual = this.estadoDe(id);
    this.definir(id, CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }

  get marcados() {
    return Object.keys(this.estados).length;
  }

  zerar() {
    if (!this.podeMarcar) return this.#recusar();
    this.estados = {};
    /* senão os subassuntos remarcariam tudo na primeira propagação */
    this.sub = {};
    limparTrilha(this.trilha);
  }

  /* --------------------------- subassuntos --------------------------- */

  subMarcado(topicoId, texto) {
    return !!this.sub[chaveDoSub(topicoId, texto)];
  }

  contarSub(topicoId, subs) {
    return subs.filter((t) => this.subMarcado(topicoId, t)).length;
  }

  alternarSub(topicoId, texto, subs) {
    if (!this.podeMarcar) return this.#recusar();
    const chave = chaveDoSub(topicoId, texto);
    const copia = { ...this.sub };
    if (copia[chave]) delete copia[chave];
    else copia[chave] = 1;
    this.sub = copia;
    salvarSub(this.trilha, topicoId, texto, !!copia[chave]);
    /* propagar pode mudar o estado do tópico, e `definir` manda a sua
       própria escrita: são duas idas ao banco porque são dois fatos */
    this.propagar(topicoId, subs);
  }

  /* o estado do tópico segue os subassuntos: o primeiro marcado põe em
     estudo, todos marcados concluem, desmarcar volta. "Pulado" é uma
     decisão explícita e fica imune — senão espiar um subassunto
     desfaria o que a pessoa decidiu pular. */
  propagar(topicoId, subs) {
    if (this.estadoDe(topicoId) === "pulado") return;

    const n = this.contarSub(topicoId, subs);
    const alvo = n === 0 ? "pendente" : n === subs.length ? "feito" : "estudando";

    if (this.estadoDe(topicoId) !== alvo) this.definir(topicoId, alvo);
  }

  /* ----------------------------- sanfona ----------------------------- */

  etapaAberta(etapaId) {
    return !this.fechadas[etapaId];
  }

  /* só o gesto explícito vira preferência; abrir pela busca ou pelo
     índice é navegação, e some quando a busca é limpa */
  alternarEtapa(etapaId, abrir) {
    const copia = { ...this.fechadas };
    if (abrir) delete copia[etapaId];
    else copia[etapaId] = 1;
    this.fechadas = copia;
    gravar(chaveEtapas(this.trilha), this.fechadas);
  }
}
