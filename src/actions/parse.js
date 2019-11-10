import InputStream from '../lexer/InputStream';
import BaseTokenStream from '../lexer/BaseTokenStream';
import {
	is_whitespace,
	is_tag,
	is_ident,
	is_backtick,
	is_not_backtick,
	is_num,
	is_tag_token,
	is_not_pipe,
	is_pipe
} from '../lexer/predicates';

const PIPE = '|';
const QUOTE = '"';
const HASH = '#';
const BACKTICK = '\`';

class TokenStream extends BaseTokenStream {
	constructor (istream) {
		super(istream);
	}

	readBacktick () {
		const code = this.readBacktickString();
		return {
			type: 'nested',
			value: parse(code),
			code
		};
	}

	readString () {
		return {
			type: 'string',
			value: this.readEscapedString()
		}
	}

	readTag () {
		return {
			type: 'tag',
			value: this.readWhile(is_tag)
		}
	}

	readIdent () {
		return {
			type: 'ident',
			value: this.readWhile(is_ident)
		}
	}

	readNum () {
		return {
			type: 'number',
			value: this.readWhile(is_num)
		}
	}

	readNext () {
		this.readWhile(is_whitespace);
		if (this.istream.eof()) { return null; }

		const c = this.istream.peek();

		if (c === HASH) {
			return this.readTag();
		}

		if (c === PIPE) {
			this.istream.next();
			return { type: 'pipe' };
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
	constructor (tstream) {
		this.tstream = tstream;
	}

	readWhile (predicate) {
		const values = [];
		while (!this.tstream.eof() && predicate(this.tstream.peek())) {
			values.push(this.tstream.next());
		}
		return values;
	}

	readSelector () {
		return {
			type: 'selector',
			values: this.readWhile(is_tag_token)
		}
	}

	readArgs () {
		const args = [];
		let token = this.tstream.peek();
		
		while (!this.tstream.eof() && token.type !== 'pipe') {
			if (token.type === 'tag') {
				args.push({
					type: 'selector',
					values: this.readWhile(is_tag_token).map(t => t.value)
				});
			} else {
				args.push(this.tstream.next())
			}

			token = this.tstream.peek();
		}

		return args;
	}

	parseToken () {
		this.readWhile(is_pipe);
		if (this.tstream.eof()) { return; }

		const token = this.tstream.peek();

		if (token.type === 'tag') {
			return {
				fn: 'select',
				arguments: this.readArgs()
			}
		}

		if (token.type === 'ident') {
			this.tstream.next();
			return {
				fn: token.value,
				arguments: this.readArgs()
			}
		}

		throw new Error(`unrecognized token (${token.value})`);
	}

	parse () {
		const prog = [];
		while (!this.tstream.eof()) {
			const progStep = this.parseToken();
			progStep && prog.push(progStep);
		}

		return prog;
	}
}

const parse = (src) => {
	const istream = new InputStream(src);
	const tstream = new TokenStream(istream);
	const astream = new ASTStream(tstream);

	return astream.parse();
};

export {
	parse 
};