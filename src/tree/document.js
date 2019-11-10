import { extract } from '../plugins/extract';

import { parse } from '../actions/parse';

import { countIndent } from '../commands/indent';

class Block {
	constructor () {
		this.from = 0;
		this.to = 0;
		this.depth = 0;
		this.size = 0;
		this.parent = null;
		this.children = [];
		this.features = [];
	}
	
	addChild (node) {
		this.children.push(node);
		node.parent = this;
	};
}

class DocumentStructure {
	constructor () {
		this.reset();
		this.lastError = null;
	}

	reset () {
		this.index = {};
		this.features = [];
		this.root = null;
	}

	getLastError () {
		return this.lastError;	
	}

	recurseTree (node, fn) {
		for (let i = 0; i < node.children.length; ++i) {
			const b = node.children[i];
			let result = fn(b);

			if (result === false) {
				return false;
			}

			if (b.children && b.children.length) {
				result = this.recurseTree(b, fn);
				if (result === false) {
					return false;
				}
			}
		}
	}

	find (pos) {
		let result;
		this.recurseTree(this.root, b => {
			if (b.from === pos) {
				result = b;
				return false;
			}
		});

		return result;
	}

	build (state) {
		this.reset();

		let rootBlock = new Block;
		let previousDepth = -1;
		let blockStack = [rootBlock];
		
		state.doc.descendants((node, pos) => {
			if (!node.isBlock) return;
			
			let line = node.textContent;
			let depth = countIndent(line);
			let block = new Block;

			block.from = pos;
			block.to = pos + node.nodeSize;
			block.depth = depth;
			block.size = node.nodeSize;

			const features = extract(node.textContent);
			features.forEach(f => {
				if (f.type === 'tag') {
					if (!this.index[f.label])
						this.index[f.label] = [];
					
					// only add block once
					if (this.index[f.label].indexOf(block) === -1)
						this.index[f.label].push(block);
				} else if (f.type === 'imm' || f.type === 'text') {
					try {
						const ast = parse(f.code);
						f.ast = ast;
					} catch (err) {
						this.lastError = err;
					}
				}

				// increment by 1 because textnode lives 
				// 1 position further than the blocknode
				f.from += pos + 1;
				f.to += pos + 1;
				f.blockFrom = block.from;
				f.block = block;
				this.features.push(f);
				block.features.push(f);
			});

			if (depth > previousDepth) {
				blockStack[blockStack.length - 1].addChild(block);
				blockStack.push(block);
				previousDepth = depth;
			} else if (depth == previousDepth) {
				blockStack.pop();
				blockStack[blockStack.length - 1].addChild(block);
				blockStack.push(block);
			} else if (depth < previousDepth) {
				blockStack[depth].addChild(block);
				previousDepth = depth;
				blockStack.length = depth + 1;
				blockStack.push(block)
			}
		});

		this.root = rootBlock;
	}
}

export default DocumentStructure;