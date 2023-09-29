<?php
// sakuramml version
include_once __DIR__ . '/version_picosakura.inc.php';
$picosakuraVersion = VERSION_PICO;
$pico_ok = [
    '0.1.22' => TRUE,
    '0.1.23' => TRUE,
    '0.1.25' => TRUE,
];

// ピコサクラのバージョン変更を許可するか？
if (isset($_GET['pico_ver']) && $_GET['pico_ver'] !== '') {
    $pico_ver = $_GET['pico_ver'];
    if (isset($pico_ok[$pico_ver])) {
        $picosakuraVersion = $pico_ver;
    }
    /*
    // 正規表現でチェック
    if (preg_match('/^[0-9]+\.[0-9]+\.[0-9]+$/', $_GET['pico_ver'])) {
        $picosakuraVersion = $_GET['pico_ver'];
    }
    */
}
$uriPicoLib = "https://cdn.jsdelivr.net/npm/sakuramml@{$picosakuraVersion}/sakuramml.js";
?>
<script type="module">
    // Load WebAssembly
    import init, {
        get_version,
        SakuraCompiler
    } from '<?php echo $uriPicoLib ?>';
    // sakura version
    let sakuraVession = '?.?.?'
    // Init WebAssembly
    init().then(() => {
        sakuraVession = get_version()
        console.log(`loaded: sakuramml v.${sakuraVession}`)
        document.getElementById('player').style.display = 'block'
        document.getElementById('sakura_version').innerHTML = 'ver.' + sakuraVession
        window._picosakura = {
            get_version,
            SakuraCompiler,
            lang: '<?php echo $picosakuraLang; ?>',
        }
    }).catch(err => {
        console.error(err);
        document.getElementById('msg').innerHTML = '[LOAD_ERROR]' + tohtml(err.toString())
    });
</script>