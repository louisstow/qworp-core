import {
	ensureStringArray,
	InputError
} from '../../validate';

function trim (stdin, args) {
	if (!ensureStringArray(stdin)) {
		throw new InputError('trim', 'strings');
	}

	const out = stdin.map(t => {
		return t.trim();
	});

	return out;
};

export default trim;