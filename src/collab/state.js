import EventEmitter from './event';

import {
	E_SEND_LOCAL_CHANGES,
	E_APPLY_CHANGES,
	E_SEND_REMOTE_CHANGES,
	E_REQUEST_LOCAL_SYNC,

	M_INVALID_VERSION,
	M_CONFIRMED,
	M_RECV_REMOTE_CHANGES,
	M_SENDABLE,
	M_NEW_VERSION
} from './constants';

class State {
	enter () {}
	handle () {}
}

// local sync means pushing changes to server
class LocalSync extends State {
	constructor (changes) {
		super();
		this.changes = changes;
	}

	enter (collab) {
		const steps = this.changes.steps.map(s => s.toJSON());

		collab.emit(E_SEND_LOCAL_CHANGES, {
			steps,
			version: this.changes.version,
			clientID: this.changes.clientID
		});
	}

	handle (collab, type, msg) {
		if (type === M_INVALID_VERSION) {
			collab.setServerVersion(msg.version);
			return new RemoteSync;
		} else if (type === M_CONFIRMED) {
			const steps = this.changes.steps.map(s => s.toJSON());
			const clientIDs = this.changes.steps.map(s => this.changes.clientID);

			collab.setLocalVersion(msg.version)
			collab.setServerVersion(msg.version)

			collab.emit(E_APPLY_CHANGES, { steps, clientIDs });

			return new Idle;
		}
	}
}

// remote sync means pulling changes from server
class RemoteSync extends State {
	enter (collab) {
		collab.emit(E_SEND_REMOTE_CHANGES, collab.localVersion);
	}

	handle (collab, type, msg) {
		if (type === M_RECV_REMOTE_CHANGES) {
			const steps = msg.payload.map(s => s.step);
			const clientIDs = msg.payload.map(s => s.clientID);
			collab.emit(E_APPLY_CHANGES, { steps, clientIDs });

			return new Idle;
		}
	}
}

class Idle extends State {
	enter (collab) {
		if (collab.needsRemoteSync()) {
			return new RemoteSync;
		} else {
			// request from orchestrator for
			// any sendable changes
			collab.emit(E_REQUEST_LOCAL_SYNC);
		}
	}

	handle (collab, type, msg) {
		if (collab.needsRemoteSync()) {
			return new RemoteSync;
		} else if (type === M_SENDABLE) {
			return new LocalSync(msg.payload);
		}
	}
}

class CollabState extends EventEmitter {
	constructor (localVersion, serverVersion) {
		super();

		this.localVersion = localVersion;
		this.serverVersion = serverVersion;
		this.state = new Idle;
	}

	needsRemoteSync () {
		return this.localVersion < this.serverVersion;
	}

	handle (type, msg) {
		if (type === M_NEW_VERSION) {
			this.serverVersion = msg.version;
		}

		let state = this.state.handle(this, type, msg);
		while (state && state !== this.state) {
			this.state = state;
			state = this.state.enter(this);
		}
	}

	setLocalVersion (version) {
		this.localVersion = version;
	}

	setServerVersion (version) {
		this.serverVersion = version;
	}	
}

export default CollabState;