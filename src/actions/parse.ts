import InputStream from "../lexer/InputStream";
import BaseTokenStream, { Token } from "../lexer/BaseTokenStream";
import {
  is_whitespace,
  is_tag,
  is_ident,
  is_backtick,
  is_not_backtick,
  is_num,
  is_tag_token,
  is_not_pipe,
  is_pipe,
} from "../lexer/predicates";

const PIPE = "|";
const QUOTE = '"';
const HASH = "#";
const BACKTICK = "`";

type ProgramStep = {
  fn: string;
  arguments: Array<ASTToken>;
};

type SelectorToken = {
  type: "selector";
  values: string[];
};

type NestedToken = {
  type: "nested";
  value: ProgramStep[];
  code: string;
};

type IdentToken = {
  type: "ident";
  value: string;
};

type StringToken = {
  type: "string";
  value: string;
};

type TagToken = {
  type: "tag";
  value: string;
};

type NumberToken = {
  type: "number";
  value: string;
};

type PipeToken = {
  type: "pipe";
  value: string;
};

type ASTToken =
  | StringToken
  | TagToken
  | NumberToken
  | SelectorToken
  | PipeToken
  | IdentToken
  | NestedToken;

class TokenStream extends BaseTokenStream<ASTToken> {
  constructor(istream: InputStream) {
    super(istream);
  }

  readBacktick(): NestedToken {
    const code = this.readBacktickString();
    return {
      type: "nested",
      value: parse(code),
      code,
    };
  }

  readString(): StringToken {
    return {
      type: "string",
      value: this.readEscapedString(),
    };
  }

  readTag(): TagToken {
    return {
      type: "tag",
      value: this.readWhile(is_tag),
    };
  }

  readIdent(): IdentToken {
    return {
      type: "ident",
      value: this.readWhile(is_ident),
    };
  }

  readNum(): NumberToken {
    return {
      type: "number",
      value: this.readWhile(is_num),
    };
  }

  readNext(): ASTToken | null {
    this.readWhile(is_whitespace);
    if (this.istream.eof()) {
      return null;
    }

    const c = this.istream.peek();

    if (c === HASH) {
      return this.readTag();
    }

    if (c === PIPE) {
      this.istream.next();
      return { type: "pipe", value: c };
    }

    if (c === QUOTE) {
      this.istream.next();
      return this.readString();
    }

    if (c === BACKTICK) {
      this.istream.next();
      return this.readBacktick();
    }

    if (is_num(c)) {
      return this.readNum();
    }

    if (is_ident(c)) {
      return this.readIdent();
    }

    throw new Error(`cannot handle char: ${c} at ${this.istream.pos}`);
  }
}

class ASTStream {
  tstream: TokenStream;

  constructor(tstream: TokenStream) {
    this.tstream = tstream;
  }

  readWhile(predicate: (t: Token) => boolean) {
    const values = [];
    let peek: ASTToken | null = null;

    while (
      !this.tstream.eof() &&
      (peek = this.tstream.peek()) &&
      predicate(peek as Token)
    ) {
      const t = this.tstream.next();
      if (t) {
        values.push(t);
      }
    }
    return values;
  }

  readSelector(): SelectorToken {
    const tokens = this.readWhile(is_tag_token) as TagToken[];
    return {
      type: "selector",
      values: tokens.map((t) => t.value),
    };
  }

  readArgs() {
    const args: Array<ASTToken> = [];
    let token = this.tstream.peek();

    while (!this.tstream.eof() && token && token.type !== "pipe") {
      if (token.type === "tag") {
        args.push(this.readSelector());
      } else {
        const nextToken = this.tstream.next();
        if (nextToken) {
          args.push(nextToken);
        }
      }

      token = this.tstream.peek();
    }

    return args;
  }

  parseToken(): ProgramStep | null {
    this.readWhile(is_pipe);
    if (this.tstream.eof()) {
      return null;
    }

    const token = this.tstream.peek();
    if (!token) {
      return null;
    }

    if (token.type === "tag") {
      return {
        fn: "select",
        arguments: this.readArgs(),
      };
    }

    if (token.type === "ident") {
      this.tstream.next();
      return {
        fn: token.value,
        arguments: this.readArgs(),
      };
    }

    throw new Error(`unrecognized token`);
  }

  parse() {
    const prog: ProgramStep[] = [];
    while (!this.tstream.eof()) {
      const progStep = this.parseToken();
      if (progStep) {
        prog.push(progStep);
      }
    }

    return prog;
  }
}

const parse = (src: string) => {
  const istream = new InputStream(src);
  const tstream = new TokenStream(istream);
  const astream = new ASTStream(tstream);

  return astream.parse();
};

export { parse, ProgramStep };
