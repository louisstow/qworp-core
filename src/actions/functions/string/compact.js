import {
	ensureStringArray,
	InputError
} from '../../validate';

function compact (stdin, args) {
	if (!ensureStringArray(stdin)) {
		throw new InputError('compact', 'strings');
	}

	const out = stdin.map(t => {
		return t.replace(/\s+/g, ' ').trim();
	});

	return out;
};

export default compact;