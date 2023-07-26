// sound font player
/*
<script src="synth/libfluidsynth-2.3.0-with-libsndfile.js"></script>
<script src="synth/js-synthesizer.js"></script>
<script src="resource/soundfont_player.js"></script>
*/

const SF_info = {
    font: null,
    synth: null,
    context: null,
    node: null,
}
async function loadBinary(url) {
    const resp = await fetch(url);
    return await resp.arrayBuffer();
}
async function SF_loadSoundFont(urlSoundFont) {
    SF_info.font = null
    SF_info.font = await loadBinary(urlSoundFont)
}
function SF_isReady() {
    return SF_info.font !== null
}
async function SF_play(midi) {
    // Prepare the AudioContext instance
    var context = new AudioContext();
    SF_info.context = context;
    var synth = new JSSynth.Synthesizer();
    SF_info.synth = synth;
    synth.init(context.sampleRate);
    // Create AudioNode (ScriptProcessorNode) to output audio data
    var node = synth.createAudioNode(context, 8192); // 8192 is the frame count of buffer
    node.connect(context.destination);
    SF_info.node = node;

    // Load your SoundFont data (sfontBuffer: ArrayBuffer)
    synth.loadSFont(SF_info.font).then(function () {
        // Load your SMF file data (smfBuffer: ArrayBuffer)
        return synth.addSMFDataToPlayer(midi);
    }).then(function () {
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
        console.log('Failed:', err);
        // Releases the synthesizer
        synth.close();
    });
}
async function SF_stop() {
    if (SF_info.synth) {
        try {
            SF_info.synth.close()
        } catch (err) {
            console.log('[synth.close]', err)
        }
        SF_info.synth = null
        try {
            if (SF_info && SF_info.context) {
                if (SF_info.context.state === 'running') {
                    await SF_info.context.close()
                }
            }
        } catch (err) {
            console.log('[audiocontext.close]', err)
        }
        SF_info.context = null
    }
}

