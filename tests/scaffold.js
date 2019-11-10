import schema from '../src/schema';
import { EditorState } from "prosemirror-state";
import DocumentStructure from '../src/tree/document';

import Executor from '../src/actions/execute';
import allFunctions from '../src/actions/functions/all';

import { parse } from '../src/actions/parse';

class Environment {
	constructor (doc) {
		this.state = EditorState.create({
			doc: schema.nodeFromJSON(doc),
			schema
		});

		this.lastExec = null;

		this.docStruct = new DocumentStructure;
		this.docStruct.build(this.state);
	}

	run (code, blockFrom) {
		const ast = parse(code);

		const exec = new Executor(
			ast,
			blockFrom || 0,
			this.state,
			{},
			this.docStruct,
			allFunctions
		);

		this.lastExec = exec;

		return exec;
	}

	getNode (from) {
		return this.state.doc.resolve(from).nodeAfter;
	}

	apply () {
		this.state = this.lastExec.currentState;
		this.docStruct.build(this.state);
	}
}

const createEnvironment = (doc) => {
	return new Environment(doc);
};

export { createEnvironment };