import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function clearformat (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('clearformat');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node) {
			const attrs = { ...node.attrs };
			attrs.bold = false;
			attrs.italic = false;
			attrs.underline = false;
			attrs.strikethrough = false;
			attrs.color = '';
			attrs.background = '';

			if (JSON.stringify(attrs) === JSON.stringify(node.attrs)) {
				return;
			}
			
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default clearformat;