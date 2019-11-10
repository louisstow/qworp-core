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

const selectorFunctions = {
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

	'>': children,
	'*': descendants
};

export default selectorFunctions;