# GitHub Pages復旧とActions安全化

## Summary

- GitHub PagesをGitHub Actions方式で再有効化し、`nagu.dev`のカスタムドメインとHTTPSを復元する。DNSは変更しない。
- 通常サイトは`/`、下書きを含むPreviewは`/preview/`へ出力し、Previewの検索除外を維持する。

## Implementation Changes

- Hugo成果物へ`CNAME`を含め、workflowの動的なbase URL上書きをやめて設定済みの`https://nagu.dev/`を使う。
- Preview生成後の`public/preview/images`削除を廃止し、Preview内の画像を配信する。
- GitHub Actionsを最新安定版の不変SHAへ固定し、`actions/cache`をv6.1.0へ更新する。
- DependabotでGo moduleとGitHub Actionsを週次監視し、Dependabot alertsとActions既定権限を安全な設定へ更新する。

## Verification

- Hugo 0.166.0でproductionとPreviewを単一artifact構成でビルドし、Previewの画像、noindex、robots、CNAMEを検査する。
- デプロイ後に通常サイトとPreviewがHTTP 200であること、draftの露出範囲が正しいことを確認する。
