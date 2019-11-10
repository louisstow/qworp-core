import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function underline (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('underline');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && !node.attrs.underline) {
			const attrs = { ...node.attrs };
			attrs.underline = true;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default underline;