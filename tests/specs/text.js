const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"this is a #line of text"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#many #tags with [x](this) buttons"}]}]};

/**
this is a #line of text
#many #tags with [x](this) buttons
**/

export default (createEnvironment, define) => {
	define('Text', function () {
		const env = createEnvironment(testDoc);

		let out = env.run('#line | text').execute();

		if (!this.test('stripped text', out[0], 'this is a  of text'))
			return false;

		out = env.run('#many | text').execute();

		if (!this.test('stripped text including buttons', out[0], '  with  buttons'))
			return false;
	});

	define('Compact text', function () {
		const env = createEnvironment(testDoc);

		let out = env.run('#line | text | compact').execute();

		if (!this.test('stripped text', out[0], 'this is a of text'))
			return false;

		out = env.run('#many | text | compact').execute();

		if (!this.test('stripped text including buttons', out[0], 'with buttons'))
			return false;
	});

	define('Trim', function () {
		const env = createEnvironment(testDoc);

		let out = env.run('#many | text | trim').execute();

		if (!this.test('stripped text including buttons', out[0], 'with  buttons'))
			return false;
	});

	define('Join', function () {
		const env = createEnvironment(testDoc);

		let out = env.run('#line | #many | text | compact | join').execute();

		if (!this.test('joined list', out, 'this is a of text, with buttons'))
			return false;

		out = env.run('#line | #many | text | compact | join " - "').execute();

		if (!this.test('joined list custom delimeter', out, 'this is a of text - with buttons'))
			return false;
	});
};