import { SelectorResult } from '../../selector';

import {
	uniqueStdin
} from '../../utils';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function next (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('next');
	}

	let len = 1;

	if (args[0]) {
		if (args[0].type === 'number') {
			len = Number(args[0].value);
		} else if (args[0].type === 'ident' && args[0].value === 'all') {
			len = Infinity;
		}
	}

	let out = [];
	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		const index = block.parent.children.findIndex(c => c === block);
		if (index === -1) { return; }

		const start = index + 1;
		out = out.concat(block.parent.children.slice(start, start + len));
	});

	return uniqueStdin(out).map(b => SelectorResult.fromBlock(b));
}

export default next;