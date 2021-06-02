import { Schema } from "prosemirror-model";

const schema = new Schema({
  nodes: {
    text: {},
    block: {
      content: "text*",
      attrs: {
        visible: { default: true },
        underline: { default: false },
        bold: { default: false },
        italic: { default: false },
        strikethrough: { default: false },
        color: { default: "" },
        background: { default: "" },
        tail: { default: "" },
        head: { default: "" },
        id: { default: "" },
      },
      toDOM() {
        return ["div", { class: "block" }, 0];
      },
      parseDOM: [{ tag: "div" }],
    },
    doc: {
      content: "block+",
    },
  },
});

type BlockAttrs = {
  visible: boolean;
  underline: boolean;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  color: string;
  background: string;
  tail: string;
  head: string;
  id: string;
};

const defaultAttrs: BlockAttrs = {
  visible: true,
  underline: false,
  bold: false,
  italic: false,
  strikethrough: false,
  color: "",
  background: "",
  tail: "",
  head: "",
  id: "",
};

export { BlockAttrs, defaultAttrs };
export default schema;
