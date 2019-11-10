import {
	ensureScalarArray,
	InputError
} from '../../validate';

function avg (stdin, args) {
	if (!ensureScalarArray(stdin)) {
		throw new InputError('avg', 'array of numbers');
	}

	let total = 0;
	let len = 0;

	stdin.forEach(n => {
		if (typeof n === 'number') {
			total += n;
			len++;
		}
	});

	return total / len;
};

export default avg;