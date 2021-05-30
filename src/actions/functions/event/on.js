import { SelectorResult } from '../../selector';

import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

import {
	uniqueStdin,
	trimHead
} from '../../utils';

/*
#x | on NEW_CHILD | do things

events
	- NEW_CHILD
	- HIDDEN
	- SHOWN
	- 
*/
function on (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('on');
	}

	if (!args.length || args[0].type !== 'ident') {
		throw new ArgumentError('on', 'argument requires event');
	}

	const event = args[0].value;
	const out = [];

	stdin = uniqueStdin(stdin);

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);

		block.children.forEach(child => {
			const node = this.tr.doc.resolve(this.tr.mapping.map(child.from)).nodeAfter;
			if (node.attrs.new) {
				out.push(SelectorResult.fromBlock(child));
			}
		});
	});

	return out;
}

export default on;