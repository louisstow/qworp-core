import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { Slice, Fragment } from "prosemirror-model";
import { ReplaceStep } from "prosemirror-transform";
import type { EditorState, Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

import { generateId } from "../tree/id";
import { defaultAttrs } from "../schema";

type DispatchFn = (tr: Transaction) => void;

const countIndent = (s: string) => {
  let i = 0;
  while (s[i++] === "\t");
  return i - 1;
};

const createIndent = (n: number) => {
  let s = "";
  while (n--) s += "\t";
  return s;
};

function indent(state: EditorState, dispatch: DispatchFn | undefined) {
  let tr = state.tr;

  state.doc.nodesBetween(state.selection.from, state.selection.to, (n, i) => {
    tr.insertText("\t", tr.mapping.map(i + 1));
    return false;
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

function unindent(state: EditorState, dispatch: DispatchFn | undefined) {
  let tr = state.tr;

  state.doc.nodesBetween(state.selection.from, state.selection.to, (n, i) => {
    if (n.textContent.charAt(0) == "\t") {
      const index = tr.mapping.map(i + 1);
      tr.insertText("", index, index + 1);
    }
    return false;
  });

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

function enter(
  state: EditorState,
  dispatch: DispatchFn | undefined,
  view: EditorView | undefined
) {
  let indents = 0;
  let empty = false;

  state.doc.nodesBetween(state.selection.from, state.selection.from, (n, i) => {
    indents = countIndent(n.textContent);
    if (n.textContent.length === indents) {
      empty = true;
    }
  });

  baseKeymap["Enter"](state, dispatch);

  if (!view) {
    return true;
  }

  if (indents && !empty) {
    const tr = view.state.tr;
    const from = view.state.selection.from;

    tr.insertText(createIndent(indents), from);

    const resolved = tr.doc.resolve(from - 1);
    const node = resolved.nodeAfter;

    // reset head and tail attrs
    if (node) {
      const attrs = {
        ...defaultAttrs,
        id: node.attrs.id || generateId(),
      };

      tr.setNodeMarkup(from - 1, undefined, attrs);
    }

    if (dispatch) {
      dispatch(tr);
    }
  }

  return true;
}

function indentKeymap() {
  return keymap({
    Tab: indent,
    "Shift-Tab": unindent,
    Enter: enter,
  });
}

export { createIndent, countIndent, indentKeymap };
