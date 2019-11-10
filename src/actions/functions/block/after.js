import { TextSelection } from 'prosemirror-state';

import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

import {
	uniqueStdin
} from '../../utils';

const trimHead = (text, head, tail) => {
	const trimmed = tail && text.endsWith(tail) ?
		text.substring(0, text.length - tail.length) : text;

	return head && trimmed.startsWith(head) ? 
				text.substr(head.length) : text;
};

function after (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('after');
	}

	if (!args.length) {
		throw new ArgumentError('after', 'argument must be a string');
	}

	if (args[0].type !== 'string') {
		throw new ArgumentError('after', 'argument must be a string');
	}

	stdin = uniqueStdin(stdin);

	const template = args[0].value;
	const once = args[1] && args[1].type === 'ident' && args[1].value === 'once';

	stdin.forEach((b, i) => {
		const block = this.docStruct.find(b.from);
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;
		
		if (!node || node.isText) {
			return;
		}

		const text = node.textContent.substr(block.depth);
		const tail = node.attrs.tail;
		const dest = this.tr.mapping.map(b.from) + node.textContent.length + 1;
		const trimmedText = trimHead(text, node.attrs.head, node.attrs.tail);

		if (once && tail) {
			return;
		}

		// tail exists, different to template
		if (tail !== template) {
			node.attrs.tail = template;
			const attrs = { ...node.attrs };
			attrs.tail = template;
			
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}

		if (tail && trimmedText.length && trimmedText.endsWith(tail) && tail !== template) {
			// replace
			this.tr.insertText(template, dest - tail.length, dest);
			return;
		}

		if (!trimmedText.endsWith(template)) {
			const selection = this.tr.selection;
			if (selection.from === dest && selection.empty) {
				// move selection behind inserted text
				this.tr.insertText(template, dest);
				this.tr.setSelection(TextSelection.create(this.tr.doc, dest));
			} else {
				this.tr.insertText(template, dest);
			}
		}
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default after;