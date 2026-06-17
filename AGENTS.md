# ピコサクラ フォルダ構成定義書 (`AGENTS.md`)

テキスト音楽「サクラ」のブラウザ版移植である「ピコサクラ (Picosakura)」のフォルダ構成およびアーキテクチャの概要です。

## フォルダツリー概要

```text
picosakura/
├── index.html                   # index.phpへのリダイレクト用HTML
├── index.php                    # アプリケーションのメインエントリポイント
├── loader.php                   # ヘルパーライブラリ
├── resource.php                 # リソース・テンプレート動的配信用のエントリポイント
├── player.html                  # インラインプレイヤー画面
├── service-worker-pico.js       # PWA・キャッシュ制御用サービスワーカー
├── version_picosakura.inc.php   # ピコサクラ本体のバージョン定義ファイル
│
├── app/                         # サーバーサイド処理 (PHP)
│   ├── index.inc.php            # アプリケーション共通の初期化・設定
│   ├── libpico.inc.php          # 共通ライブラリ関数定義
│   ├── action/                  # アクションコントローラー (ルーティング先)
│   │   ├── index.action.php     # メイン画面のレンダリング処理
│   │   └── tpl.action.php       # テンプレートファイル（CSS/HTML等）の配信処理
│   ├── sample/                  # サンプルMMLファイル
│   │   ├── hello-en.mml
│   │   └── hello-ja.mml
│   ├── template/                # 画面構成用テンプレート（HTML / CSS）
│   │   ├── error_system.html
│   │   ├── footer_c.html
│   │   ├── header_c.html
│   │   ├── index.html           # メインエディタ・プレイヤー画面のHTML
│   │   ├── message.html
│   │   ├── pico_common.css      # ピコサクラ共通CSSスタイルシート
│   │   ├── pico_loader.html
│   │   ├── pico_tool_commandlist_window.html # コマンド一覧のモーダル用HTML
│   │   └── pico_tool_voicelist_window.html    # 音色一覧のモーダル用HTML
│   └── php_fw_simple/           # 軽量自作PHPフレームワーク
│
├── src/                         # フロントエンドロジック (JavaScript - ES Modules)
│   ├── main.js                  # フロントエンドのエントリポイント（UIイベント・初期化・鍵盤描画等）
│   ├── pico_loader.js           # コンパイラ・SoundFontのローディング状態確認
│   ├── pico_messages.js         # 他言語化辞書定義 (日本語・英語)
│   ├── pico_module.js           # MMLのコンパイルおよび再生制御、Storage・通信制御
│   ├── pico_tool.js             # 音色一覧・コマンド一覧ダイアログの表示制御
│   ├── pico_utils.js            # モーダル・ダイアログの作成などのユーティリティ
│   ├── pico_editor.js           # (将来用・現在空ファイル)
│   └── pico_player.js           # (将来用・現在空ファイル)
│
├── synth/                       # 音源・シンセサイザーエンジン群 (WASM / JS)
│   ├── fonts/                   # SoundFontファイル格納先
│   │   └── TimGM6mb.sf2         # デフォルトSoundFont音源ファイル
│   ├── lib/                     # js-synthesizer of TypeScriptコンパイル後のモジュール群
│   ├── js-synthesizer.js        # FluidSynthのWeb Audio API用ラッパー
│   ├── js-synthesizer.worklet.js# AudioWorklet内で動作するFluidSynthプロセッサ
│   ├── libfluidsynth-2.3.0.js   # FluidSynth本体のWebAssembly/JSバインディング
│   ├── picoaudio1.1.2_PicoAudio.min.js # 軽量MIDIシンセサイザー「PicoAudio」
│   ├── sakuramml.js / .wasm     # Rust製Sakura MMLコンパイラ(WebAssembly版)
│   ├── sakuramml_loader.js      # WASM・JS・SoundFont読み込みのコントローラー
│   ├── sakuramml_loader_js.php  # sakuramml_loader.jsを動的に生成・配信するPHPスクリプト
│   └── soundfont_player.js      # シンセサイザーの再生ラッパー (PicoAudio/FluidSynthを制御)
│
├── resource/                    # 画像・デザイン・MML定義リソース
│   ├── skin.css                 # スキン（着せ替え）用のスタイルシート
│   ├── voicelist.json           # GM準拠 of 音色リスト
│   ├── commandlist.txt          # サクラMMLコマンドリファレンス
│   └── *.jpg / *.gif            # スキン用背景画像・ローダー画像
│
├── tools/                       # ユーティリティツール群
│   ├── wav_converter.html       # MIDI/MMLからWAVファイルへの変換画面
│   ├── wav_converter.php        # WAV変換処理を補助するサーバーサイドスクリプト
│   └── wav_converter-worker.js  # オフラインWAV変換用のWeb Worker
│
└── cache/                       # PHPテンプレートエンジンキャッシュ領域
```

## 主要ディレクトリ・ファイル詳細

### 1. アプリケーション基盤とルーティング

* **[index.php](index.php)** / **[resource.php](resource.php)**
  PHPのWebエントリーポイントです。いずれも **[app/index.inc.php](app/index.inc.php)** をロードし、自作の軽量PHPフレームワークである **[app/php_fw_simple](app/php_fw_simple)** を介して、クエリパラメータに応じたアクションを呼び出します。
* **[app/action/index.action.php](app/action/index.action.php)**
  デフォルトアクションであり、メイン画面テンプレートをパラメータ付きでレンダリングします。
* **[app/action/tpl.action.php](app/action/tpl.action.php)**
  テンプレートディレクトリにある各種リソースファイルを適切なMime-Typeヘッダーを付与してクライアントへ配信します。

### 2. フロントエンド UI とロジック (`/src`)

JavaScriptコードは ES Modules 形式で細分化されています。
* **[src/main.js](src/main.js)**
  フロントエンドのエントリーポイント。DOMの読み込み完了時に実行され、多言語対応のセットアップ、スキン（着せ替え）デザインの適用、各DOMに対するイベントリスナー（再生/停止ボタン、各種ダイアログ起動、テキストエリア入力検知など）の設定を行います。また、ピアノロール（鍵盤）のCanvas描画およびクリックイベントのハンドリングもここで実装されています。
* **[src/pico_loader.js](src/pico_loader.js)**
  MMLコンパイラ(WebAssembly)やSoundFontが正しくロードされたかを監視し、ロード完了後に画面のローダー表示を消してプレイヤーバーを表示します。
* **[src/pico_messages.js](src/pico_messages.js)**
  画面上のテキストやダイアログ of 日本語・英語メッセージ辞書および多言語切り替え関数（`getLang`）を提供します。
* **[src/pico_module.js](src/pico_module.js)**
  テキストエリアに入力されたMMLテキストを取得し、再生エンジン（`playMMLDirect` / `stopMML`）を呼び出します。また、ブラウザストレージへのMMLの自動保存機能等も担います。
* **[src/pico_tool.js](src/pico_tool.js)**
  音色一覧（Voice List）やコマンド一覧（Command List）のフローティングウィンドウを表示・初期化します。
* **[src/pico_utils.js](src/pico_utils.js)**
  汎用的なモーダル・ダイアログウィンドウを作成・制御するユーティリティ関数を提供します。

### 3. 音源・シンセサイザーエンジン (`/synth`)

* **[synth/sakuramml.js](synth/sakuramml.js)** / **[synth/sakuramml_bg.wasm](synth/sakuramml_bg.wasm)**
  Rustで開発されたMMLコンパイラ「sakuramml」をWebAssembly向けにビルドしたコアエンジンです。テキストMMLを解析してMIDIバイナリに変換します。
* **[synth/soundfont_player.js](synth/soundfont_player.js)**
  ピコサクラの再生制御の中心的な役割を持つラッパー。以下の2つの再生モードをMMLの指定（`SoundType`）やブラウザの機能状況に応じて切り替えて制御します。
  1. **PicoAudio（[synth/picoaudio1.1.2_PicoAudio.min.js](synth/picoaudio1.1.2_PicoAudio.min.js)）**
     ブラウザ標準のWeb Audio APIオシレーター等を利用した、動作が極めて軽量なシンセサイザー。
  2. **FluidSynth（[synth/js-synthesizer.js](synth/js-synthesizer.js)）**
     WebAssemblyビルドされた FluidSynth を利用し、高品質な SoundFont（`TimGM6mb.sf2`）を用いてリッチな波形再生を行うシンセサイザー。内部的には AudioWorklet（`js-synthesizer.worklet.js`）を通じて音響処理を行います。
* **[synth/sakuramml_loader.js](synth/sakuramml_loader.js)**
  `PicoAudio`や`FluidSynth`関連ライブラリの動的ロード、およびCDNからのWebAssemblyコンパイラの非同期初期化を行います。

### 4. 画面・リソーステンプレート (`app/template`)

* **[app/template/index.html](app/template/index.html)**
  ピコサクラのメイン画面。エディタ、再生・停止などのコントロール、ツールボタン、ピアノキーボード、ステータスバーなどのUIが定義されています。また、動的に読み込まれるCSSファイルやJSローダーの管理も行っています。
* **[app/template/pico_common.css](app/template/pico_common.css)**
  ピコサクラ全体で使われるレイアウトや、ダイアログなどの共通CSSスタイルです。
* **[app/template/pico_tool_voicelist_window.html](app/template/pico_tool_voicelist_window.html)** / **[app/template/pico_tool_commandlist_window.html](app/template/pico_tool_commandlist_window.html)**
  音色選択やコマンド選択時に、フローティングウィンドウ内にインラインで挿入されるHTMLスニペットです。
