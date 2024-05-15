import Preset from './Preset';
export default class WorkletSoundfont {
    private readonly name;
    getName(): string;
    getPreset(bank: number, presetNum: number): Promise<Preset | null>;
    getPresetIterable(): Promise<Iterable<Preset>>;
}
