import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { EditorView, DecorationSet, Decoration } from "prosemirror-view";
import { Schema, Fragment, Slice, Node, DOMParser } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { Step, Mapping } from 'prosemirror-transform';
import { history, undo, redo } from "prosemirror-history";

import { 
	collab, 
	sendableSteps, 
	getVersion, 
	receiveTransaction 
} from "prosemirror-collab";

import { indentKeymap } from './commands/indent';

import decorationPlugin from './plugins/decorations';
import nodeviewPlugin from './plugins/nodeview';
import docStructPlugin from './plugins/docStruct';

import { selector } from './actions/selector';

import DocumentStructure from './tree/document';

import schema from './schema';

import Executor from './actions/execute';
import allFunctions from './actions/functions/all';

import CollabOrchestrator from './collab/orchestrator';
import CollabState from './collab/state';
import Connection from './collab/connection';

const execute = (originalDoc, state, meta, docStruct) => {
	meta.addToHistory = false;

	let docChanged = false;
	let currentState = state;
	let mapping = new Mapping;

	docStruct.features
	  .filter(f => (f.type === 'imm' || f.type === 'text') && f.ast)
	  .forEach(f => {
		const exec = new Executor(
			f.ast, 
			mapping.map(f.blockFrom), 
			currentState,
			meta,
			docStruct,
			allFunctions
		);

		let out = exec.execute();
		currentState = exec.currentState;
		mapping.appendMapping(exec.mapping);

		// executor reports whether it should update
		if (exec.shouldUpdate) {
			docChanged = true;
		}

		if (f.type === 'text') {
			if (Array.isArray(out) && out.length === 1) {
				out = out[0];
			}

			// text can only render string or number
			if (typeof out !== 'string' && typeof out !== 'number') {
				return;
			}

			exec.docStruct.build(currentState);
			const tr = exec.currentState.tr;

			if (String(out) !== f.label) {
				const from = mapping.map(f.from);
				tr.insertText(String(out), from + 1, from + 1 + f.label.length);
			}

			exec.tr = tr;
			exec.apply();
			mapping.appendMapping(tr.mapping)

			docChanged = tr.docChanged;
			currentState = exec.currentState;
		}
	});

	return { docChanged, currentState };
};

const MAX_TICK = 100;

const docStructKey = new PluginKey('docStructKey');

const domParser = DOMParser.fromSchema(schema);
const clipboardParser = {
	parseSlice (dom, opts) {
		// use the default dom parser if the HTML is ProseMirror-like
		const contextNode = dom && dom.querySelector("[data-pm-slice]");
		if (contextNode) {
			return domParser.parseSlice(dom, opts);
		}

		const blocks = dom.textContent.split(/(?:\r\n?|\n)/);
		const nodes = [];
		
		blocks.forEach(b => {
			nodes.push(Node.fromJSON(schema, {
				type: 'block',
				content: b ? [
					{type: 'text', text: b}
				] : null
			}));
		});

		const fragment = Fragment.fromArray(nodes);
		const slice = Slice.maxOpen(fragment);

		return slice;
	}
};

const clipboardTextSerializer = (slice) => {
	const nodes = [];
	slice.content.nodesBetween(0, slice.content.size, node => {
		if (node.isBlock) { 
			nodes.push(node.textContent);
		}
	})

	return nodes.join('\n');
};

const clipboardTextParser = (text, $context) => {
	const blocks = text.split(/(?:\r\n?|\n)/);
	const nodes = [];

	blocks.forEach(b => {
		nodes.push(Node.fromJSON(schema, {
			type: 'block',
			content: b ? [
				{type: 'text', text: b}
			] : null
		}));
	});

	const fragment = Fragment.fromArray(nodes);
	const slice = Slice.maxOpen(fragment);

	return slice;
};

class QworpEditor {
	constructor () {
		this.created = false;
		this.view = null;
		this.conn = null;
		this.collabState = null;
		this.collabOrchestrator = null;
		this.lastUpdated = Date.now();
	}

	create (editor, version, doc, websocketUrl) {
		const state = this.createState(doc, version);
		const view = new EditorView(editor, {
			state,
			dispatchTransaction (tr) {
				if (tr.docChanged) {
					view.shouldUpdate = true;
				}

				const newState = view.state.apply(tr);
				view.updateState(newState);
			},

			clipboardTextSerializer,
			clipboardParser,
			clipboardTextParser
		});

		view.shouldUpdate = false;

		this.created = true;
		this.view = view;
		this.conn = new Connection(websocketUrl);
		this.collabState = new CollabState(version, version);
		this.collabOrchestrator = new CollabOrchestrator(this.collabState, this.conn, this.view, schema);

		this.triggerUpdate();
		requestAnimationFrame(this.loop.bind(this));
	}

	triggerUpdate () {
		docStructKey.getState(this.view.state).build(this.view.state);
		const execResponse = execute(
			this.view.state.doc, 
			this.view.state, 
			{}, 
			docStructKey.getState(this.view.state)
		);

		this.view.shouldUpdate = execResponse.docChanged;
		this.view.updateState(execResponse.currentState)

		const tr = this.view.state.tr;
		tr.setMeta('forceUpdate', true);
		this.view.dispatch(tr);
	}

	reload (doc, version) {
		this.view.updateState(this.createState(doc, version));
		this.triggerUpdate();
	}

	createState (doc, version) {
		return EditorState.create({
			doc: schema.nodeFromJSON(doc),
			schema,
			plugins: [
				docStructPlugin(docStructKey),
				history(),
				indentKeymap(),
				keymap({ "Mod-z": undo, "Mod-y": redo }),
				keymap(baseKeymap),
				decorationPlugin,
				nodeviewPlugin,
				collab({ version: version })
			]
		});
	}

	loop () {
		const now = Date.now();

		if (this.view.shouldUpdate && now - this.lastUpdated > MAX_TICK) {
			const execResponse = execute(
				this.view.state.doc, 
				this.view.state, 
				{ addToHistory: false }, 
				docStructKey.getState(this.view.state)
			);

			this.view.shouldUpdate = execResponse.docChanged;
			this.view.updateState(execResponse.currentState);

			this.lastUpdated = now;
			this.collabOrchestrator.localSyncRequest();
		}

		requestAnimationFrame(this.loop.bind(this));
	}
}

export default QworpEditor;