import { selector } from '../../selector';

import {
	InputError,
	ArgumentError
} from '../../validate';

function select (stdin, args) {
	if (!args.length) {
		throw new ArgumentError('select', 'argument must have selector');
	}

	const query = args[0];
	if (query.type !== 'selector') {
		throw new ArgumentError('select', 'argument must be selector');
	}

	if (stdin && stdin.length) {
		// dedupe results
		const results = selector(this.docStruct, query.values) || [];
		return stdin.concat(results.filter(r => stdin.indexOf(r) === -1));
	} else {
		return selector(this.docStruct, query.values) || [];
	}
};

export default select;