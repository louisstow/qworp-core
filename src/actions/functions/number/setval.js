import {
	ensureSelectorResult,
	ensureArray,
	ensureAnyScalar,
	InputError,
	ArgumentError
} from '../../validate';

import selectorFunctions from '../selectors';

function setval (stdin, args) {
	if (!ensureAnyScalar(stdin)) {
		throw new InputError('setval', 'scalar(s)');
	}

	if (!args.length) {
		throw new ArgumentError('setval', 'argument must have a selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('setval', 'argument must be a selector');
	}

	const tag = args[0].values[0];
	const target = args[1] && args[1].type === 'nested' ? 
		this.executeNewContext(args[1].value, selectorFunctions) : [ this.docStruct.find(this.blockFrom) ];
	const value = String(parseFloat((ensureArray(stdin) ? stdin[0] : stdin) || 0, 10));

	target.forEach(b => {
		const block = this.docStruct.find(b.from);

		block.features.filter(f => f.type === 'tag' && f.label === tag).forEach(f => {
			if (String(f.value) === value) { return; }
			const from = this.tr.mapping.map(f.from);
			const to = this.tr.mapping.map(f.to);
			this.tr.insertText(f.label + ':' + value, from, to);
		});
	});

	return stdin;
};

export default setval;