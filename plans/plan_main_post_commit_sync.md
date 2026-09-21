# main の post-commit 自動同期

## Summary

`main` でローカルコミットした直後、CMS が更新した `origin/main` を `git pull --rebase --autostash` で取り込む、リポジトリ限定の Git hook を設定する。競合・通信失敗時は変更を上書きせず、Git の出力と明示メッセージで停止状態を知らせる。

## Implementation Changes

- 追跡対象の `.githooks/post-commit` を追加する。
- `main` 以外では即時終了し、`main` では `origin/main` を rebase で同期する。
- 同期できない場合はコミットを取り消さず、解消が必要な旨を標準エラーへ表示する。
- 現在の checkout の `.git/config` にだけ `core.hooksPath=.githooks` を設定する。

## Test Plan

- シェル構文、実行権限、ローカル `core.hooksPath` 設定を確認する。
- 一時的なローカル Git リモートで、`main` のローカルコミットがリモート更新の後へ rebase されることを確認する。
- `main` 以外のブランチでは同期処理を実行しないことを確認する。

## Assumptions

- Pages CMS の編集対象は `content/posts` と `static/images`。
- 既存の未コミット変更は保持し、触れない。
- リモート更新だけで hook を起動することはできないため、同期契機はローカルの `git commit` 後とする。
