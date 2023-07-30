<?php
// ------------------------------------------------------------
// Pico Sakura Player
// ------------------------------------------------------------
include_once __DIR__ . '/lib/mml_sample.inc.php';
$player_css_mtime = filemtime(__DIR__ . '/resource/player.css');
$picosakuraPlayerJSTime = filemtime(__DIR__ . '/resource/picosakura_player.js');
$picosakuraEditorJSmtime = filemtime(__DIR__ . '/resource/picosakura_editor.js');
$soundfont_player_mtime = filemtime(__DIR__ . '/synth/soundfont_player.js');
$lang_mtime = filemtime(__DIR__ . '/resource/lang.js');
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
  <script src="<?php echo $baseUrl; ?>/resource/lang.js?m=<?php echo $lang_mtime ?>"></script>
  <script src="<?php echo $baseUrl; ?>/resource/picosakura_editor.js?m=<?php echo $picosakuraEditorJSmtime ?>"></script>

  <!-- + music player -->
  <!-- | js-synthesizer -->
  <script src="<?php echo $baseUrl; ?>/synth/libfluidsynth-2.3.0-with-libsndfile.js"></script>
  <script src="<?php echo $baseUrl; ?>/synth/js-synthesizer.js"></script>
  <script src="<?php echo $baseUrl; ?>/synth/soundfont_player.js?m=<?php echo $soundfont_player_mtime ?>"></script>
  <!-- | picoaudio player -->
  <script src="https://unpkg.com/picoaudio/dist/browser/PicoAudio.js"></script>

</head>

<body>
  <!-- for sakuramml -->
  <?php require_once __DIR__ . '/lib/pico_player.inc.php'; ?>
  <script type="module" src="<?php echo $baseUrl; ?>/resource/picosakura_player.js?m=<?php echo $picosakuraPlayerJSTime ?>"></script>
  <div id="picosakura-player">
    <div id="app-title">
      <h1>Pico Sakura</h1>
      <div id="splash-window" style="display: none;">
        <p id="splash-window-body">This is a user-friendly music production tool that allows music creation directly in the browser. It converts text into music and plays it back.</p>
        <p><button id="splash-window-ok">OK</button></p>
      </div>
    </div>
    <div id="player-outer" class="front-panel">
      <div id="player" style="display:none;">
        <div>
          <button id="btnPlay" class="play-button">▶ PLAY</button>
          <button id="btnStop" class="stop-button">□</button>
          <button id="btnPiano" class="piano-button">🎹</button>
        </div>
      </div><!-- /#player -->
      <div id="txt-outer">
        <div id="piano-outer" style="display:none;">
          <div>
            <canvas id="piano-canvas"></canvas>
          </div>
          <div class="piano-parts">
            <label for="chkPiano">
              &nbsp;<input type="checkbox" id="chkPiano" checked="checked">&nbsp;<span class="lang">Insert</span>
            </label>
            <label for="chkPianoPlay">
              &nbsp;<input type="checkbox" id="chkPianoPlay" checked="checked">&nbsp;<span class="lang">Sound</span>
            </label>&nbsp;
            <button onclick="insertToText('ー')">ー</button>&nbsp;
            <button onclick="insertToText('BS')">BS</button>&nbsp;
            <button onclick="insertToText(' | ')">|</button>&nbsp;
          </div>
        </div>
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

      <!-- tools -->
      <div id="descript-open" style="display:none;">
        <button class="open-button">🔧</button>
      </div>
      <div id="descript">

        <div id="descript-title">
          <h2>🔧 Tools</h2>
          <button id="descript-close">×</button>
        </div>

        <div>
          <h3>Voice List</h3>
          <div class="insertButtons">
            <div id="voice-list" style="flex:5"></div>
            <button onclick="insertVoice()" style="flex:1" class="lang">Insert</button>
          </div>
          <div class="insertButtons">
            <input type="text" id="voice-list-mml" size="15" value="o5l8ドレミソ↑ドー↓「ドミソ」1" style="flex:5">&nbsp;
            <button onclick="testVoice()" style="flex:1" class="lang">Test</button>
          </div>
        </div>
        <div>
          <h3>Command List</h3>
          <div class="insertButtons">
            <div id="command-list" style="flex:5"></div>
            <button onclick="insertCommand()" style="flex:1" class="lang">Insert</button>
          </div>
        </div>
        <div id="descript-ja">
          <h3>サクラの簡単な使い方:</h3>
          <p>テキストボックスに「ドレミファソラシ」と書いて[Play]ボタンを押すと音が鳴ります。休符は「ッ」か「ン」です。「ソーミソラーソー」と「ー」を書くと二倍の長さになります。</p>
          <p>四分音符は「ド4」、八分音符は「レ8」、付点四分音符は「ミ4.」のように記述します。また「音符8」と書くと八分音符がデフォルト音長になります。</p>
          <p>「音階5」とか「音階4」と書くとオクターブが変わります。「↑」や「↓」と書くと相対的にオクターブを変更します。『「ドミソ」』と書くと和音が鳴ります。</p>
          <p>トラックを切り替えるには「トラック2」「トラック3」と書きます。「トラック10」が打楽器専用です。</p>
          <p>音色を変えるには「音色(GrandPiano)」のように書きます。Voice Listから挿入できます。</p>
          <p>Save Listはブラウザの一時領域に保存するだけなので、保存した後<a href="https://sakuramml.com/mmlbbs6/post.php?action=edit" target="_new">🔗曲掲示板6...</a>に投稿してください。</p>
          <p>ショートカットキー: [F9]で再生、[F10]で停止</p>
          <p>
            <a target="_new" href="https://sakuramml.com/go.php?16">🔗文法例...</a> /
            <a target="_new" href="https://github.com/kujirahand/sakuramml-rust/blob/main/src/command.md">🔗コマンド一覧...</a> /
            <a target="_new" href="https://sakuramml.com/index.php?FAQ">🔗FAQ...</a>
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
        <h3>Save List</h3>
        <p>Save: <span id="save-list"></span></p>
        <p>Load: <span id="load-list"></span></p>
      </div>
    </div><!-- /player-outer -->
  </div>
  <br><br><br><br>
  <div id="picosakura-footer">
    <div>
      <span class="footer-link">
        <a href="https://sakuramml.com/" target="_new">sakuramml.com</a>
      </span> &gt;
      <span class="footer-link">
        <a href="https://sakuramml.com/picosakura/" target="_new">picosakura</a>
      </span> -
      <span class="footer-link">
        <a href="https://github.com/kujirahand/picosakura" target="_new">(repo.)</a>
      </span>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      // load SoundFont
      SF_loadSoundFont('<?php echo $baseUrl; ?>/synth/TimGM6mb.sf2');
      // initScript
      <?php echo $initScript; ?>
    });
  </script>
</body>

</html>