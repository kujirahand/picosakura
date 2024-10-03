// ----------------------------------------------------
// Player & Editor for Sakura MML
// ----------------------------------------------------
// play MML
export function playMML() {
    checkSynthType()
    saveToStorage()
    // get data
    const txtElem = document.getElementById('txt')
    const txt = txtElem.value
    if (txt) {
        playMMLDirect(txt)
    } else {
        console.error('MML is empty.')
    }
}

export function stopMML() {
    window._picosakura.stopMML()
}

// compile & play
function playMMLDirect(mml) {
    const btnPlay = document.getElementById('btnPlay') || document.createElement('button')
    const btnStop = document.getElementById('btnStop') || document.createElement('button')
    const soundfontUrl = window._picosakura.soundfontUrl
    window._picosakura.playMML(
        mml,
        'auto',
        soundfontUrl,
        () => {
            sakura_log('now loading ... soundfont')
            console.log('[pico_module.js] try to load:', soundfontUrl)
            btnPlay.disabled = true
            btnStop.disabled = true
            btnPlay.style.backgroundColor = 'gray'
        },
        () => {
            sakura_log('playing')
            console.log('[pico_module.js] loaded:', soundfontUrl)
            btnPlay.disabled = false
            btnStop.disabled = false
            btnPlay.style.backgroundColor = '#4090f0'
        }
    )
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
    updateSaveList()
})

function updateSaveList() {
    // save & load
    const saveList = document.getElementById('save-list');
    const loadList = document.getElementById('load-list');
    saveList.innerHTML = '';
    loadList.innerHTML = '';
    for (let no = 0; no < 10; no++) {
        if (no < 5) {
            const btn = document.createElement('button');
            btn.textContent = ` ${no} `;
            btn.addEventListener('click', () => { window._picosakura.saveToStorageNo(no); });
            saveList.appendChild(btn);
        }
        if (localStorage.getItem(`picosakura-${no}`)) {
            const b = document.createElement('button');
            b.textContent = ` ${no} `;
            b.addEventListener('click', () => { window._picosakura.loadFromStorageNo(no); });
            loadList.appendChild(b);
        }
    }
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

export async function fetchJson(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('JSONデータの取得に失敗しました:', error);
    }
}

export async function fetchText(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('JSONデータの取得に失敗しました:', error);
    }
}

// set log
function sakura_log(s) {
    console.log('[sakura_log]', s)
    const msg = document.getElementById('msg');
    let msg_memo = '';
    if (s === '') {
        s = 'ok.';
    }
    if (s.indexOf('[ERROR]') >= 0) { msg_memo += '<br><span class="memo">※' + window._picosakura.getLang('Click on [ERROR] to jump.') + '</span>'; }
    msg.innerHTML = tohtmlError(s) + msg_memo;
    msg.style.display = 'block';
}
window.sakura_log = sakura_log;

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
            html += `<span class="error" onclick="window.gotoLine(${lineNo})">[ERROR](${lineNo})</span>${info}<br>\n`
        } else {
            html += tohtml(line) + '<br>\n'
        }
    }
    return html
}

// export window
window.loadLastMMLFromLS = loadLastMMLFromLS
window.checkSynthType = checkSynthType
window.playMMLDirect = playMMLDirect
window.updateSaveList = updateSaveList
window.isMobileDevice = isMobileDevice
window.saveToStorage = saveToStorage