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

// remove the head of the text
// note: this does not trim the tail
const trimHead = (text, head, tail) => {
	const trimmedTail = tail && text.endsWith(tail) ?
		text.substring(0, text.length - tail.length) : text;

	return head && trimmedTail.startsWith(head) ? 
				text.substr(head.length) : text;
};

// remove the tail of the text
// note: this does not trim the head
const trimTail = (text, head, tail) => {
	const trimmedHead = head && text.startsWith(head) ?
		text.substr(head.length) : text;

	return tail && trimmedHead.endsWith(tail) ? 
				text.substring(0, text.length - tail.length) : text;
};

export {
	recurseTree,
	getUniqueSubtrees,
	uniqueStdin,
	createIndent,
	trimHead,
	trimTail
};