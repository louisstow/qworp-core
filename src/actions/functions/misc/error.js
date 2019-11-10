function error (stdin, args) {
	return (this.docStruct.lastError ? this.docStruct.lastError.message : '');
};

export default error;