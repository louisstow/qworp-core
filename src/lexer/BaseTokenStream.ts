import type InputStream from "./InputStream";

type Token = {
  type: string;
  value: string;
};

class BaseTokenStream<T = Token> {
  istream: InputStream;
  current: T | null;

  constructor(istream: InputStream) {
    this.istream = istream;
    this.current = null;
  }

  readWhile(predicate: (s: string) => boolean) {
    let s = "";
    while (!this.istream.eof() && predicate(this.istream.peek())) {
      s += this.istream.next();
    }
    return s;
  }

  readEscapedString(keepEscape = false) {
    let escaped = false;
    let s = "";

    while (!this.istream.eof()) {
      const c = this.istream.next();

      if (escaped) {
        if (keepEscape) s += "\\";
        s += c;
        escaped = false;
      } else if (c === "\\") {
        escaped = true;
      } else if (c === '"') {
        break;
      } else {
        s += c;
      }
    }

    return s;
  }

  readBacktickString() {
    let s = "";

    while (!this.istream.eof()) {
      const c = this.istream.next();
      if (c === "`") {
        break;
      }

      s += c;
    }

    return s;
  }

  readNext(): T | null {
    return null;
  }

  next() {
    const tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  peek() {
    return this.current || (this.current = this.readNext());
  }

  eof() {
    return this.peek() === null;
  }
}

export { Token };
export default BaseTokenStream;
