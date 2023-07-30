// language data
const PICO_LANG = {
    'ja': {
        'Insert': '挿入',
        'Test': 'テスト',
        'Can I read the following data?': '以下のデータを読み込んでも良いですか？',
        'Sound': '発音',
        'splash-window:body': '「ピコサクラ」はブラウザ上で「ドレミ」とテキスト入力することで音楽を作成するツールです。以下のテキストボックスに、音楽データを記述して[PLAY]ボタンを押すと音楽を再生します。音楽データの記述方法は、<a href="https://sakuramml.com/go.php?16" target="_new">マニュアル</a>をご覧ください。',
    },
    'en': {
        'Insert': 'Insert',
        'Test': 'Test',
        'Can I read the following data?': 'Can I read the following data?',
        'Sound': 'Sound',
        'splash-window:body': '`Picosakura` is a user-friendly music production tool that allows music creation directly in the browser. It converts text into music and plays it back.'
    }
}
// easy function
function getLang(key, def) {
    if (def === undefined) { def = key }
    let lang = window.navigator.language
    if (lang === undefined) { lang = 'en-US' }
    lang = (lang + '-').split('-')[0]
    const locales = PICO_LANG[lang]
    if (!locales) { return def }
    const msg = locales[key]
    if (msg === undefined) {
        return def
    }
    return msg
}
