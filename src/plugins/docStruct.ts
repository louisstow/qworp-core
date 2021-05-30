import { Plugin, PluginKey, Transaction } from "prosemirror-state";

import { DocumentStructure } from "../tree/document";

const docStructPlugin = (docStructKey: PluginKey) =>
  new Plugin({
    key: docStructKey,
    state: {
      init() {
        return new DocumentStructure();
      },

      apply(tr: Transaction, docStruct: DocumentStructure) {
        const invalidatedRanges = [];

        // tr.steps.forEach((s, i) => {
        //   const doc = tr.docs[i];
        //   const blocks = docStruct.findRange(s.from, s.to);

        //   console.log(s.toJSON());
        //   invalidatedRanges.push({ from: s.from, to: s.to });

        //   s.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
        //     console.log(">", oldStart, oldEnd, newStart, newEnd);
        //   });
        // });

        tr.setMeta("docStruct", docStruct);

        const forceUpdate = Boolean(tr.getMeta("forceUpdate"));
        if (!tr.docChanged && !forceUpdate) {
          return docStruct;
        }

        docStruct.build(tr);
        return docStruct;
      },
    },
  });

export default docStructPlugin;
