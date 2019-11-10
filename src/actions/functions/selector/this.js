import { SelectorResult } from '../../selector';

import {
	ensureSelectorResult
} from '../../validate';

function thisFn (stdin, args) {
	if (ensureSelectorResult(stdin)) {
		stdin.push(SelectorResult.fromBlock(this.docStruct.find(this.blockFrom)));
		return stdin;
	}

	return [ SelectorResult.fromBlock(this.docStruct.find(this.blockFrom)) ];
};

export default thisFn;