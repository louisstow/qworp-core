const testDoc = {"type":"doc","content":[{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#a #b"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#a:4"}]},{"type":"block","attrs":{"visible":true,"underline":false,"bold":false,"italic":false,"strikethrough":false,"color":"black","tail":"","head":""},"content":[{"type":"text","text":"#a:2"}]}]};

/**
#a #b
#a:4
#a:2
**/

export default (createEnvironment, define) => {
	define('Increment', function () {
		const env = createEnvironment(testDoc);
		let out;

		env.run('#a #b | inc #a').execute();
		env.apply();

		out = env.run('#a #b').execute();

		const tag = env.docStruct.find(out[0].from).features[0];

		if (!this.test('Did empty #a tag increment', tag.value, '1'))
			return false;
	});

	define('Decrement', function () {
		const env = createEnvironment(testDoc);
		let out;

		env.run('#a #b | dec #a').execute();
		env.apply();

		out = env.run('#a #b').execute();

		const tag = env.docStruct.find(out[0].from).features[0];

		if (!this.test('Did empty #a tag decrement', tag.value, '-1'))
			return false;
	});

	define('Setval and Count', function () {
		const env = createEnvironment(testDoc);
		let out;

		env.run('#a | count | setval #b `#b`').execute();
		env.apply();

		out = env.run('#a #b').execute();

		const tag = env.docStruct.find(out[0].from).features[1];

		if (!this.test('Did empty #a tag set by count', tag.value, '3'))
			return false;
	});

	define('Val and Sum', function () {
		const env = createEnvironment(testDoc);
		let out;

		out = env.run('#a | val #a | sum').execute();

		if (!this.test('Sum the value of #a', out, 6))
			return false;

		env.run('#b | addtag #a').execute();
		env.apply();

		env.run('#b | inc #a').execute();
		env.apply();

		out = env.run('#a | val #a all | sum').execute();

		if (!this.test('Sum the value of all #a', out, 8))
			return false;
	});

	define('Min / Max', function () {
		const env = createEnvironment(testDoc);
		let out;

		out = env.run('#a | val #a all | min').execute();

		if (!this.test('Min #a', out, 0))
			return false;

		out = env.run('#a | min #a').execute();

		if (!this.test('Get the minimum block', out.length, 1))
			return false;

		out = env.run('#a | val #a all | max').execute();

		if (!this.test('Max #a', out, 4))
			return false;

		out = env.run('#a | max #a').execute();

		if (!this.test('Get the max block', out.length, 1))
			return false;
	});

	define('Expr', function () {
		const env = createEnvironment(testDoc);
		let out;

		out = env.run('expr "min(1,2)"').execute();
		if (!this.test('Minimum of 1 and 2', out[0], 1))
			return false;

		out = env.run('expr "min(max(1*4+2,1),2/1, 0)"').execute();
		if (!this.test('Complex nested min math functions with many arguments', out[0], 0))
			return false;

		out = env.run('expr "ceil(sqrt(2) * (1/3))"').execute();
		if (!this.test('Another complex formula', out[0], 1))
			return false;

		env.run('#b | inc #a | inc #a | inc #b').execute();
		env.apply();

		out = env.run('expr "min(2 * #a, #b / 2, 2) / 0.5 + 1"').execute();
		if (!this.test('Using tag values in complex formula', out[0], 2))
			return false;

		out = env.run('expr "#a + #b - #a + -#b"').execute();
		if (!this.test('Using tag values simply', out[0], 0))
			return false;
	});
};