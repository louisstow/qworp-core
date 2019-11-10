const VALID_HASH = "#_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const VALID_FN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const VALID_NUM = "0123456789.-";
const OPERATORS = "+-*/^%";

const is_whitespace = (c) => c === ' ' || c === '\t';
const is_tag = (c) => VALID_HASH.indexOf(c) !== -1;
const is_ident = (c) => !is_whitespace(c) && c !== '|';
const is_num = (c) => VALID_NUM.indexOf(c) !== -1;
const is_operator = (c) => OPERATORS.indexOf(c) !== -1;
const is_paren = (c) => c === '(' || c === ')';

const is_backtick = (c) => c === '\`';
const is_not_backtick = (c) => c !== '\`';

const is_fn = (c) => VALID_FN.indexOf(c) !== -1;

const is_tag_token = (t) => t.type === 'tag';
const is_not_pipe = (t) => t.type !== 'pipe';
const is_pipe = (t) => t.type === 'pipe';

export {
	is_whitespace,
	is_tag,
	is_ident,
	is_num,
	is_operator,
	is_paren,
	is_backtick,
	is_not_backtick,
	is_fn,
	is_tag_token,
	is_not_pipe,
	is_pipe
};