// ----------------------------------------------------
// Player & Editor for Sakura MML
// ----------------------------------------------------
window.player_sf = null
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

function tohtmlError(s) {
    const lines = s.split('\n')
    let html = ''
    for (const line of lines) {
        const m = line.match(/^\[ERROR\]\((\d+)\)(.+$)/)
        if (m) {
            const lineNo = m[1]
            const info = tohtml(m[2])
            html += `<span class="error" onclick="gotoLine(${lineNo})">[ERROR](${lineNo})</span>${info}<br>\n`
        } else {
            html += tohtml(line) + '<br>\n'
        }
    }
    return html
}

function playMMLDirect(mml) {
    // 既に再生中なら停止する
    stopMML()
    // init player
    const pico = document.getElementById('pico')
    if (pico.checked) {
        if (!window.player_pico) {
            // load Pico
            window.player_pico = new PicoAudio();
            window.player_pico.init();
        }
    } else {
        if (!window.player_sf) {
            // load SoundFont
            window.player_sf = { info: SF_info };
        }
    }
    try {
        // compiler
        const SakuraCompiler = window._picosakura.SakuraCompiler
        const com = SakuraCompiler.new()
        com.set_language(window._picosakura.lang)
        const a = com.compile(mml)
        const log = com.get_log()
        const smfData = new Uint8Array(a);
        // show log
        document.getElementById('msg').innerHTML = tohtmlError(log)
        console.log(log)

        if (pico.checked) {
            // play pico player
            const parsedData = player_pico.parseSMF(smfData);
            window.player_pico.setData(parsedData);
            window.player_pico.play();
        } else {
            // play soundfont player
            if (!SF_isReady()) {
                alert('Sorry, SoundFont is not ready. Please try again later.')
                return
            }
            SF_play(smfData)
        }
    } catch (err) {
        console.error(err);
        document.getElementById('msg').innerHTML = '[SYSTEM_ERROR]' + tohtml(err.toString())
    }
}


// play MML
function playMML() {
    // get data
    const txt = document.getElementById('txt')
    checkSynthType()
    saveToStorage()
    //
    playMMLDirect(txt.value)
}

function stopMML() {
    if (window.player_sf) {
        SF_stop()
        window.player_sf = null
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
const lineNoInfo = document.getElementById('lineno-info')
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
    if (keyCode == 13 || keyCode == 8) { // enter
        showCursorInfo()
        updateLineNumbers()
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
    lineNoInfo.innerHTML = `line: ${zero(lineno, 3)} `
}
txt.onfocus = () => {
    updateLineNumbers()
    showCursorInfo();
}

function zero(no, len) {
    no = '0000000000' + no.toString()
    return no.substring(no.length - len)
}

function updateLineNumbers() {
    const textArea = document.getElementById('txt');
}
document.addEventListener('DOMContentLoaded', function () {
    if (isMobileDevice()) {
        // mobile
        txt.setAttribute('rows', '10')
    }
    // voice list
    const voiceList = document.getElementById('voice-list')
    fetchJson('resource/voicelist.json').then((data) => {
        voiceList.innerHTML = ''
        let html = '<select id="voice-select">'
        for (const voice of data.inst) {
            const name = voice['voice']
            const no = voice['no']
            html += `<option value="${no}">${no}:${name}</option>`
        }
        html += '</select>'
        voiceList.innerHTML = html
    })
    // command list
    const commandList = document.getElementById('command-list')
    fetchText('resource/commandlist.txt').then((data) => {
        commandList.innerHTML = ''
        let tsv_list = data.split('\n')
        let html = '<select id="command-select">'
        for (const cmd of tsv_list) {
            if (cmd == '') { continue }
            let [tpl, desc] = cmd.split('\t')
            tpl = tpl.replace('"', '\"')
            html += `<option value="${tpl}">${tpl} … ${desc}</option>`
        }
        html += '</select>'
        commandList.innerHTML = html
    })
    updateSaveList()
})

function updateSaveList() {
    // save & load
    let htmlSave = ''
    let htmlLoad = ''
    for (let no = 0; no < 10; no++) {
        htmlSave += `<button onclick="saveToStorage(${no})">${no}</button>`
        if (localStorage.getItem(`picosakura-${no}`)) {
            htmlLoad += `<button onclick="loadFromStorage(${no})">${no}</button>`
        }
    }
    if (htmlLoad == '') {
        htmlLoad = '---'
    }
    document.getElementById('save-list').innerHTML = htmlSave
    document.getElementById('load-list').innerHTML = htmlLoad
}

// ----------------------------------------------------
// storage loader
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
        updateLineNumbers()
    }
}
// load last mml file from localStorage
function loadLastMMLFromLS() {
    loadFromStorage()
}
// ----------------------------------------------------
// SoundType events
// ----------------------------------------------------
const SOUND_TYPE_PICO = 'SoundType={pico}'
const SOUND_TYPE_SOUNDFONT = 'SoundType={soundfont}'
//
const pico = document.getElementById('pico')
const soundfont = document.getElementById('soundfont')
// check synth type
function checkSynthType() {
    const txt = document.getElementById("txt")
    const txtValue = txt.value
    if (txtValue.indexOf(SOUND_TYPE_PICO) >= 0) {
        pico.checked = true
    } else if (txtValue.indexOf(SOUND_TYPE_SOUNDFONT) >= 0) {
        document.getElementById('soundfont').checked = true
    } else {
        soundfont.checked = true
        txt.vaule = SOUND_TYPE_SOUNDFONT + '\n' + txtValue
    }
}
//
pico.onclick = () => {
    replaceSoundType(SOUND_TYPE_SOUNDFONT, SOUND_TYPE_PICO)
    checkSynthType()
}
soundfont.onclick = () => {
    replaceSoundType(SOUND_TYPE_PICO, SOUND_TYPE_SOUNDFONT)
    checkSynthType()
}
//
function replaceSoundType(a, b) {
    const txt = document.getElementById("txt")
    const txtValue = txt.value
    if (txtValue.indexOf(a) < 0 && txtValue.indexOf(b) < 0) {
        txt.value = b + '\n' + txtValue
        return
    }
    txt.value = txtValue.replace(a, b)
}


function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('JSONデータの取得に失敗しました:', error);
    }
}
async function fetchText(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('JSONデータの取得に失敗しました:', error);
    }
}

// export window
window.loadLastMMLFromLS = loadLastMMLFromLS
window.checkSynthType = checkSynthType
window.playMMLDirect = playMMLDirect
window.updateSaveList = updateSaveList
window.isMobileDevice = isMobileDevice