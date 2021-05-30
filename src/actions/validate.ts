import { SelectorResult } from "./selector";

const is_array = (a: unknown) => Array.isArray(a);
const is_number = (n: unknown) => typeof n === "number";
const is_string = (s: unknown) => typeof s === "string";
const is_scalar = (x: unknown) => is_number(x) || is_string(x);
const is_selector_result = (b: unknown) => b instanceof SelectorResult;

const ensureSelectorResult = (stdin: unknown[]) => {
  if (!is_array(stdin)) return false;
  return stdin.every(is_selector_result);
};

// scalar validation
const ensureScalar = (stdin: unknown) => {
  return is_scalar(stdin);
};

const ensureScalarArray = (stdin: unknown[]) => {
  return is_array(stdin) && stdin.every(is_scalar);
};

const ensureAnyScalar = (stdin: unknown[]) => {
  return ensureScalarArray(stdin) || ensureScalar(stdin);
};

// number validation
const ensureNumber = (stdin: unknown) => {
  return is_number(stdin);
};

const ensureNumberArray = (stdin: unknown[]) => {
  return is_array(stdin) && stdin.every(is_number);
};

const ensureAnyNumber = (stdin: unknown[]) => {
  return ensureNumberArray(stdin) || ensureNumber(stdin);
};

// string validation
const ensureString = (stdin: unknown) => {
  return is_string(stdin);
};

const ensureStringArray = (stdin: unknown[]) => {
  return is_array(stdin) && stdin.every(is_string);
};

const ensureAnyString = (stdin: unknown[]) => {
  return ensureStringArray(stdin) || ensureString(stdin);
};

// other validation
const ensureArray = (stdin: unknown) => {
  return is_array(stdin);
};

const ensureSelector = (arg: any) => {
  return arg && arg.type === "selector";
};

class InputError extends Error {
  constructor(fn: string, type: string) {
    type = type || "blocks";
    super(`${fn}: input must be of type ${type}`);
  }
}

class ArgumentError extends Error {
  constructor(fn: string, message: string) {
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
  ArgumentError,
};
