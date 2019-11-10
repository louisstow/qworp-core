const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t1"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t3"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#B"}]}]};

/**
#A
	1
		a
			b
	2
	3
#B
**/

export default (createEnvironment, define) => {
	define('Before', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#A | children only | before "**"').execute();
		env.apply();

		out = env.run('#A | children only').execute();
		let didPass = true;

		out.forEach(b => {
			const node = env.getNode(b.from);
			if (!this.test("Check node text " + b.from, node.textContent.startsWith('\t**'), true))
				didPass = false;

			if (!this.test("Check node head attrs " + b.from, node.attrs.head, '**'))
				didPass = false;
		});

		return didPass;
	});

	define('After', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#A | children only | after "$$$"').execute();
		env.apply();

		out = env.run('#A | children only').execute();
		let didPass = true;

		out.forEach(b => {
			const node = env.getNode(b.from);
			if (!this.test("Check node text " + b.from, node.textContent.endsWith('$$$'), true))
				didPass = false;

			if (!this.test("Check node tail attrs " + b.from, node.attrs.tail, '$$$'))
				didPass = false;
		});

		return didPass;
	});
};