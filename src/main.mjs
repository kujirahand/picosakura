import { checkLoading } from './pico_loader.js';
import { btnToolVoicelClick, btnToolCommandClick } from './pico_tool.js';
import { showWindow, closeWindow } from './pico_utils.js';
import { getLang } from './pico_messages.js';
import { playMML, stopMML } from './pico_module.js';

// global variables
const pianoRect = []
window._picosakura.closeWindow = closeWindow
window._picosakura.getLang = getLang
let pianoOctave = 0
// global dom
let pianoCanvas = null
let chkPiano = null
let chkPianoPlay = null
let chkPianoSutoton = null
// const
const LS_SPLASH_WINDOW = 'picosakura-splash-window' // localStorage key
// events
document.addEventListener('DOMContentLoaded', function () {
    // skin
    updateLang()
    updateDesignSkin()
    // dom events
    setDomEvents()
    // loader
    checkLoading()
    // splash window
    checkSplash()
})
window.addEventListener('beforeunload', function (e) {
    if (window._picosakura.mmlChanged) {
        // 現代のブラウザでは、メッセージを返すと確認ダイアログが表示されます
        e.preventDefault() // 確認ダイアログを表示するため
        e.returnValue = '' // この行の具体的な内容はブラウザによって異なります
    }
})
//---------------------------------------------------------
// dom events
//---------------------------------------------------------
function setDomEvents() {
    // app-title-bar
    const bar_help = document.getElementById('app-title-bar-help')
    bar_help.addEventListener('click', function () {
        showSplash(true)
    })
    // piano
    pianoCanvas = document.getElementById('piano-canvas')
    chkPiano = document.getElementById('chkPiano')
    chkPianoPlay = document.getElementById('chkPianoPlay')
    chkPianoSutoton = document.getElementById('chkPianoSutoton')
    // event
    document.getElementById('descript-close').onclick = closeDescript
    document.getElementById('descript-open').onclick = openDescript
    // set events
    document.getElementById('btnPlay').onclick = playMML
    document.getElementById('btnStop').onclick = stopMML
    document.getElementById('btnPiano').onclick = btnPianoClick
    document.getElementById('btnToolVoice').onclick = btnToolVoicelClick
    document.getElementById('btnToolCommand').onclick = btnToolCommandClick
    // editor
    document.getElementById('txt').addEventListener('input', (e) => {
        window.saveToStorage()
        window._picosakura.mmlChanged = true
    })
    document.getElementById('txt').addEventListener('keyup', (e) => {
        window._picosakura.mmlChanged = true
    })
    // piano tool
    document.getElementById('btnPiano_h').onclick = () => { insertToText('ー') }
    document.getElementById('btnPiano_v').onclick = () => { insertToText(' | ') }
    document.getElementById('btnPiano_bs').onclick = () => { insertToText('BS') }
}
//---------------------------------------------------------
// splash
//---------------------------------------------------------
function showSplash(visible) {
    if (visible) {
        showWindow('splash-window', {
            title: getLang('splash-window:title'),
            content: getLang('splash-window:body'),
            onClose: () => {
                localStorage.setItem(LS_SPLASH_WINDOW, '1')
            }
        })
    } else {
        closeWindow('splash-window')
    }
}
// check splash window
function checkSplash() {
    const lsv = localStorage.getItem(LS_SPLASH_WINDOW)
    const isFirstTime = (lsv === null)
    showSplash(isFirstTime)
}

//---------------------------------------------------------
// design
//---------------------------------------------------------
function updateDesignSkin() {
    // get skin type
    let designType = localStorage.getItem('picosakura-skin-type')
    if (designType === null) { designType = 'skin-sakura' }
    // selected
    const skinSelect = document.getElementById('skin-select')
    skinSelect.value = designType
    skinSelect.onchange = function () {
        changeSkinType(skinSelect.value)
    }
    changeSkinType(designType)
}
function changeSkinType(skinName) {
    const body = document.getElementById('picosakura-body')
    body.classList.remove(...body.classList)
    body.classList.add(skinName)
    localStorage['picosakura-skin-type'] = skinName
    console.log('picosakura-skin-type:', skinName)
}

//---------------------------------------------------------
// piano canvas
//---------------------------------------------------------
function btnPianoClick() {
    const pianoOuter = document.getElementById('piano-outer')
    if (pianoOuter.style.display == 'none') {
        pianoOuter.style.display = 'block'
        drawPiano()
    } else {
        pianoOuter.style.display = 'none'
    }
    console.log('isMobile=', window.isMobileDevice())
    if (!window.isMobileDevice()) {
        pianoCanvas.onmouseup = pianoCanvasUp
    } else {
        pianoCanvas.addEventListener("touchstart", (e) => {
            const touchAreaRect = e.target.getBoundingClientRect()
            // console.log('@', touchAreaRect)
            const touch = e.touches[0]
            pianoCanvasUp({
                preventDefault: () => {
                    e.preventDefault()
                },
                offsetX: touch.clientX - touchAreaRect.left,
                offsetY: touch.clientY - touchAreaRect.top
            })
        })
    }
}

function pianoCanvasUp(e) {
    // console.log(e)
    const x = e.offsetX
    const y = e.offsetY
    for (let i = pianoRect.length - 1; i >= 0; i--) {
        const rect = pianoRect[i]
        const [x1, y1, x2, y2, keyS, oct, keyMML] = rect
        let key = chkPianoSutoton.checked ? keyS : keyMML
        if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
            e.preventDefault()
            const octave = 4 + oct
            if (chkPiano.checked) {
                let key2 = key
                if (pianoOctave != octave) {
                    const v = octave - pianoOctave
                    if (pianoOctave == 0) {
                        key2 = `o${octave}${key}`
                    } else {
                        if (v == 1) {
                            key2 = `↑${key}`
                        } else if (v == -1) {
                            key2 = `↓${key}`
                        }
                    }
                    pianoOctave = octave
                }
                insertToText(key2)
            }
            if (chkPianoPlay.checked) {
                const mml = `v120 o${octave}l8${key}`
                window.playMMLDirect(mml)
            }
            break
        }
    }
}

function drawPiano() {
    // canvas
    const outer = document.getElementById('piano-outer')
    const canvas = document.getElementById("piano-canvas")
    const ctx = canvas.getContext("2d")
    // width
    let pw = outer.clientWidth
    let ph = outer.clientHeight
    canvas.width = pw
    canvas.style.width = pw + 'px'
    canvas.height = 100
    canvas.style.height = '100px'
    if (pw > 400) {
        pw = 400
    }

    // 鍵盤の数と音階の配列
    const numKeys = 14 // numKeys
    // 鍵盤のサイズと色
    const whiteKeyWidth = Math.floor(pw / numKeys)
    const whiteKeyHeight = 100
    const blackKeyWidth = Math.floor(whiteKeyWidth * 0.8)
    const blackKeyHeight = 60
    const whiteColor = "#ffffff"
    const blackColor = "#000000"
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const whiteNames = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']
    const whiteNamesMML = ['c', 'd', 'e', 'f', 'g', 'a', 'b']

    // 白鍵を描画
    pianoRect.splice(0, pianoRect.length)
    for (let i = 0; i < numKeys; i++) {
        const x = i * whiteKeyWidth
        const y = 0
        ctx.fillStyle = 'white'
        ctx.fillRect(x, y, whiteKeyWidth, whiteKeyHeight)
        ctx.strokeRect(x, y, whiteKeyWidth, whiteKeyHeight)
        const key = whiteNames[i % 7]
        const keyMML = whiteNamesMML[i % 7]
        pianoRect.push([
            x, y, (x + whiteKeyWidth), (y + whiteKeyHeight), key, Math.floor(i / 7), keyMML
        ])
    }
    // 黒鍵を描画
    const blackNames = ['ド#', 'レ#', 'ファ#', 'ソ#', 'ラ#']
    const blackNamesMML = ['c#', 'd#', 'f#', 'g#', 'a#']
    const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13]
    for (const i in blackKeys) {
        const index = blackKeys[i]
        const x = index * whiteKeyWidth - blackKeyWidth / 2
        const y = 0
        ctx.fillStyle = 'black'
        ctx.fillRect(x, y, blackKeyWidth, blackKeyHeight)
        const key = blackNames[i % 5]
        const keyMML = blackNamesMML[i % 5]
        pianoRect.push([
            x, y, x + blackKeyWidth, y + blackKeyHeight, key, Math.floor(i / 5), keyMML
        ])
    }
}

function insertToText(s) {
    window._picosakura.mmlChanged = true
    const textarea = document.getElementById('txt')
    const pos = textarea.selectionStart
    const text = textarea.value
    const text1 = text.substr(0, pos)
    const text2 = text.substr(pos)
    if (s == 'BS') {
        const text3 = text1.substr(0, text1.length - 1)
        textarea.value = text3 + text2
        textarea.focus()
        textarea.selectionStart = pos - 1
        textarea.selectionEnd = pos - 1
        return
    }
    textarea.value = text1 + s + text2
    if (!window.isMobileDevice()) {
        textarea.focus()
    }
    textarea.selectionStart = pos + s.length
    textarea.selectionEnd = pos + s.length
}

//---------------------------------------------------------
// locales
//---------------------------------------------------------
function updateLang() {
    // language (ja-JP / en-US)
    const lang = navigator.language || navigator.userLanguage
    // descript panel
    const isJa = (lang.indexOf('ja') >= 0)
    document.getElementById('descript-ja').style.display = isJa ? 'block' : 'none'
    document.getElementById('descript-en').style.display = isJa ? 'none' : 'block'
    // buttons
    const lang_doms = document.getElementsByClassName('lang')
    if (lang_doms) {
        for (const dom of lang_doms) {
            dom.innerHTML = getLang(dom.innerHTML, dom.innerHTML)
        }
    }
}

//---------------------------------------------------------
// Description panel
//---------------------------------------------------------
function closeDescript() {
    document.getElementById('app-title').style.display = 'none'
    document.getElementById('descript').style.display = 'none'
    document.getElementById('descript-open').style.display = 'block'
}

function openDescript() {
    document.getElementById('app-title').style.display = 'block'
    document.getElementById('descript').style.display = 'block'
    document.getElementById('descript-open').style.display = 'none'
}
// jump line
function gotoLine(lineNumber) {
    const textarea = document.getElementById('txt')
    const lines = textarea.value.split('\n')
    // 行番号が範囲内にあることを確認します
    if (lineNumber < 0) {
        lineNumber = 0
    } else if (lineNumber > lines.length) {
        lineNumber = lines.length
    }
    // カーソルを移動させる位置を計算します
    var position = 0
    for (var i = 0; i < lineNumber; i++) {
        position += lines[i].length + 1 // 行の長さに改行文字('\n')を足します
    }
    // カーソルを移動させるために、テキストエリアをフォーカスします
    textarea.focus()
    // カーソルの位置をセットします
    textarea.selectionStart = position
    textarea.selectionEnd = position
}
// insert voice
function insertVoice() {
    const voiceSelect = document.getElementById('voice-select')
    const voiceIndex = voiceSelect.selectedIndex
    const voiceLabel = voiceSelect.options[voiceIndex].innerHTML
    const [voiceNo, voiceName] = voiceLabel.split(':')
    const voice = `音色(${voiceName})`
    insertToText(voice + ' ')
    window._picosakura.closeWindow('tool-voice-window')
}
window._picosakura.insertVoice = insertVoice
function testVoice() {
    const voiceSelect = document.getElementById('voice-select')
    const voiceIndex = voiceSelect.selectedIndex
    const voiceLabel = voiceSelect.options[voiceIndex].innerHTML
    const [voiceNo, voiceName] = voiceLabel.split(':')
    const voice = `@${voiceName}`
    const sample = document.getElementById('voice-list-mml').value
    const mml = `@${voiceNo} ${sample}`
    console.log('test:', mml)
    window.playMMLDirect(mml)
}
window._picosakura.testVoice = testVoice
// onchange
window._picosakura.voiceOnChange = () => {
    const voiceSelect = document.getElementById('voice-select')
    const voiceIndex = voiceSelect.selectedIndex
    const voiceLabel = voiceSelect.options[voiceIndex].innerHTML
    const [voiceNo, voiceName] = voiceLabel.split(':')
    document.getElementById('voice-list-clip').value = `音色(${voiceName})`
}
window._picosakura.commandOnChange = () => {
    const voiceSelect = document.getElementById('command-select')
    const voiceIndex = voiceSelect.selectedIndex
    const voiceLabel = voiceSelect.options[voiceIndex].value
    const [voiceNo, voiceName] = voiceLabel.split(':')
    document.getElementById('voice-list-clip').value = voiceLabel
}
window._picosakura.copyVoice = () => {
    const clip = document.getElementById('voice-list-clip')
    clip.select()
    navigator.clipboard.writeText(clip.value).then(() => {
        console.log('copy:', clip.value)
    })
}
// insert Command
function insertCommand() {
    const cSelect = document.getElementById('command-select')
    const cIndex = cSelect.selectedIndex
    const val = cSelect.options[cIndex].value
    insertToText(val + ' ')
    closeWindow('tool-command-window')
}
window._picosakura.insertCommand = insertCommand

// save/load
function saveToStorageNo(no) {
    const txt = document.getElementById('txt')
    localStorage.setItem(`picosakura-${no}`, txt.value)
    alert(`Saved : ${no}`)
    window._picosakura.mmlChanged = false
    window.updateSaveList()
}
window._picosakura.saveToStorageNo = saveToStorageNo
function loadFromStorageNo(no) {
    const txt = document.getElementById('txt')
    const mml = localStorage.getItem(`picosakura-${no}`)
    let mmlSub = mml ? mml : ''
    mmlSub = mmlSub
        .replace(/\-{2,}/g, '')
        .replace(/\={2,}/g, '')
        .replace(/\s{2,}/g, '')
    if (mmlSub.length > 30) {
        mmlSub = mmlSub.substr(0, 30) + '...'
    }
    if (txt.value != '') {
        const msg = getLang('Can I read the following data?')
        const c = confirm(`${msg} [${no}]\n>>> ${mmlSub}`)
        if (!c) {
            return
        }
    }
    if (mml) {
        txt.value = mml
        alert('loaded.')
        txt.focus()
    } else {
        alert('no mml')
    }
}
window._picosakura.loadFromStorageNo = loadFromStorageNo
