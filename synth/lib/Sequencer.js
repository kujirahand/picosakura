import { rewriteEventDataImpl } from './ISequencerEventData';
import { INVALID_POINTER } from './PointerType';
import SequencerEventData from './SequencerEventData';
import Synthesizer from './Synthesizer';
let _module;
let _removeFunction;
let fluid_sequencer_get_client_name;
function bindFunctions() {
    if (_module) {
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        _module = AudioWorkletGlobalScope.wasmModule;
        _removeFunction = AudioWorkletGlobalScope.wasmRemoveFunction;
    }
    else {
        _module = Module;
        _removeFunction = removeFunction;
    }
    fluid_sequencer_get_client_name =
        _module.cwrap('fluid_sequencer_get_client_name', 'string', ['number', 'number']);
}
function makeEvent(event) {
    const ev = _module._new_fluid_event();
    if (!rewriteEventDataImpl(ev, event)) {
        _module._delete_fluid_event(ev);
        return null;
    }
    return ev;
}
/** @internal */
export default class Sequencer {
    constructor() {
        bindFunctions();
        this._seq = INVALID_POINTER;
        this._seqId = -1;
        this._clientFuncMap = {};
    }
    /** @internal */
    _initialize() {
        this.close();
        this._seq = _module._new_fluid_sequencer2(0);
        this._seqId = -1;
        return Promise.resolve();
    }
    /** @internal */
    getRaw() {
        return this._seq;
    }
    close() {
        if (this._seq !== INVALID_POINTER) {
            Object.keys(this._clientFuncMap).forEach((clientIdStr) => {
                this.unregisterClient(Number(clientIdStr));
            });
            this.unregisterClient(-1);
            _module._delete_fluid_sequencer(this._seq);
            this._seq = INVALID_POINTER;
        }
    }
    registerSynthesizer(synth) {
        if (this._seqId !== -1) {
            _module._fluid_sequencer_unregister_client(this._seq, this._seqId);
            this._seqId = -1;
        }
        let val;
        if (typeof synth === 'number') {
            val = synth;
        }
        else if (synth instanceof Synthesizer) {
            val = synth.getRawSynthesizer();
        }
        else {
            return Promise.reject(new TypeError('\'synth\' is not a compatible type instance'));
        }
        this._seqId = _module._fluid_sequencer_register_fluidsynth(this._seq, val);
        return Promise.resolve(this._seqId);
    }
    unregisterClient(clientId) {
        if (clientId === -1) {
            clientId = this._seqId;
            if (clientId === -1) {
                return;
            }
        }
        // send 'unregistering' event
        const ev = _module._new_fluid_event();
        _module._fluid_event_set_source(ev, -1);
        _module._fluid_event_set_dest(ev, clientId);
        _module._fluid_event_unregistering(ev);
        _module._fluid_sequencer_send_now(this._seq, ev);
        _module._delete_fluid_event(ev);
        _module._fluid_sequencer_unregister_client(this._seq, clientId);
        if (this._seqId === clientId) {
            this._seqId = -1;
        }
        else {
            const map = this._clientFuncMap;
            if (map[clientId]) {
                _removeFunction(map[clientId]);
                delete map[clientId];
            }
        }
    }
    getAllRegisteredClients() {
        const c = _module._fluid_sequencer_count_clients(this._seq);
        const r = [];
        for (let i = 0; i < c; ++i) {
            const id = _module._fluid_sequencer_get_client_id(this._seq, i);
            const name = fluid_sequencer_get_client_name(this._seq, id);
            r.push({ clientId: id, name: name });
        }
        return Promise.resolve(r);
    }
    getClientCount() {
        return Promise.resolve(_module._fluid_sequencer_count_clients(this._seq));
    }
    getClientInfo(index) {
        const id = _module._fluid_sequencer_get_client_id(this._seq, index);
        const name = fluid_sequencer_get_client_name(this._seq, id);
        return Promise.resolve({ clientId: id, name: name });
    }
    setTimeScale(scale) {
        _module._fluid_sequencer_set_time_scale(this._seq, scale);
    }
    getTimeScale() {
        return Promise.resolve(_module._fluid_sequencer_get_time_scale(this._seq));
    }
    getTick() {
        return Promise.resolve(_module._fluid_sequencer_get_tick(this._seq));
    }
    sendEventAt(event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            // send to all clients
            const count = _module._fluid_sequencer_count_clients(this._seq);
            for (let i = 0; i < count; ++i) {
                const id = _module._fluid_sequencer_get_client_id(this._seq, i);
                _module._fluid_event_set_dest(ev, id);
                _module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            }
            _module._delete_fluid_event(ev);
        }
    }
    sendEventToClientAt(clientId, event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            _module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventToClientNow(clientId, event) {
        const ev = makeEvent(event);
        if (ev !== null) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_now(this._seq, ev);
            _module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventNow(clientId, eventData) {
        if (!(eventData instanceof SequencerEventData)) {
            return;
        }
        const ev = eventData.getRaw();
        if (ev !== INVALID_POINTER) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_now(this._seq, ev);
        }
    }
    removeAllEvents() {
        _module._fluid_sequencer_remove_events(this._seq, -1, -1, -1);
    }
    removeAllEventsFromClient(clientId) {
        _module._fluid_sequencer_remove_events(this._seq, -1, clientId === -1 ? this._seqId : clientId, -1);
    }
    processSequencer(msecToProcess) {
        if (this._seq !== INVALID_POINTER) {
            _module._fluid_sequencer_process(this._seq, msecToProcess);
        }
    }
    /** @internal */
    setIntervalForSequencer(msec) {
        return setInterval(() => this.processSequencer(msec), msec);
    }
}
//# sourceMappingURL=Sequencer.js.map