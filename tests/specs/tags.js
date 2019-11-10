const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"this is a line #endingwith"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#startingwith tag"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"add tag with #after"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#before add tag with #before"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#lines #with #all #tags"}]}]};

/**
this is a line #endingwith
#startingwith tag
add tag with #after
#before add tag with #before
#lines #with #all #tags
**/

export default (createEnvironment, define) => {
	define('Add tag', function () {
		const env = createEnvironment(testDoc);
		let out, node;

		env.run('#after | after "<"').execute();
		env.apply();

		env.run('#endingwith | addtag #newtag').execute();
		env.apply();

		out = env.run('#endingwith').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Tag added at end', 'this is a line #endingwith #newtag', node.textContent))
			return false;

		env.run('#endingwith | addtag #newtag once').execute();
		env.apply();

		out = env.run('#endingwith').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Only add single tag (once)', 'this is a line #endingwith #newtag', node.textContent))
			return false;

		env.run('#after | addtag #newtag').execute();
		env.apply();

		out = env.run('#after').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Add tag before the tail', 'add tag with #after #newtag<', node.textContent))
			return false;
	});

	define('Remove tag', function () {
		const env = createEnvironment(testDoc);
		let out, node;

		env.run('#before | before ">"').execute();
		env.apply();

		env.run('#before | removetag #before all').execute();
		env.apply();

		out = env.run('#after | next 1').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Tag removed', '> add tag with ', node.textContent))
			return false;
	});

	define('Toggle tag', function () {
		const env = createEnvironment(testDoc);
		let out, node;

		env.run('#lines | toggletag #toggled').execute();
		env.apply();

		out = env.run('#lines').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Tag toggled on', '#lines #with #all #tags #toggled', node.textContent))
			return false;

		env.run('#lines | toggletag #toggled').execute();
		env.apply();

		out = env.run('#lines').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Tag toggled off', '#lines #with #all #tags ', node.textContent))
			return false;

		env.run('#lines | toggletag #toggled').execute();
		env.apply();

		out = env.run('#lines').execute();
		node = env.getNode(out[0].from);

		if (!this.test('Tag toggled back on', '#lines #with #all #tags #toggled', node.textContent))
			return false;
	});
};