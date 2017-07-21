function emit(target, name, props) {
	if (!target.emit) target.emit = [];
	target.emit.push(name);
}

module.exports = emit;