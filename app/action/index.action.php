<?php
function action_index_default() {
  global $picosakuraLang;
  // get parametes
  $pico_ver = empty($_GET['pico_ver']) ? '' : $_GET['pico_ver'];
  $utf8_mml = empty($_GET['utf8_mml']) ? '' : $_GET['utf8_mml'];
  $sampleMML = '';
  // -----------------------------------------------------------------
  // CHECK mode
  // -----------------------------------------------------------------
  // Normal mode || include from mmlbbs6
  if (empty($utf8_mml)) {
    // normal mode
    $sampleFile = __DIR__ . "/sample/hello-{$picosakuraLang}.mml";
    $sampleMML = @file_get_contents($sampleFile);
    $utf8_mml = $sampleMML;
    $baseUrl = '.';
    $initScript = 'window.loadLastMMLFromLS(); window.checkSynthType();';
    $textareaRows = 23;
  } else {
    // include from mmlbbs6
    $baseUrl = dirname(dirname($_SERVER['PHP_SELF'])).'/picosakura';
    $baseUrl = preg_replace('#^\/\/pico#', '/pico', $baseUrl); // replace //pico -> /pico
    $initScript = 'window.checkSynthType(); closeDescript();';
    $textareaRows = 9;
  }

  // -----------------------------------------------------------------
  // CHECK picosakura version
  // -----------------------------------------------------------------
  global $VERSION_PICO;
  $picosakuraVersion = $VERSION_PICO;
  // Allow change version?
  if ($pico_ver !== '') {
    $pico_ver = $_GET['pico_ver'];
    if (!preg_match('/^[0-9\.]+$/', $pico_ver)) {
      $pico_ver = '';
    } else {
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

