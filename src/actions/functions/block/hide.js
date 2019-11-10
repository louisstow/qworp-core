import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function hide (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('hide');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));

		const node = resolved.nodeAfter;
		if (node && node.attrs.visible) {
			const attrs = { ...node.attrs };
			attrs.visible = false;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default hide;