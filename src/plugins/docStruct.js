import { Plugin } from "prosemirror-state";

import DocumentStructure from '../tree/document';

const docStructPlugin = docStructKey => new Plugin({
	key: docStructKey,
 	state: {
 		init () {
 			return new DocumentStructure;
 		},

 		apply (tr, docStruct) {
 			tr.setMeta('docStruct', docStruct);

 			const forceUpdate = tr.getMeta("forceUpdate");
 			if (!tr.docChanged && !forceUpdate) {
 				return docStruct;
 			}
 			
 			docStruct.build(tr);
 			
 			return docStruct;
 		}
 	}
});

export default docStructPlugin;