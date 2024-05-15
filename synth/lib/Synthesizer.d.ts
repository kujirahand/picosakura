import { InterpolationValues, ChorusModulation, GeneratorTypes, LegatoMode, PortamentoMode, PlayerSetTempoType } from './Constants';
import IMIDIEvent from './IMIDIEvent';
import ISequencer from './ISequencer';
import ISequencerEventData from './ISequencerEventData';
import ISynthesizer from './ISynthesizer';
import SynthesizerSettings from './SynthesizerSettings';
import SequencerEvent, { EventType as SequencerEventType } from './SequencerEvent';
import Soundfont from './Soundfont';
/** Hook callback function type */
export interface HookMIDIEventCallback {
    /**
     * Hook callback function type.
     * @param synth the base synthesizer instance
     * @param eventType MIDI event type (e.g. 0x90 is note-on event)
     * @param eventData detailed event data
     * @param param parameter data passed to the registration method
     * @return true if the event data is processed, or false if the default processing is necessary
     */
    (synth: Synthesizer, eventType: number, eventData: IMIDIEvent, param: any): boolean;
}
/** Client callback function type for sequencer object */
export interface SequencerClientCallback {
    /**
     * Client callback function type for sequencer object.
     * @param time the sequencer tick value
     * @param eventType sequencer event type
     * @param event actual event data (can only be used in this callback function)
     * @param sequencer the base sequencer object
     * @param param parameter data passed to the registration method
     */
    (time: number, eventType: SequencerEventType, event: ISequencerEventData, sequencer: ISequencer, param: number): void;
}
/** Default implementation of ISynthesizer */
export default class Synthesizer implements ISynthesizer {
    constructor();
    /** Return the promise object that resolves when WebAssembly has been initialized */
    static waitForWasmInitialized(): Promise<void>;
    isInitialized(): boolean;
    /** Return the raw synthesizer instance value (pointer for libfluidsynth). */
    getRawSynthesizer(): number;
    createAudioNode(context: AudioContext, frameSize?: number): AudioNode;
    init(sampleRate: number, settings?: SynthesizerSettings): void;
    close(): void;
    isPlaying(): boolean;
    setInterpolation(value: InterpolationValues, channel?: number): void;
    getGain(): number;
    setGain(gain: number): void;
    setChannelType(channel: number, isDrum: boolean): void;
    waitForVoicesStopped(): Promise<void>;
    loadSFont(bin: ArrayBuffer): Promise<number>;
    unloadSFont(id: number): void;
    unloadSFontAsync(id: number): Promise<void>;
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return `Soundfont` instance or `null` if `sfontId` is not valid or loaded
     */
    getSFontObject(sfontId: number): Soundfont | null;
    getSFontBankOffset(id: number): Promise<number>;
    setSFontBankOffset(id: number, offset: number): void;
    render(outBuffer: AudioBuffer | Float32Array[]): void;
    midiNoteOn(chan: number, key: number, vel: number): void;
    midiNoteOff(chan: number, key: number): void;
    midiKeyPressure(chan: number, key: number, val: number): void;
    midiControl(chan: number, ctrl: number, val: number): void;
    midiProgramChange(chan: number, prognum: number): void;
    midiChannelPressure(chan: number, val: number): void;
    midiPitchBend(chan: number, val: number): void;
    midiSysEx(data: Uint8Array): void;
    midiPitchWheelSensitivity(chan: number, val: number): void;
    midiBankSelect(chan: number, bank: number): void;
    midiSFontSelect(chan: number, sfontId: number): void;
    midiProgramSelect(chan: number, sfontId: number, bank: number, presetNum: number): void;
    midiUnsetProgram(chan: number): void;
    midiProgramReset(): void;
    midiSystemReset(): void;
    midiAllNotesOff(chan?: number): void;
    midiAllSoundsOff(chan?: number): void;
    midiSetChannelType(chan: number, isDrum: boolean): void;
    /**
     * Set reverb parameters to the synthesizer.
     */
    setReverb(roomsize: number, damping: number, width: number, level: number): void;
    /**
     * Set reverb roomsize parameter to the synthesizer.
     */
    setReverbRoomsize(roomsize: number): void;
    /**
     * Set reverb damping parameter to the synthesizer.
     */
    setReverbDamp(damping: number): void;
    /**
     * Set reverb width parameter to the synthesizer.
     */
    setReverbWidth(width: number): void;
    /**
     * Set reverb level to the synthesizer.
     */
    setReverbLevel(level: number): void;
    /**
     * Enable or disable reverb effect of the synthesizer.
     */
    setReverbOn(on: boolean): void;
    /**
     * Get reverb roomsize parameter of the synthesizer.
     */
    getReverbRoomsize(): number;
    /**
     * Get reverb damping parameter of the synthesizer.
     */
    getReverbDamp(): number;
    /**
     * Get reverb level of the synthesizer.
     */
    getReverbLevel(): number;
    /**
     * Get reverb width parameter of the synthesizer.
     */
    getReverbWidth(): number;
    /**
     * Set chorus parameters to the synthesizer.
     */
    setChorus(voiceCount: number, level: number, speed: number, depthMillisec: number, type: ChorusModulation): void;
    /**
     * Set chorus voice count parameter to the synthesizer.
     */
    setChorusVoiceCount(voiceCount: number): void;
    /**
     * Set chorus level parameter to the synthesizer.
     */
    setChorusLevel(level: number): void;
    /**
     * Set chorus speed parameter to the synthesizer.
     */
    setChorusSpeed(speed: number): void;
    /**
     * Set chorus depth parameter to the synthesizer.
     */
    setChorusDepth(depthMillisec: number): void;
    /**
     * Set chorus modulation type to the synthesizer.
     */
    setChorusType(type: ChorusModulation): void;
    /**
     * Enable or disable chorus effect of the synthesizer.
     */
    setChorusOn(on: boolean): void;
    /**
     * Get chorus voice count of the synthesizer.
     */
    getChorusVoiceCount(): number;
    /**
     * Get chorus level of the synthesizer.
     */
    getChorusLevel(): number;
    /**
     * Get chorus speed of the synthesizer.
     */
    getChorusSpeed(): number;
    /**
     * Get chorus depth (in milliseconds) of the synthesizer.
     */
    getChorusDepth(): number;
    /**
     * Get chorus modulation type of the synthesizer.
     */
    getChorusType(): ChorusModulation;
    /**
     * Get generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @return a value related to the generator
     */
    getGenerator(channel: number, param: GeneratorTypes): number;
    /**
     * Set generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @param value a value related to the generator
     */
    setGenerator(channel: number, param: GeneratorTypes, value: number): void;
    /**
     * Return the current legato mode of the channel.
     * @param channel MIDI channel number
     * @return legato mode
     */
    getLegatoMode(channel: number): LegatoMode;
    /**
     * Set the current legato mode of the channel.
     * @param channel MIDI channel number
     * @param mode legato mode
     */
    setLegatoMode(channel: number, mode: LegatoMode): void;
    /**
     * Return the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @return portamento mode
     */
    getPortamentoMode(channel: number): PortamentoMode;
    /**
     * Set the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @param mode portamento mode
     */
    setPortamentoMode(channel: number, mode: PortamentoMode): void;
    /**
     * Return the current breath mode of the channel.
     * @param channel MIDI channel number
     * @return breath mode (BreathFlags)
     */
    getBreathMode(channel: number): number;
    /**
     * Set the current breath mode of the channel.
     * @param channel MIDI channel number
     * @param flags breath mode flags (BreathFlags)
     */
    setBreathMode(channel: number, flags: number): void;
    resetPlayer(): Promise<void>;
    closePlayer(): void;
    isPlayerPlaying(): boolean;
    addSMFDataToPlayer(bin: ArrayBuffer): Promise<void>;
    playPlayer(): Promise<void>;
    stopPlayer(): void;
    retrievePlayerCurrentTick(): Promise<number>;
    retrievePlayerTotalTicks(): Promise<number>;
    retrievePlayerBpm(): Promise<number>;
    retrievePlayerMIDITempo(): Promise<number>;
    seekPlayer(ticks: number): void;
    setPlayerLoop(loopTimes: number): void;
    setPlayerTempo(tempoType: PlayerSetTempoType, tempo: number): void;
    /**
     * Hooks MIDI events sent by the player.
     * initPlayer() must be called before calling this method.
     * @param callback hook callback function, or null to unhook
     * @param param any additional data passed to the callback
     */
    hookPlayerMIDIEvents(callback: HookMIDIEventCallback | null, param?: any): void;
    waitForPlayerStopped(): Promise<void>;
    /**
     * Create the sequencer object for this class.
     */
    static createSequencer(): Promise<ISequencer>;
    /**
     * Registers the user-defined client to the sequencer.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param name the client name
     * @param callback the client callback function that processes event data
     * @param param additional parameter passed to the callback
     * @return registered sequencer client id (can be passed to seq.unregisterClient())
     */
    static registerSequencerClient(seq: ISequencer, name: string, callback: SequencerClientCallback, param: number): number;
    /**
     * Send sequencer event immediately to the specific client.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param event event data
     */
    static sendEventToClientNow(seq: ISequencer, clientId: number, event: SequencerEvent): void;
    /**
     * (Re-)send event data immediately.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param eventData event data which can be retrieved in SequencerClientCallback
     */
    static sendEventNow(seq: ISequencer, clientId: number, eventData: ISequencerEventData): void;
    /**
     * Set interval timer process to call processSequencer for this sequencer.
     * This method uses 'setInterval' global method to register timer.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param msec time in milliseconds passed to both setInterval and processSequencer
     * @return return value of 'setInterval' (usually passing to 'clearInterval' will reset event)
     */
    static setIntervalForSequencer(seq: ISequencer, msec: number): number;
}
