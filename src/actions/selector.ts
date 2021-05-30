import type { Mapping } from "prosemirror-transform";
import type { Block, DocumentStructure } from "../tree/document";

class SelectorResult {
  from: number;
  to: number;
  history: Array<{ from: number; to: number }>;

  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
    this.history = [];
  }

  toJSON() {
    return { from: this.from, to: this.to };
  }

  applyMapping(mapping: Mapping) {
    this.history.push(this.toJSON());
    this.from = mapping.map(this.from);
    this.to = mapping.map(this.to);

    return this;
  }

  static fromBlock(block: Block) {
    return new SelectorResult(block.from, block.to);
  }
}

// query: ['#A', '#B']
const selector = (docStruct: DocumentStructure, query: string[]) => {
  let results = docStruct.index[query[0]];
  let i = 1;

  // clone array
  if (results?.length) {
    results = [...results];
  } else {
    results = [];
  }

  while (i < query.length) {
    const blocks = docStruct.index[query[i]] || [];
    results = results.filter((r) => blocks.indexOf(r) !== -1);
    i++;
  }

  return results.map((r) => new SelectorResult(r.from, r.to));
};

const selectorNearest = (
  docStruct: DocumentStructure,
  tag: string,
  node: Block
) => {
  // check parents
  let parent: Block | null = node.parent;
  do {
    const t = parent?.features.find((f) => f.type === "tag" && f.value === tag);
    if (t) {
      return parent;
    }
  } while (parent && (parent = parent.parent));

  // check descendants
  let childBlock: Block | null = null;
  docStruct.recurseTree(node, (c: Block) => {
    const t = c.features.find((f) => f.type === "tag" && f.value === tag);
    if (t) {
      childBlock = c;
      return false;
    }

    return true;
  });

  if (childBlock) {
    return childBlock;
  }

  // grab first in the global index
  const tags = docStruct.index[tag];
  if (!tags || !tags.length) {
    return null;
  }

  return tags[0];
};

export { selector, selectorNearest, SelectorResult };
