import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import type { BlockAttrs } from "../schema";

import { countIndent } from "../commands/indent";

const generateClassName = (attrs: BlockAttrs) => {
  const classes = ["block"];
  if (!attrs.visible) classes.push("hidden");
  if (attrs.bold) classes.push("bold");
  if (attrs.italic) classes.push("italics");
  if (attrs.underline) classes.push("underline");
  if (attrs.strikethrough) classes.push("strikethrough");
  if (attrs.color) classes.push("unset-color");
  return classes.join(" ");
};

const generateStyle = (attrs: BlockAttrs) => {
  const styles = [];

  if (attrs.color) styles.push(`color:${attrs.color}`);

  if (attrs.background) styles.push(`background-color:${attrs.background}`);

  return styles.join(";");
};

class BlockView {
  dom: HTMLElement;

  constructor(node: Node) {
    this.dom = document.createElement("div");
    this.dom.classList.add("block");

    this.render(node);
  }

  render(node: Node) {
    const depth = countIndent(node.textContent);
    const classes =
      generateClassName(node.attrs as BlockAttrs) + ` block-depth-${depth}`;
    const styles = generateStyle(node.attrs as BlockAttrs);
    this.dom.className = classes;
    this.dom.style.cssText = styles;
  }

  update(node: Node) {
    this.render(node);
    return true;
  }
}

const nodeviewPlugin = new Plugin({
  props: {
    nodeViews: {
      block(node) {
        return new BlockView(node);
      },
    },
  },
});

export default nodeviewPlugin;
