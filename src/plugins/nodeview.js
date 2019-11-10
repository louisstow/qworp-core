import { Plugin } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";

import { countIndent } from '../commands/indent';

const generateClassName = (attrs) => {
	const classes = ['block'];
	if (!attrs.visible) classes.push('hidden');
	if (attrs.bold) classes.push('bold');
	if (attrs.italic) classes.push('italics');
	if (attrs.underline) classes.push('underline');
	if (attrs.strikethrough) classes.push('strikethrough');
	if (attrs.color) classes.push('unset-color');
	return classes.join(' ');
}

const generateStyle = (attrs) => {
	const styles = [];
	
	if (attrs.color) 
		styles.push(`color:${attrs.color}`);

	if (attrs.background) 
		styles.push(`background-color:${attrs.background}`);

	return styles.join(';');
};

class BlockView {
	constructor (node) {
		console.log('constructor blockview')
		this.dom = this.contentDOM = document.createElement('div');
		this.dom.classList.add('block');

		this.render(node);
	}

	render (node) {
		const depth = countIndent(node.textContent);
		const classes = generateClassName(node.attrs) + ` block-depth-${depth}`;
		const styles = generateStyle(node.attrs);
		this.dom.className = classes;
		this.dom.style.cssText = styles;
	}

	update (node) {
		console.log('update')
		this.render(node);
		return true;
	}
}

const nodeviewPlugin = new Plugin({
	// state: {
	// 	init (_, {doc}) {
	// 		return DecorationSet.empty;
	// 	},

	// 	apply (tr, set) {
	// 		const forceUpdate = tr.getMeta("forceUpdate");
	// 		const docStruct = tr.getMeta("docStruct");

	// 		if (!tr.docChanged && !forceUpdate) {
	// 			return set.map(tr.mapping, tr.doc);
	// 		}

	// 		set = DecorationSet.empty;

	// 		tr.doc.descendants((node, pos) => {
	// 			if (!node.isBlock) { return; }
				
	// 			const block = docStruct.find(pos)
	// 			console.log('set add')
	// 			set = set.add(tr.doc, [
	// 				Decoration.node(
	// 					pos,
	// 					pos + node.nodeSize,
	// 					{
	// 						class: generateClassName(node.attrs) + (block ? ` block-depth-${block.depth}` : ''),
	// 						style: generateStyle(node.attrs)
	// 					}
	// 				)
	// 			]);
	// 		});

	// 		return set;
	// 	}
	// },

	props: {
		
		nodeViews: {
			block (node) { return new BlockView(node); }
		}
	}
});

export default nodeviewPlugin;