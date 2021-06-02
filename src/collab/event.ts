class EventEmitter {
  _handlers: { [k: string]: Function[] };

  constructor() {
    this._handlers = {};
  }

  on(evt: string, fn: Function) {
    if (!this._handlers[evt]) {
      this._handlers[evt] = [];
    }

    this._handlers[evt].push(fn);
  }

  emit(evt: string, arg?: any) {
    if (!this._handlers[evt]) {
      return false;
    }

    this._handlers[evt].forEach((fn) => fn(arg));
    return true;
  }
}

export default EventEmitter;
