import { SelectorResult } from '../../selector';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function duplicate (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('duplicate');
	}

	const duplicates = [];

	stdin.forEach(b => {
		const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;
		const dest = this.tr.mapping.map(b.to);
		this.tr.insert(dest, node);

		duplicates.push(new SelectorResult(dest, dest + node.nodeSize));
	});

	return duplicates;
};

export default duplicate;