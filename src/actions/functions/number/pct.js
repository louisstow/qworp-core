import {
	ensureAnyNumber,
	ensureArray,
	InputError
} from '../../validate';

function pct (stdin, args) {
	if (!ensureAnyNumber(stdin)) {
		throw new InputError('pct', 'number(s)');
	}

	const num = Number((ensureArray(stdin) ? stdin[0] : stdin) || 0);
	const fixed = args[0] && args[0].type === 'number' ? Number(args[0].value) : 0;
	return String((num * 100).toFixed(fixed)) + "%";
};

export default pct;