---
title: Pages CMSを使ってブログを書くのを楽にする
description: Github PagesとHugoを使ったブログをvscodeで書くのが辛くなりpages cmsを導入してみた話｡
date: 2026-09-19
draft: false
---
## Github Pages と Hugo なブログ

現在[Hugo](https://gohugo.io)というオープンソースのSSGを使って静的サイトという形でブログを作っている｡  
ホスティングはGitHub Pagesを使っている｡

どちらも高いクオリティでありながら無料で使えて素晴らしい｡

## Hugo の content/posts/xxx.md をvscodeで書くのが辛い

新しいブログポストを作成する時は `/contet/posts/xxx.md` を作成する｡

エディタにはvscodeを使っているため次のようなフローになっている｡

1. vscodeでプロジェクトを開く
2. `hugo serve` でサーバを起動する
3. vscodeでxxx.mdを書く (WYSIWYGではない)
4. 画像がある場合は `static/images/` にコピーする
5. `localhost:1313`で確認する
6. commit & pushする

めんどくさいね ٩( ᐛ )و

## Pages CMSを使ってvscodeから脱却する

[Pages CMS](https://pagescms.org) というオープンソースなCMSがある｡

実際に使ってみると下記のようにブラウザ上でポストを編集できるインタフェースになっている

画像ファイルをドラッグ&ドロップすると `static/images/`に勝手に追加してくれる｡ブラウザから手軽に開けるのもいい感じ｡ `Cmd + S`で保存ができるのも手軽で良い｡

![Screenshot 2026-09-20 at 13.44.09 Large.jpeg](</images/Screenshot 2026-09-20 at 13.44.09 Large.jpeg>)

これまでvscodeを開きつつブラウザを行き来していた煩雑な作業がブラウザだけで完結するようになった｡

欲を言えば次のようなことが出来たら嬉しい｡

- Draft状態で保存した時はPRを作成して､Draftを解除したらmainブランチに自動でマージする
- PRはコミットを追加するたびにDraft状態のページのみビルドして素早くPreviewできるようにする
- PRをマージするとPreview環境を破棄する

が､個人ブログの範囲でここまでやるのは少し大げさな気もしている｡今はmainブランチに直接 commit & push する手軽な構成にしている｡

## 感想

求めていた手軽にポストを書ける環境がPages CMSを導入して出来上がった｡これまでの書き始めるまでにvscodeやhugo serverを起動して…といった煩雑な作業にさよならバイバイ｡

半年に1ポスト書けば良い方なブログではあるけれど､最近アウトプットの重要性を噛み締めているのでこれを皮切りにポストの頻度を少しだけあげたい ٩( ᐛ )و