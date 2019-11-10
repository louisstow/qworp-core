import { SelectorResult } from '../../selector';

import {
	uniqueStdin
} from '../../utils';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function children (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('children');
	}

	const incl = (args[0] && args[0].type === 'ident' && args[0].value === 'incl');
	const children = [];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		block.children && block.children.forEach(c => {
			if (incl) {
				stdin.push(SelectorResult.fromBlock(c));
			} else {
				children.push(SelectorResult.fromBlock(c))
			}	
		});
	});

	return incl ? uniqueStdin(stdin) : children;
};

export default children;