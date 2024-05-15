import MessageError from './MessageError';
/** @internal */
export function initializeCallPort(port, hookMessage) {
    const instance = {
        port: port,
        defers: {},
        deferId: 0
    };
    port.addEventListener('message', (e) => processReturnMessage(instance.defers, hookMessage, e));
    port.start();
    return instance;
}
function convertErrorTransferable(err) {
    const result = {};
    const objList = [];
    let obj = err;
    while (obj && obj !== Object.prototype) {
        objList.unshift(obj);
        obj = Object.getPrototypeOf(obj);
    }
    objList.forEach((o) => {
        Object.getOwnPropertyNames(o).forEach((key) => {
            try {
                const data = err[key];
                if (typeof data !== 'function' && typeof data !== 'symbol') {
                    result[key] = data;
                }
            }
            catch (_e) { }
        });
    });
    return {
        baseName: err.name,
        message: err.message,
        detail: result
    };
}
function convertAnyErrorTransferable(err) {
    return convertErrorTransferable((err && err instanceof Error) ? err : new Error(`${err}`));
}
function makeMessageError(error) {
    return new MessageError(error.baseName, error.message, error.detail);
}
function processReturnMessage(defers, hook, e) {
    const data = e.data;
    if (!data) {
        return;
    }
    if (hook && hook(data)) {
        return;
    }
    const defer = defers[data.id];
    if (defer) {
        delete defers[data.id];
        if (data.error) {
            defer.reject(makeMessageError(data.error));
        }
        else {
            defer.resolve(data.val);
        }
    }
    else {
        if (data.error) {
            throw makeMessageError(data.error);
        }
    }
}
/** @internal */
export function postCall({ port }, method, args) {
    port.postMessage({
        id: -1, method, args
    });
}
/** @internal */
export function postCallWithPromise(instance, method, args) {
    const id = instance.deferId++;
    if (instance.deferId === Infinity || instance.deferId < 0) {
        instance.deferId = 0;
    }
    const promise = new Promise((resolve, reject) => {
        instance.defers[id] = { resolve, reject };
    });
    const transfers = [];
    if (args[0] instanceof MessagePort) {
        transfers.push(args[0]);
    }
    instance.port.postMessage({
        id, method, args
    }, transfers);
    return promise;
}
/** @internal */
export function initializeReturnPort(port, promiseInitialized, targetObjectHolder, hookMessage) {
    const instance = {
        port: port
    };
    if (promiseInitialized) {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            promiseInitialized.then(() => processCallMessage(instance.port, data, targetObjectHolder, hookMessage));
        });
    }
    else {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            processCallMessage(instance.port, data, targetObjectHolder, hookMessage);
        });
    }
    port.start();
    return instance;
}
function processCallMessage(port, data, targetObjectHolder, hook) {
    if (hook && hook(data)) {
        return;
    }
    const target = targetObjectHolder();
    if (!target[data.method]) {
        postReturnErrorImpl(port, data.id, data.method, new Error('Not implemented'));
    }
    else {
        try {
            postReturnImpl(port, data.id, data.method, target[data.method].apply(target, data.args));
        }
        catch (e) {
            postReturnErrorImpl(port, data.id, data.method, e);
        }
    }
}
/** @internal */
export function postReturn(instance, id, method, value) {
    postReturnImpl(instance.port, id, method, value);
}
function postReturnImpl(port, id, method, value) {
    if (value instanceof Promise) {
        value.then((v) => {
            if (id >= 0) {
                port.postMessage({
                    id,
                    method,
                    val: v
                });
            }
        }, (error) => {
            port.postMessage({
                id,
                method,
                error: convertAnyErrorTransferable(error)
            });
        });
    }
    else {
        port.postMessage({
            id,
            method,
            val: value
        });
    }
}
/** @internal */
export function postReturnError(instance, id, method, error) {
    postReturnErrorImpl(instance.port, id, method, error);
}
function postReturnErrorImpl(port, id, method, error) {
    port.postMessage({
        id,
        method,
        error: convertAnyErrorTransferable(error)
    });
}
//# sourceMappingURL=MethodMessaging.js.map