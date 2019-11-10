function pos (stdin, args) {
	const block = this.docStruct.find(this.blockFrom);
	const index = block.parent.children.findIndex(b => b === block);
	return index;
};

export default pos;