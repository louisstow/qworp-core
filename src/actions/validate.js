import { SelectorResult } from './selector';

const is_array = a => Array.isArray(a);
const is_number = n => typeof n === 'number';
const is_string = s => typeof s === 'string';
const is_scalar = x => is_number(x) || is_string(x);
const is_selector_result = b => b instanceof SelectorResult;

const ensureSelectorResult = (stdin) => {
	if (!is_array(stdin)) return false;
	return stdin.every(is_selector_result);
};

// scalar validation
const ensureScalar = (stdin) => {
	return is_scalar(stdin);
};

const ensureScalarArray = (stdin) => {
	return is_array(stdin) && stdin.every(is_scalar);
};

const ensureAnyScalar = (stdin) => {
	return ensureScalarArray(stdin) || ensureScalar(stdin);
}

// number validation
const ensureNumber = (stdin) => {
	return is_number(stdin);
};

const ensureNumberArray = (stdin) => {
	return is_array(stdin) && stdin.every(is_number);
};

const ensureAnyNumber = (stdin) => {
	return ensureNumberArray(stdin) || ensureNumber(stdin);
};

// string validation
const ensureString = (stdin) => {
	return is_string(stdin);
};

const ensureStringArray = (stdin) => {
	return is_array(stdin) && stdin.every(is_string);
};

const ensureAnyString = (stdin) => {
	return ensureStringArray(stdin) || ensureString(stdin);
};

// other validation
const ensureArray = (stdin) => {
	return is_array(stdin);
};

const ensureSelector = (arg) => {
	return arg && arg.type === 'selector';
}

class InputError extends Error {
	constructor (fn, type) {
		type = type || 'blocks';
		super(`${fn}: input must be of type ${type}`);
	}
}

class ArgumentError extends Error {
	constructor (fn, message) {
		super(`${fn}: ${message}`);
	}
}

export {
	ensureSelectorResult,
	ensureArray,

	ensureScalar,
	ensureScalarArray,
	ensureAnyScalar,

	
	ensureNumber,
	ensureNumberArray,
	ensureAnyNumber,

	ensureString,
	ensureStringArray,
	ensureAnyString,

	InputError,
	ArgumentError
};