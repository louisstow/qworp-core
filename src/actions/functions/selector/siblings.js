import { SelectorResult } from '../../selector';

import {
	uniqueStdin
} from '../../utils';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function siblings (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('siblings');
	}

	const siblings = [];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		block.parent && block.parent.children.forEach(c => {
			if (c !== block) {
				siblings.push(c);
			}
		});
	});

	return uniqueStdin(siblings).map(b => SelectorResult.fromBlock(b));
};

export default siblings;