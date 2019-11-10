import {
	ensureSelectorResult,
	ensureNumberArray,
	InputError
} from '../../validate';

function max (stdin, args) {
	if (!ensureSelectorResult(stdin) && !ensureNumberArray(stdin)) {
		throw new InputError('max');
	}

	if (!stdin.length) {
		throw new InputError('max');
	}

	const isInputNum = ensureNumberArray(stdin);
	const isInputBlock = ensureSelectorResult(stdin);

	if (isInputNum) {
		return Math.max.apply(Math, stdin);
	}

	const target = args[0] && args[0].type === 'selector' && args[0].values[0];
	if (!target) return [];

	let maxVal = -Infinity;
	let maxBlock = null;

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const tags = block.features.filter(f => f.type === 'tag' && f.label === target);

		tags.forEach(t => {
			const v = Number(t.value || 0);
			if (v > maxVal) {
				maxVal = v;
				maxBlock = b;
			}
		});
	});

	if (maxBlock) {
		return [ maxBlock ]
	}

	return [];
};

export default max;