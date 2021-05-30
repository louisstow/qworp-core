import InputStream from "../lexer/InputStream";
import ExprTokenStream from "../lexer/ExprTokenStream";
import type { Token } from "../lexer/BaseTokenStream";

import { is_paren, is_num, is_operator, is_tag } from "../lexer/predicates";

interface ValueToken extends Token {
  valueNum?: number;
}

const precedence = (c: string) => {
  if (c === "+" || c === "-") return 1;
  if (c === "*" || c === "/") return 2;
  return 0;
};

const top = (a: ValueToken[]) => a[a.length - 1];

class ExprASTStream {
  tstream: ExprTokenStream;
  operatorStack: ValueToken[];
  outputStack: ValueToken[];
  lastOperator: ValueToken | null;
  tokens: ValueToken[];

  constructor(tstream: ExprTokenStream) {
    this.tstream = tstream;

    this.operatorStack = [];
    this.outputStack = [];
    this.tokens = [];

    this.lastOperator = null;
  }

  readOperator(token: ValueToken) {
    while (
      this.operatorStack.length &&
      (top(this.operatorStack).type === "fn" ||
        precedence(top(this.operatorStack).value) >= precedence(token.value)) &&
      top(this.operatorStack).value !== "("
    ) {
      const op = this.operatorStack.pop();
      if (op) {
        this.outputStack.push(op);
      }
    }
  }

  readRightParen() {
    while (this.operatorStack.length && top(this.operatorStack).value !== "(") {
      const t = this.operatorStack.pop();
      if (t) this.outputStack.push(t);
    }

    if (this.operatorStack.length) {
      if (top(this.operatorStack).value === "(") {
        this.operatorStack.pop(); // discard
      } else {
        throw new Error(
          "expr: parsing expression failed (no left bracket found)"
        );
      }
    }
  }

  parseToken(token: ValueToken, i: number) {
    const prevToken = i > 0 ? this.tokens[i - 1] : null;

    if (token.type === "paren" && token.value === "(") {
      this.operatorStack.push(token);
      if (prevToken && prevToken.type === "fn") {
        this.outputStack.push({ type: "stop", value: "" });
      }
    } else if (token.type === "fn") {
      this.operatorStack.push(token);
    } else if (token.type === "number" || token.type === "var") {
      token.valueNum = Number(token.value);
      this.outputStack.push(token);
    } else if (token.type === "operator") {
      if (
        !prevToken ||
        (prevToken.type !== "number" &&
          prevToken.type !== "var" &&
          prevToken.value !== ")")
      ) {
        this.operatorStack.push({ type: "fn", value: "unary" + token.value });
        this.outputStack.push({ type: "stop", value: "" });
      } else {
        this.readOperator(token);
        this.operatorStack.push(token);
      }
    } else if (token.type === "paren" && token.value === ")") {
      if (!prevToken || prevToken.type === "comma") {
        throw new Error(
          "expr: parsing expression failed (comma before closed bracket)"
        );
      }

      this.readRightParen();
    } else if (token.type === "comma") {
      if (
        !prevToken ||
        prevToken.type === "operator" ||
        prevToken.type === "comma"
      ) {
        throw new Error("expr: parsing expression failed");
      }

      // this.operatorStack.push(token);
      if (top(this.operatorStack).type === "operator") {
        const t = this.operatorStack.pop();
        if (t) this.outputStack.push();
      }
    }
  }

  parseTokens() {
    this.tokens.forEach((token, i) => this.parseToken(token, i));
  }

  parse() {
    this.tokens = [];

    while (!this.tstream.eof()) {
      const t = this.tstream.next();
      if (t) this.tokens.push(t);
    }

    this.parseTokens();

    while (this.operatorStack.length) {
      if (top(this.operatorStack).type === "paren") {
        throw new Error("expr: mismatched brackets");
      }

      const t = this.operatorStack.pop();
      if (t) this.outputStack.push(t);
    }

    return this.outputStack;
  }
}

const parseExpr = (src: string) => {
  const istream = new InputStream(src);
  const tstream = new ExprTokenStream(istream);
  const astream = new ExprASTStream(tstream);

  return astream.parse();
};

const EXPR_FUNCTIONS: { [k: string]: Function } = {
  min(...args: number[]) {
    return Math.min.apply(Math, args);
  },

  max(...args: number[]) {
    return Math.max.apply(Math, args);
  },

  sin(a: number) {
    return Math.sin(a);
  },

  cos(a: number) {
    return Math.cos(a);
  },

  tan(a: number) {
    return Math.tan(a);
  },

  pow(a: number, b: number) {
    return Math.pow(a, b);
  },

  fixed(a: number, b: number) {
    return a.toFixed(b);
  },

  abs(a: number) {
    return Math.abs(a);
  },

  random() {
    return Math.random();
  },

  ceil(a: number) {
    return Math.ceil(a);
  },

  floor(a: number) {
    return Math.floor(a);
  },

  round(a: number) {
    return Math.round(a);
  },

  sqrt(a: number) {
    return Math.sqrt(a);
  },

  add(a: number, b: number) {
    return a + b;
  },

  subtract(a: number, b: number) {
    return a - b;
  },

  multiply(a: number, b: number) {
    return a * b;
  },

  divide(a: number, b: number) {
    return a / b;
  },

  unaryNegative(a: number) {
    return -a;
  },

  unaryPositive(a: number) {
    return +a;
  },
};

// operator aliases
EXPR_FUNCTIONS["+"] = EXPR_FUNCTIONS.add;
EXPR_FUNCTIONS["-"] = EXPR_FUNCTIONS.subtract;
EXPR_FUNCTIONS["*"] = EXPR_FUNCTIONS.multiply;
EXPR_FUNCTIONS["/"] = EXPR_FUNCTIONS.divide;
EXPR_FUNCTIONS["unary-"] = EXPR_FUNCTIONS.unaryNegative;
EXPR_FUNCTIONS["unary+"] = EXPR_FUNCTIONS.unaryPositive;

class ExprExecutor {
  ast: ValueToken[];
  prepared: boolean;
  functionMap: { [k: string]: Function };

  constructor(ast: ValueToken[]) {
    this.ast = ast;
    this.prepared = false;

    this.functionMap = EXPR_FUNCTIONS;
  }

  variables(initialValue: number) {
    const map: { [k: string]: number } = {};
    this.ast
      .filter((t) => t.type === "var")
      .map((t) => t.value)
      .forEach((t) => {
        map[t] = initialValue;
      });

    return map;
  }

  prepare(map: { [k: string]: number }) {
    this.ast
      .filter((t) => t.type === "var")
      .forEach((t) => {
        if (t.value in map) {
          t.valueNum = map[t.value];
        } else {
          throw new Error(`expr: expected variable (${t.value})`);
        }
      });

    this.prepared = true;
  }

  evaluate() {
    const valueStack: ValueToken[] = [];

    for (let i = 0; i < this.ast.length; ++i) {
      const token = this.ast[i];

      if (token.type === "operator" || token.type === "fn") {
        const fn = this.functionMap[token.value];
        let result: number;

        if (!fn) {
          throw new Error(
            `expr: unrecognised expression function (${token.value})`
          );
        }

        if (token.type === "fn") {
          const args: number[] = [];
          while (valueStack.length && top(valueStack).type !== "stop") {
            const t = valueStack.pop();
            if (t?.valueNum !== undefined) {
              args.unshift(t.valueNum);
            }
          }

          if (valueStack.length && top(valueStack).type === "stop") {
            valueStack.pop();
          }

          result = fn.apply(fn, args);
        } else {
          const b = valueStack.pop();
          const a = valueStack.pop();

          if (a === undefined || b === undefined) {
            throw new Error("expr: invalid use of operator");
          }

          result = fn(a.valueNum, b.valueNum);
        }

        valueStack.push({
          type: "number",
          valueNum: result,
          value: String(result),
        });
      } else if (token.type === "var" || token.type === "number") {
        valueStack.push(token);
      } else if (token.type === "stop") {
        valueStack.push(token);
      }
    }

    return valueStack;
  }
}

export { parseExpr, ExprExecutor };
