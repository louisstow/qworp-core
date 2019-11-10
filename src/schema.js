import { Schema } from "prosemirror-model";

const schema = new Schema({
	nodes: {
		text: {},
		block: {
			content: "text*",
			attrs: {
				visible: {default: true},
				underline: {default: false},
				bold: {default: false},
				italic: {default: false},
				strikethrough: {default: false},
				color: {default: ''},
				background: {default: ''},
				tail: {default: ''},
				head: {default: ''}
			},
			toDOM () {
				return ["div", {'class': 'block'}, 0] 
			},
			parseDOM: [{tag: "div"}]
		},
		doc: {
			content: "block+",
		}
	}
});

export default schema;