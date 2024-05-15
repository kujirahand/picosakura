import WorkletSoundfont from './WorkletSoundfont';
import WorkletSequencer from './WorkletSequencer';
import * as MethodMessaging from './MethodMessaging';
import { addLoggingStatusChangedHandler, getDisabledLoggingLevel } from './logging';
/** An synthesizer object with AudioWorkletNode */
export default class AudioWorkletNodeSynthesizer {
    constructor() {
        this._status = {
            playing: false,
            playerPlaying: false
        };
        this._messaging = null;
        this._node = null;
        this._gain = 0.5 /* Gain */;
        this.handleLoggingChanged = this._handleLoggingChanged.bind(this);
        addLoggingStatusChangedHandler(this.handleLoggingChanged);
    }
    /** Audio node for this synthesizer */
    get node() {
        return this._node;
    }
    /**
     * Create AudiWorkletNode instance
     */
    createAudioNode(context, settings) {
        const processorOptions = {
            settings: settings,
            disabledLoggingLevel: getDisabledLoggingLevel(),
        };
        const node = new AudioWorkletNode(context, "fluid-js" /* ProcessorName */, {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            channelCount: 2,
            outputChannelCount: [2],
            processorOptions: processorOptions,
        });
        this._node = node;
        this._messaging = MethodMessaging.initializeCallPort(node.port, (data) => {
            if (data.method === "updateStatus" /* UpdateStatus */) {
                this._status = data.val;
                return true;
            }
            return false;
        });
        return node;
    }
    isInitialized() {
        return this._messaging !== null;
    }
    init(_sampleRate, _settings) {
    }
    close() {
        // call init instead of close
        MethodMessaging.postCall(this._messaging, 'init', [0]);
    }
    isPlaying() {
        return this._status.playing;
    }
    setInterpolation(value, channel) {
        MethodMessaging.postCall(this._messaging, 'setInterpolation', [value, channel]);
    }
    getGain() {
        return this._gain;
    }
    setGain(gain) {
        this._gain = gain;
        MethodMessaging.postCallWithPromise(this._messaging, 'setGain', [gain]).then(() => {
            return MethodMessaging.postCallWithPromise(this._messaging, 'getGain', []);
        }).then((value) => {
            this._gain = value;
        });
    }
    setChannelType(channel, isDrum) {
        MethodMessaging.postCall(this._messaging, 'setChannelType', [channel, isDrum]);
    }
    waitForVoicesStopped() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'waitForVoicesStopped', []);
    }
    loadSFont(bin) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'loadSFont', [bin]);
    }
    unloadSFont(id) {
        MethodMessaging.postCall(this._messaging, 'unloadSFont', [id]);
    }
    unloadSFontAsync(id) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'unloadSFont', [id]);
    }
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return resolve with `Soundfont` instance (rejected if `sfontId` is not valid or loaded)
     */
    getSFontObject(sfontId) {
        const channel = new MessageChannel();
        return MethodMessaging.postCallWithPromise(this._messaging, 'getSFontObject', [channel.port2, sfontId]).then((name) => {
            return new WorkletSoundfont(channel.port1, name);
        });
    }
    getSFontBankOffset(id) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getSFontBankOffset', [id]);
    }
    setSFontBankOffset(id, offset) {
        MethodMessaging.postCall(this._messaging, 'setSFontBankOffset', [id, offset]);
    }
    render() {
        throw new Error('Unexpected call');
    }
    midiNoteOn(chan, key, vel) {
        MethodMessaging.postCall(this._messaging, 'midiNoteOn', [chan, key, vel]);
    }
    midiNoteOff(chan, key) {
        MethodMessaging.postCall(this._messaging, 'midiNoteOff', [chan, key]);
    }
    midiKeyPressure(chan, key, val) {
        MethodMessaging.postCall(this._messaging, 'midiKeyPressure', [chan, key, val]);
    }
    midiControl(chan, ctrl, val) {
        MethodMessaging.postCall(this._messaging, 'midiControl', [chan, ctrl, val]);
    }
    midiProgramChange(chan, prognum) {
        MethodMessaging.postCall(this._messaging, 'midiProgramChange', [chan, prognum]);
    }
    midiChannelPressure(chan, val) {
        MethodMessaging.postCall(this._messaging, 'midiChannelPressure', [chan, val]);
    }
    midiPitchBend(chan, val) {
        MethodMessaging.postCall(this._messaging, 'midiPitchBend', [chan, val]);
    }
    midiSysEx(data) {
        MethodMessaging.postCall(this._messaging, 'midiSysEx', [data]);
    }
    midiPitchWheelSensitivity(chan, val) {
        MethodMessaging.postCall(this._messaging, 'midiPitchWheelSensitivity', [chan, val]);
    }
    midiBankSelect(chan, bank) {
        MethodMessaging.postCall(this._messaging, 'midiBankSelect', [chan, bank]);
    }
    midiSFontSelect(chan, sfontId) {
        MethodMessaging.postCall(this._messaging, 'midiSFontSelect', [chan, sfontId]);
    }
    midiProgramSelect(chan, sfontId, bank, presetNum) {
        MethodMessaging.postCall(this._messaging, 'midiProgramSelect', [chan, sfontId, bank, presetNum]);
    }
    midiUnsetProgram(chan) {
        MethodMessaging.postCall(this._messaging, 'midiUnsetProgram', [chan]);
    }
    midiProgramReset() {
        MethodMessaging.postCall(this._messaging, 'midiProgramReset', []);
    }
    midiSystemReset() {
        MethodMessaging.postCall(this._messaging, 'midiSystemReset', []);
    }
    midiAllNotesOff(chan) {
        MethodMessaging.postCall(this._messaging, 'midiAllNotesOff', [chan]);
    }
    midiAllSoundsOff(chan) {
        MethodMessaging.postCall(this._messaging, 'midiAllSoundsOff', [chan]);
    }
    midiSetChannelType(chan, isDrum) {
        MethodMessaging.postCall(this._messaging, 'midiSetChannelType', [chan, isDrum]);
    }
    resetPlayer() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'resetPlayer', []);
    }
    closePlayer() {
        MethodMessaging.postCall(this._messaging, 'closePlayer', []);
    }
    isPlayerPlaying() {
        return this._status.playerPlaying;
    }
    addSMFDataToPlayer(bin) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'addSMFDataToPlayer', [bin]);
    }
    playPlayer() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'playPlayer', []);
    }
    stopPlayer() {
        MethodMessaging.postCall(this._messaging, 'stopPlayer', []);
    }
    retrievePlayerCurrentTick() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'retrievePlayerCurrentTick', []);
    }
    retrievePlayerTotalTicks() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'retrievePlayerTotalTicks', []);
    }
    retrievePlayerBpm() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'retrievePlayerBpm', []);
    }
    retrievePlayerMIDITempo() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'retrievePlayerMIDITempo', []);
    }
    seekPlayer(ticks) {
        MethodMessaging.postCall(this._messaging, 'seekPlayer', [ticks]);
    }
    setPlayerLoop(loopTimes) {
        MethodMessaging.postCall(this._messaging, 'setPlayerLoop', [loopTimes]);
    }
    setPlayerTempo(tempoType, tempo) {
        MethodMessaging.postCall(this._messaging, 'setPlayerTempo', [tempoType, tempo]);
    }
    waitForPlayerStopped() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'waitForPlayerStopped', []);
    }
    /**
     * Creates a sequencer instance associated with this worklet node.
     */
    createSequencer() {
        const channel = new MessageChannel();
        return MethodMessaging.postCallWithPromise(this._messaging, 'createSequencer', [channel.port2]).then(() => {
            return new WorkletSequencer(channel.port1);
        });
    }
    /**
     * Hooks MIDI events sent by the player. The hook callback function defined on
     * AudioWorkletGlobalScope object available in the worklet is used.
     * @param callbackName hook callback function name available as 'AudioWorkletGlobalScope[callbackName]',
     *     or falsy value ('', null, or undefined) to unhook.
     *     The type of 'AudioWorkletGlobalScope[callbackName]' must be HookMIDIEventCallback.
     * @param param any additional data passed to the callback.
     *     This data must be 'Transferable' data.
     * @return Promise object that resolves when succeeded, or rejects when failed
     */
    hookPlayerMIDIEventsByName(callbackName, param) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'hookPlayerMIDIEventsByName', [callbackName, param]);
    }
    /**
     * Registers the user-defined client to the sequencer.
     * The client callback function defined on AudioWorkletGlobalScope
     * object available in the worklet is used.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by AudioWorkletNodeSynthesizer.createSequencer
     * @param clientName the client name
     * @param callbackName callback function name available as 'AudioWorkletGlobalScope[callbackName]',
     *     or falsy value ('', null, or undefined) to unhook.
     *     The type of 'AudioWorkletGlobalScope[callbackName]' must be SequencerClientCallback.
     * @param param additional parameter passed to the callback
     * @return Promise object that resolves with registered client id when succeeded, or rejects when failed
     */
    registerSequencerClientByName(seq, clientName, callbackName, param) {
        if (!(seq instanceof WorkletSequencer)) {
            return Promise.reject(new TypeError('Invalid sequencer object'));
        }
        return seq.registerSequencerClientByName(clientName, callbackName, param);
    }
    /**
     * Call a function defined in the AudioWorklet.
     *
     * The function will receive two parameters; the first parameter is a Synthesizer instance
     * (not AudioWorkletNodeSynthesizer instance), and the second is the data passed to 'param'.
     * This method is useful when the script loaded in AudioWorklet wants to
     * retrieve Synthesizer instance.
     *
     * @param name a function name (must be retrieved from AudioWorkletGlobalScope[name])
     * @param param any parameter (must be Transferable)
     * @return Promise object that resolves when the function process has done, or rejects when failed
     */
    callFunction(name, param) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'callFunction', [name, param]);
    }
    /** @internal */
    _getRawSynthesizer() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getRawSynthesizer', []);
    }
    /** @internal */
    _handleLoggingChanged(level) {
        if (this._messaging == null) {
            return;
        }
        MethodMessaging.postCall(this._messaging, 'loggingChanged', [level]);
    }
}
//# sourceMappingURL=AudioWorkletNodeSynthesizer.js.map