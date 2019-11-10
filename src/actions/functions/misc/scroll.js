import { TextSelection } from 'prosemirror-state';

import {
	ensureSelectorResult,
	InputError
} from '../../validate';

function scroll (stdin, args) {
	if (!ensureSelectorResult(stdin)) {
		throw new InputError('scroll');
	}

	if (!stdin.length) {
		return;
	}

	if (!this.domAtPos) {
		return;
	}

	const domNode = this.domAtPos(stdin[0].from + 1);
	if (!domNode) {
		return;
	}

	domNode.node.scrollIntoView();
};

export default scroll;