import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function italic (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('italic');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && !node.attrs.italic) {
			const attrs = { ...node.attrs };
			attrs.italic = true;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default italic;