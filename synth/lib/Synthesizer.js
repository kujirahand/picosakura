import { INVALID_POINTER } from './PointerType';
import MIDIEvent from './MIDIEvent';
import Sequencer from './Sequencer';
import SequencerEventData from './SequencerEventData';
import Soundfont from './Soundfont';
let _module;
let _addFunction;
let _removeFunction;
let _fs;
// wrapper to use String type
let fluid_settings_setint;
let fluid_settings_setnum;
let fluid_settings_setstr;
let fluid_synth_error;
let fluid_synth_sfload;
let fluid_sequencer_register_client;
let malloc;
let free;
let defaultMIDIEventCallback;
function bindFunctions() {
    if (fluid_synth_error) {
        // (already bound)
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        _module = AudioWorkletGlobalScope.wasmModule;
        _addFunction = AudioWorkletGlobalScope.wasmAddFunction;
        _removeFunction = AudioWorkletGlobalScope.wasmRemoveFunction;
    }
    else if (typeof Module !== 'undefined') {
        _module = Module;
        _addFunction = addFunction;
        _removeFunction = removeFunction;
    }
    else {
        throw new Error('wasm module is not available. libfluidsynth-*.js must be loaded.');
    }
    _fs = _module.FS;
    // wrapper to use String type
    fluid_settings_setint =
        _module.cwrap('fluid_settings_setint', 'number', ['number', 'string', 'number']);
    fluid_settings_setnum =
        _module.cwrap('fluid_settings_setnum', 'number', ['number', 'string', 'number']);
    fluid_settings_setstr =
        _module.cwrap('fluid_settings_setstr', 'number', ['number', 'string', 'string']);
    fluid_synth_error =
        _module.cwrap('fluid_synth_error', 'string', ['number']);
    fluid_synth_sfload =
        _module.cwrap('fluid_synth_sfload', 'number', ['number', 'string', 'number']);
    fluid_sequencer_register_client =
        _module.cwrap('fluid_sequencer_register_client', 'number', ['number', 'string', 'number', 'number']);
    malloc = _module._malloc.bind(_module);
    free = _module._free.bind(_module);
    defaultMIDIEventCallback = _module._fluid_synth_handle_midi_event.bind(_module);
}
let promiseWaitForInitialized;
function waitForInitialized() {
    if (promiseWaitForInitialized) {
        return promiseWaitForInitialized;
    }
    let mod;
    let addOnPostRunFn;
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        mod = AudioWorkletGlobalScope.wasmModule;
        addOnPostRunFn = AudioWorkletGlobalScope.addOnPostRun;
    }
    else if (typeof Module !== 'undefined') {
        mod = Module;
        addOnPostRunFn = typeof addOnPostRun !== 'undefined' ? addOnPostRun : undefined;
    }
    else {
        return Promise.reject(new Error('wasm module is not available. libfluidsynth-*.js must be loaded.'));
    }
    if (mod.calledRun) {
        promiseWaitForInitialized = Promise.resolve();
        return promiseWaitForInitialized;
    }
    if (typeof addOnPostRunFn === 'undefined') {
        promiseWaitForInitialized = new Promise((resolve) => {
            const fn = _module.onRuntimeInitialized;
            _module.onRuntimeInitialized = () => {
                resolve();
                if (fn) {
                    fn();
                }
            };
        });
    }
    else {
        promiseWaitForInitialized = new Promise((resolve) => {
            addOnPostRunFn(resolve);
        });
    }
    return promiseWaitForInitialized;
}
function setBoolValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value ? 1 : 0);
    }
}
function setIntValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value);
    }
}
function setNumValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setnum(settings, name, value);
    }
}
function setStrValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setstr(settings, name, value);
    }
}
function getActiveVoiceCount(synth) {
    const actualCount = _module._fluid_synth_get_active_voice_count(synth);
    if (!actualCount) {
        return 0;
    }
    // FluidSynth may return incorrect value for active voice count,
    // so check internal data and correct it
    // check if the structure is not changed
    // for fluidsynth 2.0.x-2.1.x:
    //   140 === offset [synth->voice]
    //   144 === offset [synth->active_voice_count] for 
    // for fluidsynth 2.2.x:
    //   144 === offset [synth->voice]
    //   148 === offset [synth->active_voice_count]
    // first check 2.1.x structure
    let baseOffsetOfVoice = 140;
    let offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
    let structActiveVoiceCount = _module.HEAPU32[offsetOfActiveVoiceCount];
    if (structActiveVoiceCount !== actualCount) {
        // add 4 for 2.2.x
        baseOffsetOfVoice += 4;
        offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
        structActiveVoiceCount = _module.HEAPU32[offsetOfActiveVoiceCount];
        if (structActiveVoiceCount !== actualCount) {
            // unknown structure
            const c = console;
            c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
            return actualCount;
        }
    }
    const voiceList = _module.HEAPU32[(synth + baseOffsetOfVoice) >> 2];
    // (voice should not be NULL)
    if (!voiceList || voiceList >= _module.HEAPU32.byteLength) {
        // unknown structure
        const c = console;
        c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
        return actualCount;
    }
    // count of internal voice data is restricted to polyphony value
    const voiceCount = _module._fluid_synth_get_polyphony(synth);
    let isRunning = false;
    for (let i = 0; i < voiceCount; ++i) {
        // auto voice = voiceList[i]
        const voice = _module.HEAPU32[(voiceList >> 2) + i];
        if (!voice) {
            continue;
        }
        // offset [voice->status]
        const status = _module.HEAPU8[voice + 4];
        // 4: FLUID_VOICE_OFF
        if (status !== 4) {
            isRunning = true;
            break;
        }
    }
    if (!isRunning) {
        if (structActiveVoiceCount !== 0) {
            const c = console;
            c.warn('js-synthesizer: Active voice count is not zero, but all voices are off:', structActiveVoiceCount);
        }
        _module.HEAPU32[offsetOfActiveVoiceCount] = 0;
        return 0;
    }
    return actualCount;
}
function makeRandomFileName(type, ext) {
    return `/${type}-r${Math.random() * 65535}-${Math.random() * 65535}${ext}`;
}
function makeMIDIEventCallback(synth, cb, param) {
    return (data, event) => {
        const t = _module._fluid_midi_event_get_type(event);
        if (cb(synth, t, new MIDIEvent(event, _module), param)) {
            return 0;
        }
        return _module._fluid_synth_handle_midi_event(data, event);
    };
}
/** Default implementation of ISynthesizer */
export default class Synthesizer {
    constructor() {
        bindFunctions();
        this._settings = INVALID_POINTER;
        this._synth = INVALID_POINTER;
        this._player = INVALID_POINTER;
        this._playerPlaying = false;
        this._playerCallbackPtr = null;
        this._fluidSynthCallback = null;
        this._buffer = INVALID_POINTER;
        this._bufferSize = 0;
        this._numPtr = INVALID_POINTER;
        this._gain = 0.5 /* Gain */;
    }
    /** Return the promise object that resolves when WebAssembly has been initialized */
    static waitForWasmInitialized() {
        return waitForInitialized();
    }
    isInitialized() {
        return this._synth !== INVALID_POINTER;
    }
    /** Return the raw synthesizer instance value (pointer for libfluidsynth). */
    getRawSynthesizer() {
        return this._synth;
    }
    createAudioNode(context, frameSize) {
        const node = context.createScriptProcessor(frameSize, 0, 2);
        node.addEventListener("audioprocess", (ev) => {
            this.render(ev.outputBuffer);
        });
        return node;
    }
    init(sampleRate, settings) {
        this.close();
        const set = (this._settings = _module._new_fluid_settings());
        fluid_settings_setnum(set, "synth.sample-rate", sampleRate);
        if (settings) {
            if (typeof settings.initialGain !== "undefined") {
                this._gain = settings.initialGain;
            }
            setBoolValueForSettings(set, "synth.chorus.active", settings.chorusActive);
            setNumValueForSettings(set, "synth.chorus.depth", settings.chorusDepth);
            setNumValueForSettings(set, "synth.chorus.level", settings.chorusLevel);
            setIntValueForSettings(set, "synth.chorus.nr", settings.chorusNr);
            setNumValueForSettings(set, "synth.chorus.speed", settings.chorusSpeed);
            setIntValueForSettings(set, "synth.midi-channels", settings.midiChannelCount);
            setStrValueForSettings(set, "synth.midi-bank-select", settings.midiBankSelect);
            setIntValueForSettings(set, "synth.min-note-length", settings.minNoteLength);
            setNumValueForSettings(set, "synth.overflow.age", settings.overflowAge);
            setNumValueForSettings(set, "synth.overflow.important", settings.overflowImportantValue);
            if (typeof settings.overflowImportantChannels !== "undefined") {
                fluid_settings_setstr(set, "synth.overflow.important-channels", settings.overflowImportantChannels.join(","));
            }
            setNumValueForSettings(set, "synth.overflow.percussion", settings.overflowPercussion);
            setNumValueForSettings(set, "synth.overflow.released", settings.overflowReleased);
            setNumValueForSettings(set, "synth.overflow.sustained", settings.overflowSustained);
            setNumValueForSettings(set, "synth.overflow.volume", settings.overflowVolume);
            setIntValueForSettings(set, "synth.polyphony", settings.polyphony);
            setBoolValueForSettings(set, "synth.reverb.active", settings.reverbActive);
            setNumValueForSettings(set, "synth.reverb.damp", settings.reverbDamp);
            setNumValueForSettings(set, "synth.reverb.level", settings.reverbLevel);
            setNumValueForSettings(set, "synth.reverb.room-size", settings.reverbRoomSize);
            setNumValueForSettings(set, "synth.reverb.width", settings.reverbWidth);
        }
        fluid_settings_setnum(set, "synth.gain", this._gain);
        this._synth = _module._new_fluid_synth(this._settings);
        this._numPtr = malloc(8);
    }
    close() {
        if (this._synth === INVALID_POINTER) {
            return;
        }
        this._closePlayer();
        _module._delete_fluid_synth(this._synth);
        this._synth = INVALID_POINTER;
        _module._delete_fluid_settings(this._settings);
        this._settings = INVALID_POINTER;
        free(this._numPtr);
        this._numPtr = INVALID_POINTER;
    }
    isPlaying() {
        return (this._synth !== INVALID_POINTER &&
            getActiveVoiceCount(this._synth) > 0);
    }
    setInterpolation(value, channel) {
        this.ensureInitialized();
        if (typeof channel === "undefined") {
            channel = -1;
        }
        _module._fluid_synth_set_interp_method(this._synth, channel, value);
    }
    getGain() {
        return this._gain;
    }
    setGain(gain) {
        this.ensureInitialized();
        _module._fluid_synth_set_gain(this._synth, gain);
        this._gain = _module._fluid_synth_get_gain(this._synth);
    }
    setChannelType(channel, isDrum) {
        this.ensureInitialized();
        // CHANNEL_TYPE_MELODIC = 0, CHANNEL_TYPE_DRUM = 1
        _module._fluid_synth_set_channel_type(this._synth, channel, isDrum ? 1 : 0);
    }
    waitForVoicesStopped() {
        return this.flushFramesAsync();
    }
    loadSFont(bin) {
        this.ensureInitialized();
        const name = makeRandomFileName("sfont", ".sf2");
        const ub = new Uint8Array(bin);
        _fs.writeFile(name, ub);
        const sfont = fluid_synth_sfload(this._synth, name, 1);
        _fs.unlink(name);
        return sfont === -1
            ? Promise.reject(new Error(fluid_synth_error(this._synth)))
            : Promise.resolve(sfont);
    }
    unloadSFont(id) {
        this.ensureInitialized();
        this.stopPlayer();
        this.flushFramesSync();
        _module._fluid_synth_sfunload(this._synth, id, 1);
    }
    unloadSFontAsync(id) {
        // not throw with Promise.reject
        this.ensureInitialized();
        this.stopPlayer();
        return this.flushFramesAsync().then(() => {
            _module._fluid_synth_sfunload(this._synth, id, 1);
        });
    }
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return `Soundfont` instance or `null` if `sfontId` is not valid or loaded
     */
    getSFontObject(sfontId) {
        return Soundfont.getSoundfontById(this, sfontId);
    }
    getSFontBankOffset(id) {
        this.ensureInitialized();
        return Promise.resolve(_module._fluid_synth_get_bank_offset(this._synth, id));
    }
    setSFontBankOffset(id, offset) {
        this.ensureInitialized();
        _module._fluid_synth_set_bank_offset(this._synth, id, offset);
    }
    render(outBuffer) {
        const frameCount = "numberOfChannels" in outBuffer
            ? outBuffer.length
            : outBuffer[0].length;
        const channels = "numberOfChannels" in outBuffer
            ? outBuffer.numberOfChannels
            : outBuffer.length;
        const sizePerChannel = 4 * frameCount;
        const totalSize = sizePerChannel * 2;
        if (this._bufferSize < totalSize) {
            if (this._buffer !== INVALID_POINTER) {
                free(this._buffer);
            }
            this._buffer = malloc(totalSize);
            this._bufferSize = totalSize;
        }
        const memLeft = this._buffer;
        const memRight = (this._buffer +
            sizePerChannel);
        this.renderRaw(memLeft, memRight, frameCount);
        const aLeft = new Float32Array(_module.HEAPU8.buffer, memLeft, frameCount);
        const aRight = channels >= 2
            ? new Float32Array(_module.HEAPU8.buffer, memRight, frameCount)
            : null;
        if ("numberOfChannels" in outBuffer) {
            if (outBuffer.copyToChannel) {
                outBuffer.copyToChannel(aLeft, 0, 0);
                if (aRight) {
                    outBuffer.copyToChannel(aRight, 1, 0);
                }
            }
            else {
                // copyToChannel API not exist in Safari AudioBuffer
                const leftData = outBuffer.getChannelData(0);
                aLeft.forEach((val, i) => (leftData[i] = val));
                if (aRight) {
                    const rightData = outBuffer.getChannelData(1);
                    aRight.forEach((val, i) => (rightData[i] = val));
                }
            }
        }
        else {
            outBuffer[0].set(aLeft);
            if (aRight) {
                outBuffer[1].set(aRight);
            }
        }
        // check and update player status
        this.isPlayerPlaying();
    }
    midiNoteOn(chan, key, vel) {
        _module._fluid_synth_noteon(this._synth, chan, key, vel);
    }
    midiNoteOff(chan, key) {
        _module._fluid_synth_noteoff(this._synth, chan, key);
    }
    midiKeyPressure(chan, key, val) {
        _module._fluid_synth_key_pressure(this._synth, chan, key, val);
    }
    midiControl(chan, ctrl, val) {
        _module._fluid_synth_cc(this._synth, chan, ctrl, val);
    }
    midiProgramChange(chan, prognum) {
        _module._fluid_synth_program_change(this._synth, chan, prognum);
    }
    midiChannelPressure(chan, val) {
        _module._fluid_synth_channel_pressure(this._synth, chan, val);
    }
    midiPitchBend(chan, val) {
        _module._fluid_synth_pitch_bend(this._synth, chan, val);
    }
    midiSysEx(data) {
        const len = data.byteLength;
        const mem = malloc(len);
        _module.HEAPU8.set(data, mem);
        _module._fluid_synth_sysex(this._synth, mem, len, INVALID_POINTER, INVALID_POINTER, INVALID_POINTER, 0);
        free(mem);
    }
    midiPitchWheelSensitivity(chan, val) {
        _module._fluid_synth_pitch_wheel_sens(this._synth, chan, val);
    }
    midiBankSelect(chan, bank) {
        _module._fluid_synth_bank_select(this._synth, chan, bank);
    }
    midiSFontSelect(chan, sfontId) {
        _module._fluid_synth_sfont_select(this._synth, chan, sfontId);
    }
    midiProgramSelect(chan, sfontId, bank, presetNum) {
        _module._fluid_synth_program_select(this._synth, chan, sfontId, bank, presetNum);
    }
    midiUnsetProgram(chan) {
        _module._fluid_synth_unset_program(this._synth, chan);
    }
    midiProgramReset() {
        _module._fluid_synth_program_reset(this._synth);
    }
    midiSystemReset() {
        _module._fluid_synth_system_reset(this._synth);
    }
    midiAllNotesOff(chan) {
        _module._fluid_synth_all_notes_off(this._synth, typeof chan === "undefined" ? -1 : chan);
    }
    midiAllSoundsOff(chan) {
        _module._fluid_synth_all_sounds_off(this._synth, typeof chan === "undefined" ? -1 : chan);
    }
    midiSetChannelType(chan, isDrum) {
        // CHANNEL_TYPE_MELODIC = 0
        // CHANNEL_TYPE_DRUM = 1
        _module._fluid_synth_set_channel_type(this._synth, chan, isDrum ? 1 : 0);
    }
    /**
     * Set reverb parameters to the synthesizer.
     */
    setReverb(roomsize, damping, width, level) {
        _module._fluid_synth_set_reverb(this._synth, roomsize, damping, width, level);
    }
    /**
     * Set reverb roomsize parameter to the synthesizer.
     */
    setReverbRoomsize(roomsize) {
        _module._fluid_synth_set_reverb_roomsize(this._synth, roomsize);
    }
    /**
     * Set reverb damping parameter to the synthesizer.
     */
    setReverbDamp(damping) {
        _module._fluid_synth_set_reverb_damp(this._synth, damping);
    }
    /**
     * Set reverb width parameter to the synthesizer.
     */
    setReverbWidth(width) {
        _module._fluid_synth_set_reverb_width(this._synth, width);
    }
    /**
     * Set reverb level to the synthesizer.
     */
    setReverbLevel(level) {
        _module._fluid_synth_set_reverb_level(this._synth, level);
    }
    /**
     * Enable or disable reverb effect of the synthesizer.
     */
    setReverbOn(on) {
        _module._fluid_synth_set_reverb_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get reverb roomsize parameter of the synthesizer.
     */
    getReverbRoomsize() {
        return _module._fluid_synth_get_reverb_roomsize(this._synth);
    }
    /**
     * Get reverb damping parameter of the synthesizer.
     */
    getReverbDamp() {
        return _module._fluid_synth_get_reverb_damp(this._synth);
    }
    /**
     * Get reverb level of the synthesizer.
     */
    getReverbLevel() {
        return _module._fluid_synth_get_reverb_level(this._synth);
    }
    /**
     * Get reverb width parameter of the synthesizer.
     */
    getReverbWidth() {
        return _module._fluid_synth_get_reverb_width(this._synth);
    }
    /**
     * Set chorus parameters to the synthesizer.
     */
    setChorus(voiceCount, level, speed, depthMillisec, type) {
        _module._fluid_synth_set_chorus(this._synth, voiceCount, level, speed, depthMillisec, type);
    }
    /**
     * Set chorus voice count parameter to the synthesizer.
     */
    setChorusVoiceCount(voiceCount) {
        _module._fluid_synth_set_chorus_nr(this._synth, voiceCount);
    }
    /**
     * Set chorus level parameter to the synthesizer.
     */
    setChorusLevel(level) {
        _module._fluid_synth_set_chorus_level(this._synth, level);
    }
    /**
     * Set chorus speed parameter to the synthesizer.
     */
    setChorusSpeed(speed) {
        _module._fluid_synth_set_chorus_speed(this._synth, speed);
    }
    /**
     * Set chorus depth parameter to the synthesizer.
     */
    setChorusDepth(depthMillisec) {
        _module._fluid_synth_set_chorus_depth(this._synth, depthMillisec);
    }
    /**
     * Set chorus modulation type to the synthesizer.
     */
    setChorusType(type) {
        _module._fluid_synth_set_chorus_type(this._synth, type);
    }
    /**
     * Enable or disable chorus effect of the synthesizer.
     */
    setChorusOn(on) {
        _module._fluid_synth_set_chorus_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get chorus voice count of the synthesizer.
     */
    getChorusVoiceCount() {
        return _module._fluid_synth_get_chorus_nr(this._synth);
    }
    /**
     * Get chorus level of the synthesizer.
     */
    getChorusLevel() {
        return _module._fluid_synth_get_chorus_level(this._synth);
    }
    /**
     * Get chorus speed of the synthesizer.
     */
    getChorusSpeed() {
        return _module._fluid_synth_get_chorus_speed(this._synth);
    }
    /**
     * Get chorus depth (in milliseconds) of the synthesizer.
     */
    getChorusDepth() {
        return _module._fluid_synth_get_chorus_depth(this._synth);
    }
    /**
     * Get chorus modulation type of the synthesizer.
     */
    getChorusType() {
        return _module._fluid_synth_get_chorus_type(this._synth);
    }
    /**
     * Get generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @return a value related to the generator
     */
    getGenerator(channel, param) {
        return _module._fluid_synth_get_gen(this._synth, channel, param);
    }
    /**
     * Set generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @param value a value related to the generator
     */
    setGenerator(channel, param, value) {
        _module._fluid_synth_set_gen(this._synth, channel, param, value);
    }
    /**
     * Return the current legato mode of the channel.
     * @param channel MIDI channel number
     * @return legato mode
     */
    getLegatoMode(channel) {
        _module._fluid_synth_get_legato_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current legato mode of the channel.
     * @param channel MIDI channel number
     * @param mode legato mode
     */
    setLegatoMode(channel, mode) {
        _module._fluid_synth_set_legato_mode(this._synth, channel, mode);
    }
    /**
     * Return the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @return portamento mode
     */
    getPortamentoMode(channel) {
        _module._fluid_synth_get_portamento_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @param mode portamento mode
     */
    setPortamentoMode(channel, mode) {
        _module._fluid_synth_set_portamento_mode(this._synth, channel, mode);
    }
    /**
     * Return the current breath mode of the channel.
     * @param channel MIDI channel number
     * @return breath mode (BreathFlags)
     */
    getBreathMode(channel) {
        _module._fluid_synth_get_breath_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current breath mode of the channel.
     * @param channel MIDI channel number
     * @param flags breath mode flags (BreathFlags)
     */
    setBreathMode(channel, flags) {
        _module._fluid_synth_set_breath_mode(this._synth, channel, flags);
    }
    ////////////////////////////////////////////////////////////////////////////
    resetPlayer() {
        return new Promise((resolve) => {
            this._initPlayer();
            resolve();
        });
    }
    closePlayer() {
        this._closePlayer();
    }
    /** @internal */
    _initPlayer() {
        this._closePlayer();
        const player = _module._new_fluid_player(this._synth);
        this._player = player;
        if (player !== INVALID_POINTER) {
            if (this._fluidSynthCallback === null) {
                // hacky retrieve 'fluid_synth_handle_midi_event' callback pointer
                // * 'playback_callback' is filled with 'fluid_synth_handle_midi_event' by default.
                // * 'playback_userdata' is filled with the synthesizer pointer by default
                const funcPtr = _module.HEAPU32[(player + 588) >> 2]; // _fluid_player_t::playback_callback
                const synthPtr = _module.HEAPU32[(player + 592) >> 2]; // _fluid_player_t::playback_userdata
                if (synthPtr === this._synth) {
                    this._fluidSynthCallback = funcPtr;
                }
            }
        }
        else {
            throw new Error("Out of memory");
        }
    }
    /** @internal */
    _closePlayer() {
        const p = this._player;
        if (p === INVALID_POINTER) {
            return;
        }
        this.stopPlayer();
        _module._delete_fluid_player(p);
        this._player = INVALID_POINTER;
        this._playerCallbackPtr = null;
    }
    isPlayerPlaying() {
        if (this._playerPlaying) {
            const status = _module._fluid_player_get_status(this._player);
            if (status === 1 /*FLUID_PLAYER_PLAYING*/) {
                return true;
            }
            this.stopPlayer();
        }
        return false;
    }
    addSMFDataToPlayer(bin) {
        this.ensurePlayerInitialized();
        const len = bin.byteLength;
        const mem = malloc(len);
        _module.HEAPU8.set(new Uint8Array(bin), mem);
        const r = _module._fluid_player_add_mem(this._player, mem, len);
        free(mem);
        return r !== -1
            ? Promise.resolve()
            : Promise.reject(new Error(fluid_synth_error(this._synth)));
    }
    playPlayer() {
        this.ensurePlayerInitialized();
        if (this._playerPlaying) {
            this.stopPlayer();
        }
        if (_module._fluid_player_play(this._player) === -1) {
            return Promise.reject(new Error(fluid_synth_error(this._synth)));
        }
        this._playerPlaying = true;
        let resolver = () => { };
        const p = new Promise((resolve) => {
            resolver = resolve;
        });
        this._playerDefer = {
            promise: p,
            resolve: resolver,
        };
        return Promise.resolve();
    }
    stopPlayer() {
        const p = this._player;
        if (p === INVALID_POINTER || !this._playerPlaying) {
            return;
        }
        _module._fluid_player_stop(p);
        _module._fluid_player_join(p);
        _module._fluid_synth_all_sounds_off(this._synth, -1);
        if (this._playerDefer) {
            this._playerDefer.resolve();
            this._playerDefer = void 0;
        }
        this._playerPlaying = false;
    }
    retrievePlayerCurrentTick() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_current_tick(this._player));
    }
    retrievePlayerTotalTicks() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_total_ticks(this._player));
    }
    retrievePlayerBpm() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_bpm(this._player));
    }
    retrievePlayerMIDITempo() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_midi_tempo(this._player));
    }
    seekPlayer(ticks) {
        this.ensurePlayerInitialized();
        _module._fluid_player_seek(this._player, ticks);
    }
    setPlayerLoop(loopTimes) {
        this.ensurePlayerInitialized();
        _module._fluid_player_set_loop(this._player, loopTimes);
    }
    setPlayerTempo(tempoType, tempo) {
        this.ensurePlayerInitialized();
        _module._fluid_player_set_tempo(this._player, tempoType, tempo);
    }
    /**
     * Hooks MIDI events sent by the player.
     * initPlayer() must be called before calling this method.
     * @param callback hook callback function, or null to unhook
     * @param param any additional data passed to the callback
     */
    hookPlayerMIDIEvents(callback, param) {
        this.ensurePlayerInitialized();
        const oldPtr = this._playerCallbackPtr;
        if (oldPtr === null && callback === null) {
            return;
        }
        const newPtr = 
        // if callback is specified, add function
        callback !== null
            ? _addFunction(makeMIDIEventCallback(this, callback, param), "iii")
            : // if _fluidSynthCallback is filled, set null to use it for reset callback
                // if not, add function defaultMIDIEventCallback for reset
                this._fluidSynthCallback !== null
                    ? null
                    : _addFunction(defaultMIDIEventCallback, "iii");
        // the third parameter of 'fluid_player_set_playback_callback' should be 'fluid_synth_t*'
        if (oldPtr !== null && newPtr !== null) {
            // (using defaultMIDIEventCallback also comes here)
            _module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            _removeFunction(oldPtr);
        }
        else {
            if (newPtr === null) {
                // newPtr === null --> use _fluidSynthCallback
                _module._fluid_player_set_playback_callback(this._player, this._fluidSynthCallback, this._synth);
                _removeFunction(oldPtr);
            }
            else {
                _module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            }
        }
        this._playerCallbackPtr = newPtr;
    }
    /** @internal */
    ensureInitialized() {
        if (this._synth === INVALID_POINTER) {
            throw new Error("Synthesizer is not initialized");
        }
    }
    /** @internal */
    ensurePlayerInitialized() {
        this.ensureInitialized();
        if (this._player === INVALID_POINTER) {
            this._initPlayer();
        }
    }
    /** @internal */
    renderRaw(memLeft, memRight, frameCount) {
        _module._fluid_synth_write_float(this._synth, frameCount, memLeft, 0, 1, memRight, 0, 1);
    }
    /** @internal */
    flushFramesSync() {
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        while (this.isPlaying()) {
            this.renderRaw(memLeft, memRight, frameCount);
        }
        free(mem);
    }
    /** @internal */
    flushFramesAsync() {
        if (!this.isPlaying()) {
            return Promise.resolve();
        }
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        const nextFrame = typeof setTimeout !== "undefined"
            ? () => {
                return new Promise((resolve) => setTimeout(resolve, 0));
            }
            : () => {
                return Promise.resolve();
            };
        function head() {
            return nextFrame().then(tail);
        }
        const self = this;
        function tail() {
            if (!self.isPlaying()) {
                free(mem);
                return Promise.resolve();
            }
            self.renderRaw(memLeft, memRight, frameCount);
            return head();
        }
        return head();
    }
    waitForPlayerStopped() {
        return this._playerDefer
            ? this._playerDefer.promise
            : Promise.resolve();
    }
    /**
     * Create the sequencer object for this class.
     */
    static createSequencer() {
        bindFunctions();
        const seq = new Sequencer();
        return seq._initialize().then(() => seq);
    }
    /**
     * Registers the user-defined client to the sequencer.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param name the client name
     * @param callback the client callback function that processes event data
     * @param param additional parameter passed to the callback
     * @return registered sequencer client id (can be passed to seq.unregisterClient())
     */
    static registerSequencerClient(seq, name, callback, param) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        const ptr = _addFunction((time, ev, _seq, data) => {
            const e = new SequencerEventData(ev, _module);
            const type = _module._fluid_event_get_type(ev);
            callback(time, type, e, seq, data);
        }, "viiii");
        const r = fluid_sequencer_register_client(seq.getRaw(), name, ptr, param);
        if (r !== -1) {
            seq._clientFuncMap[r] = ptr;
        }
        return r;
    }
    /**
     * Send sequencer event immediately to the specific client.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param event event data
     */
    static sendEventToClientNow(seq, clientId, event) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        seq.sendEventToClientNow(clientId, event);
    }
    /**
     * (Re-)send event data immediately.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param eventData event data which can be retrieved in SequencerClientCallback
     */
    static sendEventNow(seq, clientId, eventData) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        seq.sendEventNow(clientId, eventData);
    }
    /**
     * Set interval timer process to call processSequencer for this sequencer.
     * This method uses 'setInterval' global method to register timer.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param msec time in milliseconds passed to both setInterval and processSequencer
     * @return return value of 'setInterval' (usually passing to 'clearInterval' will reset event)
     */
    static setIntervalForSequencer(seq, msec) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        return seq.setIntervalForSequencer(msec);
    }
}
//# sourceMappingURL=Synthesizer.js.map