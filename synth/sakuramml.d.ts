/* tslint:disable */
/* eslint-disable */
/**
* get sakura compiler version info
* @returns {string}
*/
export function get_version(): string;
/**
* compile source to MIDI data
* @param {string} source
* @param {number} debug_level
* @returns {Uint8Array}
*/
export function compile_to_midi(source: string, debug_level: number): Uint8Array;
/**
* SakuraCompiler Object
*/
export class SakuraCompiler {
  free(): void;
/**
* new object
* @returns {SakuraCompiler}
*/
  static new(): SakuraCompiler;
/**
* compile to MIDI data
* @param {string} source
* @returns {Uint8Array}
*/
  compile(source: string): Uint8Array;
/**
* set message language
* @param {string} code
*/
  set_language(code: string): void;
/**
* get log text
* @returns {string}
*/
  get_log(): string;
/**
* set debug level
* @param {number} level
*/
  set_debug_level(level: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_version: (a: number) => void;
  readonly __wbg_sakuracompiler_free: (a: number) => void;
  readonly sakuracompiler_new: () => number;
  readonly sakuracompiler_compile: (a: number, b: number, c: number, d: number) => void;
  readonly sakuracompiler_set_language: (a: number, b: number, c: number) => void;
  readonly sakuracompiler_get_log: (a: number, b: number) => void;
  readonly sakuracompiler_set_debug_level: (a: number, b: number) => void;
  readonly compile_to_midi: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
