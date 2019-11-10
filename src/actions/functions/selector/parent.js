import { SelectorResult } from '../../selector';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function parent (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('parent');
	}

	const incl = (args[0] && args[0].type === 'ident' && args[0].value === 'incl');
	const parents = [];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const p = block.parent;
		if (p === this.docStruct.root) return;

		if (incl) {
			stdin.push(SelectorResult.fromBlock(block.parent));
		} else {
			parents.push(SelectorResult.fromBlock(block.parent))
		}
	});

	return incl ? stdin : parents;
}

export default parent;