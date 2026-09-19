Go to https://nagu.dev

## 投稿を Pages CMS で編集する

このサイトは公式ホスト版の [Pages CMS](https://pagescms.org/) で記事と画像を編集できます。

1. [Pages CMS](https://app.pagescms.org) に GitHub でログインし、[Quick Start](https://pagescms.org/docs/quick-start/) に沿って GitHub App にこのリポジトリへのアクセスを許可します。
2. Pages CMS で `csnagu/nagu.dev` リポジトリと `main` ブランチを選択します。
3. `Posts` から記事を作成または編集します。画像は `static/images` に保存され、本文には `/images/...` として挿入されます。

新規記事は `draft: true` で作成されます。公開するときは Pages CMS で「下書き」を解除して `main` に保存してください。保存後、既存の GitHub Pages workflow がサイトをビルド・デプロイします。

Pages CMS は `content/posts` と `static/images` のみを編集対象にしており、定義されていない front matter は保存時に保持します。
