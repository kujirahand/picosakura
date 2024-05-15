import { INVALID_POINTER } from './PointerType';
let _module;
let fluid_sfont_get_name;
let fluid_preset_get_name;
function bindFunctions() {
    if (_module) {
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        _module = AudioWorkletGlobalScope.wasmModule;
    }
    else {
        _module = Module;
    }
    fluid_sfont_get_name =
        _module.cwrap('fluid_sfont_get_name', 'string', ['number']);
    fluid_preset_get_name =
        _module.cwrap('fluid_preset_get_name', 'string', ['number']);
}
export default class Soundfont {
    // @internal
    constructor(sfontPtr) {
        this._ptr = sfontPtr;
    }
    static getSoundfontById(synth, id) {
        bindFunctions();
        const sfont = _module._fluid_synth_get_sfont_by_id(synth.getRawSynthesizer(), id);
        if (sfont === INVALID_POINTER) {
            return null;
        }
        return new Soundfont(sfont);
    }
    getName() {
        return fluid_sfont_get_name(this._ptr);
    }
    getPreset(bank, presetNum) {
        const presetPtr = _module._fluid_sfont_get_preset(this._ptr, bank, presetNum);
        if (presetPtr === INVALID_POINTER) {
            return null;
        }
        const name = fluid_preset_get_name(presetPtr);
        const bankNum = _module._fluid_preset_get_banknum(presetPtr);
        const num = _module._fluid_preset_get_num(presetPtr);
        return {
            soundfont: this,
            name,
            bankNum,
            num
        };
    }
    getPresetIterable() {
        const reset = () => {
            _module._fluid_sfont_iteration_start(this._ptr);
        };
        const next = () => {
            const presetPtr = _module._fluid_sfont_iteration_next(this._ptr);
            if (presetPtr === 0) {
                return {
                    done: true,
                    value: undefined
                };
            }
            else {
                const name = fluid_preset_get_name(presetPtr);
                const bankNum = _module._fluid_preset_get_banknum(presetPtr);
                const num = _module._fluid_preset_get_num(presetPtr);
                return {
                    done: false,
                    value: {
                        soundfont: this,
                        name,
                        bankNum,
                        num
                    }
                };
            }
        };
        const iterator = () => {
            reset();
            return {
                next,
            };
        };
        return {
            [Symbol.iterator]: iterator,
        };
    }
}
//# sourceMappingURL=Soundfont.js.map