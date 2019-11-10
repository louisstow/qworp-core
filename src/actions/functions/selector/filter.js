import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

function filter (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('filter');
	}

	if (!args.length) {
		throw new ArgumentError('select', 'argument must have selector');
	}

	if (args[0].type !== 'selector' && args[0].type !== 'ident') {
		throw new ArgumentError('select', 'argument must be selector or keyword');
	}

	const type = args[0].type === 'selector' ? 'selector' : args[0].value;

	return stdin.filter(b => {
		const block = this.docStruct.find(b.from);
		const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;

		switch (type) {
			case 'visible':
				return node.attrs.visible;
			case 'hidden':
				return !node.attrs.visible;
			case 'empty':
				return node.textContent.substr(block.depth).length === 0;
			case 'notempty':
				return node.textContent.substr(block.depth).length > 0;
			case 'plaintext':
				return block.features.length === 0;
			case 'feature':
				return block.features.length > 0;
			case 'haschildren':
				return block.children.length > 0;
			case 'nochildren':
				return block.children.length === 0;
			case 'hascolor':
				return node.attrs.color !== '';
			case 'nocolor':
				return node.attrs.color === '';
			case 'hasbackground':
				return node.attrs.background !== '';
			case 'nobackground':
				return node.attrs.background === '';
			case 'hashead':
				return node.attrs.head !== '';
			case 'nohead':
				return node.attrs.head === '';
			case 'hastail':
				return node.attrs.tail !== '';
			case 'notail':
				return node.attrs.tail === '';
			case 'selector':
				const tags = args[0].values;

				return Boolean(block.features.find(
					f => f.type === 'tag' && tags.indexOf(f.label) !== -1
				));
		}

		return false;
	});
};

export default filter;