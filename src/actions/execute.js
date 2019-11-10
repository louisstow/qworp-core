import { Mapping } from 'prosemirror-transform';

class Executor {
	constructor (ast, blockFrom, state, meta, docStruct, functions) {
		this.ast = ast;
		this.blockFrom = blockFrom;
		this.currentState = state;
		this.meta = meta;
		this.docStruct = docStruct;
		this.functions = functions;

		this.tr = state.tr;
		this.mapping = new Mapping;

		this.setMeta(this.tr);

		this.shouldUpdate = false;
		
		// if first function isnt a selector, make it this
		if (this.ast.length && this.ast[0].fn !== 'select' && this.ast[0].fn !== 'this') {
			this.ast.unshift({fn: 'this', arguments: []});
		}

		this.domAtPos = null;
	}

	setMeta (tr) {
		Object.keys(this.meta).forEach(k => {
			tr.setMeta(k, this.meta[k]);
		});
	}

	apply () {
		this.shouldUpdate = this.tr.docChanged || this.meta.forceUpdate;
		this.currentState = this.currentState.apply(this.tr);
		this.mapping.appendMapping(this.tr.mapping);
		
		this.blockFrom = this.tr.mapping.map(this.blockFrom);
		this.tr = this.currentState.tr;
		this.setMeta(this.tr);
		
		if (this.shouldUpdate) {
			this.docStruct.build(this.currentState);
		}
	}

	executeStep (stdin, ast) {
		const fn = this.functions[ast.fn];
		if (!fn) {
			throw new Error(`unrecognised fn: ${ast.fn}`);
		}

		return fn.call(this, stdin, ast.arguments);
	}

	execute () {
		let i = 0;
		let stdin = [];

		try {
			while (i < this.ast.length) {
				stdin = this.executeStep(stdin, this.ast[i]);
				this.apply();
				i++;
			}
		} catch (err) {
			this.docStruct.lastError = err;
		}

		return stdin;
	}

	executeNewContext (ast, fns) {
		const subexecute = new Executor(
			ast, 
			this.blockFrom,
			this.currentState,
			this.meta,
			this.docStruct,
			fns
		);
		
		const out = subexecute.execute();
		if (subexecute.shouldUpdate) {
			this.shouldUpdate = true;
			this.blockFrom = subexecute.mapping.map(this.blockFrom);
			this.mapping.appendMapping(subexecute.mapping);
		}

		return out;
	}

	getLastError () {
		return this.lastError;
	}

	setDomAtPos (fn) {
		this.domAtPos = fn;
	}
}

export default Executor;