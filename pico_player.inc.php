<?php
// sakuramml version
include_once __DIR__ . '/version_picosakura.inc.php';
$picosakuraVersion = VERSION_PICO;
$uriPicoLib = "https://cdn.jsdelivr.net/npm/sakuramml@{$picosakuraVersion}/sakuramml.js";
?>
<script type="module">
    // Load WebAssembly
    import init, {
        compile,
        get_version,
        SakuraCompiler
    } from '<?php echo $uriPicoLib ?>';

    let sakuraVession = '?.?.?'
    // Init WebAssembly
    init().then(() => {
        sakuraVession = get_version()
        console.log(`loaded: sakuramml v.${sakuraVession}`)
        document.getElementById('player').style.display = 'block'
        document.getElementById('sakura_version').innerHTML = 'ver.' + sakuraVession
    }).catch(err => {
        console.error(err);
        document.getElementById('msg').innerHTML = '[LOAD_ERROR]' + tohtml(err.toString())
    });

    // set log
    window.sakura_log = function(s) {
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
    window.player_jzz = null
    window.player_pico = null

    // play MML
    function playMML() {
        const txt = document.getElementById('txt')
        const pico = document.getElementById('pico')
        localStorage["picosakura_txt"] = txt.value
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
            const com = SakuraCompiler.new()
            com.set_language('ja')
            const a = com.compile(txt.value)
            const smfData = new Uint8Array(a);
            if (pico.checked) {
                if (window.player_jzz) {
                    window.player_jzz.stop(); //
                }
                const parsedData = player_pico.parseSMF(smfData);
                window.player_pico.setData(parsedData);
                window.player_pico.play();
            } else {
                if (window.player_jzz) {
                    window.player_pico.stop(); //
                }
                window.player_jzz.load(new JZZ.MIDI.SMF(smfData));
                window.player_jzz.play();
            }
        } catch (err) {
            console.error(err);
            document.getElementById('msg').innerHTML = '[SYSTEM_ERROR]' + tohtml(err.toString())
        }
    }

    document.getElementById('btnPlay').onclick = () => {
        playMML()
    }
    document.getElementById('btnStop').onclick = () => {
        if (window.player_jzz) {
            window.player_pico.stop();
        }
        if (window.player_pico) {
            window.player_pico.stop();
        }
    }

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
        if (keyCode == 13) {
            showCursorInfo()
        }
        if (e.keyCode == 38 || e.keyCode == 40) {
            showCursorInfo()
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


    window.addEventListener("load", (e) => {
        const txt = localStorage["picosakura_txt"]
        if (txt) {
            document.getElementById("txt").value = txt
        }
    })
</script>