import {
	ensureAnyNumber,
	ensureArray,
	InputError
} from '../../validate';

function dollar (stdin, args) {
	if (!ensureAnyNumber(stdin)) {
		throw new InputError('dollar', 'number(s)');
	}

	const num = Number((ensureArray(stdin) ? stdin[0] : stdin) || 0);
	return '$' + String((num).toFixed(2));
};

export default dollar;