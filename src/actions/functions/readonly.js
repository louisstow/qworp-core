import pos from './block/pos';

import now from './date/now';

import error from './misc/error';

import avg from './number/avg';
import count from './number/count';
import dollar from './number/dollar';
import expr from './number/expr';
import max from './number/max';
import min from './number/min';
import pct from './number/pct';
import fixed from './number/fixed';
import sum from './number/sum';
import val from './number/val';

import all from './selector/all';
import children from './selector/children';
import descendants from './selector/descendants';
import filter from './selector/filter';
import first from './selector/first';
import last from './selector/last';
import next from './selector/next';
import not from './selector/not';
import parent from './selector/parent';
import prev from './selector/prev';
import select from './selector/select';
import siblings from './selector/siblings';
import slice from './selector/slice';
import thisFn from './selector/this';

import compact from './string/compact';
import join from './string/join';
import text from './string/text';
import trim from './string/trim';

const readonlyFunctions = {
	pos,

	now,

	error,

	avg,
	count,
	dollar,
	expr,
	max,
	min,
	pct,
	fixed,
	sum,
	val,

	all,
	children,
	descendants,
	filter,
	first,
	last,
	next,
	not,
	parent,
	prev,
	select,
	siblings,
	slice,
	'this': thisFn,

	compact,
	join,
	text,
	trim,

	'>': children,
	'*': descendants
};

export default readonlyFunctions;