import { Plugin, PluginKey } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";

import { parse } from '../actions/parse';
import Executor from '../actions/execute';

import allFunctions from '../actions/functions/all';

const buttonFn = (label, code, blockFrom, docStruct) => {
	return (view, getPos) => {
		let node = document.createElement("button");
		node.textContent = label;
		node.blockFrom = blockFrom;
		node.docStruct = docStruct;
		node.className = "button";

		try {
			node.code = parse(code);
		} catch (err) {
			docStruct.lastError = err;
		}
		
		return node;
	};
}

const generateDecorations = (docStruct, tr, set) => {
	set = DecorationSet.empty;

	docStruct.features.forEach(f => {
		if (f.type === 'button') {
			set = set.add(tr.doc, [
				Decoration.inline(f.from, f.to, {'class': 'code button'}),
				Decoration.widget(
					f.from,
					buttonFn(f.label, f.code, f.blockFrom, docStruct),
					{ key: `${f.blockFrom}:${f.label}:${f.code}` }
				)
			]);
		} else if (f.type === 'tag') {
			set = set.add(tr.doc, [
				Decoration.inline(f.from, f.to, {'class': 'hashtag'})
			]);
		} else if (f.type === 'imm') {
			set = set.add(tr.doc, [
				Decoration.inline(f.from, f.to, {'class': 'code immediate'})
			]);
		} else if (f.type === 'text') {
			const leftTextFrom = f.from;
			const leftTextTo = f.from + 1;
			const rightTextFrom = f.blockFrom + f.labelTo + 1;
			const rightTextTo = rightTextFrom + 1;
			const codeFrom = f.blockFrom + f.codeFrom + 1;
			set = set.add(tr.doc, [
				Decoration.inline(leftTextFrom, leftTextTo, {'class': 'code text-wrap'}),
				Decoration.inline(rightTextFrom, rightTextTo, {'class': 'code text-wrap'}),
				Decoration.inline(codeFrom, f.to, {'class': 'code text'})
			]);
		}
	});

	return set;
}

const decorationPlugin = new Plugin({
	state: {
		init (_, state) {
			return DecorationSet.empty;
		},

		apply (tr, set) {
			const forceUpdate = tr.getMeta("forceUpdate");

			if (!tr.docChanged && !forceUpdate) {
				return set.map(tr.mapping, tr.doc);
			}

			const docStruct = tr.getMeta("docStruct");
			return generateDecorations(docStruct, tr, set);
		}
	},

	props: {
		decorations (state) {
			return decorationPlugin.getState(state);
		},

		handleDOMEvents: {
			click (view, event) {
				if (event.target.tagName == "BUTTON") {
					const node = event.target;
					
					const exec = new Executor(
						node.code, 
						node.blockFrom, 
						view.state,
						{},
						node.docStruct,
						allFunctions
					);

					exec.setDomAtPos(view.domAtPos.bind(view));

					exec.execute();
					view.updateState(exec.currentState);
					view.shouldUpdate = exec.shouldUpdate;

					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			},

			mousedown (view, event) {
				if (event.target.tagName == "BUTTON") {
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
		}
	}
});

export default decorationPlugin;