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
	define('Hide/Show/Toggle', function () {
		const env = createEnvironment(testDoc);
		env.run('#test | hide').execute();
		env.apply();

		let out = env.run('#test').execute();
		let node = env.state.doc.resolve(out[0].from).nodeAfter;

		if (!this.test('hide sets attr', node.attrs.visible, false)) 
			return false;

		env.run('#test | show').execute();
		env.apply();

		out = env.run('#test').execute();
		node = env.state.doc.resolve(out[0].from).nodeAfter;

		if (!this.test('show sets attr', node.attrs.visible, true)) 
			return false;

		env.run('#test | toggle').execute();
		env.apply();

		out = env.run('#test').execute();
		node = env.state.doc.resolve(out[0].from).nodeAfter;

		if (!this.test('toggle sets attr', node.attrs.visible, false)) 
			return false;
	});
};