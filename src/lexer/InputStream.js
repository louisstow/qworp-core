class InputStream {
	constructor (input) {
		this.reset(input);
		this.state = [];
	}

	reset (input) {
		this.input = input;
		this.pos = 0;
	}

	next () {
		return this.input[this.pos++];
	}

	peek () {
		return this.input[this.pos];
	}

	eof () {
		return this.pos >= this.input.length;
	}

	// stack methods to go back in time if we find a dead-end
	save () {
		this.state.push(this.pos);
	}

	restore () {
		this.pos = this.state.pop();
	}
}

export default InputStream;