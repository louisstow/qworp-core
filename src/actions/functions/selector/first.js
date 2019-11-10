import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function first (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('first');
	}

	return [ stdin[0] ];
};

export default first;