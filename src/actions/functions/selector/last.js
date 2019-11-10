import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function last (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('last');
	}

	return stdin.length ? [ stdin[stdin.length - 1] ] : [];
};

export default last;