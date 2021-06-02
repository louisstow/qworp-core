import EventEmitter from "./event";
import { RECONNECT, RECONNECTING } from "../events";

const TIMEOUT_MS = 30000;

class Connection extends EventEmitter {
  ws: WebSocket | null;
  url: string;
  connected: boolean;
  connecting: boolean;
  queue: string[];

  interval: NodeJS.Timeout | null;
  timeout: NodeJS.Timeout | null;

  constructor(url: string) {
    super();

    this.ws = null;
    this.url = url;
    this.connected = false;
    this.connecting = false;
    this.queue = [];

    this.interval = setInterval(this.sendPing.bind(this), 10 * 1000);
    this.timeout = null;

    this.connect();

    window.addEventListener(RECONNECT, this.reconnect.bind(this));
  }

  connect() {
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

  reconnect() {
    if (this.ws && !this.ws.CLOSED) {
      this.ws.close();
    }
  }

  onTimeout() {
    this.connected = false;
    this.connecting = false;
    this.timeout = null;
    if (this.ws && !this.ws.CLOSED) {
      this.ws.close();
    }
  }

  onOpen() {
    this.connected = true;
    this.connecting = false;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.emit("CONNECT");

    while (this.queue.length) {
      const m = this.queue.shift();
      this.send(m);
    }
  }

  onMessage(rawMsg: MessageEvent) {
    const msg = JSON.parse(rawMsg.data);
    this.emit("MESSAGE", msg);
  }

  onClose() {
    this.emit("CLOSE");
    this.connected = false;
    this.connecting = false;

    window.dispatchEvent(new CustomEvent(RECONNECTING));

    setTimeout(() => this.connect(), 1000);
  }

  onError() {
    this.emit("ERROR");
  }

  send(rawMsg: any) {
    if (!this.connected) {
      this.queue.push(rawMsg);
      return;
    }

    if (this.ws) {
      this.ws.send(JSON.stringify(rawMsg));
    }
  }

  sendPing() {
    if (!this.connected) {
      return;
    }

    if (this.ws) {
      this.ws.send(JSON.stringify({ type: "ping" }));
    }
  }

  handlePong() {}
}

export default Connection;
