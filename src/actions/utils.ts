import type { Block } from "../tree/document";
import type { SelectorResult } from "./selector";

const recurseTree = (n: Block, fn: (b: Block) => void) => {
  n.children.forEach((c) => {
    fn(c);
    if (c.children && c.children.length) {
      recurseTree(c, fn);
    }
  });
};

const getUniqueSubtrees = (rootNodes: Block[]) => {
  const visited: { [k: number]: boolean } = {};
  const unique: Block[] = [];

  rootNodes.forEach((r) => {
    if (visited[r.from]) {
      return;
    }

    recurseTree(r, (c) => {
      visited[c.from] = true;
    });

    unique.push(r);
  });

  return unique;
};

const uniqueStdin = (stdin: SelectorResult[]) =>
  stdin.filter((item, index) => stdin.indexOf(item) === index);

const createIndent = (n: number) => {
  let s = "";
  while (n--) s += "\t";
  return s;
};

// remove the head of the text
// note: this does not trim the tail
const trimHead = (text: string, head: string, tail: string) => {
  const trimmedTail =
    tail && text.endsWith(tail)
      ? text.substring(0, text.length - tail.length)
      : text;

  return head && trimmedTail.startsWith(head) ? text.substr(head.length) : text;
};

// remove the tail of the text
// note: this does not trim the head
const trimTail = (text: string, head: string, tail: string) => {
  const trimmedHead =
    head && text.startsWith(head) ? text.substr(head.length) : text;

  return tail && trimmedHead.endsWith(tail)
    ? text.substring(0, text.length - tail.length)
    : text;
};

export {
  recurseTree,
  getUniqueSubtrees,
  uniqueStdin,
  createIndent,
  trimHead,
  trimTail,
};
