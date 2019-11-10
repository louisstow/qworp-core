import InputStream from '../lexer/InputStream';
import ExprTokenStream from '../lexer/ExprTokenStream';

import {
	is_paren,
	is_num,
	is_operator,
	is_tag
} from '../lexer/predicates';

const precedence = (c) => {
	if (c === '+' || c === '-') return 1;
	if (c === '*' || c === '/') return 2;
	return 0;
}

const top = (a) => a[a.length - 1];

class ExprASTStream {
	constructor (tstream) {
		this.tstream = tstream;

		this.operatorStack = [];
		this.valueStack = [];
		this.outputStack = [];
		this.root = null;

		this.lastOperator = null;
	}

	readOperator (token) {
		while (
			this.operatorStack.length &&
			(
				top(this.operatorStack).type === 'fn' ||
				precedence(top(this.operatorStack).value) >= precedence(token.value) 
			) &&
			top(this.operatorStack).value !== '('
		) {
			const op = this.operatorStack.pop();
			this.outputStack.push(op);
		}
	}

	readRightParen () {
		while (this.operatorStack.length && top(this.operatorStack).value !== '(') {
			this.outputStack.push(this.operatorStack.pop())
		}

		if (this.operatorStack.length) {
			if (top(this.operatorStack).value === '(') {
				this.operatorStack.pop(); // discard
			} else {
				throw new Error("expr: parsing expression failed (no left bracket found)");
			}	
		}
	}

	parseToken (token, i) {
		const prevToken = i > 0 ? this.tokens[i - 1] : null;

		if (token.type === 'paren' && token.value === '(') {
			this.operatorStack.push(token);
			if (prevToken && prevToken.type === 'fn') {
				this.outputStack.push({ type: 'stop' });	
			}
		} else if (token.type === 'fn') {
			this.operatorStack.push(token);
		} else if (token.type === 'number' || token.type === 'var') {
			token.valueNum = Number(token.value);
			this.outputStack.push(token);
		} else if (token.type === 'operator') {
			if (!prevToken || 
				(prevToken.type !== 'number' && prevToken.type !== 'var' && prevToken.value !== ')')) {
				this.operatorStack.push({ type: 'fn', value: 'unary' + token.value });
				this.outputStack.push({ type: 'stop' });
			} else {
				this.readOperator(token);
				this.operatorStack.push(token);	
			}
		} else if (token.type === 'paren' && token.value === ')') {
			if (!prevToken || prevToken.type === 'comma') {
				throw new Error("expr: parsing expression failed (comma before closed bracket)");
			}

			this.readRightParen(token);
		} else if (token.type === 'comma') {
			if (!prevToken || prevToken.type === 'operator'  || prevToken.type === 'comma') {
				throw new Error("expr: parsing expression failed");
			}

			// this.operatorStack.push(token);
			if (top(this.operatorStack).type === 'operator') {
				this.outputStack.push(this.operatorStack.pop());
			}
		}
	}

	parseTokens (tokens) {
		this.tokens.forEach((token, i) => this.parseToken(token, i));
	}

	parse () {
		this.tokens = [];
		
		while (!this.tstream.eof()) {
			this.tokens.push(this.tstream.next());
		}

		this.parseTokens();

		while (this.operatorStack.length) {
			if (top(this.operatorStack).type === 'paren') {
				throw new Error("expr: mismatched brackets");
			}

			this.outputStack.push(this.operatorStack.pop())
		}

		return this.outputStack;
	}
}

const parseExpr = (src) => {
	const istream = new InputStream(src);
	const tstream = new ExprTokenStream(istream);
	const astream = new ExprASTStream(tstream);

	return astream.parse();
};


const EXPR_FUNCTIONS = {
	min () {
		return Math.min.apply(Math, arguments);
	},

	max () {
		return Math.max.apply(Math, arguments);
	},

	sin (a) {
		return Math.sin(a);
	},

	cos (a) {
		return Math.cos(a);
	},

	tan (a) {
		return Math.tan(a);
	},

	pow (a, b) {
		return Math.pow(a, b);
	},

	fixed (a, b) {
		return (a).toFixed(b);
	},

	abs (a) {
		return Math.abs(a);
	},

	random () {
		return Math.random();
	},

	ceil (a) {
		return Math.ceil(a);
	},

	floor (a) {
		return Math.floor(a);
	},

	round (a) {
		return Math.round(a);
	},

	sqrt (a) {
		return Math.sqrt(a);
	},

	add (a, b) {
		return a + b;
	},

	subtract (a, b) {
		return a - b;
	},

	multiply (a, b) {
		return a * b;
	},

	divide (a, b) {
		return a / b;
	},

	unaryNegative (a) {
		return -a;
	},

	unaryPositive (a) {
		return +a;
	}
};

// operator aliases
EXPR_FUNCTIONS['+'] = EXPR_FUNCTIONS.add;
EXPR_FUNCTIONS['-'] = EXPR_FUNCTIONS.subtract;
EXPR_FUNCTIONS['*'] = EXPR_FUNCTIONS.multiply;
EXPR_FUNCTIONS['/'] = EXPR_FUNCTIONS.divide;
EXPR_FUNCTIONS['unary-'] = EXPR_FUNCTIONS.unaryNegative;
EXPR_FUNCTIONS['unary+'] = EXPR_FUNCTIONS.unaryPositive;

class ExprExecutor {
	constructor (ast) {
		this.ast = ast;
		this.prepared = false;

		this.functionMap = EXPR_FUNCTIONS;
	}

	variables (initialValue) {
		const map = {};
		this.ast.filter(t => t.type === 'var').map(t => t.value).forEach(t => {
			map[t] = initialValue;
		});
		
		return map;
	}

	prepare (map) {
		this.ast.filter(t => t.type === 'var').forEach(t => {
			if (t.value in map) {
				t.valueNum = map[t.value];
			} else {
				throw new Error(`expr: expected variable (${t.value})`);
			}
		});

		this.prepared = true;
	}

	evaluate () {
		const valueStack = [];

		for (let i = 0; i < this.ast.length; ++i) {
			const token = this.ast[i];

			if (token.type === 'operator' || token.type === 'fn') {
				const fn = this.functionMap[token.value];
				let result;

				if (!fn) {
					throw new Error(`expr: unrecognised expression function (${token.value})`);
				}

				if (token.type === 'fn') {
					const args = [];
					while (
						valueStack.length &&
						(top(valueStack).type !== 'stop')) {

						args.unshift(valueStack.pop().valueNum);
					}

					if (valueStack.length && top(valueStack).type === 'stop') {
						valueStack.pop();
					}

					result = fn.apply(fn, args);
				} else if (token.type === 'operator') {
					const b = valueStack.pop();
					const a = valueStack.pop();

					if (a === undefined || b === undefined) {
						throw new Error("expr: invalid use of operator");
					}

					result = fn(a.valueNum, b.valueNum);
				}

				valueStack.push({ type: 'number', valueNum: result });

			} else if (token.type === 'var' || token.type === 'number') {
				valueStack.push(token);
			} else if (token.type === 'stop') {
				valueStack.push(token);
			}
		}

		return valueStack;
	}
}

export {
	parseExpr,
	ExprExecutor
};