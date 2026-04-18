# CLAUDE.md

ページ右下（初期位置）にタイトルタグを表示する Chrome 拡張機能。Manifest V3。

## 構成

- `manifest.json` — MV3 マニフェスト。`background` は ES Module、`content_scripts` は全 http/https ページに注入。
- `js/background.js` — Service Worker。`chrome.storage.local` で `position` を保存し、content script からのメッセージ (`get` / `move`) に応答する。
- `js/showTitle.js` — Content script。ページに `#showtitlewrapper` を挿入してタイトルを表示。`MutationObserver` で `<title>` 変更を追尾する。
- `css/showtitle.css` — 4つの位置クラス (`bottom_right` / `bottom_left` / `top_left` / `top_right`) と hide 状態のスタイル。FontAwesome 3 のアイコンを同梱。
- `font/` — FontAwesome webfont (woff / ttf)。
- `img/` — 拡張のアイコン (16/48/128)。

## データフロー

```
showTitle.js  ──sendMessage({type:"get",key:"position"})──▶  background.js  ──▶  chrome.storage.local
showTitle.js  ──sendMessage({type:"move",position:...})──▶  background.js  ──▶  chrome.storage.local
```

- 位置は enum: `bottom_right` / `bottom_left` / `top_left` / `top_right`
- hide 状態 (`showtitle-hide`: `"true"` / `"false"`) は content script が直接 `chrome.storage.local` に読み書きする

## 開発ワークフロー

- `chrome://extensions` を開いて「デベロッパーモード」ON
- 「パッケージ化されていない拡張機能を読み込む」でこのリポジトリのルートを選択
- ファイル変更後は拡張機能カードの更新ボタンで再読込

## コード上の注意点

- `background.js` は ES Module (`manifest.json` の `"type": "module"`)。content script は module ではないので DOM グローバル前提。
- `setTitle` は `MutationObserver` から 1 秒に 1 回までスロットルされる（タブ復帰時にタイトルが連続変化するサイト対策）。
- 位置クラスの切り替えは `classList.remove(...POSITIONS)` → `classList.add(position)`。直接 `className =` で代入すると `hide` / `not-initialized` を壊すので使わない。
- タイトルを DOM に入れるときは `textContent` / `createTextNode` を使う。`innerHTML` は XSS リスクがあるので使わない。
- ビルドステップは無い。静的ファイルをそのまま Chrome に読ませる。
