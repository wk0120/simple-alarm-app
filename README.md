# Simple Alarm

シンプルなUIのブラウザ向けアラームアプリ。HTML + CSS + 素のJavaScriptだけで動きます。

## 特徴

- 時刻を指定してアラームを追加（任意でラベルも付けられる）
- 一覧からON/OFFトグル、削除ができる
- アラーム発火時はモーダル表示＋ビープ音（Web Audio API）
- 設定は `localStorage` に保存されるのでリロードしても消えない
- 依存ライブラリなし、ビルド不要

## 使い方

`index.html` をブラウザで開くだけ。

```bash
# 例: Pythonの簡易サーバーで配信する場合
python -m http.server 8000
# → http://localhost:8000
```

## ファイル構成

- `index.html` — マークアップ
- `style.css` — 見た目
- `app.js` — アラームのロジック

## ライセンス

MIT
