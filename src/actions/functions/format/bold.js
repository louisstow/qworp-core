import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function bold (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('bold');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && !node.attrs.bold) {
			const attrs = { ...node.attrs };
			attrs.bold = true;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default bold;