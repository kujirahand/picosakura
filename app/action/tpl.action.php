<?php

function action_tpl_default() {
  global $DIR_TEMPLATE;
  // check filename and filetype
  $f = empty($_GET['f']) ? '' : $_GET['f'];
  if (!preg_match('#^[a-z_\-\.]+\.(css|js|map|txt|sf2|mml)$#', $f)) {
    echo "invalid filename";
    return;
  }
  // check file exists
  $fullpath = $DIR_TEMPLATE . '/' . $f;
  if (!file_exists($fullpath)) {
    echo "file not found";
    return;
  }
  // check file type
  $mime = mime_content_type($fullpath);
  if (preg_match('#\.css$#', $f)) { $mime = 'text/css'; }
  header('Content-Type: ' . $mime);
  echo file_get_contents($fullpath);
  echo "\n/* $mime */";
}

