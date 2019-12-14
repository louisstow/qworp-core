import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function addtag (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('addtag');
	}

	if (!args.length) {
		throw new ArgumentError('addtag', 'argument must have selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('addtag', 'argument must be selector');
	}

	const tag = args[0].values[0];
	const once = Boolean(args[1] && args[1].type === 'ident' && args[1].value === 'once');

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;
		const text = node.textContent;
		const tail = node.attrs.tail;
		const tailLen = node && tail && text.endsWith(tail) ? node.attrs.tail.length : 0;

		const exists = block.features.find(f => f.type === 'tag' && f.label === tag);
		if (once && exists) { return; }
		
		const charBefore = text.substr(text.length - tailLen - 1, 1);

		this.tr.insertText(
			(charBefore === ' ' ? '' : ' ') + tag,
			this.tr.mapping.map(b.to - tailLen - 1)
		);
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default addtag;