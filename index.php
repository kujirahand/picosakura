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
  $appTitle = '<h1>Pico Sakura</h1>';
  $baseUrl = '.';
  $initScript = 'window.loadLastMMLFromLS(); window.checkSynthType();';
  $textareaRows = 15;
} else {
  // include from mmlbbs6
  $appTitle = '';
  $baseUrl = './picosakura';
  $initScript = 'window.checkSynthType();';
  $textareaRows = 8;
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
    <?php echo $appTitle ?>
    <div id="player-outer">
      <div id="player" style="display:none;">
        <div>
          <button id="btnPlay" class="pure-button play-button pure-button-primary">▶PLAY(F9)</button>
          <button id="btnStop" class="pure-button stop-button">■STOP(F10)</button> &nbsp;
        </div>
        <div class="player-synth-selector">
          <span id="sakura_version">v.?.?</span>
          <span>
            (Synth:
            <label for="pico"><input type="radio" id="pico" class="pure-checkbox" name="player_type" value="pico"> picoaudio</label>
            <label for="soundfont"><input type="radio" id="soundfont" class="pure-checkbox" name="player_type" value="sf" checked="1"> soundfont</label>)
          </span>
        </div>
      </div>
      <div id="txt-outer">
        <div class="line-number-wrapper">
          <div class="line-numbers" id="line-numbers"></div>
          <textarea id="txt" wrap="off" cols="60" rows="<?php echo $textareaRows; ?>"><?php echo htmlspecialchars($utf8_mml, ENT_QUOTES); ?></textarea>
        </div>
        <div id="status_bar">
          <span id="lineno-info">line: ?</span>
        </div>
      </div>
      <div style="clear:both"></div>
      <div>
        <div id="player_gui"></div>
      </div>
      <div id="msg" style="padding:0.5em"></div>
      <div style="text-align:right"><a href="https://sakuramml.com/go.php?16" target="_new">Manual</a></div>
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
    });

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
  </script>
</body>

</html>