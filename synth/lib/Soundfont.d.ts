import Preset from './Preset';
import Synthesizer from './Synthesizer';
export default class Soundfont {
    private readonly _ptr;
    static getSoundfontById(synth: Synthesizer, id: number): Soundfont | null;
    getName(): string;
    getPreset(bank: number, presetNum: number): Preset | null;
    getPresetIterable(): Iterable<Preset>;
}
