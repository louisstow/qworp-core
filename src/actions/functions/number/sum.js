import {
	ensureScalarArray,
	InputError
} from '../../validate';

function sum (stdin, args) {
	if (!ensureScalarArray(stdin)) {
		throw new InputError('val', 'array of numbers');
	}

	let total = 0;
	stdin.forEach(n => {
		if (typeof n === 'number') {
			total += n;
		}
	});

	return total;
};

export default sum;