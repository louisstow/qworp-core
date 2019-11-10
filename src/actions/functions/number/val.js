import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function val (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('val');
	}

	if (!args.length) {
		throw new ArgumentError('val', 'arguments must have a selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('set', 'argument must be a selector');
	}

	const result = [];
	const tag = args[0] && args[0].type === 'selector' ? args[0].values[0] : null;
	const all = args[1] && args[1].type === 'ident' && args[1].value === 'all';

	if (!tag) {
		return [];
	}

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		const allTags = block.features.filter(f => f.type === 'tag' && f.label === tag);
		const tags = all ? allTags : allTags.slice(0, 1);
		if (!tags.length) return;

		tags.forEach(t => {
			result.push(Number(t.value || 0));	
		});
	});

	return result;
};

export default val;