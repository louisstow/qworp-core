import { createEnvironment } from './scaffold';

import selector from './specs/selector';
import visibility from './specs/visibility';
import movement from './specs/movement';
import sort from './specs/sort';
import beforeafter from './specs/beforeafter';
import tags from './specs/tags';
import number from './specs/number';
import blocks from './specs/blocks';
import text from './specs/text';

class TestFramework {
	constructor () {
		this.tests = [];
	}

	register (test) {
		this.tests.push(test);
	}

	test (name, a, b) {
		if (a === b) {
			console.log(`  + ${name} passed`);
			return true;
		} else {
			console.log(`  - ${name} failed!`);
			console.log("  A:", a);
			console.log("  B:", b);
			return false;
		}
	}

	run () {
		console.log("-----------------------");
		console.log(" QWORP Automated Tests ");
		console.log("-----------------------");
		console.log(`Running ${this.tests.length} tests`);

		for (let i = 0; i < this.tests.length; ++i) {
			const t = this.tests[i];
			console.log(`\n[ ${i+1}. ${t.name} ]`);

			// exit early if any failures
			if (t.fn.call(this) === false) {
				console.log()
				console.log("FAILED");
				return;
			}
		};

		console.log();
		console.log("ALL TESTS PASSED");
	}
}

const tests = new TestFramework;

const define = (name, fn) => {
	tests.register({ name, fn });
};

selector(createEnvironment, define);
visibility(createEnvironment, define);
movement(createEnvironment, define);
sort(createEnvironment, define);
beforeafter(createEnvironment, define);
tags(createEnvironment, define);
number(createEnvironment, define);
blocks(createEnvironment, define);
text(createEnvironment, define);

tests.run();