import InputStream from "../lexer/InputStream";
import BaseTokenStream, { Token } from "../lexer/BaseTokenStream";

import { is_tag, is_num, is_not_token } from "../lexer/predicates";

type EmptyToken = {
  type: "empty";
};

type ButtonToken = {
  type: "button";
  from: number;
  to: number;
  code: string;
  label: string;
};

type ImmToken = {
  type: "imm";
  from: number;
  to: number;
  code: string;
};

type TextToken = {
  type: "text";
  from: number;
  to: number;

  label: string;
  labelFrom: number;
  labelTo: number;

  code: string;
  codeFrom: number;
};

type TagToken = {
  type: "tag";
  from: number;
  to: number;
  label: string;
  value: string;
};

type ExtendedToken = EmptyToken | TagToken | TextToken | ImmToken | ButtonToken;

const EMPTY_TOKEN: EmptyToken = { type: "empty" };

class TokenStream extends BaseTokenStream<ExtendedToken> {
  constructor(input: InputStream) {
    super(input);
  }

  readString() {
    return {
      type: "string",
      value: this.readEscapedString(),
    };
  }

  readCode() {
    let str = "";
    while (!this.istream.eof()) {
      const c = this.istream.next();
      if (c === ")") {
        return str;
      } else if (c === '"') {
        str += '"' + this.readEscapedString(true) + '"';
      } else if (c === "`") {
        str += "`" + this.readBacktickString() + "`";
      } else {
        str += c;
      }
    }

    return null;
  }

  readTag(): TagToken {
    const token: TagToken = {
      type: "tag",
      from: this.istream.pos,
      to: 0,
      label: this.readWhile(is_tag),
      value: "",
    };

    if (this.istream.peek() === ":") {
      this.istream.next();
      token.value = this.readWhile(is_num);
    }

    token.to = this.istream.pos;
    return token;
  }

  readButton(): ButtonToken | EmptyToken {
    const token: ButtonToken = {
      type: "button",
      from: this.istream.pos,
      to: 0,
      label: "",
      code: "",
    };

    this.istream.next();
    this.istream.save();
    token.label = this.readWhile((t) => t !== "]");

    if (this.istream.eof()) {
      this.istream.restore();
      return EMPTY_TOKEN;
    }

    this.istream.next();

    if (this.istream.peek() !== "(") {
      return EMPTY_TOKEN;
    }

    this.istream.next();
    this.istream.save();

    const code = this.readCode();

    if (!code) {
      this.istream.restore();
      return EMPTY_TOKEN;
    }

    token.code = code;
    token.to = this.istream.pos;

    return token;
  }

  readImm(): ImmToken | EmptyToken {
    const token: ImmToken = {
      type: "imm",
      from: this.istream.pos,
      to: 0,
      code: "",
    };

    this.istream.next();
    if (this.istream.peek() !== "(") {
      return EMPTY_TOKEN;
    }

    this.istream.next();
    this.istream.save();
    const code = this.readCode();
    if (!code) {
      this.istream.restore();
      return EMPTY_TOKEN;
    }

    token.code = code;
    token.to = this.istream.pos;

    return token;
  }

  readText(): TextToken | EmptyToken {
    const token: TextToken = {
      type: "text",
      from: this.istream.pos,
      to: 0,
      label: "",
      labelFrom: 0,
      labelTo: 0,
      code: "",
      codeFrom: 0,
    };

    this.istream.next();
    token.labelFrom = this.istream.pos;
    this.istream.save();
    token.label = this.readWhile((t) => t !== "}");
    token.labelTo = this.istream.pos;

    if (this.istream.eof()) {
      this.istream.restore();
      return EMPTY_TOKEN;
    }

    this.istream.next();
    token.codeFrom = this.istream.pos;

    if (this.istream.peek() !== "(") {
      return EMPTY_TOKEN;
    }

    this.istream.next();
    this.istream.save();
    const code = this.readCode();
    if (!code) {
      this.istream.restore();
      return EMPTY_TOKEN;
    }

    token.code = code;
    token.to = this.istream.pos;

    return token;
  }

  readNext(): ExtendedToken | null {
    this.readWhile(is_not_token);
    if (this.istream.eof()) {
      return null;
    }

    const c = this.istream.peek();

    if (c === "#") {
      return this.readTag();
    }

    if (c === "[") {
      return this.readButton();
    }

    if (c === "=") {
      return this.readImm();
    }

    if (c === "{") {
      return this.readText();
    }

    return null;
  }
}

const extract = (input: string) => {
  const istream = new InputStream(input);
  const tstream = new TokenStream(istream);

  const blocks: ExtendedToken[] = [];
  while (!tstream.eof()) {
    const b = tstream.next();
    if (b && b !== EMPTY_TOKEN) {
      blocks.push(b);
    }
  }

  return blocks;
};

export { extract, ExtendedToken, TagToken, ImmToken, ButtonToken, TextToken };
