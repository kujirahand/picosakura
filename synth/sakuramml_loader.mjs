// file: synth/sakuramml_init.mjs
// ----------------------------------------
// global object
// ----------------------------------------
const baseUrl = import.meta.url.split('/').slice(0, -1).join('/')
const rootUrl = baseUrl.split('/').slice(0, -1).join('/')
console.log('[sakuramml_init::url]', import.meta.url)
console.log('[sakuramml_init::baseUrl]', baseUrl)
window._picosakura = {
    version: '0.0.0', // picosakura version
    SakuraCompiler: null, // sakuramml compiler
    sfLoaded: false, // soundfont loaded
    errorStr: '', // error message
    playerType: 'soundfount', // pico or soundfount
    soundfontUrl: baseUrl + '/fonts/TimGM6mb.sf2',
    lang: 'en', // language
    rootUrl: rootUrl,
}

// ----------------------------------------
// Script Loader
// ----------------------------------------
const sakuramml_scriptUrls = [
    "/picoaudio1.1.2_PicoAudio.min.js",
    "/libfluidsynth-2.3.0-with-libsndfile.js",
    "/js-synthesizer.js",
    "/soundfont_player.js",
]
function sakuramml_init_loadScript() {
    if (sakuramml_scriptUrls.length === 0) {
        console.log('[sakuramml_init::loadScript] loaded all scripts')
        return
    }
    const url = baseUrl + sakuramml_scriptUrls.shift()
    const script = document.createElement('script')
    script.src = url
    script.onload = () => {
        console.log(`[sakuramml_init::script] (${sakuramml_scriptUrls.length}) ${url}`)
        sakuramml_init_loadScript()
    }
    document.body.appendChild(script)
}
sakuramml_init_loadScript()

// ----------------------------------------
// sakuramml
// ----------------------------------------
import init, { get_version, SakuraCompiler } from './sakuramml.js'
// Init sakuramml
init().then(() => {
    const sakuraVession = get_version()
    console.log(`[sakuramml_init.mjs] loaded: sakuramml v.${sakuraVession}`)
    window._picosakura.version = sakuraVession
    window._picosakura.SakuraCompiler = SakuraCompiler
}).catch(err => {
    console.error(err)
    document.getElementById('msg').innerHTML = '[LOAD_ERROR]' + tohtml(err.toString())
})
function tohtml(s) {
    return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ----------------------------------------
// message
// ----------------------------------------
window.addEventListener('message', (event) => {
    if (!event.data) { return }
    if (event.data.type === 'play') {
        playMML(event.data.mml, 'auto', window._picosakura.soundfontUrl)
    }
    else if (event.data.type === 'stop') {
        stopMML()
    }
})
// ----------------------------------------
