<?php
function action_index_default() {
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

  // detect sample mml file
  $sampleFile = __DIR__."/sample/hello-{$lang}.mml";
  $sampleMML = @file_get_contents($sampleFile);

  // render
  template_render('index.html', [
    'baseUrl' => $baseUrl,
    'textareaRows' => $textareaRows,
    'initScript' => $initScript,
    'sampleMML' => $sampleMML,
    'm_player_css' => pico_get_resource_mtime('player.css'),
  ]);
}

