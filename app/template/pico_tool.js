
import { fetchJson, fetchText } from './index.php?a=tpl&f=pico_module.js';
import { showWindow, closeWindow } from './index.php?a=tpl&f=pico_utils.js';

let toolVoiceWindow = false;
export async function btnToolVoicelClick() {
    const toolWindowId = 'tool-voice-window'
    if (toolVoiceWindow) {
        closeWindow(toolWindowId)
        return;
    }
    const contentHtml = await fetchText("./index.php?a=tpl&f=pico_tool_voicelist_window.html");
    const win = showWindow(toolWindowId, {
        title: 'Voice List',
        content: contentHtml,
        onClose: () => {
            toolVoiceWindow = false
        }
    });
    initVoiceList(window._picosakura)
    toolVoiceWindow = true
    document.getElementById('insert-btn').innerHTML = window._picosakura.getLang('Insert');
}

let toolCommandWindow = false;
export async function btnToolCommandClick() {
    const toolWindowId = 'tool-command-window'
    if (toolCommandWindow) {
        closeWindow(toolWindowId)
        return;
    }
    const contentHtml = await fetchText("./index.php?a=tpl&f=pico_tool_commandlist_window.html");
    const win = showWindow(toolWindowId, {
        title: 'Command List',
        content: contentHtml,
        onClose: () => {
            toolCommandWindow = false
        }
    });
    initCommandList(window._picosakura)
    toolCommandWindow = true
    document.getElementById('insert-btn').innerHTML = window._picosakura.getLang('Insert');
}

function initVoiceList(picoGlobal) {
    // voice list
    const voiceList = document.getElementById('voice-list')
    fetchJson(picoGlobal.baseUrl + '/resource/voicelist.json').then((data) => {
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
}
function initCommandList(picoGlobal) {
    // command list
    const commandList = document.getElementById('command-list')
    fetchText(picoGlobal.baseUrl + '/resource/commandlist.txt').then((data) => {
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
}
