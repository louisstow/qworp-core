import { selectorNearest } from '../../selector';

import {
	ensureSelectorResult,
	ensureAnyNumber,
	ensureNumber,
	InputError,
	ArgumentError
} from '../../validate';

import { parseExpr, ExprExecutor } from '../../expr';

const prepareFromBlock = (mapping, from, docStruct) => {
	const block = docStruct.find(from);

	Object.keys(mapping).forEach(k => {
		let tag = block.features.find(f => f.type === 'tag' && f.label === k);
		if (!tag) {
			const nearestBlock = selectorNearest(docStruct, k, block);
			if (nearestBlock) {
				tag = nearestBlock.features.find(f => f.type === 'tag' && f.label === k);
			}
		}

		mapping[k] = tag ? Number(tag.value || 0) : 0;
	});

	return mapping;
}

function expr (stdin, args) {
	const isSelectorResult = ensureSelectorResult(stdin);

	if (!isSelectorResult && !ensureAnyNumber(stdin)) {
		throw new InputError('expr');
	}

	if (!args.length) {
		throw new ArgumentError('expr', 'arguments must have a string');
	}

	if (args[0].type !== 'string') {
		throw new ArgumentError('expr', 'argument must be a string');
	}

	const expr = args[0].value;

	if (!expr) { return; }

	const ast = parseExpr(expr);

	if (!ast) {
		return;
	}

	const out = [];
	const input = ensureNumber(stdin) ? [ stdin ] : stdin;

	input.forEach(b => {
		const exec = new ExprExecutor(ast);
		const mapping = exec.variables();

		if (isSelectorResult) {
			prepareFromBlock(mapping, b.from, this.docStruct);
		} else {
			mapping['#x'] = b;
		}
		
		exec.prepare(mapping);

		const evaluated = exec.evaluate()
		const num = evaluated.pop();
		if (!num) { return; }
		out.push(num.valueNum);
	});

	return out;
};

export default expr;