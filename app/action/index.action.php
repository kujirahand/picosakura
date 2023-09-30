<?php
function action_index_default() {
  global $picosakuraLang;
  // CHECK mode
  if (!isset($utf8_mml)) {
    // default mode
    $sampleFile = __DIR__ . "/sample/hello-{$picosakuraLang}.mml";
    $sampleMML = @file_get_contents($sampleFile);
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

  // render
  template_render('index.html', [
    'baseUrl' => $baseUrl,
    'utf8_mml' => $utf8_mml,
    'textareaRows' => $textareaRows,
    'initScript' => $initScript,
    'sampleMML' => $sampleMML,
    'm_player_css' => pico_get_resource_mtime('player.css'),
  ]);
}

