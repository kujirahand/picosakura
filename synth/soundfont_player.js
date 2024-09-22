// sound font player
/*
<script src="synth/libfluidsynth-2.3.0-with-libsndfile.js"></script>
<script src="synth/js-synthesizer.js"></script>
<script src="synth/soundfont_player.js"></script>
*/
// --- system requirements ---
if (JSSynth === undefined) {
    throw new Error('[System Error] JSSynth is not loaded, please load js-synthesizer.js first.')
}
const sfInfo = {
    font: null,
    synth: null,
    context: null,
    node: null,
}

/**
 * compile & play
 * @param {string} mml
 * @param {string} playerType
 * @param {string} soundfontUrl
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
async function SF_play(midi) {
    if (!sfInfo.context) {
        sfInfo.context = new AudioContext()
        sfInfo.synth = new JSSynth.Synthesizer()
    }
    const synth = sfInfo.synth;
    const context = sfInfo.context;
    synth.init(context.sampleRate);

    // Create AudioNode (ScriptProcessorNode) to output audio data
    const node = synth.createAudioNode(context, 8192) // 8192 is the frame count of buffer
    node.connect(context.destination)
    sfInfo.node = node;

    // Load your SoundFont data (sfontBuffer: ArrayBuffer)
    synth.loadSFont(sfInfo.font).then(function () {
        // Load your SMF file data (smfBuffer: ArrayBuffer)
        console.log('[soundfont] loaded')
        return synth.addSMFDataToPlayer(midi);
    }).then(function () {
        console.log('[soundfont] play')
        // Play the loaded SMF data
        return synth.playPlayer();
    }).then(function () {
        // Wait for finishing playing
        return synth.waitForPlayerStopped();
    }).then(function () {
        // Wait for all voices stopped
        return synth.waitForVoicesStopped();
    }).then(function () {
        // Releases the synthesizer
        setTimeout(() => { // 余韻を残すために1秒待つ
            synth.close();
            if (context.state === 'running') {
                context.close()
            }
        }, 1000);
    }, function (err) {
        console.error('[soundfont_player] Failed:', err);
        // Releases the synthesizer
        synth.close();
    });
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
    }
}

