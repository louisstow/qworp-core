import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function remove (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('remove');
	}

	stdin.forEach(b => {
		this.tr.delete(this.tr.mapping.map(b.from), this.tr.mapping.map(b.to));
	});

	return [];
};

export default remove;