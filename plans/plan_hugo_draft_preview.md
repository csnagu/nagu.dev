# Hugo Draft Preview を GitHub Pages に追加

## Summary

- 1つのGitHub Pages artifactで、通常のproductionサイトを`public/`へ、draftを含むPreviewサイトを`public/preview/`へ生成する。
- Previewは`https://nagu.dev/preview/`をbase URLとし、productionと同じHugoテーマ、CSS、レイアウトを利用する。
- rootの`robots.txt`とPreview HTMLの`noindex,nofollow`で、Previewを検索対象から除外する。

## Implementation Changes

- GitHub Actionsはproduction buildの後に`--buildDrafts`を指定したPreview buildを行い、`public/preview/images`はrootの`public/images`を共用するため削除する。
- Hugo binaryをGitHub Actions cacheで再利用し、Go module cacheを`go.sum`でキー化する。存在しないNode dependency処理を削除する。
- 同一workflow・refの古い実行を`cancel-in-progress: true`で中止し、最新のPages CMS Saveを優先する。
- `hugo.preview.toml`でPreview base URL、Preview識別param、manifest start URLを定義し、独自head partialでPreview時だけnoindex metaを出力する。
- `static/robots.txt`を追加し、READMEにPages CMSからPreviewを確認して公開する手順を記載する。

## Test Plan

- Hugo 0.166.0でproductionとPreviewを単一出力ディレクトリに生成する。
- 一時的なdraft記事を含むコピーで、productionには出ずPreviewだけに出ることを確認する。
- robots、noindex、PreviewのURL付きCSS・JS・favicon・webmanifest・ナビゲーション、およびroot共有の`/images/...`を検査する。
- workflow YAMLとGit差分を確認する。

## Assumptions

- Previewは認証なしで到達可能だが、robotsとnoindexで検索対象外にする。
- PreviewのGoogle Analytics挙動はproductionと同じまま維持する。
