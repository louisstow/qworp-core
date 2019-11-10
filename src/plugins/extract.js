import InputStream from '../lexer/InputStream';
import BaseTokenStream from '../lexer/BaseTokenStream';

import { 
	is_tag, 
	is_num, 
	is_not_backtick 
} from '../lexer/predicates';

const is_not_token = (t) => t !== '[' && t !== '#' && t !== '=' && t !== '{';
const EMPTY_TOKEN = { empty: true };

class TokenStream extends BaseTokenStream {
	constructor (input) {
		super(input);
	}

	readString () {
		return {
			type: 'string',
			value: this.readEscapedString()
		}
	}

	readTag () {
		return this.readWhile(is_tag);
	}

	readCode () {
		let str = '';
		while (!this.istream.eof()) {
			const c = this.istream.next();
			if (c === ')') {
				return str;
			} else if (c === '"') {
				str += '"' + this.readEscapedString(true) + '"';
			} else if (c === '\`') {
				str += '\`' + this.readBacktickString() + '\`';
			} else {
				str += c;	
			}
		}

		return null;
	}

	readTag () {
		const block = {
			type: 'tag',
			from: this.istream.pos,
			label: this.readWhile(is_tag)
		};

		if (this.istream.peek() === ':') {
			this.istream.next();
			block.value = this.readWhile(is_num);
		}

		block.to = this.istream.pos;
		return block;
	}

	readButton () {
		const block = {
			type: 'button',
			from: this.istream.pos,
		};

		this.istream.next();
		this.istream.save();
		block.label = this.readWhile(t => t !== ']');
		
		if (this.istream.eof()) {
			this.istream.restore();
			return EMPTY_TOKEN;
		}

		this.istream.next();
		
		if (this.istream.peek() !== '(') {
			return EMPTY_TOKEN;
		}

		this.istream.next();
		this.istream.save();

		block.code = this.readCode();

		if (!block.code) {
			this.istream.restore();
			return EMPTY_TOKEN;
		}

		block.to = this.istream.pos;

		return block;
	}

	readImm () {
		const block = {
			type: 'imm',
			from: this.istream.pos
		};

		this.istream.next();
		if (this.istream.peek() !== '(') {
			return EMPTY_TOKEN;
		}

		this.istream.next();
		this.istream.save();
		block.code = this.readCode();
		if (!block.code) {
			this.istream.restore();
			return EMPTY_TOKEN;
		}

		block.to = this.istream.pos;

		return block;
	}

	readText () {
		const block = {
			type: 'text',
			from: this.istream.pos,
		};

		this.istream.next();
		block.labelFrom = this.istream.pos;
		this.istream.save();
		block.label = this.readWhile(t => t !== '}');
		block.labelTo = this.istream.pos;
		
		if (this.istream.eof()) {
			this.istream.restore();
			return EMPTY_TOKEN;
		}

		this.istream.next();
		block.codeFrom = this.istream.pos;
		
		if (this.istream.peek() !== '(') {
			return EMPTY_TOKEN;
		}

		this.istream.next();
		this.istream.save();
		block.code = this.readCode();
		if (!block.code) {
			this.istream.restore();
			return EMPTY_TOKEN;
		}

		block.to = this.istream.pos;

		return block;
	}

	readNext () {
		this.readWhile(is_not_token);
		if (this.istream.eof()) { return null; }

		const c = this.istream.peek();

		if (c === '#') {
			return this.readTag();
		}

		if (c === '[') {
			return this.readButton();
		}

		if (c === '=') {
			return this.readImm();
		}

		if (c === '{') {
			return this.readText();
		}

		return null;
	}
}

const extract = (input) => {
	const istream = new InputStream(input);
	const tstream = new TokenStream(istream);

	const blocks = [];
	while (!tstream.eof()) {
		const b = tstream.next();
		b !== EMPTY_TOKEN && blocks.push(b);
	}

	return blocks;
}

export { extract };