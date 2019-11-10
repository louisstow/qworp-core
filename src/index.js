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

const init = (version, doc, websocketUrl) => {
	const editor = document.getElementById("editor");
	
	const state = EditorState.create({
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

	const view = new EditorView(editor, {
		state,
		dispatchTransaction (tr) {
			if (tr.docChanged) {
				view.shouldUpdate = true;
			}

			const newState = view.state.apply(tr);
			view.updateState(newState);
		},

		clipboardTextSerializer (slice) {
			console.log(slice.content.textBetween(0, slice.content.size, "\n", "\n"))
			const nodes = [];
			slice.content.nodesBetween(0, slice.content.size, node => {
				if (node.isBlock) { 
					nodes.push(node.textContent);
				}
			})

			return nodes.join('\n');
		},

		clipboardParser,

		clipboardTextParser (text, $context) {
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
		}
	});

	view.shouldUpdate = false;

	docStructKey.getState(view.state).build(view.state);
	const execResponse = execute(
		view.state.doc, 
		view.state, 
		{}, 
		docStructKey.getState(view.state)
	);

	view.shouldUpdate = execResponse.docChanged;
	view.updateState(execResponse.currentState)

	const tr = view.state.tr;
	tr.setMeta('forceUpdate', true);
	view.dispatch(tr);

	let lastUpdated = Date.now();

	const loop = () => {
		const now = Date.now();

		if (view.shouldUpdate && now - lastUpdated > MAX_TICK) {
			const execResponse = execute(
				view.state.doc, 
				view.state, 
				{ addToHistory: false }, 
				docStructKey.getState(view.state)
			);

			view.shouldUpdate = execResponse.docChanged;
			view.updateState(execResponse.currentState);

			console.log('tick');
			lastUpdated = now;

			collabOrchestrator.localSyncRequest();
		}

		requestAnimationFrame(loop);
	};

	requestAnimationFrame(loop);

	const conn = new Connection(websocketUrl);
	const collabState = new CollabState(version, version);
	const collabOrchestrator = new CollabOrchestrator(collabState, conn, view, schema);


	window.collabState = collabState;
	window.collabOrchestrator = collabOrchestrator;
	window.view = view;
};

window.addEventListener('startQworp', e => {
	const data = e.detail;
	init(data.version, data.doc, data.websocketUrl);
});

document.addEventListener("keydown", function(e) {
	if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
		e.preventDefault();
	}
}, false);