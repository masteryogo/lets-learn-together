#!/usr/bin/env python3
"""Gera a migration de uma trilha a partir do conteudo em JSON.

Existe porque todo caminho manual aqui tem uma armadilha silenciosa: aspas
no JSON, id de tópico repetido (duas linhas de progresso_topico colidindo na
mesma chave) e campo fora do esquema, que a tela ignora sem erro nenhum.

    python gerar-migration.py conteudo.json --id rust --rotulo Rust \
        --cor '#8a4a2d' --ordem 30 --categoria ferramenta \
        > supabase/migrations/<ts>_trilha_rust.sql
"""
import argparse, json, sys, datetime

TOPICO = {"id", "titulo", "prioridade", "desc", "detalhe", "subtopicos"}
ETAPA = {"id", "numero", "titulo", "objetivo", "descricao",
         "preRequisitos", "duracao", "grupos"}
TOPO = {"ROADMAP", "PROJETOS", "RECURSOS", "LEGENDA", "ESTADOS", "CRITERIOS"}
PRIORIDADES = {"fundamental", "importante", "opcional"}


def validar(doc):
    """Devolve a lista de problemas. Nenhum deles dá erro em produção — é
    por isso que precisam de alguém que os procure."""
    erros = []
    if set(doc) != TOPO:
        erros.append(f"chaves de topo: falta {TOPO - set(doc)}, sobra {set(doc) - TOPO}")

    vistos, etapas = {}, doc.get("ROADMAP", {}).get("etapas", [])
    for e in etapas:
        if set(e) - ETAPA:
            erros.append(f"etapa {e.get('id')}: campo fora do esquema {set(e) - ETAPA}")
        for g in e.get("grupos", []):
            for t in g.get("topicos", []):
                if set(t) - TOPICO:
                    erros.append(f"tópico {t.get('id')}: campo fora do esquema {set(t) - TOPICO}")
                if not all(t.get(k) for k in ("id", "titulo", "prioridade", "desc", "detalhe")):
                    erros.append(f"tópico {t.get('id')}: campo obrigatório vazio")
                if t.get("prioridade") not in PRIORIDADES:
                    erros.append(f"tópico {t.get('id')}: prioridade {t.get('prioridade')!r}")
                if t["id"] in vistos:
                    erros.append(f"id repetido: {t['id']} (apaga progresso do outro)")
                vistos[t["id"]] = True
    return erros, len(etapas), sum(len(e.get("grupos", [])) for e in etapas), len(vistos)


def tag_livre(texto):
    """Escolhe um rótulo de dollar-quoting que não ocorra no texto."""
    for tag in ("json", "j1", "j2", "j3"):
        if f"${tag}$" not in texto:
            return tag
    raise SystemExit("nenhum rótulo de dollar-quoting livre")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("conteudo")
    p.add_argument("--id", required=True)
    p.add_argument("--rotulo", required=True)
    p.add_argument("--cor", required=True)
    p.add_argument("--ordem", type=int, default=0)
    # obrigatória e sem default: a coluna no banco é not null sem default
    # pelo mesmo motivo — trilha que não diz o que é apareceria na gaveta
    # errada sem erro nenhum para avisar
    p.add_argument("--categoria", required=True, choices=("papel", "ferramenta"),
                   help="papel = um cargo que se quer ter; "
                        "ferramenta = uma tecnologia específica")
    p.add_argument("--rota", default="[[32,198],[96,168],[152,118],[216,94],[272,46]]")
    p.add_argument("--rascunho", action="store_true",
                   help="publicada = false: fica fora da mesa até você publicar")
    a = p.parse_args()

    # o console do Windows é cp1252 e o conteúdo é UTF-8: sem isto o script
    # morre na impressão, depois de já ter validado tudo
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

    doc = json.load(open(a.conteudo, encoding="utf-8"))
    erros, ne, ng, nt = validar(doc)
    if erros:
        print("\n".join("  - " + e for e in erros), file=sys.stderr)
        raise SystemExit(f"{len(erros)} problema(s); nada foi gerado")

    rota = json.loads(a.rota)
    if len(rota) != 5 or not all(0 <= x <= 300 and 0 <= y <= 240 for x, y in rota):
        raise SystemExit("rota: 5 pares dentro do quadro 300x240")

    blob = json.dumps(doc, ensure_ascii=False)
    tag = tag_livre(blob)
    print(f"""-- {datetime.date.today():%d/%m/%Y} — a trilha {a.id}.
--
-- <por que esta trilha existe, em uma ou duas frases>
--
-- {ne} etapas, {ng} grupos, {nt} tópicos — contagem conferida aqui, mas quem
-- a grava é o gatilho trilha_contagem, não este insert.

insert into public.trilha (id, rotulo, cor, rota, categoria, ordem, publicada,
                           conteudo)
values ('{a.id}', '{a.rotulo}', '{a.cor}',
        '{json.dumps(rota)}'::jsonb, '{a.categoria}', {a.ordem},
        {str(not a.rascunho).lower()},
        ${tag}${blob}${tag}$::jsonb);""")
    print(f"{ne} etapas, {ng} grupos, {nt} tópicos", file=sys.stderr)


if __name__ == "__main__":
    main()
