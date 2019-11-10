import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function toggle (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('toggle');
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node) {
			const attrs = { ...node.attrs };
			attrs.visible = !node.attrs.visible;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}			
	});

	return stdin;
};

export default toggle;