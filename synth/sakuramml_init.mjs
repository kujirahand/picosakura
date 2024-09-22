// file: synth/sakuramml_init.mjs
// ----------------------------------------
// global
// ----------------------------------------
window._picosakura = {
    version: '0.0.0', // picosakura version
    SakuraCompiler: null, // sakuramml compiler
    sfLoaded: false, // soundfont loaded
    errorStr: '', // error message
    playerType: 'soundfount', // pico or soundfount
    soundfontUrl: './synth/TimGM6mb.sf2',
}
// ----------------------------------------
// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js?v=102').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope)
        }, err => {
            console.log('ServiceWorker registration failed: ', err)
        })
    })
}
// ----------------------------------------
// sakuramml
// ----------------------------------------
import init, { get_version, SakuraCompiler } from './sakuramml.js'
// Init sakuramml
init().then(() => {
    const sakuraVession = get_version()
    console.log(`loaded: sakuramml v.${sakuraVession}`)
    window._picosakura.version = sakuraVession
    window._picosakura.SakuraCompiler = SakuraCompiler
}).catch(err => {
    console.error(err)
    document.getElementById('msg').innerHTML = '[LOAD_ERROR]' + tohtml(err.toString())
})
function tohtml(s) {
    return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
