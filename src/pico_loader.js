// app-loader
export function checkLoading() {
    const loader = document.getElementById('app-loader');
    const msgDom = document.getElementById('app-loader-msg');
    let msg = '';
    let checkLater = false;
    // check compiler
    if (typeof (window._picosakura.version) === 'undefined') {
        checkLater = true;
        msg = 'MML Compiler';
    }
    if (!checkLater) {
        console.log('completed to load compiler & soundfont')
        loader.style.display = 'none';
        showPlayerBar()
        return;
    }
    // check later
    setTimeout(() => {
        let curMsg = 'Now Loading ... ' + msg;
        console.log(curMsg);
        msgDom.innerHTML = curMsg;
        checkLoading()
    }, 300);
}

function showPlayerBar() {
    document.getElementById('player').style.display = 'block'
}

