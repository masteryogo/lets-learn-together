<script>
  import { onMount } from "svelte";
  import { basicSetup } from "codemirror";
  import { python } from "@codemirror/lang-python";
  import { EditorState } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { oneDark } from "@codemirror/theme-one-dark";

  let { codigo = "", aoAlterar, editavel = true, rotulo = "Código Python" } = $props();
  let elemento;
  let editor;

  $effect(() => {
    if (!editor || editor.state.doc.toString() === codigo) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: codigo } });
  });

  onMount(() => {
    editor = new EditorView({
      parent: elemento,
      state: EditorState.create({
        doc: codigo,
        extensions: [
          basicSetup,
          python(),
          oneDark,
          EditorView.editable.of(editavel),
          EditorView.contentAttributes.of({ "aria-label": rotulo, spellcheck: "false" }),
          EditorView.updateListener.of((atualizacao) => {
            if (atualizacao.docChanged) aoAlterar?.(atualizacao.state.doc.toString());
          }),
        ],
      }),
    });

    return () => editor.destroy();
  });
</script>

<div class="editor-codigo" bind:this={elemento}></div>
