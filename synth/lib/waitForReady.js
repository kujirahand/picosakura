import Synthesizer from './Synthesizer';
/**
 * Returns the Promise object which resolves when the synthesizer engine is ready.
 */
export default function waitForReady() {
    return Synthesizer.waitForWasmInitialized();
}
//# sourceMappingURL=waitForReady.js.map