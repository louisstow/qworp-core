import { Step } from "prosemirror-transform";
import type { Schema } from "prosemirror-model";

import {
  getVersion,
  receiveTransaction,
  sendableSteps,
} from "prosemirror-collab";

import {
  E_APPLY_CHANGES,
  E_REQUEST_LOCAL_SYNC,
  E_SEND_REMOTE_CHANGES,
  E_SEND_LOCAL_CHANGES,
  E_TIMEOUT,
  M_SENDABLE,
  M_REQUEST_REMOTE_CHANGES,
  M_SEND_LOCAL_CHANGES,
  M_TIMEOUT,
} from "./constants";

import { COLLAB_ERROR, ONLINE_CHANGE } from "../events";

import type CollabState from "./state";
import type Connection from "./connection";
import type { EditorView } from "prosemirror-view";

type Changes = {
  steps: Step[];
  clientID: string | number;
  version: number;
};

class CollabOrchestrator {
  collabState: CollabState;
  conn: Connection;
  document: EditorView;
  schema: Schema;

  constructor(
    collabState: CollabState,
    conn: Connection,
    doc: EditorView,
    schema: Schema
  ) {
    this.collabState = collabState;
    this.conn = conn;
    this.document = doc;
    this.schema = schema;

    this.conn.on("MESSAGE", this.onMessage.bind(this));

    this.collabState.on(E_APPLY_CHANGES, this.applyChanges.bind(this));
    this.collabState.on(E_REQUEST_LOCAL_SYNC, this.localSyncRequest.bind(this));
    this.collabState.on(
      E_SEND_REMOTE_CHANGES,
      this.sendRemoteChanges.bind(this)
    );
    this.collabState.on(E_SEND_LOCAL_CHANGES, this.sendLocalChanges.bind(this));
    this.collabState.on(E_TIMEOUT, this.timeout.bind(this));
  }

  onMessage(msg: any) {
    if (msg.type === "online") {
      window.dispatchEvent(new CustomEvent(ONLINE_CHANGE, { detail: msg }));
    } else if (msg.type === "error") {
      window.dispatchEvent(new CustomEvent(COLLAB_ERROR, { detail: msg }));
    } else if (msg.type === "pong") {
      this.conn.handlePong();
    } else {
      this.collabState.handle(msg.type, msg);
    }
  }

  timeout() {
    this.collabState.handle(M_TIMEOUT, {});
  }

  applyChanges({
    steps,
    clientIDs,
  }: {
    steps: any;
    clientIDs: (string | number)[];
  }) {
    const schemaSteps = steps.map((s: any) => Step.fromJSON(this.schema, s));

    this.document.dispatch(
      receiveTransaction(this.document.state, schemaSteps, clientIDs)
    );
    this.collabState.setLocalVersion(getVersion(this.document.state));
  }

  localSyncRequest() {
    const type = M_SENDABLE;
    const payload = sendableSteps(this.document.state);
    const msg = { type, payload };

    if (payload) {
      this.collabState.handle(type, msg);
    }
  }

  sendRemoteChanges(version: number) {
    this.conn.send({ type: M_REQUEST_REMOTE_CHANGES, version });
  }

  sendLocalChanges(changes: {
    steps: any;
    version: number;
    clientID: string | number;
  }) {
    const payload = { ...changes, type: M_SEND_LOCAL_CHANGES };
    this.conn.send(payload);
  }
}

export { Changes };
export default CollabOrchestrator;
