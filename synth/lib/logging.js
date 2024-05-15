let _module;
let _ptrDefaultLogFunction;
let _disabledLoggingLevel = null;
const _handlers = [];
const LOG_LEVEL_COUNT = 5;
/** Log level for libfluidsynth */
const LogLevel = {
    Panic: 0,
    Error: 1,
    Warning: 2,
    Info: 3,
    Debug: 4,
};
export { LogLevel };
function bindFunctions() {
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        _module = AudioWorkletGlobalScope.wasmModule;
    }
    else if (typeof Module !== 'undefined') {
        _module = Module;
    }
    else {
        throw new Error('wasm module is not available. libfluidsynth-*.js must be loaded.');
    }
}
/**
 * Disable log output from libfluidsynth.
 * @param level disable log level (when `LogLevel.Warning` is specified, `Warning` `Info` `Debug` is disabled)
 * - If `null` is specified, log output feature is restored to the default.
 */
export function disableLogging(level = LogLevel.Panic) {
    if (_disabledLoggingLevel === level) {
        return;
    }
    bindFunctions();
    if (level == null) {
        if (_ptrDefaultLogFunction != null) {
            _module._fluid_set_log_function(0, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(1, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(2, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(3, _ptrDefaultLogFunction, 0);
        }
        _module._fluid_set_log_function(4, 0, 0);
    }
    else {
        let ptr;
        for (let l = level; l < LOG_LEVEL_COUNT; ++l) {
            const p = _module._fluid_set_log_function(l, 0, 0);
            if (l !== LogLevel.Debug) {
                ptr = p;
            }
        }
        if (ptr != null && _ptrDefaultLogFunction == null) {
            _ptrDefaultLogFunction = ptr;
        }
    }
    _disabledLoggingLevel = level;
    for (const fn of _handlers) {
        fn(level);
    }
}
/**
 * Restores the log output from libfluidsynth. Same for calling `disableLogging(null)`.
 */
export function restoreLogging() {
    disableLogging(null);
}
// @internal
export function getDisabledLoggingLevel() {
    return _disabledLoggingLevel;
}
// @internal
export function addLoggingStatusChangedHandler(fn) {
    _handlers.push(fn);
}
// @internal
export function removeLoggingStatusChangedHandler(fn) {
    for (let i = 0; i < _handlers.length; ++i) {
        if (_handlers[i] === fn) {
            _handlers.splice(i, 1);
            return;
        }
    }
}
//# sourceMappingURL=logging.js.map