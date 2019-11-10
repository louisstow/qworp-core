import { SelectorResult } from '../../selector';

import {
	uniqueStdin,
	recurseTree
} from '../../utils';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function descendants (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('descendants');
	}

	const incl = (args[0] && args[0].type === 'ident' && args[0].value === 'incl');
	const out = [];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		recurseTree(block, d => {
			if (incl) {
				stdin.push(SelectorResult.fromBlock(d));
			} else {
				out.push(SelectorResult.fromBlock(d));
			}
		});
	});

	return incl ? uniqueStdin(stdin) : out;
};

export default descendants;