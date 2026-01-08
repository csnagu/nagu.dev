---
title: '素人がLive2Dモデルを自作してVTube Studioで動かす'
description: '絵心やモデリング経験のない素人が､生成AIや先人の力を借りて20時間でLive2Dモデルを作ってVTube Studioで動かす'
date: 2026-01-08
draft: false
---


絵心やモデリング経験のない素人が､生成AIや先人の力を借りて20時間でLive2Dモデルを作ってVTube Studioで動かした覚え書き｡

## 作成したLive2Dモデル
![live2d_motion_gif](/images/live2d.gif)

瞬き､視線､頭の角度がファイストラッキングでぬるぬる動く｡制作時間は3モデル作って20hくらい｡上記のモデルが一番出来がよかった｡

とても参考にしたサイト
- [Runpod でなるべく安価に Stable Diffusion Web UI 実行環境を作る](https://zenn.dev/minato_seagull/articles/fb16a843551d21)
- [試行錯誤2か月！画像生成AI×Live2Dで実現したVTuber制作の実録](https://note.com/wandertraveler/n/nfbf1c1706952)
- [【瞬き・呼吸・視線移動】AI生成したイラストにLive2Dで動きをつけてみた【NovelAI】](https://note.com/shicojapan/n/n5088f8f8a3c9)
- [素材分けについて | Live2D Manuals & Tutorials](https://docs.live2d.com/cubism-editor-manual/divide-the-material/)

## 作業環境
- イラスト作成
  - Stable Diffusion (on [Runpod](https://www.runpod.io))
- イラスト編集
  - [Krita](https://krita.org) (on Mac)
- 2Dモデリング
  - [Live2D Cubism Editor](https://www.live2d.com/cubism/download/editor/) (on Mac)
- 2Dモデルの動作確認
  - [VTube Studio](https://store.steampowered.com/app/1325860/VTube_Studio) (on Mac w/ Steam)

## モチベーション
- RunpodでGPUが簡単かつ安価に使えるというエントリを読んでRunpodを触っていた
- YouTube上でLive2Dモデルを出しつつライブコーディングする動画を最近よく見ていた

→ 自分は絵心がないけれど､画像生成AIで立ち絵が作れればLive2Dモデルを自分でも作れるのではと閃き(💡)ほぼ衝動的にはじめた｡  
(同じ考えの先駆者はたくさんいた)

## やってみた感想
### Stable DiffusionでLive2D用のイラスト作成
Runpod上でstable-diffusion-webuiを使ったイラスト作成はめちゃめちゃ簡単だった｡
欲しい要素のキーワードを列挙して最後に `masterpiece,best quality` などをつければかなりきれいな絵が出てくる｡すごすぎ｡

権利周りは心配になるが画像検索しても似た画像がヒットしなかったので多分大丈夫だと思いたい…(ときどき問題になっているけど､生成した画像が権利的に怪しいかをどうやって判断しているのだろう)｡

![live2d_illust](/images/live2d_illust.png)

### Kritaでイラストからパーツを分解
イラスト作成後のパーツ分解はKritaでやった｡10年以上前はGIMPを使っていたことを思い出して独りほっこりしていた｡  
この工程では生成したイラストを髪､動かす用の髪､眉､二重線､アイライン､眼球､白目､鼻､口､首､体などの粒度で分離しつつ背景透過を施す｡GIMPで身につけたレイヤの概念を思い出した｡  
とにかく作業量が多く､初実施のせいもあり後述のLive2Dモデル作成で得た気付きから透過ミスや見えない部分の補完などが必要で手戻ったりする｡線の端の透過処理をうまいことできず諦めた｡Photoshopには消えた部分をいい感じに補完するブラシがあるらしい､Photoshopを使ってもいないのにさすがAdobeと感じた ٩( ᐛ )و

自分でイラストが描けるとはじめからパーツ単位で書き分けれるため､多分この工程がいらなくなりそう｡羨ましい…｡

![live2d_krita](/images/krita.png)

イラストからパーツ分解も生成AIってやつでできるのではと試みたけどうまくいかず｡イラストに存在しないパーツが出てきたり､目や鼻のパーツの位置調整が求められるなど絵心が必要なシーンが出てきて渋かった｡

![live2d_ng_parts](/images/live2d_ng_parts.png)


### Cubism Editorでイラストに動きをつけてLive2Dモデルを作成
Live2D Creative Studioが公開している[YouTube動画](https://www.youtube.com/watch?v=DWCyHtwRewI)を見つつ Cubism Editor でパーツごとに動きをつけていく｡  
頭､胴体､目､口など徐々に動く部分が増えていってめちゃめちゃ楽しい｡頭の回転にあわせて髪に動きをつける方法がよくわからず試行錯誤していたところ､ワープデフォーマを作成してZ軸に動きをつけたらいい感じになった｡あまりよくわかっていない｡

呼吸や頭の回転､髪の毛の動きを想像してモーションをつけてみるも､しっくりこず無限に時間が溶ける｡  
ゲームなどのキャラクターに動きをつけるお仕事も楽しそうだ､なんて思ったりした｡

![live2d_cubism_editor](/images/cubism.png)

出来上がったらファイル > エクスポート からmoc3形式のファイル一式を出力する｡

### VTube Studioで2Dモデルの動作確認
SteamでVTube Studioをインストールして上記のmoc3形式のフォルダを読み込む｡フェイストラッキングにはじめから対応していて､特に困るようなことはなかった｡  
作成したモデルが自分に追従する形で動くのを見て感動した｡機会を見つけて制作したモデルを使ってみたいが予定がない｡


### ٩( ᐛ )و
絵心のない素人でも実作業が1~2日程度で満足行くクオリティのものが制作できた｡久しぶりに寝食を忘れて没頭でき､とても良い体験だったし改めて自分は目に見える成果が好きなんだなと再認識した｡

課金した箇所は実質RunpodのGPU費用くらいで､これも$10チャージして5$くらい余っているので､ブログを書きつつ費用のかからなさにただただ驚いている｡無料で提供されているソフトウェアやサービスあってのものなのでいつか業界やサービスの発展に貢献できたらいいなーなんて思ったりした｡

おしまい｡

