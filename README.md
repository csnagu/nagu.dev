Go to https://nagu.dev

## 投稿を Pages CMS で編集する

このサイトは公式ホスト版の [Pages CMS](https://pagescms.org/) で記事と画像を編集できます。

1. [Pages CMS](https://app.pagescms.org) に GitHub でログインし、[Quick Start](https://pagescms.org/docs/quick-start/) に沿って GitHub App にこのリポジトリへのアクセスを許可します。
2. Pages CMS で `csnagu/nagu.dev` リポジトリと `main` ブランチを選択します。
3. `Posts` から記事を作成または編集します。画像は `static/images` に保存され、本文には `/images/...` として挿入されます。

新規記事は `draft: true` で作成されます。保存するとGitHub Actionsが通常サイトとPreviewを同時に更新します。下書きは [Preview](https://nagu.dev/preview/) で、実際のサイトと同じテーマ・レイアウトのまま確認できます。

1. Pages CMSで記事を書き、`draft: true` のまま `main` に保存します。
2. GitHub Actionsの完了後、[https://nagu.dev/preview/](https://nagu.dev/preview/) で確認します。
3. 公開する場合は `draft: false` に変更して保存します。次のデプロイで [https://nagu.dev/](https://nagu.dev/) に公開されます。

Previewは検索対象外にするため、ホストルートの `robots.txt` で `/preview/` を拒否し、Preview HTMLには `noindex,nofollow` を付与しています。

Pages CMS は `content/posts` と `static/images` のみを編集対象にしており、定義されていない front matter は保存時に保持します。
