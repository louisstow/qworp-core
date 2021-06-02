import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";

import { DocumentStructure } from "../tree/document";
import { generateId } from "../tree/id";

const docStructPlugin = (docStructKey: PluginKey) =>
  new Plugin({
    key: docStructKey,
    state: {
      init(config, state: EditorState) {
        const newDocStruct = new DocumentStructure();
        newDocStruct.build(state);
        return newDocStruct;
      },

      apply(tr: Transaction, docStruct: DocumentStructure) {
        // no need to recompute doc struct
        const forceUpdate = Boolean(tr.getMeta("forceUpdate"));
        console.log("apply", tr.docChanged, tr.getMeta("forceUpdate"));
        if (!tr.docChanged && !forceUpdate) {
          tr.setMeta("docStruct", docStruct);
          return docStruct;
        }

        const newDocStruct = new DocumentStructure();
        newDocStruct.buildTree(tr);

        newDocStruct.list.forEach((blockA) => {
          const blockB = docStruct.findById(blockA.id);
          if (!blockB || !blockA.id) {
            // event on parent of blockA (NEW_CHILD)
            // need to extract features on blockA
            console.log("no block", blockA, blockB);
            newDocStruct.extractFeaturesOntoBlock(blockA);
            return;
          }

          // compare parent
          if (blockA.parent?.id !== blockB.parent?.id) {
            // event on parent of blockA (NEW_CHILD)
            console.log("different parent", blockA.parent, blockB.parent);
          }

          // compare text
          if (blockA.text !== blockB.text) {
            // extract features in blockA
            // maybe event
            console.log("different text");
            newDocStruct.extractFeaturesOntoBlock(blockA);
          } else {
            const blockDiff = blockA.from - blockB.from;
            blockA.cloneFeaturesFromBlock(blockB, blockDiff);
            blockA.features.forEach((f) => newDocStruct.features.push(f));
            console.log("clone features", blockDiff);
          }
        });

        tr.setMeta("docStruct", newDocStruct);
        return newDocStruct;
      },
    },

    appendTransaction(
      transactions: Transaction[],
      oldState: EditorState,
      newState: EditorState
    ) {
      const docChanged = transactions.some((t) => t.docChanged);
      if (!docChanged) {
        return;
      }

      const tr = newState.tr;
      const existingId: { [k: string]: true } = {};

      newState.doc.descendants((node, pos) => {
        if (!node.isBlock) {
          return;
        }

        const id = node.attrs.id as string;
        if (!id || existingId[id]) {
          const newId = generateId();
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: newId });
          existingId[newId] = true;
          console.log("generate id", pos, newId);
        } else if (id && !existingId[id]) {
          existingId[id] = true;
        }
      });

      return tr;
    },
  });

export default docStructPlugin;
