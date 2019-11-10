import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function slice (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('slice');
	}

	let from, to;

	if (args.length === 2) {
		from = Number(args[0].value);
		to = Number(args[1].value);
	} else if (args.length === 1) {
		from = Number(args[0].value);
		to = stdin.length;
	} else {
		throw new ArgumentError('slice', 'argument must be: from to')
	}

	if (from < 0) {
		from = stdin.length + from;
		if (to < 0) {
			// error
			return [];
		}
	}

	if (to < 0) {
		to = stdin.length + to;
		if (to < 0) {
			// error
			return [];
		}
	}
	
	return stdin.slice(from, to);
};

export default slice;