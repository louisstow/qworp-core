import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function color (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('color');
	}

	if (!args.length) {
		throw new ArgumentError('color', 'argument must have color string');
	}

	if (args[0].type !== 'string') {
		throw new ArgumentError('color', 'argument must have color string');
	}

	const color = args[0].value;

	if (/[^#0-9a-zA-Z]/.test(color)) {
		throw new ArgumentError('color', `argument has invalid color string (${color})`);
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && node.attrs.color !== color) {
			const attrs = { ...node.attrs };
			attrs.color = color;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default color;