const recurseTree = (n, fn) => {
	n.children.forEach(c => {
		fn(c);
		if (c.children && c.children.length) {
			recurseTree(c, fn);
		}
	});
};

const getUniqueSubtrees = (rootNodes) => {
	const visited = {};
	const unique = [];

	rootNodes.forEach(r => {
		if (visited[r.from]) {
			return;
		}

		recurseTree(r, (c) => {
			visited[c.from] = true;
		});

		unique.push(r);
	})
	
	return unique;
};

const uniqueStdin = (stdin) => stdin.filter((item, index) => stdin.indexOf(item) === index);

const createIndent = (n) => {
	let s = '';
	while (n--) s += '\t';
	return s;
};

export {
	recurseTree,
	getUniqueSubtrees,
	uniqueStdin,
	createIndent
};