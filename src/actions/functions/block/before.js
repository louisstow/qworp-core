import { TextSelection } from "prosemirror-state";

import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

import {
	uniqueStdin
} from '../../utils';

const trimTail = (text, head, tail) => {
	const trimmed = head && text.startsWith(head) ?
		text.substr(head.length) : text;

	return tail && trimmed.endsWith(tail) ? 
				text.substring(0, text.length - tail.length) : text;
};

function before (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('before');
	}

	if (!args.length) {
		throw new ArgumentError('before', 'argument must be a string');
	}

	if (args[0].type !== 'string') {
		throw new ArgumentError('before', 'argument must be a string');
	}

	const once = args[1] && args[1].type === 'ident' && args[1].value === 'once';

	stdin = uniqueStdin(stdin);

	const template = args[0].value;

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;
		
		if (!node || node.isText) {
			return;
		}

		const text = node.textContent.substr(block.depth);
		const head = node.attrs.head;
		const dest = this.tr.mapping.map(b.from) + block.depth + 1;

		const trimmedText = trimTail(text, node.attrs.head, node.attrs.tail);

		if (once && head) {
			return;
		}

		// head exists, different to template
		if (head !== template) {
			node.attrs.head = template;
			const attrs = { ...node.attrs };
			attrs.head = template;
			
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}

		if (head && trimmedText.length && trimmedText.startsWith(head) && head !== template) {
			// replace
			this.tr.insertText(template, dest, dest + head.length);
			return;
		}

		if (!trimmedText.startsWith(template)) {
			this.tr.insertText(template, dest);
		}
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default before;