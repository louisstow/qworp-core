import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function background (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('background');
	}

	if (!args.length) {
		throw new ArgumentError('background', 'argument must have color string');
	}

	if (args[0].type !== 'string') {
		throw new ArgumentError('background', 'argument must have color string');
	}

	const color = args[0].value;

	if (/[^#0-9a-zA-Z]/.test(color)) {
		throw new ArgumentError('background', `argument has invalid color string (${color})`);
	}

	stdin.forEach(b => {
		const resolved = this.tr.doc.resolve(this.tr.mapping.map(b.from));
		const node = resolved.nodeAfter;

		if (node && node.attrs.background !== color) {
			const attrs = { ...node.attrs };
			attrs.background = color;
			this.tr.setNodeMarkup(this.tr.mapping.map(b.from), null, attrs);
		}
	});

	return stdin;
};

export default background;