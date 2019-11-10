const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t1 #n"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t3 #n:2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#B"}]}]};

/**
#A
	1 #n
		a
			b
	2
	3 #n:2
#B
**/

export default (createEnvironment, define) => {
	define('Sort children', function () {
		const env = createEnvironment(testDoc);
		env.run('#A | sort #n asc').execute();
		env.apply();

		let expected = JSON.stringify(testDoc);
		let actual = JSON.stringify(env.state.doc.toJSON());
		
		if (!this.test('Sort tag ascending', expected, actual))
			return false;

		env.run('#A | sort #n desc').execute();
		env.apply();

		expected = JSON.stringify({"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#A"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t3 #n:2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t1 #n"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\ta"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t\t\tb"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"\t2"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","background":"","tail":"","head":""},"content":[{"type":"text","text":"#B"}]}]});
		actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('Sort tag descending', expected, actual))
			return false;

		env.run('#A | sort').execute();
		env.apply();

		expected = JSON.stringify(testDoc);
		actual = JSON.stringify(env.state.doc.toJSON());

		if (!this.test('Sort tag defaults', expected, actual))
			return false;
	});
};