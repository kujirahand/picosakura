/** Log level for libfluidsynth */
declare const LogLevel: {
    readonly Panic: 0;
    readonly Error: 1;
    readonly Warning: 2;
    readonly Info: 3;
    readonly Debug: 4;
};
/** Log level for libfluidsynth */
declare type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
export { LogLevel };
/**
 * Disable log output from libfluidsynth.
 * @param level disable log level (when `LogLevel.Warning` is specified, `Warning` `Info` `Debug` is disabled)
 * - If `null` is specified, log output feature is restored to the default.
 */
export declare function disableLogging(level?: LogLevel | null): void;
/**
 * Restores the log output from libfluidsynth. Same for calling `disableLogging(null)`.
 */
export declare function restoreLogging(): void;
