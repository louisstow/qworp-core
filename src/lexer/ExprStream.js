import BaseTokenStream from './BaseTokenStream';

import {
	is_paren,
	is_num,
	is_operator,
	is_tag
} from './predicates';

class ExprTokenStream extends BaseTokenStream {
	constructor (input) {
		super(input);
	}

	readNext () {
		this.readWhile(is_whitespace);
		if (this.istream.eof()) { return null; }

		const c = this.istream.peek();

		if (is_paren(c)) {
			return {
				type: 'paren',
				value: c
			};
		}

		if (is_num(c)) {
			return {
				type: 'number',
				value: this.readWhile(is_num)
			};
		}

		if (is_operator(c)) {
			return {
				type: 'operator',
				value: c
			}
		}

		if (c === '#') {
			return {
				type: 'var',
				value: this.readWhile(is_tag)
			};
		}

		return null;
	}
}

export default ExprTokenStream;