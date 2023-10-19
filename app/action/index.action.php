<?php
function action_index_default() {
  global $picosakuraLang;
  // get parametes
  $pico_ver = empty($_GET['pico_ver']) ? '' : $_GET['pico_ver'];
  $utf8_mml = empty($_GET['utf8_mml']) ? '' : $_GET['utf8_mml'];
  // -----------------------------------------------------------------
  // CHECK mode
  // -----------------------------------------------------------------
  // Normal mode || include from mmlbbs6
  if (!isset($utf8_mml)) {
    // normal mode
    $sampleFile = __DIR__ . "/sample/hello-{$picosakuraLang}.mml";
    $sampleMML = @file_get_contents($sampleFile);
    $utf8_mml = $sampleMML;
    $baseUrl = '.';
    $initScript = 'window.loadLastMMLFromLS(); window.checkSynthType();';
    $textareaRows = 23;
  } else {
    // include from mmlbbs6
    $baseUrl = '/picosakura';
    $initScript = 'window.checkSynthType(); closeDescript();';
    $textareaRows = 9;
  }

  // -----------------------------------------------------------------
  // CHECK picosakura version
  // -----------------------------------------------------------------
  global $VERSION_PICO;
  $picosakuraVersion = $VERSION_PICO;
  $stableVerList = [
    '0.1.22' => TRUE,
    '0.1.23' => TRUE,
    '0.1.25' => TRUE,
  ];
  // Allow change version?
  if ($pico_ver !== '') {
    $pico_ver = $_GET['pico_ver'];
    if (isset($stableVerList[$pico_ver])) {
      $picosakuraVersion = $pico_ver;
    }
  }
  // -----------------------------------------------------------------
  // render
  // -----------------------------------------------------------------
  template_render('index.html', [
    'baseUrl' => $baseUrl,
    'utf8_mml' => $utf8_mml,
    'textareaRows' => $textareaRows,
    'initScript' => $initScript,
    'sampleMML' => $sampleMML,
    'm_player_css' => pico_get_resource_mtime('player.css'),
    'picosakuraLang' => $picosakuraLang,
    'picosakuraVersion' => $picosakuraVersion,
  ]);
}

