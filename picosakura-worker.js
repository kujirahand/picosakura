//
// picosakura-worker.js
//
const URL_SOUNDFONT = './synth/TimGM6mb.sf2';

import init, { PicoResult, make_wav } from 'https://unpkg.com/picosakura@0.1.23/picosakura.js';
init().then(() => {
    console.log('@loaded')
    self.postMessage({ type: 'loaded' });
}).catch(err => {
    console.error(err);
    self.postMessage({ type: 'error', data: err.toString() });
});
//
// worker event
//
self.addEventListener("message", (e) => {
    // メッセージを受け取ったときに動かすコード
    console.log("worker received a message", e);
    // makeWav
    if (e.data.type === 'makeWav') {
        const mml = e.data.mml;
        makeWav(mml).then((obj) => {
            self.postMessage({ type: 'makeWav:ok', data: obj });
        }).catch(err => {
            console.error(err);
            self.postMessage({ type: 'error', data: err.toString() });
        });
    }
});

/// makeWav
async function makeWav(mml) {
    console.log('try to load soundfont')
    const soundfont = await loadBinary(URL_SOUNDFONT);
    console.log('soundfont.size=', soundfont.byteLength);
    // console.log('@mml=', mml);
    const result = make_wav(mml, new Uint8Array(soundfont));
    if (!result.result) {
        const log = result.get_log()
        throw new Error(`[ERROR] soundfont error: ${log}`)
    }
    const log = result.get_log();
    const wav = result.get_bin();
    return {wav, log}
}

/// load
async function loadBinary(url) {
    const resp = await fetch(url);
    return await resp.arrayBuffer();
}
