import {
	ensureArray,
	InputError
} from '../../validate';

function count (stdin, args) {
	if (!ensureArray(stdin)) {
		throw new InputError('count');
	}

	return stdin.length;
};

export default count;