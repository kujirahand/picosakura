// -------------------------------------------------------
// picosakura soundfont player
// -------------------------------------------------------
// depends:
// - libfluidsynth-2.3.0-with-libsndfile.js
// - js-synthesizer.js
// - picoaudio1.1.2_PicoAudio.min.js
// - sakuramml.mjs

console.log('[soundfont_player.js] loaded')

const sfInfo = {
    font: null,
    synth: null,
    context: null,
    node: null,
}

/**
 * compile & play
 * @param {string} mml
 * @param {string|undefined} playerType
 * @param {string|undefined} soundfontUrl
 * @return {Promise<boolean>}
 */
async function playMML(mml, playerType, soundfontUrl) {
    stopMML()
    // init player
    const g = window._picosakura
    g.errorStr = ''
    g.playerType = 'soundfont'
    if (soundfontUrl === undefined) {
        soundfontUrl = './TimGM6mb.sf2'
    }
    // check player
    if (playerType && playerType === 'auto') {
        playerType = 'soundfont'
        if (mml.indexOf('SoundType={soundfont}') >= 0) {
            playerType = 'soundfont'
        }
        if (mml.indexOf('SoundType={pico}') >= 0) {
            playerType = 'pico'
        }
    }
    if (playerType && playerType === 'pico') {
        g.playerType = 'pico'
        // load Pico
        window.player_pico = new PicoAudio()
        window.player_pico.init()
    } else {
        if (!window.player_sf) {
            // load SoundFont
            window.player_sf = { info: sfInfo }
        }
    }
    try {
        // compiler
        if (!g.SakuraCompiler) {
            throw new Error('[System Error] Sorry could not load SakuraCompiler.') // system error
        }
        const SakuraCompiler = g.SakuraCompiler
        const compiler = SakuraCompiler.new()
        let binMidiRaw = null // compiled data
        try {
            // compile
            // compiler.set_language(window._picosakura.lang)
            let mmlsrc = '' + mml
            binMidiRaw = compiler.compile(mmlsrc)
        } catch (err) {
            console.error('[MMLERROR] compile error', err)
            g.errorStr += err.toString() + '\n'
            return false
        }
        // console.log('[compile.completed]', binMidiRaw)
        const log = compiler.get_log()
        window.postMessage({ type: 'error', message: log })
        const smfData = new Uint8Array(binMidiRaw)
        console.log('[sakuramml]' + log)

        if (g.playerType === 'pico') {
            // play pico player
            const parsedData = player_pico.parseSMF(smfData)
            window.player_pico.setData(parsedData)
            window.player_pico.play()
        } else {
            // play soundfont player
            if (!SF_isReady()) {
                await SF_loadSoundFont(soundfontUrl)
            }
            await SF_play(smfData)
        }
        return true
    } catch (err) {
        console.error(err)
        g.errorStr += err.toString() + '\n'
        return false
    }
}

function stopMML() {
    const g = window._picosakura
    if (g.playerType === 'pico') {
        window.player_pico.stop()
    } else {
        SF_stop()
        window.player_sf = null
    }
}


// --- sound font ---
// load binary from url
async function loadBinary(url) {
    const resp = await fetch(url);
    return await resp.arrayBuffer();
}

// load soundfont from url
async function SF_loadSoundFont(urlSoundFont) {
    window._picosakura.sfLoaded = false
    sfInfo.font = null
    sfInfo.font = await loadBinary(urlSoundFont)
    window._picosakura.sfLoaded = true
}
function SF_isReady() {
    return sfInfo.font !== null
}

let sfPlayLoading = false
function waitForPlayLoading() {
    return new Promise((resolve, _reject) => {
        const timerId = setInterval(() => {
            if (!sfPlayLoading) {
                clearInterval(timerId)
                resolve()
            }
        }, 100)
    })
}

function waitFor(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

async function SF_play(midi) {
    if (sfPlayLoading) {
        await waitForPlayLoading()
    }
    sfPlayLoading = true
    await _SF_play(midi)
    sfPlayLoading = false
}

async function _SF_play(midi) {
    if (JSSynth === undefined) {
        throw new Error('[System Error] JSSynth is not loaded, please load js-synthesizer.js first.')
    }
    if (!sfInfo.context) {
        // Initiazlize AudioContext
        sfInfo.context = new AudioContext()
        sfInfo.synth = new JSSynth.Synthesizer()
        sfInfo.synth.init(sfInfo.context.sampleRate);
        // Create AudioNode (ScriptProcessorNode) to output audio data
        const node = sfInfo.synth.createAudioNode(sfInfo.context, 8192) // 8192 is the frame count of buffer
        node.connect(sfInfo.context.destination)
        sfInfo.node = node;
    }
    const synth = sfInfo.synth;
    const context = sfInfo.context;
    try {

        await synth.loadSFont(sfInfo.font);
        await synth.addSMFDataToPlayer(midi);
        await synth.playPlayer();
        if (sfInfo.context = null) { return } // already closed
        await synth.waitForPlayerStopped();
        await synth.waitForVoicesStopped();
        if (sfInfo.context = null) { return } // already closed
        await waitFor(1000)
        await synth.close()
        if (context.state === 'running') {
            await context.close()
        }
    } catch (err) {
        console.error('[soundfont_player] Failed:', err)
        // Releases the synthesizer
        await synth.close();
    }
}

async function SF_stop() {
    if (sfInfo.synth) {
        try {
            sfInfo.synth.close()
        } catch (err) {
            console.log('[synth.close]', err)
        }
        sfInfo.synth = null
        try {
            if (sfInfo && sfInfo.context) {
                if (sfInfo.context.state === 'running') {
                    await sfInfo.context.close()
                }
            }
        } catch (err) {
            console.log('[audiocontext.close]', err)
        }
        sfInfo.context = null
        sfPlayLoading = false
    }
}

