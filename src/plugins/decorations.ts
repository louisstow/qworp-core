import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration, EditorView } from "prosemirror-view";

import { parse, ProgramStep } from "../actions/parse";
import Executor from "../actions/execute";

import allFunctions from "../actions/functions/all";
import {
  ButtonFeature,
  DocumentStructure,
  ImmFeature,
  TagFeature,
  TextFeature,
} from "../tree/document";

const buttonFn = (
  label: string,
  ast: ProgramStep[] | undefined,
  blockFrom: number,
  docStruct: DocumentStructure
) => {
  return (view: EditorView) => {
    let node = document.createElement("button");
    node.textContent = label;
    // @ts-ignore
    node.blockFrom = blockFrom;
    // @ts-ignore
    node.docStruct = docStruct;
    node.className = "button";

    // @ts-ignore
    node.code = ast;

    return node;
  };
};

const decorateButton = (
  docStruct: DocumentStructure,
  tr: Transaction,
  set: DecorationSet,
  f: ButtonFeature
) => {
  return set.add(tr.doc, [
    Decoration.inline(f.from, f.to, { class: "code button" }),
    Decoration.widget(
      f.from,
      buttonFn(f.label, f.ast, f.blockFrom, docStruct),
      { key: `${f.blockFrom}:${f.label}:${f.code}` }
    ),
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

    apply(tr, set) {
      const forceUpdate = tr.getMeta("forceUpdate");

      if (!tr.docChanged && !forceUpdate) {
        return set.map(tr.mapping, tr.doc);
      }

      const docStruct = tr.getMeta("docStruct");
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
          const exec = new Executor(
            // @ts-ignore
            node.code,
            // @ts-ignore
            node.blockFrom,
            view.state,
            {},
            // @ts-ignore
            node.docStruct,
            allFunctions
          );

          exec.setDomAtPos(view.domAtPos.bind(view));

          exec.execute();
          view.updateState(exec.currentState);
          // @ts-ignore
          view.shouldUpdate = exec.shouldUpdate;

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
