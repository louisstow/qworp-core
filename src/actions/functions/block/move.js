import { selector, SelectorResult } from '../../selector';

import {
	getUniqueSubtrees,
	createIndent,
	recurseTree
} from '../../utils';

import {
	ensureSelectorResult,
	InputError,
	ArgumentError
} from '../../validate';

import selectorFunctions from '../selectors';

function move (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('move');
	}

	if (!args.length) {
		throw new ArgumentError('move', 'argument requires destination selector');
	}

	if (args[0].type !== 'nested') {
		throw new ArgumentError('move', 'argument requires destination as a backtick selector');
	}

	const target = this.executeNewContext(args[0].value, selectorFunctions);
	
	if (!target || !target.length || !ensureSelectorResult(target)) { 
		return stdin;
	}

	const dest = this.docStruct.find(target[0].from);
	let destPos = dest.to;

	const subtrees = getUniqueSubtrees(stdin.map(b => this.docStruct.find(b.from)));

	// get the last position of dest tree
	if (dest.children.length) {
		let n = dest;
		do {
			destPos = n.to;
		} while (n.children && n.children.length && (n = n.children[n.children.length - 1]));
	}

	const nodes = [];

	// remove all nodes for moving
	subtrees.forEach(b => {
		const block = this.docStruct.find(b.from);
		const depthDiff = (dest.depth - block.depth);

		const node = this.tr.doc.resolve(this.tr.mapping.map(b.from)).nodeAfter;
		nodes.push({ block, node, depthDiff, isRoot: true });
		this.tr.delete(
			this.tr.mapping.map(b.from),
			this.tr.mapping.map(b.to)
		);
		
		recurseTree(block, c => {
			const node = this.tr.doc.resolve(this.tr.mapping.map(c.from)).nodeAfter;
			nodes.push({ block: c, node, depthDiff });
			this.tr.delete(
				this.tr.mapping.map(c.from),
				this.tr.mapping.map(c.to)
			);
		});
	});

	const movedBlocks = [];
	let lastPos = this.tr.mapping.map(destPos);
	nodes.forEach(({block, node, depthDiff, isRoot}) => {
		this.tr.insert(lastPos, node);
		this.tr.insertText(
			createIndent(block.depth + depthDiff + 1), 
			lastPos + 1,
			lastPos + block.depth + 1
		);

		if (isRoot) {
			movedBlocks.push(new SelectorResult(lastPos, lastPos + node.nodeSize))	
		}
		
		lastPos += node.nodeSize + (depthDiff + 1);
	});

	return movedBlocks;
};

export default move;