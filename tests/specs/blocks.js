const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#a"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#b"}]}]};

/**
#a
#b
**/

export default (createEnvironment, define) => {
	define('Duplicate', function () {
		const env = createEnvironment(testDoc);
		let out;

		env.run('#a | duplicate').execute();
		env.apply();

		out = env.run('#a').execute();

		if (!this.test('found clone of #a', out.length, 2))
			return false;

		env.run('#b | duplicate | addtag #copy').execute();
		env.apply();

		out = env.run('#copy').execute();

		if (!this.test('found cloned tag #copy', out.length, 1))
			return false;
	});

	define('Remove block', function () {
		const env = createEnvironment(testDoc);
		let out;

		env.run('#b | remove').execute();
		env.apply();

		out = env.run('#b').execute();

		if (!this.test('removed node not found', out.length, 0))
			return false;
	});
};