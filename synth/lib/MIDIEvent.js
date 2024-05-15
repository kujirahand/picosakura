/** @internal */
export default class MIDIEvent {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    getType() {
        return this._module._fluid_midi_event_get_type(this._ptr);
    }
    setType(value) {
        this._module._fluid_midi_event_set_type(this._ptr, value);
    }
    getChannel() {
        return this._module._fluid_midi_event_get_channel(this._ptr);
    }
    setChannel(value) {
        this._module._fluid_midi_event_set_channel(this._ptr, value);
    }
    getKey() {
        return this._module._fluid_midi_event_get_key(this._ptr);
    }
    setKey(value) {
        this._module._fluid_midi_event_set_key(this._ptr, value);
    }
    getVelocity() {
        return this._module._fluid_midi_event_get_velocity(this._ptr);
    }
    setVelocity(value) {
        this._module._fluid_midi_event_set_velocity(this._ptr, value);
    }
    getControl() {
        return this._module._fluid_midi_event_get_control(this._ptr);
    }
    setControl(value) {
        this._module._fluid_midi_event_set_control(this._ptr, value);
    }
    getValue() {
        return this._module._fluid_midi_event_get_value(this._ptr);
    }
    setValue(value) {
        this._module._fluid_midi_event_set_value(this._ptr, value);
    }
    getProgram() {
        return this._module._fluid_midi_event_get_program(this._ptr);
    }
    setProgram(value) {
        this._module._fluid_midi_event_set_program(this._ptr, value);
    }
    getPitch() {
        return this._module._fluid_midi_event_get_pitch(this._ptr);
    }
    setPitch(value) {
        this._module._fluid_midi_event_set_pitch(this._ptr, value);
    }
    setSysEx(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_sysex(this._ptr, ptr, size, 1);
    }
    setText(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_text(this._ptr, ptr, size, 1);
    }
    setLyrics(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_lyrics(this._ptr, ptr, size, 1);
    }
}
//# sourceMappingURL=MIDIEvent.js.map