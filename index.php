<?php
include_once __DIR__ . '/lib/mml_sample.inc.php';
$player_css_mtime = filemtime(__DIR__.'/resource/player.css');
$picosakuraPlayerJSTime = filemtime(__DIR__.'/resource/picosakura_player.js');
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pico Sakura - ピコサクラ - テキスト音楽「サクラ」</title>

  <!-- for picosakura -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css" integrity="sha384-X38yfunGUhNzHpBaEBsWLO+A0HDYOQi8ufWDkZ0k9e0eXz/tH3II7uKZ9msv++Ls" crossorigin="anonymous">
  <link rel="stylesheet" href="resource/player.css?m=<?php echo $player_css_mtime ?>">

  <!-- for music player -->
  <!-- jzz player -->
  <script src="https://cdn.jsdelivr.net/npm/jzz"></script>
  <script src="https://cdn.jsdelivr.net/npm/jzz-midi-smf"></script>
  <script src="https://cdn.jsdelivr.net/npm/jzz-synth-tiny"></script>
  <script src="https://cdn.jsdelivr.net/npm/jzz-input-kbd"></script>
  <script src="https://cdn.jsdelivr.net/npm/jzz-gui-player"></script>
  <!-- picoaudio player -->
  <script src="https://unpkg.com/picoaudio/dist/browser/PicoAudio.js"></script>

</head>

<body>
  <!-- for sakuramml -->
  <?php require_once __DIR__ . '/lib/pico_player.inc.php'; ?>
  <script type="module" src="resource/picosakura_player.js?m=<?php echo $picosakuraPlayerJSTime?>"></script>
  <script>
    function show_jzz() {
      const gui = document.getElementById('player_gui')
      gui.style.display = 'block'
    }

    function show_pico() {
      document.getElementById('player_gui').style.display = 'none'
      console.log('pico')
    }
  </script>
  <div id="picosakura-player">
    <h1>♪ Pico Sakura</h1>
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
            <label for="pico"><input type="radio" id="pico" class="pure-checkbox" name="player_type" value="pico" checked="1" onclick="show_pico()"> picoaudio</label>
            <label for="jzz"><input type="radio" id="jzz" class="pure-checkbox" name="player_type" value="jzz" onclick="show_jzz()"> jzz-synth-tiny</label>)
          </span>
        </div>
      </div>
      <div id="txt-outer">
        <div>
          <textarea id="txt" cols="60" rows="15"><?php echo $sampleMML ?></textarea>
        </div>
        <div id="txt_info">line: ?</div>
      </div>
      <div>
        <div id="player_gui"></div>
      </div>
      <div id="msg" style="padding:0.5em; color: red;"></div>
      <div style="text-align:right"><a href="https://sakuramml.com/go.php?16" target="_new">Manual</a></div>
      <div style="text-align:right"><a href="https://sakuramml.com/" target="_new">sakuramml.com</a></div>
    </div><!-- /player-outer -->
  </div>
  <br><br><br><br>
  <div id="picosakura-footer">
    <a href="https://github.com/kujirahand/picosakura" target="_new">picosakura</a>
  </div>

</body>

</html>