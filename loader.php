<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PicoSakura - loader</title>
    <!-- test file : data loader -->
</head>
<body>
    <h1>PicoSakura - Now Loading...</h1>
    <img src="resource/loader.gif" style="width:100%">
</body>
<script>
    // Service Workerの登録
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                window.location.href = './app.php';
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
</script>

</html>
