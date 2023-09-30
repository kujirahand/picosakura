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

