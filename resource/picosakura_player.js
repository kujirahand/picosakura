// ----------------------------------------------------
// Player & Editor for Sakura MML
// ----------------------------------------------------
window.player_jzz = null
window.player_pico = null
// set log
window.sakura_log = function (s) {
    console.log(s)
    document.getElementById('msg').innerHTML = tohtml(s)
}

// tohtml
function tohtml(s) {
    s = s.replace(/&/g, '&amp;')
    s = s.replace(/</g, '&lt;')
    s = s.replace(/>/g, '&gt;')
    s = s.replace(/\n/g, '<br>\n')
    return s
}

// play MML
function playMML() {
    const txt = document.getElementById('txt')
    const pico = document.getElementById('pico')
    saveToStorage()
    // init player
    if (pico.checked) {
        if (!window.player_pico) {
            // load Pico
            window.player_pico = new PicoAudio();
            window.player_pico.init();
        }
    } else {
        if (!window.player_jzz) {
            // load JZZ
            document.getElementById('player_gui').style.display = 'none'
            window.player_jzz = new JZZ.gui.Player('player_gui');
            JZZ.synth.Tiny.register('Web Audio');
        }
    }
    try {
        // compiler
        const SakuraCompiler = window._picosakura.SakuraCompiler
        const com = SakuraCompiler.new()
        com.set_language(window._picosakura.lang)
        const a = com.compile(txt.value)
        const smfData = new Uint8Array(a);

        // 既に再生中なら停止する
        stopMML()
        if (pico.checked) {
            // play pico player
            const parsedData = player_pico.parseSMF(smfData);
            window.player_pico.setData(parsedData);
            window.player_pico.play();
        } else {
            // play jzz player
            window.player_jzz.load(new JZZ.MIDI.SMF(smfData));
            window.player_jzz.play();
        }
    } catch (err) {
        console.error(err);
        document.getElementById('msg').innerHTML = '[SYSTEM_ERROR]' + tohtml(err.toString())
    }
}

function stopMML() {
    if (window.player_jzz) {
        window.player_jzz.stop();
        console.log('stop jzz')
    }
    else if (window.player_pico) {
        window.player_pico.stop();
    }
}

document.getElementById('btnPlay').onclick = () => {
    playMML()
}
document.getElementById('btnStop').onclick = () => {
    stopMML()
}

// ----------------------------------------------------
// text editor events
// ----------------------------------------------------
// set event
const info = document.getElementById('txt_info')
const txt = document.getElementById('txt')
txt.onkeydown = (e) => {
    if (e.isComposing) {
        return
    }
    const keyCode = e.keyCode
    if (keyCode == 9) { // tab
        e.preventDefault();
        const start = txt.selectionStart;
        const end = txt.selectionEnd;
        txt.value = txt.value.substring(0, start) + "\t" + txt.value.substring(end);
        txt.selectionEnd = start + 1;
    }
}
txt.onkeyup = (e) => {
    if (e.isComposing) {
        return
    }
    const keyCode = e.keyCode
    if (keyCode == 13) { // enter
        showCursorInfo()
        return
    }
    if (e.keyCode == 38 || e.keyCode == 40) { // left or right
        showCursorInfo()
        return
    }
    if (e.keyCode == 120) { // [F9]
        playMML()
        return
    }
    if (e.keyCode == 121) { // [F10]
        stopMML()
        return
    }
}
txt.onmouseup = (e) => {
    showCursorInfo()
}

function showCursorInfo() {
    const start = txt.selectionStart
    const end = txt.selectionEnd
    const text = txt.value
    let lineno = 0
    for (let i = 0; i < start; i++) {
        if (text.charAt(i) == '\n') {
            lineno++
        }
    }
    info.innerHTML = `line: ${lineno} `
}

// ----------------------------------------------------
// storage loader
// ----------------------------------------------------
window.addEventListener("load", (e) => {
    loadFromStorage()
})
// ----------------------------------------------------
// storage functions
function saveToStorage() {
    const txt = document.getElementById("txt")
    localStorage["picosakura_txt"] = txt.value
}
function loadFromStorage() {
    const txt = localStorage["picosakura_txt"]
    if (txt) {
        document.getElementById("txt").value = txt
    }
}
// ----------------------------------------------------


