import after from './block/after';
import before from './block/before';
import duplicate from './block/duplicate';
import flatten from './block/flatten';
import hide from './block/hide';
import indent from './block/indent';
import move from './block/move';
import pos from './block/pos';
import remove from './block/remove';
import show from './block/show';
import sort from './block/sort';
import toggle from './block/toggle';
import unindent from './block/unindent';

import now from './date/now';

import background from './format/background';
import bold from './format/bold';
import clearformat from './format/clearformat';
import color from './format/color';
import italic from './format/italic';
import strikethrough from './format/strikethrough';
import underline from './format/underline';

import error from './misc/error';
import scroll from './misc/scroll';

import avg from './number/avg';
import count from './number/count';
import dec from './number/dec';
import dollar from './number/dollar';
import expr from './number/expr';
import inc from './number/inc';
import max from './number/max';
import min from './number/min';
import pct from './number/pct';
import fixed from './number/fixed';
import setval from './number/setval';
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

import addtag from './tag/addtag';
import removetag from './tag/removetag';
import toggletag from './tag/toggletag';

import on from './event/on';

const allFunctions = {
	after,
	before,
	duplicate,
	flatten,
	hide,
	indent,
	move,
	pos,
	remove,
	show,
	sort,
	toggle,
	unindent,

	now,

	background,
	bold,
	clearformat,
	color,
	italic,
	strikethrough,
	underline,

	error,
	scroll,

	avg,
	count,
	dec,
	dollar,
	expr,
	inc,
	max,
	min,
	pct,
	fixed,
	setval,
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

	addtag,
	removetag,
	toggletag,

	on,

	'>': children,
	'*': descendants
};

export default allFunctions;