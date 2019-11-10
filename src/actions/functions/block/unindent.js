import {
	ensureSelectorResult,
	InputError
} from '../../validate';

import {
	createIndent
} from '../../utils';

function unindent (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('unindent');
	}

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		this.tr.insertText(
			createIndent(block.depth - 1),
			this.tr.mapping.map(b.from) + 1, 
			this.tr.mapping.map(b.from) + block.depth + 1
		);
	});

	return stdin.map(b => b.applyMapping(this.tr.mapping));
};

export default unindent;