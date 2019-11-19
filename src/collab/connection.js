import EventEmitter from './event';

const TIMEOUT_MS = 30000;

class Connection extends EventEmitter {
	constructor (url) {
		super();

		this.ws = null;
		this.url = url;
		this.connected = false;
		this.connecting = false;
		this.queue = [];

		this.interval = setInterval(this.sendPing.bind(this), 10 * 1000);
		this.timeout = null;

		this.connect();
	}

	connect () {
		if (this.connecting || this.connected) {
			return false;
		}
		
		this.ws = new WebSocket(this.url);
		this.ws.onmessage = this.onMessage.bind(this);
		this.ws.onclose = this.onClose.bind(this);
		this.ws.onopen = this.onOpen.bind(this);
		this.ws.onerror = this.onError.bind(this);

		this.connecting = true;

		this.timeout = setTimeout(() => this.onTimeout(), TIMEOUT_MS);

		return true;
	}

	onTimeout () {
		this.connected = false;
		this.connecting = false;
		this.timeout = null;
		this.ws.close();
	}

	onOpen () {
		this.connected = true;
		this.connecting = false;

		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		this.emit('CONNECT');

		while (this.queue.length) {
			const m = this.queue.unshift();
			this.send(m);
		}
	}

	onMessage (rawMsg) {
		const msg = JSON.parse(rawMsg.data);
		this.emit('MESSAGE', msg);
	}

	onClose (err) {
		this.emit('CLOSE');
		this.connected = false;
		this.connecting = false;

		window.dispatchEvent(new CustomEvent('RECONNECTING'));

		setTimeout(() => this.connect(this.url), 1000);
	}

	onError (err) {
		this.emit('ERROR');
	}

	send (rawMsg) {
		if (!this.connected) {
			this.queue.push(rawMsg);
			return;
		}

		return this.ws.send(JSON.stringify(rawMsg));
	}

	sendPing () {
		if (!this.connected) { return; }
		return this.ws.send(JSON.stringify({ type: 'ping' }));
	}

	handlePong () {
		
	}
};

export default Connection;