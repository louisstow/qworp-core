import { EditorState, Transaction } from "prosemirror-state";
import { Mapping } from "prosemirror-transform";
import { DocumentStructure } from "src/tree/document";
import { ProgramStep } from "./parse";

class Executor {
  ast: ProgramStep[];
  blockFrom: number;
  currentState: EditorState;
  meta: { [k: string]: any };
  docStruct: DocumentStructure;
  functions: { [k: string]: Function };
  tr: Transaction;
  mapping: Mapping;
  docChanged: boolean;
  domAtPos: Function | null;

  constructor(
    ast: ProgramStep[],
    blockFrom: number,
    state: EditorState,
    meta: { [k: string]: any },
    docStruct: DocumentStructure,
    functions: { [k: string]: Function }
  ) {
    this.ast = ast;
    this.blockFrom = blockFrom;
    this.currentState = state;
    this.meta = meta;
    this.docStruct = docStruct;
    this.functions = functions;

    this.tr = state.tr;
    this.mapping = new Mapping();

    this.setMeta(this.tr);

    this.docChanged = false;

    // if first function isnt a selector, make it this
    if (
      this.ast.length &&
      this.ast[0].fn !== "select" &&
      this.ast[0].fn !== "this"
    ) {
      this.ast.unshift({ fn: "this", arguments: [] });
    }

    this.domAtPos = null;
  }

  setMeta(tr: Transaction) {
    Object.keys(this.meta).forEach((k) => {
      tr.setMeta(k, this.meta[k]);
    });
  }

  apply() {
    this.docChanged = Boolean(this.tr.docChanged || this.meta.forceUpdate);
    this.currentState = this.currentState.apply(this.tr);
    this.mapping.appendMapping(this.tr.mapping);

    this.blockFrom = this.tr.mapping.map(this.blockFrom);
    this.tr = this.currentState.tr;
    this.setMeta(this.tr);

    if (this.docChanged) {
      console.log("Executor apply");
      this.docStruct.build(this.currentState);
    }
  }

  executeStep(stdin: any, ast: ProgramStep) {
    const fn = this.functions[ast.fn];
    if (!fn) {
      throw new Error(`unrecognised fn: ${ast.fn}`);
    }

    return fn.call(this, stdin, ast.arguments);
  }

  execute() {
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

  executeNewContext(ast: ProgramStep[], fns: { [k: string]: Function }) {
    const subexecute = new Executor(
      ast,
      this.blockFrom,
      this.currentState,
      this.meta,
      this.docStruct,
      fns
    );

    const out = subexecute.execute();
    if (subexecute.docChanged) {
      this.docChanged = true;
      this.blockFrom = subexecute.mapping.map(this.blockFrom);
      this.mapping.appendMapping(subexecute.mapping);
    }

    return out;
  }

  getLastError() {
    return this.docStruct.lastError;
  }

  setDomAtPos(fn: Function) {
    this.domAtPos = fn;
  }
}

export default Executor;
