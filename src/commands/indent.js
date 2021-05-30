import { keymap } from "prosemirror-keymap";
import { baseKeymap, splitBlock } from "prosemirror-commands";
import { Slice, Fragment } from "prosemirror-model";
import { ReplaceStep } from "prosemirror-transform";

const countIndent = (s) => {
	let i = 0;
	while (s[i++] === '\t');
	return i - 1;
};

const createIndent = (n) => {
	let s = '';
	while (n--) s += '\t';
	return s;
};

function indent (state, dispatch) {
	let tr = state.tr;

	state.doc.nodesBetween(state.selection.from, state.selection.to, (n, i) => {
		tr.insertText("\t", tr.mapping.map(i + 1))
		return false;
	});

	if (dispatch) {
		dispatch(tr)
	}

	return true;
}

function unindent (state, dispatch) {
	let tr = state.tr;

	state.doc.nodesBetween(state.selection.from, state.selection.to, (n, i) => {
		if (n.textContent.charAt(0) == '\t') {
			const index = tr.mapping.map(i + 1);
			tr.insertText("", index, index + 1)	
		}
		return false;
	});

	if (dispatch) {
		dispatch(tr)
	}

	return true;
}

function enter (state, dispatch, view) {
	let indents = 0;
	let empty = false;

	state.doc.nodesBetween(state.selection.from, state.selection.from, (n, i) => {
		indents = countIndent(n.textContent);
		if (n.textContent.length === indents) {
			empty = true;
		}
	});

	baseKeymap['Enter'](state, dispatch);

	if (indents && !empty) {
		const tr = view.state.tr;
		const from = view.state.selection.from;

		tr.insertText(createIndent(indents), from);

		const resolved = tr.doc.resolve(from - 1);
		const node = resolved.nodeAfter;

		// reset head and tail attrs
		if (node) {
			const attrs = { ...node.type.defaultAttrs };
			attrs.head = '';
			attrs.tail = '';

			tr.setNodeMarkup(from - 1, null, attrs);
		}
		
		dispatch(tr);
	}
	
	return true;
}

function indentKeymap () {
	return keymap({
		"Tab": indent,
		"Shift-Tab": unindent,
		"Enter": enter
	});
}

export {
	createIndent,
	countIndent,
	indentKeymap
};