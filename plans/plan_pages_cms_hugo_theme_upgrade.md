# Pages CMS 導入・Hugo／テーマ更新

## Summary

- 公式ホスト版 Pages CMS を導入し、`content/posts` の記事と `static/images` の画像を編集可能にする。
- 新規記事は `draft: true` で作成し、CMS 上で下書きを解除すると `main` への保存と既存 GitHub Pages デプロイにより公開される構成にする。
- Hugo を `0.128.0` から `0.166.0`、`hugo-blog-awesome` を `v1.21.0` から `v2.1.1` に更新する。
- サイトの Bluesky プロフィールリンクを `https://bsky.app/profile/chikr.bsky.social` に変更する。

## Implementation Changes

- ルートへ `.pages.yml` を追加する。記事フィールドはタイトル、概要、公開日、下書き、タグ、Markdown 本文とし、画像は `static/images` へ保存して `/images/...` を挿入する。未定義 front matter は merge 設定で保持する。
- Hugo Module をテーマ v2 へ移行し、言語設定の deprecated key と独自テンプレート配置を Hugo の新構成へ更新する。テーマ側で修正済みの RSS 上書きは削除する。
- GitHub Pages workflow を Hugo 0.166.0、Go 1.27、現行メジャーの公式 Actions へ更新し、不要な Dart Sass インストールを削除する。
- README に公式 Pages CMS の GitHub App 導入、対象リポジトリ／ブランチ選択、下書き公開手順を追記する。
- 過去記事内の Bluesky 埋め込みは変更せず、サイト設定のプロフィールリンクのみ差し替える。

## Compatibility

- 公開 URL、既存記事ファイル名、本文、画像パスは変更しない。
- 新規記事の日付は `yyyy-MM-dd` とし、既存の日時付き front matter は該当記事を CMS で保存するまで変更しない。
- Pages CMS は GitHub Pages のデプロイを置き換えず、GitHub 上の Markdown を編集する入口として追加する。

## Test Plan

- Hugo 0.166.0 で production build を実行し、deprecated warning が残らないことを確認する。
- 日本語・英語ホーム、通常記事、card shortcode、Mermaid、独自 ToC、画像、RSS の生成結果を確認する。
- Bluesky リンク、`.pages.yml` の構文・フィールド・下書き初期値・画像パスを確認する。
- 既存記事が一括再整形されていないことと、差分に whitespace error がないことを確認する。
- GitHub App の認証と Pages CMS 上での最終確認はユーザー操作として案内する。

## Assumptions

- Pages CMS は公式ホスト版を利用し、編集対象は記事と画像に限定する。
- CMS の対象ブランチは `main`、新規記事は常に下書き開始とする。
- Hugo `0.166.0`、テーマ `v2.1.1`、Go `1.27` を固定する。
