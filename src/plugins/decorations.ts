import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration, EditorView } from "prosemirror-view";

import { parse, ProgramStep } from "../actions/parse";
import Executor from "../actions/execute";

import { NEEDS_EXECUTE } from "../events";

import allFunctions from "../actions/functions/all";
import {
  ButtonFeature,
  DocumentStructure,
  ImmFeature,
  TagFeature,
  TextFeature,
} from "../tree/document";

const buttonHandler: {
  [k: string]: (state: EditorState) => Executor | undefined;
} = {};

const decorateButton = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet,
  f: ButtonFeature
) => {
  const key = `${f.blockFrom}:${f.label}:${f.code}`;
  const node = document.createElement("button");
  node.id = key;
  node.className = "button";
  node.textContent = f.label;

  buttonHandler[key] = (state: EditorState) => {
    return (
      f.ast &&
      new Executor(f.ast, f.blockFrom, state, {}, docStruct, allFunctions)
    );
  };

  return set.add(tr.doc, [
    Decoration.inline(f.from, f.to, { class: "code button" }),
    Decoration.widget(f.from, node, { key }),
  ]);
};

const decorateText = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet,
  f: TextFeature
) => {
  const leftTextFrom = f.from;
  const leftTextTo = f.from + 1;
  const rightTextFrom = f.blockFrom + f.labelTo + 1;
  const rightTextTo = rightTextFrom + 1;
  const codeFrom = f.blockFrom + f.codeFrom + 1;

  return set.add(tr.doc, [
    Decoration.inline(leftTextFrom, leftTextTo, {
      class: "code text-wrap",
    }),
    Decoration.inline(rightTextFrom, rightTextTo, {
      class: "code text-wrap",
    }),
    Decoration.inline(codeFrom, f.to, { class: "code text" }),
  ]);
};

const decorateImm = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet,
  f: ImmFeature
) => {
  return set.add(tr.doc, [
    Decoration.inline(f.from, f.to, { class: "code immediate" }),
  ]);
};

const decorateTag = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet,
  f: TagFeature
) => {
  return set.add(tr.doc, [
    Decoration.inline(f.from, f.to, { class: "hashtag" }),
  ]);
};

const generateDecorations = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet
) => {
  set = DecorationSet.empty;

  docStruct.features.forEach((f) => {
    if (f.type === "button") {
      set = decorateButton(docStruct, tr, set, f);
    } else if (f.type === "tag") {
      set = decorateTag(docStruct, tr, set, f);
    } else if (f.type === "imm") {
      set = decorateImm(docStruct, tr, set, f);
    } else if (f.type === "text") {
      set = decorateText(docStruct, tr, set, f);
    }
  });

  return set;
};

const decorationPlugin: Plugin = new Plugin({
  state: {
    init(_, state) {
      return DecorationSet.empty;
    },

    apply(tr, set: DecorationSet) {
      const forceUpdate = Boolean(tr.getMeta("forceUpdate"));

      if (!tr.docChanged && !forceUpdate) {
        return set.map(tr.mapping, tr.doc);
      }

      const docStruct = tr.getMeta("docStruct") as DocumentStructure;
      return generateDecorations(docStruct, tr, set);
    },
  },

  props: {
    decorations(state) {
      return decorationPlugin.getState(state);
    },

    handleDOMEvents: {
      click(view: EditorView, event: MouseEvent): boolean {
        const node = event?.target as HTMLElement;

        if (node?.tagName == "BUTTON") {
          const exec = buttonHandler[node.id]?.(view.state);
          if (!exec) {
            return false;
          }

          exec.setDomAtPos(view.domAtPos.bind(view));

          exec.execute();
          view.updateState(exec.currentState);

          if (exec.docChanged) {
            window.dispatchEvent(new Event(NEEDS_EXECUTE));
          }

          event.stopPropagation();
          event.preventDefault();
          return false;
        }

        return true;
      },

      mousedown(view: EditorView, event: MouseEvent) {
        const node = event?.target as HTMLElement;

        if (node?.tagName == "BUTTON") {
          event.stopPropagation();
          event.preventDefault();
          return false;
        }

        return true;
      },
    },
  },
});

export default decorationPlugin;
