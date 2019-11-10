import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function inc (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('inc');
	}

	if (!args.length) {
		throw new ArgumentError('inc', 'argument must have a selector');
	}

	if (args[0].type !== 'selector') {
		throw new ArgumentError('inc', 'argument must be a selector');
	}

	const target = args[0].values[0];
	
	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		block.features.filter(f => f.type === 'tag' && f.label === target).forEach(f => {
			const v = Number(f.value || 0) + 1;
			const from = this.tr.mapping.map(f.from);
			const to = this.tr.mapping.map(f.to);

			this.tr.insertText(f.label + ':' + v, from, to);
		});
	});	

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default inc;