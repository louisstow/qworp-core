import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function flatten (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('flatten');
	}

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		this.tr.insertText(
			'',
			this.tr.mapping.map(b.from) + 1, 
			this.tr.mapping.map(b.from) + block.depth + 1
		);
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default flatten;