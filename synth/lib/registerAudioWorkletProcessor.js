var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Synthesizer from './Synthesizer';
import waitForReady from './waitForReady';
import { initializeReturnPort, postReturn, postReturnError } from './MethodMessaging';
import { disableLogging } from './logging';
const promiseWasmInitialized = waitForReady();
/** Registers processor using Synthesizer for AudioWorklet. */
export default function registerAudioWorkletProcessor() {
    /**
     * The processor using Synthesizer
     */
    class Processor extends AudioWorkletProcessor {
        constructor(options) {
            super(options);
            const processorOptions = options.processorOptions;
            const settings = processorOptions && processorOptions.settings;
            if (processorOptions && processorOptions.disabledLoggingLevel) {
                disableLogging(processorOptions.disabledLoggingLevel);
            }
            const promiseInitialized = this.doInit(settings);
            this._messaging = initializeReturnPort(this.port, promiseInitialized, () => this.synth, (data) => {
                switch (data.method) {
                    case 'init':
                        this.synth.init(sampleRate, settings);
                        return true;
                    case 'createSequencer':
                        this.doCreateSequencer(data.args[0]).then(() => {
                            postReturn(this._messaging, data.id, data.method, void (0));
                        });
                        return true;
                    case 'hookPlayerMIDIEventsByName':
                        {
                            const r = this.doHookPlayerMIDIEvents(data.args[0], data.args[1]);
                            if (r) {
                                postReturn(this._messaging, data.id, data.method, void (0));
                            }
                            else {
                                postReturnError(this._messaging, data.id, data.method, new Error('Name not found'));
                            }
                        }
                        return true;
                    case 'callFunction':
                        try {
                            this.doCallFunction(data.args[0], data.args[1]);
                            postReturn(this._messaging, data.id, data.method, void (0));
                        }
                        catch (e) {
                            postReturnError(this._messaging, data.id, data.method, e);
                        }
                        return true;
                    case 'getSFontObject':
                        try {
                            const name = this.doGetSFontObject(data.args[0], data.args[1]);
                            if (name !== null) {
                                postReturn(this._messaging, data.id, data.method, name);
                            }
                            else {
                                postReturnError(this._messaging, data.id, data.method, new Error('Invalid sfontId'));
                            }
                        }
                        catch (e) {
                            postReturnError(this._messaging, data.id, data.method, e);
                        }
                        return true;
                    case 'playPlayer':
                        this.doPlayPlayer(data);
                        return true;
                    case 'loggingChanged':
                        disableLogging(data.args[0]);
                        return true;
                }
                return false;
            });
        }
        doInit(settings) {
            return __awaiter(this, void 0, void 0, function* () {
                yield promiseWasmInitialized;
                this.synth = new Synthesizer();
                this.synth.init(sampleRate, settings);
            });
        }
        doCreateSequencer(port) {
            return Synthesizer.createSequencer().then((seq) => {
                const messaging = initializeReturnPort(port, null, () => seq, (data) => {
                    // special handle for Sequencer
                    if (data.method === 'getRaw') {
                        postReturn(messaging, data.id, data.method, seq.getRaw());
                        return true;
                    }
                    else if (data.method === 'registerSequencerClientByName') {
                        const r = this.doRegisterSequencerClient(seq, data.args[0], data.args[1], data.args[2]);
                        if (r !== null) {
                            postReturn(messaging, data.id, data.method, r);
                        }
                        else {
                            postReturnError(messaging, data.id, data.method, new Error('Name not found'));
                        }
                        return true;
                    }
                    return false;
                });
            });
        }
        doGetSFontObject(port, sfontId) {
            const sfont = this.synth.getSFontObject(sfontId);
            if (sfont === null) {
                return null;
            }
            const messaging = initializeReturnPort(port, null, () => sfont, (data) => {
                if (data.method === 'getPresetIterable') {
                    postReturn(messaging, data.id, data.method, [...sfont.getPresetIterable()]);
                    return true;
                }
                return false;
            });
            return sfont.getName();
        }
        doPlayPlayer(data) {
            const syn = this.synth;
            syn.playPlayer().then(() => {
                postReturn(this._messaging, -1, "updateStatus" /* UpdateStatus */, {
                    playing: syn.isPlaying(),
                    playerPlaying: syn.isPlayerPlaying()
                });
                postReturn(this._messaging, data.id, data.method, void (0));
            }, (e) => {
                postReturnError(this._messaging, data.id, data.method, e);
            });
        }
        doHookPlayerMIDIEvents(name, param) {
            if (!name) {
                this.synth.hookPlayerMIDIEvents(null);
                return true;
            }
            const fn = (AudioWorkletGlobalScope[name]);
            if (fn && typeof fn === 'function') {
                this.synth.hookPlayerMIDIEvents(fn, param);
                return true;
            }
            return false;
        }
        doCallFunction(name, param) {
            const fn = (AudioWorkletGlobalScope[name]);
            if (fn && typeof fn === 'function') {
                fn.call(null, this.synth, param);
                return;
            }
            throw new Error('Name not found');
        }
        doRegisterSequencerClient(seq, clientName, callbackName, param) {
            const fn = (AudioWorkletGlobalScope[callbackName]);
            if (fn && typeof fn === 'function') {
                return Synthesizer.registerSequencerClient(seq, clientName, fn, param);
            }
            return null;
        }
        process(_inputs, outputs) {
            if (!this.synth) {
                return true;
            }
            const syn = this.synth;
            syn.render(outputs[0]);
            postReturn(this._messaging, -1, "updateStatus" /* UpdateStatus */, {
                playing: syn.isPlaying(),
                playerPlaying: syn.isPlayerPlaying()
            });
            return true;
        }
    }
    registerProcessor("fluid-js" /* ProcessorName */, Processor);
}
//# sourceMappingURL=registerAudioWorkletProcessor.js.map