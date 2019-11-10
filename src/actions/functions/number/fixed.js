import {
	ensureAnyNumber,
	ensureArray,
	InputError
} from '../../validate';

function fixed (stdin, args) {
	if (!ensureAnyNumber(stdin)) {
		throw new InputError('fixed', 'number(s)');
	}

	const num = Number((ensureArray(stdin) ? stdin[0] : stdin) || 0);
	const fixed = args[0] && args[0].type === 'number' ? Number(args[0].value) : 0;
	return num.toFixed(fixed);
};

export default fixed;