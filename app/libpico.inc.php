<?php

function pico_get_resource_mtime($fname) {
  global $DIR_RESOURCE;
  $full = $DIR_RESOURCE . '/' . $fname;
  if (file_exists($full)) {
    return filemtime($full);
  } else {
    return 0;
  }
}

function pico_template_url($fname) {
  global $DIR_TEMPLATE;
  $fullpath = $DIR_TEMPLATE . '/' . $fname;
  $mtime = 0;
  if (file_exists($fullpath)) {
    $mtime = filemtime($fullpath) % 1000;
  }
  return "./index.php?f=$fname&a=tpl&m=$mtime";
}

