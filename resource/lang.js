// language data
const PICO_LANG = {
    'ja': {
        'Insert': '挿入',
        'Test': 'テスト',
        'Can I read the following data?': '以下のデータを読み込んでも良いですか？',
    },
    'en': {
        'Insert': 'Insert',
        'Test': 'Test',
        'Can I read the following data?': 'Can I read the following data?',
    }
}
// easy function
function getLang(key, def) {
    if (def === undefined) { def = key }
    let lang = window.navigator.language
    if (lang === undefined) { lang = 'en-US' }
    lang = (lang + '-').split('-')[0]
    console.log('@lang=', lang)
    const locales = PICO_LANG[lang]
    if (!locales) { return def }
    const msg = locales[key]
    if (msg === undefined) {
        return def
    }
    return msg
}
