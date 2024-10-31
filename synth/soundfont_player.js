// -------------------------------------------------------
// picosakura soundfont player
// -------------------------------------------------------
// depends:
// - libfluidsynth-2.3.0-with-libsndfile.js
// - js-synthesizer.js
// - picoaudio1.1.2_PicoAudio.min.js
// - sakuramml.js

console.log('[soundfont_player.js] loaded')

const sfInfo = {
    font: null,
    synth: null,
    context: null,
    node: null,
    //
    timerId: null,
    totalTicks: 0,
    onSetPosition: null,
    playFrom: 0,
    _onSetOnPosition: (pos, totalTicks) => {
        if (typeof sfInfo.onSetPosition === 'function') {
            sfInfo.onSetPosition(pos, totalTicks)
        }
    }
}

/**
 * compile & play
 * @param {string} mml
 * @param {string|undefined} playerType
 * @param {string|undefined} soundfontUrl
 * @param {Function} onStartLoad
 * @param {Function} onEndLoad
 * @param {Function} onSetPosition
 * @return {Promise<boolean>}
 */
async function playMML(mml, playerType, soundfontUrl, onStartLoad, onEndLoad, onSetPosition) {
    await stopMML()
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
            g.errorStr += '[Compile Error] ' + err.toString() + '\n'
            window.postMessage({ type: 'error', message: g.errorStr })
            return false
        }
        // console.log('[compile.completed]', binMidiRaw)
        const log = compiler.get_log()
        window.postMessage({ type: 'error', message: log })
        const smfData = new Uint8Array(binMidiRaw)
        console.log('[sakuramml]' + log)
        sfInfo.onSetPosition = onSetPosition

        if (g.playerType === 'pico') {
            // play pico player
            const parsedData = player_pico.parseSMF(smfData)
            window.player_pico.setData(parsedData)
            window.player_pico.play()
        } else {
            // play soundfont player
            if (!SF_isReady()) {
                if (onStartLoad) { onStartLoad() }
                await waitFor(100)
                console.log('[soundfont_player] loadSoundFont::begin')
                await SF_loadSoundFont(soundfontUrl)
                console.log('[soundfont_player] loadSoundFont::end')
                if (onEndLoad) { onEndLoad() }
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

async function stopMML() {
    const g = window._picosakura
    if (g.playerType === 'pico') {
        window.player_pico.stop()
    } else {
        await SF_stop()
        window.player_sf = null
    }
}
async function seekPlayer(position) {
    sfInfo.playFrom = position
    const g = window._picosakura
    if (g.playerType === 'pico') {
        window.player_pico.stop()
    } else {
        await SF_play()
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

let lastMidi = null // last midi data
async function SF_play(midi) {
    if (midi !== undefined) {
        lastMidi = midi
    } else {
        midi = lastMidi
    }
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
        console.log('[soundfont_player] AudioContext initializing...')
        const context = sfInfo.context = new AudioContext()
        sfInfo.synth = new JSSynth.Synthesizer();
        sfInfo.synth.init(context.sampleRate);
        const node = sfInfo.synth.createAudioNode(context, 8192);
        node.connect(context.destination);
    }
    const synth = sfInfo.synth;
    if (synth == null) {
        console.error('[soundfont_player] synth is null')
        return
    }
    const context = sfInfo.context;
    try {
        await synth.loadSFont(sfInfo.font);
        await synth.addSMFDataToPlayer(midi);
        if (sfInfo.playFrom > 0) {
            await synth.seekPlayer(sfInfo.playFrom)
        }
        await synth.playPlayer();
        if (sfInfo.context = null) { return } // already closed
        sfInfo.timerId = setInterval(async () => {
            if (!synth) { return }
            if (sfInfo.totalTicks === 0) {
                const totalTicks = await synth.retrievePlayerTotalTicks()
                if (totalTicks > 0) {
                    sfInfo.totalTicks = totalTicks
                }
            }
            const cur = await synth.retrievePlayerCurrentTick()
            const total = (sfInfo.totalTicks === 0) ? 1000 : sfInfo.totalTicks
            sfInfo._onSetOnPosition(cur, total)
        }, 100);
        await synth.waitForPlayerStopped();
        clearInterval(sfInfo.timerId)
        sfInfo.timerId = null
        // console.log('waitForVoicesStopped')
        await synth.waitForVoicesStopped();
        if (sfInfo.context = null) { return } // already closed
        await waitFor(300)
        await synth.close()
        if (context.state === 'running') {
            await context.close()
        }
    } catch (err) {
        console.error('[pico::soundfont_player] Failed:', err)
        // Releases the synthesizer
        await synth.close();
    }
}

async function SF_stop() {
    console.log('[soundfont_player] try to stop')
    if (sfInfo.synth) {
        if (sfInfo.timerId !== null) {
            clearInterval(sfInfo.timerId)
        }
        try {
            sfInfo.synth.stopPlayer()
            await sfInfo.synth.waitForPlayerStopped()
        } catch (err) {
            console.log('[synth.stop.error]', err)
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
        console.log('[soundfont_player] stopped...')
    }
}

// register to window object
window._picosakura.playMML = playMML
window._picosakura.stopMML = stopMML
window._picosakura.seekPlayer = seekPlayer