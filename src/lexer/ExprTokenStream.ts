import BaseTokenStream, { Token } from "./BaseTokenStream";
import type InputStream from "./InputStream";

import {
  is_whitespace,
  is_tag,
  is_fn,
  is_paren,
  is_num,
  is_operator,
  is_digit,
} from "./predicates";

class ExprTokenStream extends BaseTokenStream {
  constructor(input: InputStream) {
    super(input);
  }

  readNum() {
    let dot = this.istream.peek() === ".";
    let s = this.istream.next();

    while (!this.istream.eof()) {
      const c = this.istream.peek();
      if (c === ".") {
        if (dot) break;
        dot = true;
        s += c;
        this.istream.next();
      } else if (is_digit(c)) {
        s += c;
        this.istream.next();
      } else {
        break;
      }
    }

    return s;
  }

  readNext(): Token | null {
    this.readWhile(is_whitespace);
    if (this.istream.eof()) {
      return null;
    }

    const c = this.istream.peek();

    if (is_paren(c)) {
      this.istream.next();
      return {
        type: "paren",
        value: c,
      };
    }

    if (is_operator(c)) {
      this.istream.next();
      return {
        type: "operator",
        value: c,
      };
    }

    if (is_num(c)) {
      return {
        type: "number",
        value: this.readNum(),
      };
    }

    if (c === "#") {
      return {
        type: "var",
        value: this.readWhile(is_tag),
      };
    }

    if (is_fn(c)) {
      return {
        type: "fn",
        value: this.readWhile(is_fn),
      };
    }

    if (c === ",") {
      this.istream.next();
      return {
        type: "comma",
        value: ",",
      };
    }

    return null;
  }
}

export default ExprTokenStream;
