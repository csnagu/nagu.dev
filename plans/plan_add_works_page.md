# Worksページに実画面とCLI例を追加

## Summary

日英のWorksページを追加し、公開Web作品は実画面のスクリーンショット付きリンクカード、ffhは端末利用イメージ付きで掲載する。既存の`card`ショートコードとスタイルを再利用する。

## Changes

- `content/pages/works.md` と英語版に4作品を掲載する。
- 公開Web作品の紹介画像を `static/images/works-*.png` に保存する。
- PrivateのtunaリポジトリURLは掲載しない。
- メインメニューにWorksをPostsとAboutの間で追加する。

## Verification

- Hugo本番ビルドで日英ページ、画像、リンク、コードブロックを確認する。
