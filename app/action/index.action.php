<?php
function action_index_default() {
  $baseUrl = '.';

  // check language
  $langAccept = empty($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? 'ja' : strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);
  $picosakuraLang = $lang = (strpos($langAccept, 'ja') >= 0) ? 'ja' : 'en';

  // detect sample mml file
  $sampleFile = __DIR__."/sample/hello-{$lang}.mml";
  $sampleMML = @file_get_contents($sampleFile);

  template_render('index.html', [
    'baseUrl' => $baseUrl,
  ]);
}

