# Show Title Tag Chrome Extension

ページ端に `<title>` タグの内容を常時表示する Chrome 拡張機能です。タブが狭くてタイトルが読めないとき、SEO チェックのときなどに便利です。

![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)

## 特徴

- ページの四隅いずれかに現在のタイトルを常時表示
- 65文字を超える部分は赤色でハイライトし、長すぎるタイトルを可視化
- 表示位置はワンクリックで四隅を循環 (`bottom_right` → `bottom_left` → `top_left` → `top_right`)
- 目隠しボタンで半透明化（ホバーで復帰）
- 位置・表示状態は `chrome.storage.local` に保存され、タブ間・再起動後も保持

## インストール

Chrome Web Store には未登録のため、デベロッパーモードでローカル読み込みしてください。

1. このリポジトリを `git clone` する
2. Chrome で `chrome://extensions` を開く
3. 右上の「デベロッパーモード」をオンにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. clone したフォルダを選択

## 使い方

- 任意のページを開くと、右下にタイトルバーが表示されます
- 手のアイコンをクリックするたびに表示位置が切り替わります
- 目のアイコンをクリックするとバーが半透明になり、ホバーで元に戻ります

## プロジェクト構成

```
.
├── manifest.json          # MV3 マニフェスト
├── js/
│   ├── background.js      # Service Worker (位置の永続化)
│   └── showTitle.js       # Content script (DOM 挿入・更新)
├── css/showtitle.css      # 表示スタイル & アイコン定義
├── font/                  # FontAwesome webfont
└── img/                   # 拡張のアイコン
```

## ライセンス

原作: Martin Dalgaard

アイコンフォント: [Font Awesome 3](http://fortawesome.github.com/Font-Awesome) (SIL OFL / MIT / CC BY 3.0)
