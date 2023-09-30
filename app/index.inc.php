<?php
// --------------------------------------------------
// picosakura
// --------------------------------------------------
// template engine: php_fw_simple
// --------------------------------------------------
// DIR
$DIR_ROOT = dirname(__DIR__);
$DIR_LIB = __DIR__;
$DIR_ACTION = $DIR_LIB.'/action';
$DIR_TEMPLATE = $DIR_LIB.'/template';
$DIR_TEMPLATE_CACHE = $DIR_ROOT.'/cache';
$DIR_RESOURCE = $DIR_ROOT.'/resource';
// --------------------------------------------------
// require 
require_once $DIR_ROOT.'/version_picosakura.inc.php';
require_once $DIR_LIB.'/libpico.inc.php';
// --------------------------------------------------
// check language
$langAccept = empty($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? 'ja' : strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);
$picosakuraLang = $lang = (strpos($langAccept, 'ja') >= 0) ? 'ja' : 'en';
// action
require_once __DIR__.'/php_fw_simple/index.lib.php';


