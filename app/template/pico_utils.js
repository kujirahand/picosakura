// pico_utils.js

if (typeof (window._picosakura.windowList) === 'undefined') {
    window._picosakura.windowList = {};
}

export function showWindow(windowId, options) {
    if (window._picosakura.windowList[windowId]) {
        closeWindow(windowId);
    }
    const win = createFloatingWindow(windowId, options);
    window._picosakura.windowList[windowId] = win;
    return win
}
export function closeWindow(windowId) {
    // console.log('closeWindow:try', windowId, window._picosakura.windowList);
    if (!window._picosakura.windowList[windowId]) { return; }
    const winObj = window._picosakura.windowList[windowId];
    if (typeof(winObj._onClose) === 'function') {
        winObj._onClose(windowId);
    }
    document.body.removeChild(winObj);
    document.body.removeChild(winObj._link);
    delete window._picosakura.windowList[windowId];
    // console.log('closeWindow:delete', windowId);
}

function getBrowserWindowSize() {
    const w = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    const h = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    return { w, h };
}

// フローティングウィンドウを作成する関数
function createFloatingWindow(windowId, options) {
    if (options === undefined) { options = {} }
    // config
    const winBorder = 12;
    const appBarHeihgt = 20;
    const size = getBrowserWindowSize();
    // check options
    const windowTitle = options.title || 'Picosakura';
    const windowContent = options.content || '-';
    const onClose = options.onClose || null;
    // set background
    const background = document.createElement('div');
    background.className = 'floating-window-background';
    background.style.position = 'fixed';
    background.style.top = '0px';
    background.style.left = '0px';
    background.style.width = size.w + 'px';
    background.style.height = size.h + 'px';
    background.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    background.style.zIndex = '9998';
    background.addEventListener('click', (_event) => {
        closeWindow(windowId);
    });
    // modal dialog
    const floatingWindow = document.createElement('div');
    floatingWindow.windowId = windowId;
    floatingWindow.className = 'picodialog-window';
    // set style
    floatingWindow.style.width = (size.w - winBorder * 2) + 'px';
    floatingWindow.style.height = (size.h / 2) + 'px';
    // floatingWindow.style.height = (size.h - winBorder * 2 - appBarHeihgt * 2) + 'px';
    floatingWindow.style.backgroundColor = 'rgba(255,250,250,0.9)';
    floatingWindow.style.border = '1px solid #ccc';
    floatingWindow.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.2)';
    floatingWindow.style.position = 'fixed';
    floatingWindow.style.top = (appBarHeihgt + winBorder) + 'px';
    floatingWindow.style.left = winBorder + 'px';
    // floatingWindow.style.transform = 'translate(-50%, -50%)';
    floatingWindow.style.zIndex = '9999';

    const closeButton = document.createElement('div');
    closeButton.className = 'picodialog-close-button';
    closeButton.textContent = '✖';
    closeButton.addEventListener('click', (_event) => {
        closeWindow(windowId);
    });
    floatingWindow.appendChild(closeButton);
    const title = document.createElement('h3');
    title.textContent = windowTitle;
    floatingWindow.appendChild(title);
    const content = document.createElement('p');
    content.className = 'picodialog-content';
    content.innerHTML = windowContent;
    floatingWindow.appendChild(content);
    // append to body
    document.body.appendChild(background);
    document.body.appendChild(floatingWindow);
    floatingWindow._link = background;
    floatingWindow._onClose = onClose;
    return floatingWindow;
}
