/** Error object used for errors occurred in the message receiver (e.g. Worklet) */
export default class MessageError extends Error {
    constructor(baseName, message, detail) {
        super(message);
        this.baseName = baseName;
        this.detail = detail;
        if (detail && detail.stack) {
            this.stack = detail.stack;
        }
    }
}
//# sourceMappingURL=MessageError.js.map