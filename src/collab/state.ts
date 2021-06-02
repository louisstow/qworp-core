import type { Step } from "prosemirror-transform";
import type { Changes } from "./orchestrator";

import EventEmitter from "./event";
import { RELOAD } from "../events";

import {
  E_SEND_LOCAL_CHANGES,
  E_APPLY_CHANGES,
  E_SEND_REMOTE_CHANGES,
  E_REQUEST_LOCAL_SYNC,
  E_TIMEOUT,
  M_INVALID_VERSION,
  M_CONFIRMED,
  M_RECV_REMOTE_CHANGES,
  M_SENDABLE,
  M_NEW_VERSION,
  M_TIMEOUT,
} from "./constants";

interface State {
  enter(collab: CollabState): void;
  handle(collab: CollabState, type: string, msg: any): State | void;
}

// local sync means pushing changes to server
class LocalSync implements State {
  changes: Changes;
  timeoutId: NodeJS.Timeout | null;

  constructor(changes: Changes) {
    this.changes = changes;
    this.timeoutId = null;
  }

  enter(collab: CollabState) {
    const steps = this.changes.steps.map((s) => s.toJSON());

    collab.emit(E_SEND_LOCAL_CHANGES, {
      steps,
      version: this.changes.version,
      clientID: this.changes.clientID,
    });

    this.timeoutId = setTimeout(() => {
      collab.emit(E_TIMEOUT);
    }, 1000);
  }

  handle(collab: CollabState, type: string, msg: any): State | void {
    if (type === M_INVALID_VERSION) {
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
      }

      collab.setServerVersion(msg.version);

      if (collab.isLocalAhead()) {
        window.dispatchEvent(new CustomEvent(RELOAD));
        return;
      }

      return new RemoteSync();
    } else if (type === M_CONFIRMED) {
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
      }

      const steps = this.changes.steps.map((s) => s.toJSON());
      const clientIDs = this.changes.steps.map((_) => this.changes.clientID);

      collab.setLocalVersion(msg.version);
      collab.setServerVersion(msg.version);

      collab.emit(E_APPLY_CHANGES, { steps, clientIDs });

      return new Idle();
    } else if (type === M_TIMEOUT) {
      return new Idle();
    }
  }
}

// remote sync means pulling changes from server
class RemoteSync implements State {
  enter(collab: CollabState) {
    collab.emit(E_SEND_REMOTE_CHANGES, collab.localVersion);
  }

  handle(collab: CollabState, type: string, msg: any): State | void {
    if (type === M_RECV_REMOTE_CHANGES) {
      const steps = msg.payload.map((s: any) => s.step);
      const clientIDs = msg.payload.map((s: any) => s.clientID);
      collab.emit(E_APPLY_CHANGES, { steps, clientIDs });

      return new Idle();
    }
  }
}

class Idle implements State {
  enter(collab: CollabState) {
    if (collab.needsRemoteSync()) {
      return new RemoteSync();
    } else {
      // request from orchestrator for
      // any sendable changes
      collab.emit(E_REQUEST_LOCAL_SYNC);
    }
  }

  handle(collab: CollabState, type: string, msg: any): State | void {
    if (collab.needsRemoteSync()) {
      return new RemoteSync();
    } else if (type === M_SENDABLE) {
      return new LocalSync(msg.payload);
    }
  }
}

class CollabState extends EventEmitter {
  localVersion: number;
  serverVersion: number;
  state: State;

  constructor(localVersion: number, serverVersion: number) {
    super();

    this.localVersion = localVersion;
    this.serverVersion = serverVersion;
    this.state = new Idle();
  }

  needsRemoteSync() {
    return this.localVersion < this.serverVersion;
  }

  isLocalAhead() {
    return this.localVersion > this.serverVersion;
  }

  handle(type: string, msg: any) {
    if (type === M_NEW_VERSION) {
      this.serverVersion = msg.version;
    }

    let state = this.state.handle(this, type, msg);
    while (state && state !== this.state) {
      this.state = state;
      state = this.state.enter(this);
    }
  }

  setLocalVersion(version: number) {
    this.localVersion = version;
  }

  setServerVersion(version: number) {
    this.serverVersion = version;
  }
}

export default CollabState;
