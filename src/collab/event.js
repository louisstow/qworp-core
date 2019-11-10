
class EventEmitter {
	constructor () {
		this._handlers = {};
	}

	on (evt, fn) {
		if (!this._handlers[evt]) {
			this._handlers[evt] = [];
		}

		this._handlers[evt].push(fn);
	}

	emit (evt, arg) {
		if (!this._handlers[evt]) {
			return false;
		}

		this._handlers[evt].forEach(fn => fn(arg));
		return true;
	}
}

export default EventEmitter;