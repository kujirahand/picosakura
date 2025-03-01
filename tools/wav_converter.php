<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Picosakura WAV Converter</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
    <script type="module">
        // worker
        const worker = new Worker('./wav_converter-worker.js.php', {
            type: "module"
        });
        worker.addEventListener('message', (event) => {
            console.log("Data from worker received: ", event);
            const btnSave = document.getElementById('btnSave');
            const msg = document.getElementById('msg');
            const downloadLink = document.getElementById('download');
            const selectFormat = document.getElementById('selectFormat').value;
            const version = document.getElementById('version');
            if (event.data.type === 'loaded') {
                console.log('worker loaded');
                btnSave.disabled = false;
                msg.innerHTML = '';
                version.innerHTML = event.data.version;
            }
            if (event.data.type === 'error') {
                const errMsg = '' + event.data.data;
                msg.innerHTML = '[WORKER_ERROR]' + tohtml(errMsg);
                btnSave.disabled = false;
            }
            if (event.data.type === 'makeWav:ok') {
                const {
                    wav,
                    log
                } = event.data.data;
                let outputName = 'audio.wav';
                const downloadLink = document.createElement('a');
                // log
                msg.innerHTML = tohtml(log);
                // wav
                // const dataview = new DataView(wav.buffer);
                let audioBlob = new Blob([wav], {
                    type: 'audio/wav'
                });
                let url = window.URL.createObjectURL(audioBlob);
                if (url === null) {
                    downloadLink.href = '#';
                    return;
                }
                btnSave.disabled = false;
                // make download link
                downloadLink.href = url;
                downloadLink.download = outputName;
                downloadLink.click();
            }
        }, false);
        //
        function tohtml(s) {
            s = s.replace(/&/g, '&amp;')
            s = s.replace(/</g, '&lt;')
            s = s.replace(/>/g, '&gt;')
            s = s.replace(/\n/g, '<br>\n')
            return s
        }

        function makeWav(mml, out_format) {
            try {
                // start to generate
                worker.postMessage({
                    type: 'makeWav',
                    mml: mml,
                    out_format: out_format
                });
            } catch (err) {
                console.error(err);
                document.getElementById('msg').innerHTML = '[SYSTEM_ERROR]' + tohtml(err.toString())
            }
        }
        // load
        async function loadBinary(url) {
            const resp = await fetch(url);
            return await resp.arrayBuffer();
        }
        // button
        const downloadLink = document.getElementById('downloadLink');
        btnSave.onclick = async () => {
            const btnSave = document.getElementById('btnSave');
            const selectFormat = document.getElementById('selectFormat');
            const msg = document.getElementById('msg');
            btnSave.disabled = true;
            // save mml
            const mml = document.getElementById('mml').value;
            localStorage.setItem('picosakura_txt', mml); // save
            msg.innerHTML = 'Now converting...<img src="./loader.gif">';
            makeWav(mml, selectFormat.value);
        };
        // load
        window.addEventListener('load', () => {
            // load from localStorage
            const txt = localStorage.getItem('picosakura_txt');
            if (txt) {
                const mml = document.getElementById('mml');
                mml.value = txt;
            }
        });
    </script>
    <style>
        body {
            background-color: #f0f0ff;
        }

        h1 {
            font-size: 1.5em;
            background-color: #fff0f0;
            padding: 12px;
            border-bottom: 2px dotted pink;
        }

        #btnSave {
            width: 20em;
            padding: 1em;
        }

        .version {
            padding: 0.5em;
            font-size: 0.8em;
            text-align: right;
        }

        #mml {
            width: 97%;
            padding: 9px;
            font-size: 1.0em;
        }

        #msg {
            text-align: left;
            font-size: 0.8em;
            background-color: white;
            color: blue;
            padding: 1em;
            border-bottom: 2px dotted pink;
            border-top: 2px dotted pink;
        }
    </style>
    <div>
        <h1>Picosakura WAV Converter</h1>
        <div class="version">
            picosakura <span id="version">???</span>
        </div>
        <div>MML:<br><textarea id="mml" rows="10" cols="80">o4v120 cdefgfed</textarea></div>
        <div id="msg">
            <img src="loader.gif" style="width: 1.5em;">&nbsp;
            Now loading...
        </div>
        <div style="padding: 1em;">Format:
            <select id="selectFormat">
                <!-- <option value="ogg">Ogg-Orpus</option> -->
                <option value="wav16">WAV 16bit</option>
                <option value="wav" selected>WAV 32bit</option>
            </select>
        </div>
        <div><button id="btnSave" disabled="disabled">Download Audio</button></div>
        <div><a id=" download"></a></div>
    </div>
    <div>&nbsp;</div>
    <div style="padding: 12px; border: 1px solid silver; background-color: #f0f0f0;">
        <div style="font-size: 0.8em;">
            テキストボックスにMMLを記入し、上記の「Download Audio」ボタンを押すとダウンロードできます。<br>
            ブラウザ上でオーディオの生成処理を行うので書き出しには時間がかかります。
        </div>
    </div>
</body>

</html>