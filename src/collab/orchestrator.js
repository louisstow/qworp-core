import { Step } from 'prosemirror-transform';
import { getVersion, receiveTransaction, sendableSteps } from "prosemirror-collab";

import { 
	E_APPLY_CHANGES,
	E_REQUEST_LOCAL_SYNC,
	E_SEND_REMOTE_CHANGES,
	E_SEND_LOCAL_CHANGES,

	M_SENDABLE,
	M_REQUEST_REMOTE_CHANGES,
	M_SEND_LOCAL_CHANGES
} from './constants';

class CollabOrchestrator {
	constructor (collabState, conn, doc, schema) {
		this.collabState = collabState;
		this.conn = conn;
		this.document = doc;
		this.schema = schema;

		this.conn.on('MESSAGE', this.onMessage.bind(this));

		this.collabState.on(E_APPLY_CHANGES, this.applyChanges.bind(this));
		this.collabState.on(E_REQUEST_LOCAL_SYNC, this.localSyncRequest.bind(this));
		this.collabState.on(E_SEND_REMOTE_CHANGES, this.sendRemoteChanges.bind(this));
		this.collabState.on(E_SEND_LOCAL_CHANGES, this.sendLocalChanges.bind(this));
	}

	onMessage (msg) {
		if (msg.type === 'online') {
			window.dispatchEvent(new CustomEvent("onlineChange", { detail: msg }));
		} else if (msg.type === 'error') {
			window.dispatchEvent(new CustomEvent("collabError", { detail: msg }));
		} else if (msg.type === 'pong') {
			this.conn.handlePong();
		} else {
			this.collabState.handle(msg.type, msg);
		}
	}

	applyChanges ({steps, clientIDs}) {
		const schemaSteps = steps.map(s => Step.fromJSON(this.schema, s));
		
		this.document.dispatch(receiveTransaction(this.document.state, schemaSteps, clientIDs));
		this.collabState.setLocalVersion(getVersion(this.document.state));
	}	

	localSyncRequest () {
		const type = M_SENDABLE;
		const payload = sendableSteps(this.document.state);
		const msg = { type, payload };

		if (payload) {
			this.collabState.handle(type, msg);	
		}
	}

	sendRemoteChanges (version) {
		this.conn.send({ type: M_REQUEST_REMOTE_CHANGES, version });
	}

	sendLocalChanges (changes) {
		changes.type = M_SEND_LOCAL_CHANGES;
		this.conn.send(changes);
	}
}

export default CollabOrchestrator;