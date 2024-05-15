/** Default values for synthesizer instances */
export declare const enum SynthesizerDefaultValues {
    Gain = 0.5
}
/** Interpolation values used by ISynthesizer.setInterpolation */
export declare const enum InterpolationValues {
    /** No interpolation: Fastest, but questionable audio quality */
    None = 0,
    /** Straight-line interpolation: A bit slower, reasonable audio quality */
    Linear = 1,
    /** Fourth-order interpolation, good quality, the default */
    FourthOrder = 4,
    /** Seventh-order interpolation */
    SeventhOrder = 7,
    /** Default interpolation method */
    Default = 4,
    /** Highest interpolation method */
    Highest = 7
}
/** Chorus modulation waveform type, used by Synthesizer.setChorus etc. */
export declare const enum ChorusModulation {
    /** Sine wave chorus modulation */
    Sine = 0,
    /** Triangle wave chorus modulation */
    Triangle = 1
}
/** Generator type ID (specified in SoundFont format) */
export declare const enum GeneratorTypes {
    StartAddrsOffset = 0,
    EndAddrsOffset = 1,
    StartLoopAddrsOffset = 2,
    EndLoopAddrsOffset = 3,
    StartAddrsCoarseOffset = 4,
    ModLfoToPitch = 5,
    VibLfoToPitch = 6,
    ModEnvToPitch = 7,
    InitialFilterFc = 8,
    InitialFilterQ = 9,
    ModLfoToFilterFc = 10,
    ModEnvToFilterFc = 11,
    EndAddrsCoarseOffset = 12,
    ModLfoToVolume = 13,
    ChorusEffectsSend = 15,
    ReverbEffectsSend = 16,
    Pan = 17,
    DelayModLFO = 21,
    FreqModLFO = 22,
    DelayVibLFO = 23,
    FreqVibLFO = 24,
    DelayModEnv = 25,
    AttackModEnv = 26,
    HoldModEnv = 27,
    DecayModEnv = 28,
    SustainModEnv = 29,
    ReleaseModEnv = 30,
    KeynumToModEnvHold = 31,
    KeynumToModEnvDecay = 32,
    DelayVolEnv = 33,
    AttackVolEnv = 34,
    HoldVolEnv = 35,
    DecayVolEnv = 36,
    SustainVolEnv = 37,
    ReleaseVolEnv = 38,
    KeynumToVolEnvHold = 39,
    KeynumToVolEnvDecay = 40,
    Instrument = 41,
    KeyRange = 43,
    VelRange = 44,
    StartloopAddrsCoarseOffset = 45,
    Keynum = 46,
    Velocity = 47,
    InitialAttenuation = 48,
    EndloopAddrsCoarseOffset = 50,
    CoarseTune = 51,
    FineTune = 52,
    SampleID = 53,
    SampleModes = 54,
    ScaleTuning = 56,
    ExclusiveClass = 57,
    OverridingRootKey = 58,
    _Pitch = 59,
    _CustomBalance = 60,
    _CustomFilterFc = 61,
    _CustomFilterQ = 62
}
/** Mono legato mode */
export declare const enum LegatoMode {
    Retrigger = 0,
    MultiRetrigger = 1
}
/** Portamento mode */
export declare const enum PortamentoMode {
    EachNote = 0,
    LegatoOnly = 1,
    StaccatoOnly = 2
}
/** Breath mode flags */
export declare const enum BreathFlags {
    Poly = 16,
    Mono = 32,
    Sync = 64
}
/** Tempo type for `Synthesizer.setPlayerTempo` */
declare const PlayerSetTempoType: {
    readonly Internal: 0;
    readonly ExternalBpm: 1;
    readonly ExternalMidi: 2;
};
/** Tempo type for `Synthesizer.setPlayerTempo` */
declare type PlayerSetTempoType = (typeof PlayerSetTempoType)[keyof typeof PlayerSetTempoType];
export { PlayerSetTempoType };
