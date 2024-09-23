<?php

function action_tpl_default() {
  global $DIR_TEMPLATE;
  // check filename and filetype
  $f = empty($_GET['f']) ? '' : $_GET['f'];
  if (!preg_match('#^[a-z_\-\.]+\.(css|json|js|html|map|txt|sf2|mml)$#', $f)) {
    echo "invalid filename";
    return;
  }
  // check file exists
  $fullpath = $DIR_TEMPLATE . '/' . $f;
  if (!file_exists($fullpath)) {
    header("HTTP/1.1 404 Not Found");
    echo "404 file not found";
    return;
  }
  // check file type
  $mime = 'text/plain';
  if (preg_match('#\.css$#', $f)) { $mime = 'text/css'; }
  elseif (preg_match('#\.js$#', $f)) { $mime = 'text/javascript'; }
  header('Content-Type: ' . $mime);
  echo file_get_contents($fullpath);
}

