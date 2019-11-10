const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":"[ ] "},"content":[{"type":"text","text":"#test line"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"another #test #with #more #tags"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"this #isnt"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\tchild 1"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\tchild 2 #x"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\tchild 3"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"\t\tsubchild"}]}]};

/**
#test line
another #test #with #more #tags
this #isnt
	child 1
	child 2 #x
	child 3
		subchild
**/

export default (createEnvironment, define) => {
	define('Basic Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#test').execute();

		if (!this.test('two blocks found', out.length, 2)) 
			return false;
	});

	define('AND Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#test #tags').execute();

		if (!this.test('one blocks found', out.length, 1)) 
			return false;

		if (!this.test('block found in correct position', out[0].from, 12)) 
			return false;
	});

	define('OR Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#test | #isnt').execute();

		if (!this.test('three blocks found', out.length, 3)) 
			return false;
	});

	define('Children Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#isnt | children incl').execute();

		if (!this.test('four blocks found', out.length, 4)) 
			return false;
	});

	define('Children ONLY Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#isnt | children').execute();

		if (!this.test('three blocks found', out.length, 3)) 
			return false;
	});

	define('Descendants Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#isnt | *').execute();

		if (!this.test('four blocks found', out.length, 4))
			return false;
	});

	define('NOT Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#test | not #tags').execute();

		if (!this.test('one blocks found', out.length, 1)) 
			return false;
	});

	define('ALL Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('all').execute();

		if (!this.test('all blocks found', out.length, 7)) 
			return false;
	});

	define('THIS Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('this').execute();

		const node = env.getNode(out[0].from);

		if (!this.test('block found', out.length, 1)) 
			return false;

		if (!this.test('correct size', node.textContent.length, 10)) 
			return false;
	});

	define('Next Selector', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#more | next 1').execute();

		if (!this.test('next block found', out.length, 1)) 
			return false;

		out = env.run('#test | next all').execute();

		if (!this.test('next block without argument', out.length, 2)) 
			return false;
	});

	define('Prev Selector', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#more | prev 1').execute();

		if (!this.test('previous block found', out.length, 1)) 
			return false;

		out = env.run('#isnt | prev all').execute();

		if (!this.test('previous block without argument', out.length, 2)) 
			return false;
	});

	define('Parent Selector', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#x | parent').execute();

		if (!this.test('parent', out.length, 1)) 
			return false;

		out = env.run('#x | parent incl').execute();

		if (!this.test('parent including original', out.length, 2)) 
			return false;
	});

	define('Siblings Selector', function () {
		const env = createEnvironment(testDoc);
		const out = env.run('#isnt | siblings').execute();

		if (!this.test('found siblings', out.length, 2)) 
			return false;
	});

	define('First / Last', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#test | first').execute();
		let node = env.getNode(out[0].from);

		if (!this.test('found first', node.textContent, '#test line')) 
			return false;

		out = env.run('#test | last').execute();
		node = env.getNode(out[0].from);

		if (!this.test('found last', node.textContent, 'another #test #with #more #tags')) 
			return false;
	});

	define('Slice', function () {
		const env = createEnvironment(testDoc);
		let out = env.run('#test | slice 0 1').execute();
		let node = env.getNode(out[0].from);

		if (!this.test('found first', node.textContent, '#test line')) 
			return false;

		out = env.run('#test | slice -1').execute();
		node = env.getNode(out[0].from);

		if (!this.test('found last', node.textContent, 'another #test #with #more #tags')) 
			return false;
	});
};