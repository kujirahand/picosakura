<?php
// ------------------------------------------------------------
// Pico Sakura Player
// ------------------------------------------------------------
include_once __DIR__ . '/lib/mml_sample.inc.php';
$player_css_mtime = filemtime(__DIR__ . '/resource/player.css');
$picosakuraPlayerJSTime = filemtime(__DIR__ . '/resource/picosakura_player.js');
// CHECK mode
if (!isset($utf8_mml)) {
  // default mode
  $utf8_mml = $sampleMML;
  $baseUrl = '.';
  $initScript = 'window.loadLastMMLFromLS(); window.checkSynthType();';
  $textareaRows = 25;
} else {
  // include from mmlbbs6
  $baseUrl = './picosakura';
  $initScript = 'window.checkSynthType(); closeDescript();';
  $textareaRows = 9;
}
// ------------------------------------------------------------
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pico Sakura - ピコサクラ - テキスト音楽「サクラ」</title>

  <!-- for picosakura -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css" integrity="sha384-X38yfunGUhNzHpBaEBsWLO+A0HDYOQi8ufWDkZ0k9e0eXz/tH3II7uKZ9msv++Ls" crossorigin="anonymous">
  <link rel="stylesheet" href="<?php echo $baseUrl; ?>/resource/player.css?m=<?php echo $player_css_mtime ?>">

  <!-- for music player -->

  <!-- | js-synthesizer -->
  <script src="<?php echo $baseUrl; ?>/synth/libfluidsynth-2.3.0-with-libsndfile.js"></script>
  <script src="<?php echo $baseUrl; ?>/synth/js-synthesizer.js"></script>
  <script src="<?php echo $baseUrl; ?>/synth/soundfont_player.js"></script>
  <!-- | picoaudio player -->
  <script src="https://unpkg.com/picoaudio/dist/browser/PicoAudio.js"></script>

</head>

<body>
  <!-- for sakuramml -->
  <?php require_once __DIR__ . '/lib/pico_player.inc.php'; ?>
  <script type="module" src="<?php echo $baseUrl; ?>/resource/picosakura_player.js?m=<?php echo $picosakuraPlayerJSTime ?>"></script>
  <div id="picosakura-player">
    <h1 id="app-title">Pico Sakura</h1>
    <div id="player-outer" class="front-panel">
      <div id="player" style="display:none;">
        <div>
          <button id="btnPlay" class="play-button">▶ PLAY</button>
          <button id="btnStop" class="stop-button">□</button>
        </div>
      </div><!-- /#player -->
      <div id="txt-outer">
        <textarea id="txt" wrap="off" cols="60" rows="<?php echo $textareaRows; ?>"><?php echo htmlspecialchars($utf8_mml, ENT_QUOTES); ?></textarea>
      </div>

      <!-- status_bar -->
      <div id="status_bar">
        <span class="box" id="lineno-info">line: 000</span>
        <span class="box">
          <span id="sakura_version">v.?.?</span>
        </span>
        <span class="player-synth-selector box">
          <label for="pico"><input type="radio" id="pico" class="pure-checkbox" name="player_type" value="pico"> picoaudio</label>
          <label for="soundfont"><input type="radio" id="soundfont" class="pure-checkbox" name="player_type" value="sf" checked="1"> soundfont</label>
        </span>
      </div><!-- /status_bar -->
      <div id="msg" style="padding:0.5em"></div>

      <!-- manual -->
      <div id="descript-open" style="display:none;">
        <span class="open-button">?</span>
      </div>
      <div id="descript">
        <div id="descript-title">
          <h2><a href="https://sakuramml.com/go.php?16" target="_new">Manual</a></h2>
          <button id="descript-close">×</button>
        </div>
        <div id="descript-ja">
          <h3>使い方:</h3>
          <p>「ドレミファソラシ」または「cdefgab」と書くと音が鳴ります。休符は「ッ」か「ン」で、「ソーミソラーソー」と「ー」を書くと二倍の長さになります。</p>
          <p>四分音符は「ド4」、八分音符は「レ8」、付点四分音符は「ミ4.」のように記述します。また「音符8」と書くと八分音符がデフォルト音長になります。</p>
          <p>「音階5」とか「音階4」と書くとオクターブが変わります。「↑」や「↓」と書くと相対的にオクターブを変更します。『「ドミソ」』と書くと和音が鳴ります。</p>
          <p>トラックを切り替えるには「トラック2」「トラック3」と書きます。トラック10が打楽器です。</p>
          <p>音色を変えるには「音色(GrandPiano)」とか「@80」と書きます。この下のVoice Listから挿入すると楽です。</p>
          <p>ショートカットキー: [F9]で再生、[F10]で停止</p>
          <p>以下のSave Listはブラウザに保存するだけなので、保存後<a href="https://sakuramml.com/mmlbbs6/post.php?action=edit" target="_new">🔗曲掲示板6...</a>に投稿してください。</p>
          <p>
            <a target="_new" href="https://sakuramml.com/go.php?16">🔗利用例...</a> /
            <a target="_new" href="https://github.com/kujirahand/sakuramml-rust/blob/main/src/command.md">🔗コマンド一覧...</a>
          </p>
        </div>
        <div id="descript-en">
          <h3>About Picosakura</h3>
          <p>This is a user-friendly music production tool that allows music creation directly in the browser. It converts text into music and plays it back.</p>
          <h3>Shortcut key</h3>
          <ul>
            <li>Play : F9</li>
            <li>Stop : F10</li>
          </ul>
          <h3>Command List</h3>
          <p>
            <a target="_new" href="https://github.com/kujirahand/sakuramml-rust/blob/main/src/command.md">🔗Command list...</a>
          </p>
        </div>
        <h3>Voice List</h3>
        <p>
          <span id="voice-list"></span>
          <button onclick="insertVoice()">Insert</button>
          <button onclick="testVoice()">Test</button>
          <input type="text" id="voice-list-mml" size="15" value="o5l8ドレミソ↑ドー↓「ドミソ」1">
        </p>
        <h3>Command List</h3>
        <p>
          <span id="command-list"></span>
          <button onclick="insertCommand()">Insert</button>
        </p>
        <h3>Save List</h3>
        <p>Save: <span id="save-list"></span></p>
        <p>Load: <span id="load-list"></span></p>
      </div>
    </div><!-- /player-outer -->
  </div>
  <br><br><br><br>
  <div id="picosakura-footer">
    <div>
      <a href="https://github.com/kujirahand/picosakura" target="_new">picosakura</a>
      - <a href="https://sakuramml.com/" target="_new">sakuramml.com</a>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      // load SoundFont
      SF_loadSoundFont('<?php echo $baseUrl; ?>/synth/TimGM6mb.sf2');
      // initScript
      <?php echo $initScript; ?>
      // event
      document.getElementById('descript-close').onclick = closeDescript;
      document.getElementById('descript-open').onclick = openDescript;
      // language (ja-JP / en-US)
      const lang = navigator.language || navigator.userLanguage;
      const isJa = (lang.indexOf('ja') >= 0)
      document.getElementById('descript-ja').style.display = isJa ? 'block' : 'none';
      document.getElementById('descript-en').style.display = isJa ? 'none' : 'block';
    });

    function closeDescript() {
      document.getElementById('app-title').style.display = 'none';
      document.getElementById('descript').style.display = 'none';
      document.getElementById('descript-open').style.display = 'block';
    }

    function openDescript() {
      document.getElementById('descript').style.display = 'block';
      document.getElementById('descript-open').style.display = 'none';
    }
    // jump line
    function gotoLine(lineNumber) {
      const textarea = document.getElementById('txt')
      const lines = textarea.value.split('\n')
      // 行番号が範囲内にあることを確認します
      if (lineNumber < 0) {
        lineNumber = 0;
      } else if (lineNumber > lines.length) {
        lineNumber = lines.length;
      }
      // カーソルを移動させる位置を計算します
      var position = 0;
      for (var i = 0; i < lineNumber; i++) {
        position += lines[i].length + 1; // 行の長さに改行文字('\n')を足します
      }
      // カーソルを移動させるために、テキストエリアをフォーカスします
      textarea.focus();
      // カーソルの位置をセットします
      textarea.selectionStart = position;
      textarea.selectionEnd = position;
    }
    // insert voice
    function insertVoice() {
      const voiceSelect = document.getElementById('voice-select');
      const voiceIndex = voiceSelect.selectedIndex;
      const voiceLabel = voiceSelect.options[voiceIndex].innerHTML;
      const [voiceNo, voiceName] = voiceLabel.split(':');
      const voice = `音色(${voiceName})`;
      const textarea = document.getElementById('txt');
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const text1 = text.substr(0, pos);
      const text2 = text.substr(pos);
      textarea.value = text1 + voice + text2;
      textarea.focus();
      textarea.selectionStart = pos + voice.length;
      textarea.selectionEnd = pos + voice.length;
    }

    function testVoice() {
      const voiceSelect = document.getElementById('voice-select');
      const voiceIndex = voiceSelect.selectedIndex;
      const voiceLabel = voiceSelect.options[voiceIndex].innerHTML;
      const [voiceNo, voiceName] = voiceLabel.split(':');
      const voice = `@${voiceName}`;
      const sample = document.getElementById('voice-list-mml').value;
      const mml = `@${voiceNo} ${sample}`;
      console.log('test:', mml)
      window.playMMLDirect(mml)
    }

    // insert Command
    function insertCommand() {
      const cSelect = document.getElementById('command-select');
      const cIndex = cSelect.selectedIndex;
      const val = cSelect.options[cIndex].value;
      const textarea = document.getElementById('txt');
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const text1 = text.substr(0, pos);
      const text2 = text.substr(pos);
      textarea.value = text1 + val + text2;
      textarea.focus();
      textarea.selectionStart = pos + val.length;
      textarea.selectionEnd = pos + val.length;
    }

    // save/load
    function saveToStorage(no) {
      const txt = document.getElementById('txt')
      localStorage.setItem(`picosakura-${no}`, txt.value)
      alert(`Saved : ${no}`)
      window.updateSaveList()
    }

    function loadFromStorage(no) {
      const txt = document.getElementById('txt')
      const mml = localStorage.getItem(`picosakura-${no}`)
      const mmlSub = mml ? mml.substr(0, 20) + '...' : ''
      if (txt.value != '') {
        const c = confirm(`Can I load [${no}]?\n>>> ${mmlSub}`)
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
  </script>
</body>

</html>