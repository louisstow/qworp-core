import { SelectorResult } from '../../selector';

import {
	recurseTree
} from '../../utils';

function all (stdin, args) {
	const out = [];
	recurseTree(this.docStruct.root, n => {
		out.push(SelectorResult.fromBlock(n));
	});

	return out;
};

export default all;