import { TextSelection } from 'prosemirror-state';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

import {
	recurseTree
} from '../../utils';

function sort (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('sort');
	}

	const selectionFrom = this.tr.selection.from;
	let sortKey = 'alpha';
	let direction = 'asc';

	if (args.length === 2) {
		sortKey = args[0].type === 'selector' ? args[0].values[0] : args[0].value;
		direction = args[1].value === 'asc' || args[1].value === 'desc' ? args[1].value : 'asc';
	} else if (args.length === 1) {
		sortKey = 'alpha';
		direction = args[0].value === 'asc' || args[0].value === 'desc' ? args[0].value : 'asc';
	}

	const directionPolar = direction === 'desc' ? -1 : 1;

	stdin.forEach(b => {
		const block = this.docStruct.find(b.from);
		const destPos = this.tr.mapping.map(b.to);

		const sorted = [ ...block.children ];
		sorted.sort((a, b) => {
			const n1 = this.tr.doc.resolve(this.tr.mapping.map(a.from)).nodeAfter;
			const n2 = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;

			const t1 = n1.textContent.substr(a.depth);
			const t2 = n2.textContent.substr(b.depth);

			if (sortKey === 'alpha') {
				if ( t1 === '' || t2 === '' ) return 0;
				if ( n1.textContent < n2.textContent ) return -1 * directionPolar;
				if ( n1.textContent > n2.textContent ) return 1 * directionPolar;	
			} else {
				const aTag = a.features.find(f => f.label === sortKey);
				const bTag = b.features.find(f => f.label === sortKey);

				const aValue = Number(aTag && aTag.value || 0);
				const bValue = Number(bTag && bTag.value || 0);

				return (aValue - bValue) * directionPolar;
			}

			return 0;
		});

		// only continue if sorted != children
		const noChange = sorted.every((n, i) => n === block.children[i]);
		if (noChange) { return; }

		const nodes = [];

		block.children.forEach(c => {
			const node = this.tr.doc.resolve(this.tr.mapping.map(c.from)).nodeAfter;
			this.tr.delete(
				this.tr.mapping.map(c.from),
				this.tr.mapping.map(c.to)
			);
			
			nodes.push({ node, block: c, from: c.from });

			recurseTree(c, subc => {
				const node = this.tr.doc.resolve(this.tr.mapping.map(subc.from)).nodeAfter;
				this.tr.delete(
					this.tr.mapping.map(subc.from),
					this.tr.mapping.map(subc.to)
				);
				nodes.push({ node, block: subc, from: c.from });
			});
		});
		
		const cursorBlock = sorted.find(b => selectionFrom > b.from && selectionFrom < b.to);
		const offset = cursorBlock ? selectionFrom - cursorBlock.from : null;
		let cursorDest = null;

		let lastPos = destPos;
		sorted.forEach(c => {
			const insertNodes = nodes.filter(n => n.from === c.from);
			
			if (c === cursorBlock) {
				cursorDest = lastPos;
			}

			insertNodes.forEach(n => {
				this.tr.insert(lastPos, n.node);
				lastPos += n.node.nodeSize;
			});
		});

		if (cursorBlock && cursorDest !== null) {
			this.tr.setSelection(TextSelection.create(this.tr.doc, cursorDest + offset));
		}
	});

	return stdin;
};

export default sort;