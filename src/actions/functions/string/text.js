import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function text (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('text');
	}

	const all = args[0] && args[0].type === 'ident' && args[0].value === 'all';
	const resultText = [];

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;
		const text = node.textContent;

		let strippedText = '';

		if (all) {
			strippedText += text;
		} else {
			let start = 0;
			block.features.forEach(f => {
				const from = f.from - b.from - 1;
				strippedText += text.substring(start, from);
				start = f.to - b.from - 1;
			});

			strippedText += text.substring(start, text.length);
		}

		resultText.push(strippedText);
	});

	return resultText;
};

export default text;