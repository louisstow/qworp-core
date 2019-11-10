import { selector } from '../../selector';

import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function not (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('not', 'block');
	}

	if (!args.length) {
		throw new ArgumentError('not', 'argument must be a selector or this');
	}

	const query = args[0];
	let results;

	if (query.type === 'selector') {
		results = selector(this.docStruct, query.values) || [];
	} else if (query.type === 'ident' && query.value === 'this') {
		results = [this.docStruct.find(this.blockFrom)];
	}

	return stdin.filter(r => results.findIndex(x => x.from === r.from) === -1);
}

export default not;