/** @internal */
import { INVALID_POINTER } from './PointerType';
/** @internal */
import SequencerEventData from './SequencerEventData';
const _module = typeof AudioWorkletGlobalScope !== 'undefined' ?
    AudioWorkletGlobalScope.wasmModule : Module;
/** @internal */
export function rewriteEventDataImpl(ev, event) {
    switch (event.type) {
        case 0 /* Note */:
        case 'note':
            _module._fluid_event_note(ev, event.channel, event.key, event.vel, event.duration);
            break;
        case 1 /* NoteOn */:
        case 'noteon':
        case 'note-on':
            _module._fluid_event_noteon(ev, event.channel, event.key, event.vel);
            break;
        case 2 /* NoteOff */:
        case 'noteoff':
        case 'note-off':
            _module._fluid_event_noteoff(ev, event.channel, event.key);
            break;
        case 3 /* AllSoundsOff */:
        case 'allsoundsoff':
        case 'all-sounds-off':
            _module._fluid_event_all_sounds_off(ev, event.channel);
            break;
        case 4 /* AllNotesOff */:
        case 'allnotesoff':
        case 'all-notes-off':
            _module._fluid_event_all_notes_off(ev, event.channel);
            break;
        case 5 /* BankSelect */:
        case 'bankselect':
        case 'bank-select':
            _module._fluid_event_bank_select(ev, event.channel, event.bank);
            break;
        case 6 /* ProgramChange */:
        case 'programchange':
        case 'program-change':
            _module._fluid_event_program_change(ev, event.channel, event.preset);
            break;
        case 7 /* ProgramSelect */:
        case 'programselect':
        case 'program-select':
            _module._fluid_event_program_select(ev, event.channel, event.sfontId, event.bank, event.preset);
            break;
        case 12 /* ControlChange */:
        case 'controlchange':
        case 'control-change':
            _module._fluid_event_control_change(ev, event.channel, event.control, event.value);
            break;
        case 8 /* PitchBend */:
        case 'pitchbend':
        case 'pitch-bend':
            _module._fluid_event_pitch_bend(ev, event.channel, event.value);
            break;
        case 9 /* PitchWheelSensitivity */:
        case 'pitchwheelsens':
        case 'pitchwheelsensitivity':
        case 'pitch-wheel-sens':
        case 'pitch-wheel-sensitivity':
            _module._fluid_event_pitch_wheelsens(ev, event.channel, event.value);
            break;
        case 10 /* Modulation */:
        case 'modulation':
            _module._fluid_event_modulation(ev, event.channel, event.value);
            break;
        case 11 /* Sustain */:
        case 'sustain':
            _module._fluid_event_sustain(ev, event.channel, event.value);
            break;
        case 13 /* Pan */:
        case 'pan':
            _module._fluid_event_pan(ev, event.channel, event.value);
            break;
        case 14 /* Volume */:
        case 'volume':
            _module._fluid_event_volume(ev, event.channel, event.value);
            break;
        case 15 /* ReverbSend */:
        case 'reverb':
        case 'reverbsend':
        case 'reverb-send':
            _module._fluid_event_reverb_send(ev, event.channel, event.value);
            break;
        case 16 /* ChorusSend */:
        case 'chorus':
        case 'chorussend':
        case 'chorus-send':
            _module._fluid_event_chorus_send(ev, event.channel, event.value);
            break;
        case 20 /* KeyPressure */:
        case 'keypressure':
        case 'key-pressure':
        case 'aftertouch':
            _module._fluid_event_key_pressure(ev, event.channel, event.key, event.value);
            break;
        case 19 /* ChannelPressure */:
        case 'channelpressure':
        case 'channel-pressure':
        case 'channel-aftertouch':
            _module._fluid_event_channel_pressure(ev, event.channel, event.value);
            break;
        case 21 /* SystemReset */:
        case 'systemreset':
        case 'system-reset':
            _module._fluid_event_system_reset(ev);
            break;
        case 17 /* Timer */:
        case 'timer':
            _module._fluid_event_timer(ev, event.data);
            break;
        default:
            // 'typeof event' must be 'never' here
            return false;
    }
    return true;
}
/**
 * Rewrites event data with specified SequencerEvent object.
 * @param data destination instance
 * @param event source data
 * @return true if succeeded
 */
export function rewriteEventData(data, event) {
    if (!data || !(data instanceof SequencerEventData)) {
        return false;
    }
    const ev = data.getRaw();
    if (ev === INVALID_POINTER) {
        return false;
    }
    return rewriteEventDataImpl(ev, event);
}
//# sourceMappingURL=ISequencerEventData.js.map