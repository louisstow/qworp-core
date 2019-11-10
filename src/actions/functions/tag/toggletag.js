import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function toggletag (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('toggletag');
	}

	if (!args.length) {
		throw new ArgumentError('toggletag', 'argument must have selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('toggletag', 'argument must be selector');
	}

	const tag = args[0].values[0];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const tags = block.features.filter(f => f.type === 'tag' && f.label === tag);
		
		if (tags.length) {
			// remove tags
			tags.forEach(t => {
				const dest = this.tr.mapping.map(t.from);
				this.tr.insertText('', this.tr.mapping.map(t.from), this.tr.mapping.map(t.to));
				this.docStruct.build(this.tr);
			});
		} else {
			// add tag
			const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;
			const tailLen = node ? node.attrs.tail.length : 0;

			const text = node.textContent;
			const charBefore = text.substr(text.length - tailLen - 1, 1);

			this.tr.insertText(
				(charBefore === ' ' ? '' : ' ') + tag,
				this.tr.mapping.map(b.to - tailLen - 1)
			);
		}
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default toggletag;