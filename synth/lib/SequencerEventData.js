import { INVALID_POINTER } from './PointerType';
/** @internal */
export default class SequencerEventData {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    /** @internal */
    getRaw() {
        return this._ptr;
    }
    /** @internal */
    dispose() {
        this._ptr = INVALID_POINTER;
    }
    getType() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_type(this._ptr);
    }
    getSource() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_source(this._ptr);
    }
    getDest() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_dest(this._ptr);
    }
    getChannel() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_channel(this._ptr);
    }
    getKey() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_key(this._ptr);
    }
    getVelocity() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_velocity(this._ptr);
    }
    getControl() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_control(this._ptr);
    }
    getValue() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_value(this._ptr);
    }
    getProgram() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_program(this._ptr);
    }
    getData() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_data(this._ptr);
    }
    getDuration() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_duration(this._ptr);
    }
    getBank() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_bank(this._ptr);
    }
    getPitch() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_pitch(this._ptr);
    }
    getSFontId() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_sfont_id(this._ptr);
    }
}
//# sourceMappingURL=SequencerEventData.js.map