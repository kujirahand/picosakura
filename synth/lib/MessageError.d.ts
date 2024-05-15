/** Error object used for errors occurred in the message receiver (e.g. Worklet) */
export default class MessageError extends Error {
    /** The name of original error object if available */
    baseName: any;
    /** Detailed properties of original error object if available */
    detail: any;
    constructor(baseName: string, message: string, detail?: any);
}
