import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function strikethrough (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('strikethrough');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && !node.attrs.strikethrough) {
			const attrs = { ...node.attrs };
			attrs.strikethrough = true;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default strikethrough;