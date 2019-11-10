const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t1"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t3"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#B"}]}]};

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
	define('Move children', function () {
		const env = createEnvironment(testDoc);
		env.run('#A | > only | move `#B`').execute();
		env.apply();

		let expected = JSON.stringify({"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#B"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t1"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t3"}]}]})
		let actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('move children from A to B', expected, actual))
			return false;

		env.run('#B | > only | move `#A`').execute();
		env.apply();

		expected = JSON.stringify(testDoc);
		actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('move children from B to A', expected, actual))
			return false;
	});

	define('Move descendants', function () {
		const env = createEnvironment(testDoc);
		env.run('#A | * only | move `#B`').execute();
		env.apply();

		let expected = JSON.stringify({"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#B"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t1"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t3"}]}]})
		let actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('move descendants from A to B', expected, actual))
			return false;

		env.run('#B | * only | move `#A`').execute();
		env.apply();

		expected = JSON.stringify(testDoc);
		actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('move descendants from B to A', expected, actual))
			return false;
	});
};