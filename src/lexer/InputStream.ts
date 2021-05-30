class InputStream {
  input: string;
  pos: number;
  state: number[];

  constructor(input: string) {
    this.reset(input);
    this.state = [];
    this.input = input;
    this.pos = 0;
  }

  reset(input: string) {
    this.input = input;
    this.pos = 0;
  }

  next() {
    return this.input[this.pos++];
  }

  peek() {
    return this.input[this.pos];
  }

  eof() {
    return this.pos >= this.input.length;
  }

  // stack methods to go back in time if we find a dead-end
  save() {
    this.state.push(this.pos);
  }

  restore() {
    this.pos = this.state.pop() || 0;
  }
}

export default InputStream;
