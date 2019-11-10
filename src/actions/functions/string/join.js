import {
	ensureScalarArray,
	InputError
} from '../../validate';

function join (stdin, args) {
	if (!ensureScalarArray(stdin)) {
		throw new InputError('join', 'strings');
	}

	const delimeter = args[0] && args[0].type === 'string' ? args[0].value : ', ';
	const out = stdin.join(delimeter);
	return out;
};

export default join;