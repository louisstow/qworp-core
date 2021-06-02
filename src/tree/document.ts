import type { EditorState, Transaction } from "prosemirror-state";

import {
  extract,
  ExtendedToken,
  TagToken,
  ButtonToken,
  ImmToken,
  TextToken,
} from "../plugins/extract";
import { parse, ProgramStep } from "../actions/parse";
import { countIndent } from "../commands/indent";

interface BaseFeature {
  from: number;
  to: number;
  blockFrom: number;
  block: Block;
}

interface ImmFeature extends BaseFeature {
  type: "imm";
  ast?: ProgramStep[];
  code: string;
}

interface TextFeature extends BaseFeature {
  type: "text";
  ast?: ProgramStep[];
  label: string;
  labelFrom: number;
  labelTo: number;
  code: string;
  codeFrom: number;
}

interface TagFeature extends BaseFeature {
  type: "tag";
  label: string;
  value: string;
}

interface ButtonFeature extends BaseFeature {
  type: "button";
  ast?: ProgramStep[];
  code: string;
  label: string;
}

type Feature = ImmFeature | TextFeature | TagFeature | ButtonFeature;

class Block {
  from: number;
  to: number;
  depth: number;
  size: number;
  parent: Block | null;
  id: string;
  text: string;
  children: Block[];
  features: Feature[];

  constructor() {
    this.from = 0;
    this.to = 0;
    this.depth = 0;
    this.size = 0;
    this.parent = null;
    this.id = "";
    this.text = "";
    this.children = [];
    this.features = [];
  }

  addChild(node: Block) {
    this.children.push(node);
    node.parent = this;
  }

  cloneFeaturesFromBlock(block: Block, blockDiff: number) {
    // remap features unto current block
    this.features = block.features.map((f) => {
      f.from += blockDiff;
      f.to += blockDiff;
      f.blockFrom += blockDiff;
      f.block = this;

      if (f.type === "text") {
        f.codeFrom += blockDiff;
        f.labelFrom += blockDiff;
        f.labelTo += blockDiff;
      }

      return f;
    });
  }

  toJSON() {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      depth: this.depth,
      size: this.size,
    };
  }
}

class DocumentStructure {
  lastError: string | null;
  tagIndex: { [k: string]: Block[] };
  idIndex: { [k: string]: Block };
  features: Feature[];
  root: Block | null;
  list: Block[];

  constructor() {
    this.reset();
    this.lastError = null;

    this.tagIndex = {};
    this.idIndex = {};
    this.features = [];
    this.root = null;
    this.list = [];
  }

  reset() {
    this.tagIndex = {};
    this.idIndex = {};
    this.features = [];
    this.root = null;
    this.list = [];
  }

  getLastError() {
    return this.lastError;
  }

  recurseTree(node: Block, fn: (b: Block) => boolean) {
    for (let i = 0; i < node.children.length; ++i) {
      const b = node.children[i];
      let result = fn(b);

      if (result === false) {
        return false;
      }

      if (b.children && b.children.length) {
        result = this.recurseTree(b, fn);
        if (result === false) {
          return false;
        }
      }
    }

    return false;
  }

  find(pos: number) {
    return this.list.find((b) => b.from === pos);
  }

  findRange(from: number, to: number) {
    const found: Block[] = [];
    for (let i = 0; i < this.list.length; ++i) {
      const b = this.list[i];
      if (from >= b.from && from < b.to) {
        found.push(b);
      } else if (to > b.from && to <= b.to) {
        found.push(b);
      }

      if (to < b.from) {
        break;
      }
    }
    return found;
  }

  findByTag(query: string) {
    return this.tagIndex[query] || [];
  }

  findById(id: string): Block | null {
    return this.idIndex[id] || null;
  }

  addFeature(feature: Feature, block: Block) {
    this.features.push(feature);
    block.features.push(feature);
  }

  parseFeatureCode(code: string) {
    try {
      return parse(code);
    } catch (err) {
      this.lastError = err;
    }
  }

  parseTagToken(t: TagToken, block: Block, localPos: number): TagFeature {
    if (!this.tagIndex[t.label]) {
      this.tagIndex[t.label] = [];
    }

    // only add block once
    if (this.tagIndex[t.label].indexOf(block) === -1) {
      this.tagIndex[t.label].push(block);
    }

    return {
      type: "tag",
      label: t.label,
      value: t.value,
      from: t.from + localPos + 1,
      to: t.to + localPos + 1,
      blockFrom: block.from,
      block,
    };
  }

  parseImmToken(t: ImmToken, block: Block, localPos: number): ImmFeature {
    return {
      type: "imm",
      ast: this.parseFeatureCode(t.code),
      code: t.code,
      from: t.from + localPos + 1,
      to: t.to + localPos + 1,
      blockFrom: block.from,
      block,
    };
  }

  parseButtonToken(
    t: ButtonToken,
    block: Block,
    localPos: number
  ): ButtonFeature {
    return {
      type: "button",
      ast: this.parseFeatureCode(t.code),
      code: t.code,
      label: t.label,
      from: t.from + localPos + 1,
      to: t.to + localPos + 1,
      blockFrom: block.from,
      block,
    };
  }

  parseTextToken(t: TextToken, block: Block, localPos: number): TextFeature {
    return {
      type: "text",
      ast: this.parseFeatureCode(t.code),
      code: t.code,
      label: t.label,
      from: t.from + localPos + 1,
      to: t.to + localPos + 1,
      labelFrom: t.labelFrom,
      labelTo: t.labelTo,
      codeFrom: t.codeFrom,
      blockFrom: block.from,
      block,
    };
  }

  buildTree(state: EditorState | Transaction) {
    this.reset();

    const rootBlock = new Block();
    const blockStack = [rootBlock];
    let previousDepth = -1;
    rootBlock.id = "@@root";

    state.doc.descendants((node, pos) => {
      if (!node.isBlock) {
        return;
      }

      const depth = countIndent(node.textContent);
      const block = new Block();

      block.id = String(node.attrs?.id || "");
      block.from = pos;
      block.to = pos + node.nodeSize;
      block.depth = depth;
      block.size = node.nodeSize;
      block.text = node.textContent;

      if (depth > previousDepth) {
        blockStack[blockStack.length - 1].addChild(block);
        blockStack.push(block);
        previousDepth = depth;
      } else if (depth == previousDepth) {
        blockStack.pop();
        blockStack[blockStack.length - 1].addChild(block);
        blockStack.push(block);
      } else if (depth < previousDepth) {
        blockStack[depth].addChild(block);
        previousDepth = depth;
        blockStack.length = depth + 1;
        blockStack.push(block);
      }

      this.list.push(block);
      if (node.attrs.id) {
        this.idIndex[node.attrs.id] = block;
      }
    });

    this.root = rootBlock;
  }

  extractFeaturesOntoBlock(block: Block) {
    extract(block.text).forEach((f) => {
      if (f.type == "empty") {
        return;
      } else if (f.type === "tag") {
        this.addFeature(this.parseTagToken(f, block, block.from), block);
      } else if (f.type === "imm") {
        this.addFeature(this.parseImmToken(f, block, block.from), block);
      } else if (f.type === "button") {
        this.addFeature(this.parseButtonToken(f, block, block.from), block);
      } else if (f.type === "text") {
        this.addFeature(this.parseTextToken(f, block, block.from), block);
      }
    });
  }

  build(state: EditorState | Transaction) {
    this.buildTree(state);
    this.list.forEach((b) => this.extractFeaturesOntoBlock(b));
  }
}

export {
  Block,
  DocumentStructure,
  Feature,
  ButtonFeature,
  TagFeature,
  TextFeature,
  ImmFeature,
};
