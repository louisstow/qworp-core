import {
	ensureSelectorResult,
	ensureNumberArray,
	InputError
} from '../../validate';

function min (stdin, args) {
	if (!ensureSelectorResult(stdin) && !ensureNumberArray(stdin)) {
		throw new InputError('min');
	}

	if (!stdin.length) {
		throw new InputError('min');
	}

	const isInputNum = ensureNumberArray(stdin);
	const isInputBlock = ensureSelectorResult(stdin);

	if (isInputNum) {
		return Math.min.apply(Math, stdin);
	}

	const target = args[0] && args[0].type === 'selector' && args[0].values[0];
	if (!target) return [];

	let minVal = Infinity;
	let minBlock = null;

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const tags = block.features.filter(f => f.type === 'tag' && f.label === target);

		tags.forEach(t => {
			const v = Number(t.value || 0);
			if (v < minVal) {
				minVal = v;
				minBlock = b;
			}
		});
	});

	if (minBlock) {
		return [ minBlock ]
	}

	return [];
};

export default min;