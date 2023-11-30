// language data
const PICO_LANG = {
    'ja': {
        'Insert': '挿入',
        'Test': 'テスト',
        'Can I read the following data?': '以下のデータを読み込んでも良いですか？',
        'Sound': '発音',
        'Sutoton': 'ストトン',
        'cde': 'ドレミ',
        'splash-window:title': '「ピコサクラ」について',
        'splash-window:body': '<p>「ピコサクラ」はブラウザ上で「ドレミ」とテキスト入力することで音楽を作成するツールです。</p><p>テキストボックスに、音楽データを記述して[PLAY]ボタンを押すと音楽を再生します。</p><p>音楽データの記述方法は、<a href="https://sakuramml.com/go.php?16" target="_new">マニュアル</a>をご覧ください。</p>',
        'Click on [ERROR] to jump.': '[ERROR]をクリックするとカーソルが自動的に移動します。',
        'Sorry, SoundFont is not ready. Please try again later.': 'すみません。SoundFontを読み込み中です。少し待ってから改めて再生してください。',
        'export to WAV': 'WAVファイルに出力',
    },
    'en': {
        'Insert': 'Insert',
        'Test': 'Test',
        'cde': 'ドレミ', // Japanese-Sutoton
        'Can I read the following data?': 'Can I read the following data?',
        'Sound': 'Sound',
        'splash-window:title': 'About Picosakura',
        'splash-window:body': '`Picosakura` is a user-friendly music production tool that allows music creation directly in the browser. It converts text into music and plays it back.',
        'Click on [ERROR] to jump.': 'Click on [ERROR] to jump.',
        'Sorry, SoundFont is not ready. Please try again later.': 'Sorry, SoundFont is not ready. Please try again later.',
        'export to WAV': 'export to WAV'
    }
}
// easy function
export function getLang(key, def) {
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
