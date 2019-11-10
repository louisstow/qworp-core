class SelectorResult {
	constructor (from, to) {
		this.from = from;
		this.to = to;
		this.history = [];
	}

	toJSON () {
		return { from: this.from, to: this.to };
	}

	applyMapping (mapping) {
		this.history.push(this.toJSON());
		this.from = mapping.map(this.from);
		this.to = mapping.map(this.to);

		return this;
	}

	static fromBlock (block) {
		return new SelectorResult(block.from, block.to);
	}
}


// query: ['#A', '#B']
const selector = (docStruct, query) => {
	let results = docStruct.index[query[0]];
	let i = 1;

	// clone array
	if (results && results.length) {
		results = results.slice(0);
	} else {
		results = [];
	}
	
	while (i < query.length) {
		const blocks = docStruct.index[query[i]] || [];
		results = results.filter(r => blocks.indexOf(r) !== -1);
		i++;
	}

	return results.map(r => new SelectorResult(r.from, r.to));
};

const selectorNearest = (docStruct, tag, node) => {
	// check parents
	let parent = node.parent;
	do {
		const t = parent.features.find(f => f.type === 'tag' && f.value === tag);
		if (t) {
			return parent;
		}
	} while (parent = parent.parent);

	// check descendants
	let childBlock;
	docStruct.recurseTree(node, c => {
		const t = c.features.find(f => f.type === 'tag' && f.value === tag);
		if (t) {
			childBlock = c;
			return false;
		}
	});

	if (childBlock) {
		return childBlock;
	}

	// grab first in the global index
	const tags = docStruct.index[tag];
	if (!tags || !tags.length) { return; }

	return tags[0];
};

export { selector, selectorNearest, SelectorResult };