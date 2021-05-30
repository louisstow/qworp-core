import type { Token } from "./BaseTokenStream";

const VALID_HASH = "#_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const VALID_FN =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const VALID_NUM = "0123456789.-";
const OPERATORS = "+-*/^%";

const is_whitespace = (c: string) => c === " " || c === "\t";
const is_tag = (c: string) => VALID_HASH.indexOf(c) !== -1;
const is_ident = (c: string) => !is_whitespace(c) && c !== "|";
const is_num = (c: string) => VALID_NUM.indexOf(c) !== -1;
const is_operator = (c: string) => OPERATORS.indexOf(c) !== -1;
const is_paren = (c: string) => c === "(" || c === ")";
const is_digit = (c: string) => "0123456789".indexOf(c) !== -1;

const is_backtick = (c: string) => c === "`";
const is_not_backtick = (c: string) => c !== "`";

const is_fn = (c: string) => VALID_FN.indexOf(c) !== -1;

const is_tag_token = (t: Token) => t.type === "tag";
const is_not_pipe = (t: Token) => t.type !== "pipe";
const is_pipe = (t: Token) => t.type === "pipe";
const is_not_token = (t: string) =>
  t !== "[" && t !== "#" && t !== "=" && t !== "{";

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
  is_pipe,
  is_not_token,
  is_digit,
};
