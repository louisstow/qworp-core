import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function removetag (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('removetag');
	}

	if (!args.length) {
		throw new ArgumentError('removetag', 'argument must have selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('removetag', 'argument must be selector');
	}

	const tag = args[0].values[0];
	const all = Boolean(args[1] && args[1].type === 'ident' && args[1].value === 'all');

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const allTags = block.features.filter(f => f.type === 'tag' && f.label === tag);
		const tags = all ? allTags : allTags.slice(0, 1);

		tags.forEach(t => {
			const dest = this.tr.mapping.map(t.from);
			this.tr.insertText('', this.tr.mapping.map(t.from), this.tr.mapping.map(t.to))
			this.docStruct.build(this.tr);
		});
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default removetag;