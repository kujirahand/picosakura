import AudioWorkletNodeSynthesizer from './AudioWorkletNodeSynthesizer';
import * as MethodMessaging from './MethodMessaging';
/** @internal */
export default class WorkletSequencer {
    constructor(port) {
        this._messaging = MethodMessaging.initializeCallPort(port);
    }
    /** @internal */
    getRaw() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getRaw', []);
    }
    /** @internal */
    registerSequencerClientByName(clientName, callbackName, param) {
        return this.getRaw().then((seqPtr) => MethodMessaging.postCallWithPromise(this._messaging, 'registerSequencerClientByName', [seqPtr, clientName, callbackName, param]));
    }
    close() {
        MethodMessaging.postCall(this._messaging, 'close', []);
    }
    registerSynthesizer(synth) {
        let val;
        if (synth instanceof AudioWorkletNodeSynthesizer) {
            val = synth._getRawSynthesizer();
        }
        else {
            return Promise.reject(new TypeError('\'synth\' is not a compatible type instance'));
        }
        return val.then((v) => MethodMessaging.postCallWithPromise(this._messaging, 'registerSynthesizer', [v]));
    }
    unregisterClient(clientId) {
        MethodMessaging.postCall(this._messaging, 'unregisterClient', [clientId]);
    }
    getAllRegisteredClients() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getAllRegisteredClients', []);
    }
    getClientCount() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getClientCount', []);
    }
    getClientInfo(index) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getClientInfo', [index]);
    }
    setTimeScale(scale) {
        MethodMessaging.postCall(this._messaging, 'setTimeScale', [scale]);
    }
    getTimeScale() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getTimeScale', []);
    }
    getTick() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getTick', []);
    }
    sendEventAt(event, tick, isAbsolute) {
        MethodMessaging.postCall(this._messaging, 'sendEventAt', [event, tick, isAbsolute]);
    }
    sendEventToClientAt(clientId, event, tick, isAbsolute) {
        MethodMessaging.postCall(this._messaging, 'sendEventToClientAt', [clientId, event, tick, isAbsolute]);
    }
    removeAllEvents() {
        MethodMessaging.postCall(this._messaging, 'removeAllEvents', []);
    }
    removeAllEventsFromClient(clientId) {
        MethodMessaging.postCall(this._messaging, 'removeAllEventsFromClient', [clientId]);
    }
    processSequencer(msecToProcess) {
        MethodMessaging.postCall(this._messaging, 'processSequencer', [msecToProcess]);
    }
}
//# sourceMappingURL=WorkletSequencer.js.map