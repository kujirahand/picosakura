import * as MethodMessaging from './MethodMessaging';
export default class WorkletSoundfont {
    // @internal
    constructor(port, name) {
        this.name = name;
        this._messaging = MethodMessaging.initializeCallPort(port);
    }
    getName() {
        return this.name;
    }
    getPreset(bank, presetNum) {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getPreset', [bank, presetNum]);
    }
    getPresetIterable() {
        return MethodMessaging.postCallWithPromise(this._messaging, 'getPresetIterable', []);
    }
}
//# sourceMappingURL=WorkletSoundfont.js.map